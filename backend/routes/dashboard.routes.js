const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const Event = require('../models/Event.model');
const Booking = require('../models/Booking.model');

const router = express.Router();

router.use(protect);

// @desc    Get organizer dashboard stats
// @route   GET /api/v1/dashboard/stats
router.get('/stats', authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    // Get organizer's events
    const events = await Event.find({ organizer: req.user.id });
    
    // Calculate stats
    const totalEvents = events.length;
    const upcomingEvents = events.filter(event => 
      new Date(event.startDate) > new Date() && event.status === 'published'
    ).length;
    
    // Get total attendees across all events
    const totalAttendees = events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
    
    // Get total revenue
    const totalRevenue = events.reduce((sum, event) => {
      const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) => 
        ticketSum + (ticket.price * (ticket.sold || 0)), 0
      ) || 0;
      return sum + eventRevenue;
    }, 0);

    // Get recent events
    const recentEvents = await Event.find({ organizer: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .select('title startDate status currentAttendees images category');

    // Get recent bookings for organizer's events
    const eventIds = events.map(event => event._id);
    const recentBookings = await Booking.find({ 
      event: { $in: eventIds },
      paymentStatus: 'paid'
    })
      .sort('-createdAt')
      .limit(5)
      .populate('event', 'title')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents,
          upcomingEvents,
          totalAttendees,
          totalRevenue
        },
        recentEvents,
        recentBookings
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    // Return empty stats if error
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents: 0,
          upcomingEvents: 0,
          totalAttendees: 0,
          totalRevenue: 0
        },
        recentEvents: [],
        recentBookings: []
      }
    });
  }
});

module.exports = router;
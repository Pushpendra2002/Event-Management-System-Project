const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const Event = require('../models/Event.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ paymentStatus: 'paid' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Get recent activity
    const recentEvents = await Event.find()
      .sort('-createdAt')
      .limit(5)
      .populate('organizer', 'name');

    const recentBookings = await Booking.find({ paymentStatus: 'paid' })
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name')
      .populate('event', 'title');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentEvents,
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update event status
// @route   PUT /api/v1/admin/events/:id/status
router.put('/events/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Feature/unfeature event
// @route   PUT /api/v1/admin/events/:id/feature
router.put('/events/:id/feature', async (req, res, next) => {
  try {
    const { featured } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { featured },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get analytics
// @route   GET /api/v1/admin/analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get revenue analytics
    const revenueAnalytics = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get event category distribution
    const categoryDistribution = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenueAnalytics,
        categoryDistribution,
        userGrowth
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
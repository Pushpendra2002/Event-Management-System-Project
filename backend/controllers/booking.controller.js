const Booking = require('../models/Booking.model');
const Event = require('../models/Event.model');
const User = require('../models/User.model');
const sendEmail = require('../utils/email');
const QRCode = require('qrcode');

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketTypeId, quantity, attendees, specialRequirements } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1 || !Array.isArray(attendees) || attendees.length !== quantity) {
      return res.status(400).json({
        success: false,
        error: 'Provide one attendee for each ticket'
      });
    }

    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Event is not available for booking'
      });
    }

    // Find ticket type
    const ticketType = event.ticketTypes.id(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({
        success: false,
        error: 'Ticket type not found'
      });
    }

    // Check ticket availability
    if (ticketType.quantity - ticketType.sold < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough tickets available'
      });
    }

    // Check if ticket sales are active
    if (!ticketType.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Ticket sales are not active'
      });
    }

    // Check sales date
    const now = new Date();
    if (now < ticketType.salesStartDate || 
        (ticketType.salesEndDate && now > ticketType.salesEndDate)) {
      return res.status(400).json({
        success: false,
        error: 'Ticket sales are not available at this time'
      });
    }

    // Calculate total amount
    const totalAmount = ticketType.price * quantity;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketType: {
        name: ticketType.name,
        price: ticketType.price
      },
      quantity,
      totalAmount,
      attendees,
      specialRequirements,
      paymentStatus: 'pending'
    });

    // Generate QR code for ticket
    const qrCodeData = JSON.stringify({
      bookingId: booking._id,
      ticketNumber: booking.ticketNumber,
      eventId: event._id,
      userId: req.user.id
    });

    const qrCode = await QRCode.toDataURL(qrCodeData);
    booking.qrCode = qrCode;
    await booking.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'organizer') {
      // Get organizer's events
      const events = await Event.find({ organizer: req.user.id });
      const eventIds = events.map(event => event._id);
      query.event = { $in: eventIds };
    }

    const bookings = await Booking.find(query)
      .populate('event', 'title startDate venue images')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role === 'user' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    if (req.user.role === 'organizer') {
      const event = await Event.findById(booking.event._id);
      if (event.organizer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this booking'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking payment status
// @route   PUT /api/v1/bookings/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod, paymentId } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const wasPaid = booking.paymentStatus === 'paid';

    // Update payment details
    booking.paymentStatus = paymentStatus;
    booking.paymentMethod = paymentMethod;
    booking.paymentId = paymentId;

    await booking.save();

    if (paymentStatus === 'paid' && !wasPaid) {
      // Update ticket sold count
      const event = await Event.findById(booking.event._id);
      const ticketType = event.ticketTypes.find(
        t => t.name === booking.ticketType.name
      );
      
      if (ticketType) {
        ticketType.sold += booking.quantity;
        event.currentAttendees += booking.quantity;
        await event.save();
      }

      // Send confirmation email
      try {
        await sendEmail({
          email: booking.user.email,
          subject: 'Booking Confirmation - Event Management System',
          html: `
          <h1>Booking Confirmed!</h1>
          <p>Thank you for your booking. Here are your details:</p>
          <ul>
            <li>Event: ${event.title}</li>
            <li>Date: ${new Date(event.startDate).toLocaleDateString()}</li>
            <li>Tickets: ${booking.quantity} x ${booking.ticketType.name}</li>
            <li>Total: $${booking.totalAmount}</li>
            <li>Ticket Number: ${booking.ticketNumber}</li>
          </ul>
          <p>Please bring this confirmation to the event.</p>
        `
        });
      } catch (emailError) {
        console.error('Booking confirmation email failed:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const isBookingOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    let isEventOrganizer = false;

    if (req.user.role === 'organizer') {
      const event = await Event.findById(booking.event).select('organizer');
      isEventOrganizer = event?.organizer.toString() === req.user.id;
    }

    if (!isBookingOwner && !isAdmin && !isEventOrganizer) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Only paid bookings can be cancelled'
      });
    }

    // Check cancellation policy (within 24 hours)
    const event = await Event.findById(booking.event);
    const hoursToEvent = (event.startDate - new Date()) / (1000 * 60 * 60);
    
    if (hoursToEvent < 24) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel within 24 hours of event'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();

    // Update event ticket counts
    const ticketType = event.ticketTypes.find(
      t => t.name === booking.ticketType.name
    );
    
    if (ticketType) {
      ticketType.sold -= booking.quantity;
      event.currentAttendees -= booking.quantity;
      await event.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-in attendee
// @route   PUT /api/v1/bookings/:id/checkin
// @access  Private (Organizer)
exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify organizer authorization
    const event = await Event.findById(booking.event._id);
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to check in attendees for this event'
      });
    }

    // Check if already checked in
    if (booking.checkInStatus) {
      return res.status(400).json({
        success: false,
        error: 'Attendee already checked in'
      });
    }

    // Update check-in status
    booking.checkInStatus = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

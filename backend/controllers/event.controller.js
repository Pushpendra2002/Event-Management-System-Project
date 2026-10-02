const Event = require('../models/Event.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      featured,
      search,
      startDate,
      endDate,
      sort = '-createdAt'
    } = req.query;

    let query = {};
    const isAdmin = req.user?.role === 'admin';

// If NOT admin → only published
if (!isAdmin) {
  query.status = 'published';
  query.privacy = 'public';
}

    if (category) {
      query.category = category;
    }

    // Status filter
    if (status && isAdmin) {
      query.status = status;
    }

    // Featured filter
    if (featured) {
      query.featured = featured === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const events = await Event.find(query)
      .populate('organizer', 'name email profilePhoto')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: events
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePhoto bio');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const isOwner = req.user && event.organizer._id.toString() === req.user.id;
    const canManageEvent = req.user?.role === 'admin' || isOwner;
    if ((event.status !== 'published' || event.privacy !== 'public') && !canManageEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Increment views
    event.views += 1;
    await event.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/v1/events
// @access  Private (Organizer)
exports.createEvent = async (req, res, next) => {
  try {
    // Add organizer to req.body
    req.body.organizer = req.user.id;
    req.body.organizerName = req.user.name;

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Make sure user is event organizer
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Make sure user is event organizer or admin
  
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log(req.user.role);
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this event'
      });
    }

    // Delete images from cloudinary
    for (const image of event.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload event image
// @route   POST /api/v1/events/:id/images
// @access  Private (Organizer)
exports.uploadEventImage = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Make sure user is event organizer
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to upload images for this event'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'event-management/events',
      width: 1200,
      height: 800,
      crop: 'fill'
    });

    const image = {
      url: result.secure_url,
      publicId: result.public_id,
      isMain: event.images.length === 0
    };

    event.images.push(image);
    await event.save();

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get organizer events
// @route   GET /api/v1/events/organizer/me
// @access  Private (Organizer)
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured events
// @route   GET /api/v1/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ 
      featured: true, 
      status: 'published',
      privacy: 'public',
      startDate: { $gte: new Date() }
    })
    .sort('-rating.average')
    .limit(6);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get events by category
// @route   GET /api/v1/events/category/:category
// @access  Public
exports.getEventsByCategory = async (req, res, next) => {
  try {
    const events = await Event.find({ 
      category: req.params.category,
      status: 'published',
      privacy: 'public'
    })
    .sort('startDate')
    .limit(20);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get real platform statistics for homepage
// @route   GET /api/v1/events/stats
// @access  Public
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalEvents, totalOrganizers, attendeesAgg, totalBookings, totalCancelled] = await Promise.all([
      Event.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'organizer' }),
      Event.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, total: { $sum: '$currentAttendees' } } }
      ]),
      Booking.countDocuments({ paymentStatus: 'paid' }),
      Event.countDocuments({ status: 'cancelled' })
    ]);

    const attendeeCount = Math.max(attendeesAgg[0]?.total || 0, totalBookings);
    const satisfactionRate = (totalEvents + totalCancelled) > 0
      ? Math.round((totalEvents / (totalEvents + totalCancelled)) * 100)
      : 98;

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalAttendees: attendeeCount,
        totalOrganizers,
        satisfactionRate
      }
    });
  } catch (err) {
    next(err);
  }
};

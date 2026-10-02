const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification.model');

const router = express.Router();

router.use(protect);

// @desc    Get user notifications
// @route   GET /api/v1/notifications
router.get('/', async (req, res, next) => {
  console.log("xyz : ",req.user.id);
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check authorization
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this notification'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check authorization
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
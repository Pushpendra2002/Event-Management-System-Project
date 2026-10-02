const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_created',
      'event_updated',
      'event_cancelled',
      'booking_confirmed',
      'booking_cancelled',
      'payment_success',
      'payment_failed',
      'new_message',
      'system_announcement',
      'event_reminder'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    eventId: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    organizerId: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
});

// TTL index for auto-deletion
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);
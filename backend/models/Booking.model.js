const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    name: String,
    price: Number
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'credit-card', 'bank-transfer', 'cash'],
    default: 'stripe'
  },
  paymentId: String,
  attendees: [{
    name: String,
    email: String,
    phone: String
  }],
  checkInStatus: {
    type: Boolean,
    default: false
  },
  checkInTime: Date,
  ticketNumber: {
    type: String,
    unique: true
  },
  qrCode: String,
  specialRequirements: String,
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  cancelledAt: Date,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate ticket number before saving
BookingSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const prefix = 'TICKET';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.ticketNumber = `${prefix}-${randomNum}`;
  }
  // next();
});

module.exports = mongoose.model('Booking', BookingSchema);
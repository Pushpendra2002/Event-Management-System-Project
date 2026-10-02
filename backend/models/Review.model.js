const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from reviewing same event multiple times
ReviewSchema.index({ user: 1, event: 1 }, { unique: true });

// Update event rating when review is saved
ReviewSchema.post('save', async function() {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  
  const reviews = await this.constructor.find({ event: this.event });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  
  event.rating.average = totalRating / reviews.length;
  event.rating.count = reviews.length;
  await event.save();
});

module.exports = mongoose.model('Review', ReviewSchema);
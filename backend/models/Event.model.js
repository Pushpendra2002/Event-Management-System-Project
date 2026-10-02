const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'music', 'sports', 'conference', 'workshop', 'festival', 
      'exhibition', 'networking', 'charity', 'food', 'art', 
      'technology', 'business', 'education', 'health', 'other'
    ]
  },
  tags: [String],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: String,
  images: [{
    url: String,
    publicId: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  ticketTypes: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      default: 0
    },
    salesStartDate: {
      type: Date,
      default: Date.now
    },
    salesEndDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  requirements: [{
    type: String,
    enum: ['age-18+', 'id-required', 'vaccination', 'dress-code']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in hours
EventSchema.virtual('duration').get(function() {
  return (this.endDate - this.startDate) / (1000 * 60 * 60);
});

// Update updatedAt on save
// EventSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Create text index for search
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', EventSchema);
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subscription plan name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Subscription plan description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Subscription plan price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Subscription plan duration is required'],
    min: [1, 'Duration must be at least 1 month']
  },
  features: [{
    type: String,
    required: [true, 'Feature description is required'],
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxAppointments: {
    type: Number,
    default: 0
  },
  maxMessages: {
    type: Number,
    default: 0
  },
  maxVideoCalls: {
    type: Number,
    default: 0
  },
  prioritySupport: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
subscriptionSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
subscriptionSchema.virtual('formattedDuration').get(function() {
  return `${this.duration} ${this.duration === 1 ? 'month' : 'months'}`;
});

// Method to check if plan is available
subscriptionSchema.methods.isAvailable = function() {
  return this.isActive;
};

// Pre-save middleware to ensure features is an array
subscriptionSchema.pre('save', function(next) {
  if (!Array.isArray(this.features)) {
    this.features = [this.features];
  }
  next();
});

// Virtual for number of subscribers
subscriptionSchema.virtual('subscriberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'subscriptionPlan',
  count: true
});

// Method to check if subscription plan can be deleted
subscriptionSchema.methods.canBeDeleted = async function() {
  const User = mongoose.model('User');
  const subscriberCount = await User.countDocuments({ subscriptionPlan: this._id });
  return subscriberCount === 0;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription; 
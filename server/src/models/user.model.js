import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    required: true
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative'],
    default: function() {
      return this.role === 'doctor' ? 0 : undefined;
    }
  },
  specializations: [{
    type: String,
    enum: [
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Obstetrics and Gynecology',
      'Ophthalmology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Urology',
      'General Medicine'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date,
    default: Date.now
  },
  verificationNotes: {
    type: String
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['license', 'certification', 'id'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
  }],
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'expired', 'cancelled'],
    default: 'none'
  },
  subscriptionHistory: [{
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled']
    },
    paymentAmount: Number,
    paymentDate: Date
  }],
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please provide a valid phone number']
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    }
  },
  profilePicture: {
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Profile picture must be a valid URL'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    breakTime: [{
      start: String,
      end: String
    }]
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['appointment', 'verification', 'subscription', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  trialSubscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Virtual for checking if subscription is active
userSchema.virtual('hasActiveSubscription').get(function() {
  if (!this.subscriptionEndDate) return false;
  return this.subscriptionStatus === 'active' && new Date() < this.subscriptionEndDate;
});

// Password comparison method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  try {
    console.log('Comparing passwords for user:', this._id);
    const isMatch = await bcrypt.compare(candidatePassword, userPassword);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();

    console.log('Hashing password for user:', this._id);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  try {
    return jwt.sign(
      { 
        id: this._id, 
        role: this.role,
        isVerified: this.isVerified,
        subscription: this.subscriptionStatus
      },
      'healthtech-super-secret-key-2024',
      { expiresIn: '7d' }
    );
  } catch (error) {
    throw new Error('Error generating authentication token');
  }
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

// Method to update subscription status
userSchema.methods.updateSubscriptionStatus = function() {
  if (!this.subscriptionEndDate) {
    this.subscriptionStatus = 'none';
    return;
  }

  const now = new Date();
  if (now > this.subscriptionEndDate) {
    this.subscriptionStatus = 'expired';
  } else if (this.subscriptionStatus === 'cancelled') {
    // Keep cancelled status
  } else {
    this.subscriptionStatus = 'active';
  }
};

// Pre-save middleware to update subscription status
userSchema.pre('save', function(next) {
  this.updateSubscriptionStatus();
  next();
});

// Method to start trial subscription
userSchema.methods.startTrialSubscription = async function() {
  if (this.trialSubscription.isActive) {
    throw new Error('Trial subscription is already active');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14); // 14 days trial

  this.trialSubscription = {
    isActive: true,
    startDate,
    endDate
  };

  // Add notification
  this.notifications.push({
    type: 'subscription',
    message: 'Your 14-day trial subscription has started. Enjoy all premium features!',
    read: false,
    createdAt: new Date()
  });

  await this.save();
};

// Method to check if trial is active
userSchema.methods.hasActiveTrial = function() {
  if (!this.trialSubscription.isActive) return false;
  return new Date() < this.trialSubscription.endDate;
};

// Method to check if trial has expired
userSchema.methods.hasExpiredTrial = function() {
  if (!this.trialSubscription.isActive) return false;
  return new Date() > this.trialSubscription.endDate;
};

// Pre-save middleware to check trial status
userSchema.pre('save', function(next) {
  if (this.trialSubscription.isActive && new Date() > this.trialSubscription.endDate) {
    this.trialSubscription.isActive = false;
    
    // Add notification for expired trial
    this.notifications.push({
      type: 'subscription',
      message: 'Your trial subscription has expired. Please subscribe to continue using premium features.',
      read: false,
      createdAt: new Date()
    });
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User; 
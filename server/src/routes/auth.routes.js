import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { protect, restrictTo } from '../middleware/auth.js';
import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import { signToken } from '../utils/jwt.js';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Notification from '../models/notification.model.js';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again after 15 minutes'
});

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!name) missingFields.push('name');
  if (!email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!role) missingFields.push('role');

  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  // Validate password strength
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // Validate role
  const validRoles = ['patient', 'doctor', 'admin'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role. Must be one of: patient, doctor, admin', 400);
  }

  // Check if admin already exists
  if (role === 'admin') {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new AppError('An admin account already exists', 400);
    }
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Create new user with optional fields
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone: req.body.phone || '',
    dateOfBirth: req.body.dateOfBirth || null,
    gender: req.body.gender || 'other'
  });

  // Generate token
  const token = signToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    // Instead of throwing an error, return a specific status
    return res.status(200).json({
      status: 'success',
      message: 'Account deactivated',
      data: {
        user: {
          ...user.toObject(),
          password: undefined,
          resetPasswordToken: undefined,
          resetPasswordExpire: undefined,
          emailVerificationToken: undefined
        }
      }
    });
  }

  // Generate token
  const token = signToken(user._id);

  // Remove sensitive data
  user.password = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.emailVerificationToken = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}));

// Logout user
router.post('/logout', protect, async (req, res, next) => {
  try {
    // In a real application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear any session data
    // 3. Clear any cookies
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
  try {
    console.log('Getting current user for:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found');
      throw new AppError('User not found', 404);
    }

    console.log('User found:', user);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
});

// Get available subscription plans
router.get('/subscriptions', async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ isActive: true })
      .select('name description price duration features');
      
    res.status(200).json({
      status: 'success',
      data: {
        subscriptions
      }
    });
  } catch (error) {
    next(error);
  }
});

// Reactivate account
router.post('/reactivate', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // Reactivate the account
  user.isActive = true;
  await user.save();

  // Generate new token
  const token = signToken(user._id);

  // Remove sensitive data
  user.password = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.emailVerificationToken = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Account reactivated successfully',
    token,
    data: {
      user
    }
  });
}));

export default router; 
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

const JWT_SECRET = process.env.JWT_SECRET || 'healthtech-super-secret-key-2024';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'healthtech-refresh-token-secret-2024';

export const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Please log in to access this resource', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2) Verify token using the imported function
    const decoded = verifyToken(token);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('User recently changed password. Please log in again', 401);
    }

    // 5) Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Grant access to protected route
    req.user = user;  // Set the entire user object
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token. Please log in again', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Your token has expired. Please log in again', 401));
    } else {
      next(error);
    }
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: 'success',
      token: accessToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid refresh token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Refresh token has expired. Please log in again', 401));
    } else {
      next(error);
    }
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return next(new AppError('Only doctors can access this route', 403));
  }
  next();
};

export const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return next(new AppError('Only patients can access this route', 403));
  }
  next();
};

export const canBookAppointment = (req, res, next) => {
  if (!req.user.canBookAppointment()) {
    return next(new AppError('You are not authorized to book appointments', 403));
  }
  next();
}; 
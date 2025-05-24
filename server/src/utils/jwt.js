import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';

dotenv.config();

// Use environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const signToken = (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to generate token');
    }
    
    const token = jwt.sign({ id: userId.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    });
    
    console.log('Token generated successfully for user:', userId);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new AppError('Error generating authentication token', 500);
  }
};

export const signRefreshToken = (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to generate refresh token');
    }
    
    const refreshToken = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: 'HS256'
    });
    
    return refreshToken;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new AppError('Error generating refresh token', 500);
  }
};

export const verifyToken = (token) => {
  try {
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });

    console.log('Token verified successfully for user:', decoded.id);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    throw new AppError('Error verifying token', 500);
  }
};

export const decodeToken = (token) => {
  try {
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new AppError('Invalid token format', 401);
    }

    return decoded;
  } catch (error) {
    throw new AppError('Error decoding token', 500);
  }
}; 
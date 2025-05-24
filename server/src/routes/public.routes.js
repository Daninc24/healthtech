import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/user.model.js';

const router = Router();

// Get all approved doctors
router.get('/doctors', asyncHandler(async (req, res) => {
  console.log('Fetching approved doctors...');
  
  const doctors = await User.find({
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true
  }).select('name email phone specializations consultationFee address averageRating totalRatings experience');

  console.log(`Found ${doctors.length} approved doctors`);

  res.status(200).json({
    status: 'success',
    data: {
      doctors
    }
  });
}));

// Get doctor details by ID
router.get('/doctors/:id', asyncHandler(async (req, res) => {
  const doctor = await User.findOne({
    _id: req.params.id,
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true
  }).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
}));

export default router; 
import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/user.model.js';
import { protect, restrictTo, isPatient } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import Appointment from '../models/appointment.model.js';

const router = Router();

// Public routes (no authentication required)
router.get('/doctors', asyncHandler(async (req, res) => {
  const doctors = await User.find({ 
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true 
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      doctors
    }
  });
}));

// Protected routes (require authentication)
router.use(protect);

// Patient-specific routes
router.get('/medical-records', isPatient, asyncHandler(async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name specialty')
      .sort('-date');

    res.status(200).json({
      status: 'success',
      data: {
        medicalRecords
      }
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw new AppError('Error fetching medical records', 500);
  }
}));

// Get patient's profile
router.get('/profile', isPatient, asyncHandler(async (req, res) => {
  const patient = await User.findById(req.user._id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      patient
    }
  });
}));

// Update patient's profile
router.patch('/profile', isPatient, asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'phone', 'address', 'medicalHistory'];
  const updates = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  const patient = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      patient
    }
  });
}));

// Get patient's appointments
router.get('/appointments', isPatient, asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor', 'name specialty consultationFee')
    .sort('-date -time');

  res.status(200).json({
    status: 'success',
    data: {
      appointments
    }
  });
}));

// Doctor and admin routes
router.get('/', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to perform this action', 403);
  }

  const patients = await User.find({ role: 'patient' }).select('-password');
  res.status(200).json({
    status: 'success',
    data: {
      patients
    }
  });
}));

// Get patient by ID (doctors and admins only)
router.get('/:id', protect, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get patient medical history (doctors and admins only)
router.get('/:id/medical-history', protect, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // TODO: Implement medical history retrieval
    res.status(200).json({
      status: 'success',
      data: {
        medicalHistory: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get patient upcoming appointments (doctors and admins only)
router.get('/:id/upcoming-appointments', protect, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // TODO: Implement upcoming appointments retrieval
    res.status(200).json({
      status: 'success',
      data: {
        appointments: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// Add patient notes (doctors and admins only)
router.post('/:id/notes', protect, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // TODO: Implement notes storage
    res.status(201).json({
      status: 'success',
      message: 'Notes added successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get patient notes (doctors and admins only)
router.get('/:id/notes', protect, restrictTo('doctor', 'admin'), async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // TODO: Implement notes retrieval
    res.status(200).json({
      status: 'success',
      data: {
        notes: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 
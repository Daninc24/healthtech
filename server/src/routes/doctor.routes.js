import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { protect, isDoctor, restrictTo } from '../middleware/auth.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Rating from '../models/rating.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';

const router = Router();

// Public routes - no authentication required
// Get all doctors
router.get('/', asyncHandler(async (req, res) => {
  const doctors = await User.find({ 
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true 
  }).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

  res.status(200).json({
    status: 'success',
    data: {
      doctors
    }
  });
}));

// Protected routes - require authentication
router.use(protect);
router.use(isDoctor);

// Get doctor's dashboard stats
router.get('/dashboard-stats', asyncHandler(async (req, res) => {
  try {
    const [
      totalPatients,
      totalAppointments,
      upcomingAppointments,
      totalEarnings,
      recentAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', assignedDoctor: req.user._id }),
      Appointment.countDocuments({ doctor: req.user._id }),
      Appointment.countDocuments({ 
        doctor: req.user._id,
        status: 'scheduled',
        date: { $gte: new Date() }
      }),
      Appointment.aggregate([
        { $match: { doctor: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fee' } } }
      ]),
      Appointment.find({ doctor: req.user._id })
        .sort({ date: -1, time: -1 })
        .limit(5)
        .populate('patient', 'name email')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalPatients,
          totalAppointments,
          upcomingAppointments,
          totalEarnings: totalEarnings[0]?.total || 0
        },
        recentAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new AppError('Failed to fetch dashboard stats', 500);
  }
}));

// Get doctor's profile
router.get('/profile', asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user._id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
}));

// Get doctor's consultation fee
router.get('/consultation-fee', protect, isDoctor, asyncHandler(async (req, res) => {
  console.log('Fetching consultation fee for user:', req.user._id);
  
  const doctor = await User.findOne({
    _id: req.user._id,
    role: 'doctor'
  }).select('consultationFee');

  if (!doctor) {
    console.error('Doctor not found with ID:', req.user._id);
    throw new AppError('Doctor not found. Please ensure you are registered as a doctor.', 404);
  }

  console.log('Found doctor:', doctor);

  res.status(200).json({
    status: 'success',
    data: {
      consultationFee: doctor.consultationFee || 0
    }
  });
}));

// Get all patients for the doctor
router.get('/patients', asyncHandler(async (req, res) => {
  const patients = await User.find({ 
    role: 'patient',
    assignedDoctor: req.user._id 
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      patients
    }
  });
}));

// Get patient's medical records
router.get('/patients/:id/medical-records', asyncHandler(async (req, res) => {
  const patient = await User.findOne({
    _id: req.params.id,
    role: 'patient',
    assignedDoctor: req.user._id
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const medicalRecords = await MedicalRecord.find({ 
    patient: patient._id,
    doctor: req.user._id 
  }).sort('-date');

  res.status(200).json({
    status: 'success',
    data: {
      records: medicalRecords
    }
  });
}));

// Get all medical records for all patients
router.get('/all-medical-records', asyncHandler(async (req, res) => {
  // Verify doctor exists and is active
  const doctor = await User.findOne({
    _id: req.user._id,
    role: 'doctor',
    isActive: true
  }).select('_id name email');

  if (!doctor) {
    throw new AppError('Doctor not found or account is inactive', 404);
  }

  // First get all patients assigned to this doctor
  const patients = await User.find({ 
    role: 'patient',
    assignedDoctor: doctor._id 
  }).select('_id name email');

  // Get all medical records for these patients
  const medicalRecords = await MedicalRecord.find({
    doctor: doctor._id,
    patient: { $in: patients.map(p => p._id) }
  })
  .sort('-date')
  .populate('patient', 'name email')
  .populate('doctor', 'name email');

  // Group records by patient
  const recordsByPatient = patients.map(patient => ({
    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email
    },
    records: medicalRecords
      .filter(record => record.patient._id.toString() === patient._id.toString())
      .map(record => ({
        id: record._id,
        date: record.date,
        diagnosis: record.diagnosis,
        prescription: record.prescription,
        notes: record.notes,
        followUpDate: record.followUpDate,
        status: record.status
      }))
  }));

  res.status(200).json({
    status: 'success',
    data: {
      records: recordsByPatient
    }
  });
}));

// Get all appointments for the doctor
router.get('/appointments', asyncHandler(async (req, res) => {
  // Verify doctor exists and is active
  const doctor = await User.findOne({
    _id: req.user._id,
    role: 'doctor',
    isActive: true
  }).select('_id name email');

  if (!doctor) {
    throw new AppError('Doctor not found or account is inactive', 404);
  }

  const { status, date, type } = req.query;
  
  // Build query
  const query = { doctor: doctor._id };
  
  // Add filters if provided
  if (status && status !== 'all') {
    query.status = status;
  }
  if (date) {
    query.date = new Date(date);
  }
  if (type) {
    query.type = type;
  }

  // Get appointments with populated patient details
  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone dateOfBirth gender')
    .sort('-date -time');

  // Format appointments for response
  const formattedAppointments = appointments.map(apt => ({
    id: apt._id,
    patient: {
      id: apt.patient._id,
      name: apt.patient.name,
      email: apt.patient.email,
      phone: apt.patient.phone,
      dateOfBirth: apt.patient.dateOfBirth,
      gender: apt.patient.gender
    },
    date: apt.date,
    time: apt.time,
    type: apt.type,
    status: apt.status,
    reason: apt.reason,
    consultationFee: apt.consultationFee,
    notes: apt.notes,
    createdAt: apt.createdAt
  }));

  // Get appointment statistics
  const stats = await Appointment.aggregate([
    { $match: { doctor: doctor._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format stats
  const appointmentStats = {
    total: appointments.length,
    byStatus: stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {})
  };

  res.status(200).json({
    status: 'success',
    data: {
      appointments: formattedAppointments,
      stats: appointmentStats
    }
  });
}));

// Get doctor details (public route)
router.get('/:id', asyncHandler(async (req, res) => {
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

// Get available slots for a specific date (public route)
router.get('/available-slots/:doctorId', asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new AppError('Date is required', 400);
  }

  // Verify doctor exists and is approved
  const doctor = await User.findOne({
    _id: doctorId,
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true
  });

  if (!doctor) {
    throw new AppError('Doctor not found or not available', 404);
  }

  // Get all booked slots for the date
  const bookedSlots = await Appointment.find({
    doctor: doctorId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('time');

  // Generate all possible slots (9 AM to 5 PM, 1-hour intervals)
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    allSlots.push(time);
  }

  // Filter out booked slots
  const bookedTimes = bookedSlots.map(slot => slot.time);
  const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

  res.status(200).json({
    status: 'success',
    data: {
      slots: availableSlots
    }
  });
}));

// Get doctor's medical records
router.get('/medical-records', asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user.id)
    .select('medicalRecords');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      medicalRecords: doctor.medicalRecords || []
    }
  });
}));

// Update doctor's medical records
router.patch('/medical-records', asyncHandler(async (req, res) => {
  const { medicalRecords } = req.body;

  const doctor = await User.findByIdAndUpdate(
    req.user.id,
    { medicalRecords },
    { new: true, runValidators: true }
  ).select('medicalRecords');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      medicalRecords: doctor.medicalRecords
    }
  });
}));

// Update doctor's consultation fee
router.patch('/consultation-fee', protect, isDoctor, asyncHandler(async (req, res) => {
  const { consultationFee } = req.body;

  // Validate consultation fee
  if (consultationFee === undefined || consultationFee === null) {
    throw new AppError('Consultation fee is required', 400);
  }

  if (typeof consultationFee !== 'number' || isNaN(consultationFee)) {
    throw new AppError('Consultation fee must be a number', 400);
  }

  if (consultationFee < 0) {
    throw new AppError('Consultation fee cannot be negative', 400);
  }

  // Update doctor's consultation fee
  const doctor = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      role: 'doctor'
    },
    { consultationFee },
    { new: true, runValidators: true }
  ).select('consultationFee');

  if (!doctor) {
    console.error('Doctor not found with ID:', req.user._id);
    throw new AppError('Doctor not found. Please ensure you are registered as a doctor.', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      consultationFee: doctor.consultationFee
    }
  });
}));

// Add a new patient
router.post('/patients', asyncHandler(async (req, res) => {
  const { name, email, phone, dateOfBirth, gender, medicalHistory } = req.body;

  // Check if patient already exists
  const existingPatient = await User.findOne({ email });
  if (existingPatient) {
    throw new AppError('Patient with this email already exists', 400);
  }

  // Create new patient
  const patient = await User.create({
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    medicalHistory,
    role: 'patient',
    assignedDoctor: req.user._id,
    isVerified: true // Auto-verify patients added by doctors
  });

  res.status(201).json({
    status: 'success',
    data: {
      patient
    }
  });
}));

// Get patient details
router.get('/patients/:id', asyncHandler(async (req, res) => {
  const patient = await User.findOne({
    _id: req.params.id,
    role: 'patient',
    assignedDoctor: req.user._id
  }).select('-password');

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

// Update patient details
router.patch('/patients/:id', asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'phone', 'medicalHistory'];
  const updates = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  const patient = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: 'patient',
      assignedDoctor: req.user._id
    },
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

// Get doctor's availability
router.get('/availability', asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user.id)
    .select('availability');

  res.status(200).json({
    status: 'success',
    data: {
      availability: doctor.availability
    }
  });
}));

// Update doctor's availability
router.patch('/availability', asyncHandler(async (req, res) => {
  const { availability } = req.body;

  if (!Array.isArray(availability)) {
    throw new AppError('Availability must be an array', 400);
  }

  // Validate each availability entry
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const slot of availability) {
    if (!validDays.includes(slot.day)) {
      throw new AppError(`Invalid day: ${slot.day}`, 400);
    }
    if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
      throw new AppError('Invalid time format. Use HH:MM format', 400);
    }
  }

  const doctor = await User.findByIdAndUpdate(
    req.user.id,
    { availability },
    { new: true, runValidators: true }
  ).select('availability');

  res.status(200).json({
    status: 'success',
    data: {
      availability: doctor.availability
    }
  });
}));

// Add rating to doctor
router.post('/:id/rate', protect, restrictTo('patient'), asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const doctorId = req.params.id;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Please provide a valid rating between 1 and 5', 400);
  }

  // Find doctor
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new AppError('Doctor not found', 404);
  }

  // Check if patient has had an appointment with this doctor
  const hasAppointment = await Appointment.findOne({
    doctor: doctorId,
    patient: req.user.id,
    status: 'completed'
  });

  if (!hasAppointment) {
    throw new AppError('You can only rate doctors you have had appointments with', 403);
  }

  // Check if patient has already rated this doctor
  const existingRating = await Rating.findOne({
    doctor: doctorId,
    patient: req.user.id
  });

  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.comment = comment;
    await existingRating.save();
  } else {
    // Create new rating
    await Rating.create({
      doctor: doctorId,
      patient: req.user.id,
      rating,
      comment
    });
  }

  // Update doctor's average rating
  const ratings = await Rating.find({ doctor: doctorId });
  const totalRatings = ratings.length;
  const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

  doctor.averageRating = averageRating;
  doctor.totalRatings = totalRatings;
  await doctor.save();

  res.status(200).json({
    status: 'success',
    data: {
      rating: {
        averageRating,
        totalRatings
      }
    }
  });
}));

// Update appointment status
router.patch('/appointments/:id', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctor: req.user._id },
    { status },
    { new: true }
  );

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
}));

// Schedule follow-up appointment
router.post('/appointments/follow-up', asyncHandler(async (req, res) => {
  const { appointmentId, date, time, reason } = req.body;

  // Find the original appointment
  const originalAppointment = await Appointment.findOne({
    _id: appointmentId,
    doctor: req.user._id,
    status: 'completed'
  });

  if (!originalAppointment) {
    throw new AppError('Completed appointment not found', 404);
  }

  // Check if the time slot is available
  const existingAppointment = await Appointment.findOne({
    doctor: req.user._id,
    date,
    time,
    status: { $ne: 'cancelled' }
  });

  if (existingAppointment) {
    throw new AppError('This time slot is already booked', 400);
  }

  // Create the follow-up appointment
  const followUpAppointment = await Appointment.create({
    doctor: req.user._id,
    patient: originalAppointment.patient,
    date,
    time,
    type: 'follow-up',
    reason,
    consultationFee: req.user.consultationFee,
    status: 'scheduled'
  });

  res.status(201).json({
    status: 'success',
    data: {
      appointment: followUpAppointment
    }
  });
}));

// Get available time slots for a specific date
router.get('/available-slots', asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    throw new AppError('Please provide a date', 400);
  }

  // Get all booked appointments for the date
  const bookedAppointments = await Appointment.find({
    doctor: req.user._id,
    date,
    status: { $ne: 'cancelled' }
  }).select('time');

  // Generate all possible time slots (9 AM to 5 PM)
  const allSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== 17) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Filter out booked slots
  const bookedTimes = bookedAppointments.map(apt => apt.time);
  const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

  res.status(200).json({
    status: 'success',
    data: {
      availableSlots
    }
  });
}));

export default router; 
import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { protect, restrictTo, isDoctor, isPatient } from '../middleware/auth.js';
import Appointment from '../models/appointment.model.js';
import User from '../models/user.model.js';
import { sendAppointmentNotification } from '../utils/notifications.js';
import { validateAppointmentData } from '../utils/validators.js';
import { asyncWrapper } from '../middleware/asyncWrapper.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Get all appointments (admin only)
router.get('/', protect, restrictTo('admin'), asyncWrapper(async (req, res) => {
  const { status, type, startDate, endDate, doctor, patient } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (doctor) query.doctor = doctor;
  if (patient) query.patient = patient;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email phone specializations')
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments
    }
  });
}));

// Get appointments for the authenticated user
router.get('/my-appointments', protect, isPatient, asyncHandler(async (req, res) => {
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

// Get all appointments for a doctor
router.get('/doctor', protect, isDoctor, asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const appointments = await Appointment.find({ doctor: req.user._id })
    .populate('patient', 'name email phone')
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Appointment.countDocuments({ doctor: req.user._id });

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get all appointments for a patient
router.get('/patient', protect, isPatient, asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor', 'name email phone specializations consultationFee')
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Appointment.countDocuments({ patient: req.user._id });

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create a new appointment
router.post('/', protect, asyncHandler(async (req, res) => {
  const { doctor, date, time, reason, type } = req.body;

  // Validate required fields
  if (!doctor || !date || !time || !reason || !type) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Check if doctor exists and is available
  const doctorExists = await User.findOne({
    _id: doctor,
    role: 'doctor',
    verificationStatus: 'approved',
    isActive: true
  });

  if (!doctorExists) {
    throw new AppError('Doctor not found or not available', 404);
  }

  // Check if the slot is available
  const existingAppointment = await Appointment.findOne({
    doctor,
    date: new Date(date),
    time,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingAppointment) {
    throw new AppError('This time slot is already booked', 400);
  }

  // Create the appointment
  const appointment = await Appointment.create({
    doctor,
    patient: req.user._id,
    date: new Date(date),
    time,
    reason,
    type,
    status: 'pending',
    consultationFee: doctorExists.consultationFee
  });

  // Send notification to doctor
  try {
    await sendAppointmentNotification(appointment, 'created');
  } catch (error) {
    console.error('Error sending notification:', error);
  }

  res.status(201).json({
    status: 'success',
    data: {
      appointment
    }
  });
}));

// Update an appointment
router.patch('/:id', protect, asyncWrapper(async (req, res, next) => {
  try {
    const { date, startTime, endTime, type, notes, symptoms, status, priority } = req.body;
    const appointmentId = req.params.id;
    const user = req.user;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check permissions
    if (user.role !== 'admin' && 
        appointment.patient.toString() !== user._id.toString() && 
        appointment.doctor.toString() !== user._id.toString()) {
      throw new AppError('You are not authorized to update this appointment', 403);
    }

    // Validate update data
    const validationError = validateAppointmentData(req.body, true);
    if (validationError) {
      throw new AppError(validationError, 400);
    }

    // Check if appointment can be updated
    if (status === 'cancelled' && !appointment.canBeCancelled()) {
      throw new AppError('Appointment cannot be cancelled less than 24 hours before the scheduled time', 400);
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          ...(date && { date: new Date(date) }),
          ...(startTime && { startTime }),
          ...(endTime && { endTime }),
          ...(type && { type }),
          ...(notes && { notes }),
          ...(symptoms && { symptoms }),
          ...(status && { status }),
          ...(priority && { priority })
        }
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email phone specializations' }
    ]);

    // Send notifications
    await sendAppointmentNotification(updatedAppointment, 'updated');

    res.status(200).json({
      status: 'success',
      data: {
        appointment: updatedAppointment
      }
    });
  } catch (error) {
    next(error);
  }
}));

// Cancel an appointment
router.patch('/:id/cancel', protect, isPatient, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patient: req.user._id
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.status === 'cancelled') {
    throw new AppError('Appointment is already cancelled', 400);
  }

  if (appointment.status === 'completed') {
    throw new AppError('Cannot cancel a completed appointment', 400);
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.status(200).json({
    status: 'success',
    data: {
      appointment
    }
  });
}));

// Get doctor's availability
router.get('/doctor/:doctorId/availability', protect, asyncWrapper(async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.doctorId;

    // Find doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Get doctor's availability
    const availability = doctor.availability;
    if (!availability || availability.length === 0) {
      throw new AppError('Doctor has not set their availability', 404);
    }

    // If date is provided, check for booked slots
    let bookedSlots = [];
    if (date) {
      const appointments = await Appointment.find({
        doctor: doctorId,
        date: new Date(date),
        status: { $nin: ['cancelled', 'no-show'] }
      }).select('startTime endTime');

      bookedSlots = appointments.map(apt => ({
        startTime: apt.startTime,
        endTime: apt.endTime
      }));
    }

    res.status(200).json({
      status: 'success',
      data: {
        availability,
        bookedSlots
      }
    });
  } catch (error) {
    next(error);
  }
}));

// Update doctor's availability
router.patch('/doctor/availability', protect, restrictTo('doctor'), asyncWrapper(async (req, res, next) => {
  try {
    const { availability } = req.body;
    const doctorId = req.user._id;

    // Validate availability data
    if (!Array.isArray(availability)) {
      throw new AppError('Availability must be an array', 400);
    }

    // Validate each availability slot
    for (const slot of availability) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        throw new AppError('Each availability slot must have day, startTime, and endTime', 400);
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new AppError('Invalid time format. Use HH:MM format', 400);
      }

      // Validate time range
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
      if ((endHours * 60 + endMinutes) <= (startHours * 60 + startMinutes)) {
        throw new AppError('End time must be after start time', 400);
      }
    }

    // Update doctor's availability
    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: { availability } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        availability: doctor.availability
      }
    });
  } catch (error) {
    next(error);
  }
}));

// Get appointment statistics
router.get('/stats', protect, restrictTo('admin', 'doctor'), asyncWrapper(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = stats.reduce((acc, curr) => acc + curr.count, 0);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        totalAppointments
      }
    });
  } catch (error) {
    next(error);
  }
}));

// Update appointment status
router.patch('/:id/status', protect, asyncWrapper(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Check authorization
  if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this appointment', 403);
  }
  if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this appointment', 403);
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    cancelled: [],
    completed: []
  };

  if (!validTransitions[appointment.status].includes(status)) {
    throw new AppError(`Cannot change status from ${appointment.status} to ${status}`, 400);
  }

  appointment.status = status;
  await appointment.save();

  res.json({
    success: true,
    data: appointment
  });
}));

// Add diagnosis and prescription
router.patch('/:id/diagnosis', protect, isDoctor, asyncWrapper(async (req, res) => {
  const { diagnosis, prescription, followUpDate } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this appointment', 403);
  }

  if (appointment.status !== 'completed') {
    throw new AppError('Can only add diagnosis to completed appointments', 400);
  }

  appointment.diagnosis = diagnosis;
  appointment.prescription = prescription;
  appointment.followUpDate = followUpDate;
  await appointment.save();

  res.json({
    success: true,
    data: appointment
  });
}));

// Update payment status
router.patch('/:id/payment', protect, isDoctor, asyncWrapper(async (req, res) => {
  const { paymentStatus, paymentId } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Only doctor can update payment status
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update payment status', 403);
  }

  appointment.paymentStatus = paymentStatus;
  appointment.paymentId = paymentId;
  await appointment.save();

  res.json({
    success: true,
    data: appointment
  });
}));

export default router; 
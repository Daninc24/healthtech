import { AppError } from '../middleware/errorHandler.js';

export const validateAppointmentData = (data, isUpdate = false) => {
  const {
    date,
    startTime,
    endTime,
    type,
    priority,
    symptoms,
    notes
  } = data;

  // Required fields for new appointments
  if (!isUpdate) {
    if (!date) return 'Date is required';
    if (!startTime) return 'Start time is required';
    if (!endTime) return 'End time is required';
    if (!type) return 'Appointment type is required';
  }

  // Date validation
  if (date) {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return 'Appointment date cannot be in the past';
    }
  }

  // Time format validation
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (startTime && !timeRegex.test(startTime)) {
    return 'Invalid start time format. Use HH:MM format';
  }
  if (endTime && !timeRegex.test(endTime)) {
    return 'Invalid end time format. Use HH:MM format';
  }

  // Time range validation
  if (startTime && endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      return 'End time must be after start time';
    }

    const duration = endTotalMinutes - startTotalMinutes;
    if (duration < 15) {
      return 'Appointment duration must be at least 15 minutes';
    }
    if (duration > 180) {
      return 'Appointment duration cannot exceed 3 hours';
    }
  }

  // Type validation
  const validTypes = ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'];
  if (type && !validTypes.includes(type)) {
    return 'Invalid appointment type';
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    return 'Invalid priority level';
  }

  // Symptoms validation
  if (symptoms && typeof symptoms !== 'string') {
    return 'Symptoms must be a string';
  }
  if (symptoms && symptoms.length > 1000) {
    return 'Symptoms description is too long';
  }

  // Notes validation
  if (notes && typeof notes !== 'string') {
    return 'Notes must be a string';
  }
  if (notes && notes.length > 2000) {
    return 'Notes are too long';
  }

  return null;
};

export const validateAvailabilityData = (availability) => {
  if (!Array.isArray(availability)) {
    return 'Availability must be an array';
  }

  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const slot of availability) {
    if (!slot.day || !validDays.includes(slot.day.toLowerCase())) {
      return 'Invalid day in availability slot';
    }

    if (!slot.startTime || !timeRegex.test(slot.startTime)) {
      return 'Invalid start time format in availability slot';
    }

    if (!slot.endTime || !timeRegex.test(slot.endTime)) {
      return 'Invalid end time format in availability slot';
    }

    const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
    const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      return 'End time must be after start time in availability slot';
    }

    const duration = endTotalMinutes - startTotalMinutes;
    if (duration < 30) {
      return 'Availability slot duration must be at least 30 minutes';
    }
    if (duration > 480) {
      return 'Availability slot duration cannot exceed 8 hours';
    }
  }

  return null;
};

export const validateUserData = (data, isUpdate = false) => {
  const {
    name,
    email,
    password,
    role,
    specializations,
    phone,
    address
  } = data;

  // Required fields for new users
  if (!isUpdate) {
    if (!name) return 'Name is required';
    if (!email) return 'Email is required';
    if (!password) return 'Password is required';
    if (!role) return 'Role is required';
  }

  // Name validation
  if (name) {
    if (typeof name !== 'string') return 'Name must be a string';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    if (name.length > 50) return 'Name must not exceed 50 characters';
  }

  // Email validation
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
  }

  // Password validation
  if (password) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
  }

  // Role validation
  const validRoles = ['patient', 'doctor', 'admin'];
  if (role && !validRoles.includes(role)) {
    return 'Invalid role';
  }

  // Specializations validation for doctors
  if (role === 'doctor' && specializations) {
    if (!Array.isArray(specializations)) {
      return 'Specializations must be an array';
    }
    if (specializations.length === 0) {
      return 'At least one specialization is required for doctors';
    }
    if (specializations.length > 5) {
      return 'Cannot have more than 5 specializations';
    }
  }

  // Phone validation
  if (phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return 'Invalid phone number format';
    }
  }

  // Address validation
  if (address) {
    if (typeof address !== 'string') {
      return 'Address must be a string';
    }
    if (address.length > 200) {
      return 'Address is too long';
    }
  }

  return null;
}; 
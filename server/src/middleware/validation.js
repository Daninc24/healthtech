import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  };
};

// Auth validation
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('role')
      .isIn(['patient', 'doctor'])
      .withMessage('Invalid role')
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  resetPassword: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
  ],
  updatePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
  ]
};

// User validation
export const userValidation = {
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-]{10,}$/)
      .withMessage('Please enter a valid phone number'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Address must not exceed 200 characters')
  ]
};

// Appointment validation
export const appointmentValidation = {
  create: [
    body('doctorId')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    body('date')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date < now) {
          throw new Error('Appointment date cannot be in the past');
        }
        return true;
      }),
    body('time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:mm)'),
    body('type')
      .isIn(['consultation', 'follow-up', 'emergency'])
      .withMessage('Invalid appointment type')
  ],
  update: [
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date < now) {
          throw new Error('Appointment date cannot be in the past');
        }
        return true;
      }),
    body('time')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:mm)'),
    body('status')
      .optional()
      .isIn(['scheduled', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid appointment status')
  ]
};

// Patient validation
export const patientValidation = {
  update: [
    body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
    body('allergies').optional().isArray().withMessage('Allergies must be an array'),
    body('emergencyContact').optional().isObject().withMessage('Emergency contact must be an object')
  ]
};

// Doctor validation
export const doctorValidation = {
  update: [
    body('specialization').optional().isString().withMessage('Specialization must be a string'),
    body('licenseNumber').optional().isString().withMessage('License number must be a string'),
    body('consultationFee').optional().isNumeric().withMessage('Consultation fee must be a number')
  ]
}; 
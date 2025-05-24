import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An appointment must belong to a patient']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An appointment must be with a doctor']
  },
  date: {
    type: Date,
    required: [true, 'An appointment must have a date']
  },
  time: {
    type: String,
    required: [true, 'An appointment must have a time']
  },
  reason: {
    type: String,
    required: [true, 'An appointment must have a reason']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['in-person', 'online'],
    default: 'in-person'
  },
  notes: String,
  followUpDate: Date
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ doctor: 1, date: 1, time: 1 });
appointmentSchema.index({ patient: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 
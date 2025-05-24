import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Date is required']
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required']
  },
  prescription: {
    type: String,
    required: [true, 'Prescription is required']
  },
  notes: {
    type: String
  },
  attachments: [{
    type: String // URLs to attached files
  }],
  followUpDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord; 
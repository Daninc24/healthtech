import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    enum: ['admin', 'doctor', 'patient', 'all'],
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'verification', 'subscription', 'system', 'new_account'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 
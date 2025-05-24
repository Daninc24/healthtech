import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure a patient can only rate a doctor once
ratingSchema.index({ doctor: 1, patient: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating; 
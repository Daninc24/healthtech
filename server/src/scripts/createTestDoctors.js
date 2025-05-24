import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testDoctors = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'Password123!',
    role: 'doctor',
    phone: '+1234567890',
    specializations: ['Cardiology', 'Internal Medicine'],
    consultationFee: 150,
    experience: 10,
    address: {
      street: '123 Medical Center Dr',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    verificationStatus: 'approved',
    isActive: true,
    averageRating: 4.5,
    totalRatings: 25
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'Password123!',
    role: 'doctor',
    phone: '+1234567891',
    specializations: ['Pediatrics', 'Family Medicine'],
    consultationFee: 120,
    experience: 8,
    address: {
      street: '456 Health Ave',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      zipCode: '02108'
    },
    verificationStatus: 'approved',
    isActive: true,
    averageRating: 4.8,
    totalRatings: 32
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'Password123!',
    role: 'doctor',
    phone: '+1234567892',
    specializations: ['Neurology', 'Psychiatry'],
    consultationFee: 200,
    experience: 15,
    address: {
      street: '789 Brain St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    verificationStatus: 'approved',
    isActive: true,
    averageRating: 4.7,
    totalRatings: 18
  }
];

const createTestDoctors = async () => {
  try {
    // Connect to MongoDB with authentication
    const MONGODB_URI = 'mongodb://localhost:27017/healthtech';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create new doctors without deleting existing ones
    const createdDoctors = await User.create(testDoctors);
    console.log('Created test doctors:', createdDoctors);

    console.log('Test doctors created successfully');
  } catch (error) {
    console.error('Error creating test doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestDoctors(); 
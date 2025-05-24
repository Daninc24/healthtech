import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from '../src/models/subscription.model.js';

dotenv.config();

const subscriptionPlans = [
  {
    name: 'basic',
    price: 0,
    duration: 30, // days
    features: [
      'Basic appointment scheduling',
      'Patient records management',
      'Email notifications'
    ],
    maxAppointments: 10,
    maxPatients: 50,
    isActive: true
  },
  {
    name: 'premium',
    price: 49.99,
    duration: 30,
    features: [
      'Advanced appointment scheduling',
      'Patient records management',
      'Email and SMS notifications',
      'Video consultations',
      'Prescription management',
      'Analytics dashboard'
    ],
    maxAppointments: 50,
    maxPatients: 200,
    isActive: true
  },
  {
    name: 'enterprise',
    price: 99.99,
    duration: 30,
    features: [
      'Unlimited appointments',
      'Unlimited patients',
      'All premium features',
      'Priority support',
      'Custom integrations',
      'Team management',
      'Advanced analytics'
    ],
    maxAppointments: -1, // unlimited
    maxPatients: -1, // unlimited
    isActive: true
  }
];

const initSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthtech');
    console.log('Connected to MongoDB');

    // Clear existing subscriptions
    await Subscription.deleteMany({});
    console.log('Cleared existing subscriptions');

    // Create new subscriptions
    const subscriptions = await Subscription.insertMany(subscriptionPlans);
    console.log('Created subscription plans:', subscriptions.map(s => s.name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error initializing subscriptions:', error);
    process.exit(1);
  }
};

initSubscriptions(); 
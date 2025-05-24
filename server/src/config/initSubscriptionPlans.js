import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from '../models/subscription.model.js';

dotenv.config();

const subscriptionPlans = [
  {
    name: 'basic',
    description: 'Basic subscription plan for patients',
    price: 9.99,
    duration: 1,
    features: [
      'Up to 5 appointments per month',
      'Basic messaging with doctors',
      'Access to medical records',
      'Email support'
    ],
    maxAppointments: 5,
    maxMessages: 20,
    maxVideoCalls: 0,
    prioritySupport: false
  },
  {
    name: 'premium',
    description: 'Premium subscription plan with advanced features',
    price: 19.99,
    duration: 1,
    features: [
      'Unlimited appointments',
      'Unlimited messaging with doctors',
      'Video consultations',
      'Priority support',
      'Access to medical records',
      'Prescription management'
    ],
    maxAppointments: 0, // unlimited
    maxMessages: 0, // unlimited
    maxVideoCalls: 5,
    prioritySupport: true
  },
  {
    name: 'professional',
    description: 'Professional plan for healthcare providers',
    price: 49.99,
    duration: 1,
    features: [
      'Unlimited appointments',
      'Unlimited messaging',
      'Unlimited video consultations',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ],
    maxAppointments: 0, // unlimited
    maxMessages: 0, // unlimited
    maxVideoCalls: 0, // unlimited
    prioritySupport: true
  }
];

const initializeSubscriptionPlans = async () => {
  try {
    // Connect to MongoDB without authentication for local development
    await mongoose.connect('mongodb://localhost:27017/healthtech');
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Subscription.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Create new plans
    const createdPlans = await Subscription.insertMany(subscriptionPlans);
    console.log('Created subscription plans:', createdPlans.map(plan => plan.name));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeSubscriptionPlans(); 
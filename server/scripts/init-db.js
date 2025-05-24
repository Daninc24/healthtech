import mongoose from 'mongoose';

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/healthtech');
    console.log('Connected to MongoDB');

    // Create collections and indexes
    const db = mongoose.connection.db;

    // Users collection
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Users collection created');

    // Appointments collection
    await db.createCollection('appointments');
    await db.collection('appointments').createIndex({ patient: 1 });
    await db.collection('appointments').createIndex({ doctor: 1 });
    await db.collection('appointments').createIndex({ date: 1 });
    console.log('Appointments collection created');

    // Patients collection
    await db.createCollection('patients');
    await db.collection('patients').createIndex({ userId: 1 }, { unique: true });
    console.log('Patients collection created');

    // Reminders collection
    await db.createCollection('reminders');
    await db.collection('reminders').createIndex({ appointment: 1 });
    await db.collection('reminders').createIndex({ user: 1 });
    console.log('Reminders collection created');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the initialization
initDatabase(); 
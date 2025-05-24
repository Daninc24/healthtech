import { MongoClient } from 'mongodb';

const setupMongoDB = async () => {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const adminDb = client.db('admin');

    // Create admin user if it doesn't exist
    try {
      await adminDb.command({
        createUser: 'admin',
        pwd: 'admin123',
        roles: [
          { role: 'userAdminAnyDatabase', db: 'admin' },
          { role: 'dbAdminAnyDatabase', db: 'admin' },
          { role: 'readWriteAnyDatabase', db: 'admin' }
        ]
      });
      console.log('Admin user created successfully');
    } catch (error) {
      if (error.code === 51003) {
        console.log('Admin user already exists');
      } else {
        throw error;
      }
    }

    // Create and configure the healthtech database
    const healthtechDb = client.db('healthtech');
    await healthtechDb.createCollection('users');
    await healthtechDb.createCollection('appointments');
    await healthtechDb.createCollection('patients');
    await healthtechDb.createCollection('reminders');

    console.log('Database and collections created successfully');
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    await client.close();
  }
};

setupMongoDB(); 
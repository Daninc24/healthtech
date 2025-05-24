import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new AppError('MongoDB URI is not defined in environment variables', 500);
    }

    let retries = 5;
    while (retries > 0) {
      try {
        const conn = await mongoose.connect(MONGODB_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          // Attempt to reconnect
          setTimeout(() => {
            console.log('Attempting to reconnect to MongoDB...');
            mongoose.connect(MONGODB_URI, options);
          }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
          try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
          } catch (err) {
            console.error('Error during MongoDB disconnection:', err);
            process.exit(1);
          }
        });

        return conn;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new AppError(`Failed to connect to MongoDB after 5 attempts: ${error.message}`, 500);
        }
        console.log(`MongoDB connection failed. Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 
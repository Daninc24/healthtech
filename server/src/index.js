import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { setupRedis } from './config/redis.js';
import { setupAgenda } from './config/agenda.js';
import { errorHandler } from './middleware/errorHandler.js';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { stream } from './config/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Improved CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : [/^http:\/\/localhost:\d+$/],  // Allow any localhost port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream }));

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import patientRoutes from './routes/patient.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import adminRoutes from './routes/admin.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import publicRoutes from './routes/public.routes.js';

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details
  console.error({
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Setup Redis (optional)
    if (process.env.REDIS_ENABLED === 'true') {
      try {
        const redisClient = await setupRedis();
        if (redisClient) {
          console.log('Redis setup completed successfully');
        }
      } catch (error) {
        console.warn('Redis setup failed, continuing without Redis:', error.message);
      }
    } else {
      console.log('Redis is disabled in environment');
    }

    // Setup Agenda
    try {
      await setupAgenda();
    } catch (error) {
      console.warn('Agenda setup failed, continuing without Agenda:', error.message);
    }

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log('Redis:', process.env.REDIS_ENABLED === 'true' ? 'Enabled' : 'Disabled');
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer(); 
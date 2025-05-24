import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import Appointment from '../models/appointment.model.js';
import { protect, isAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Protect all admin routes
router.use(protect);
router.use(isAdmin);

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  console.log('Admin route accessed by:', req.user._id);
  console.log('Admin role:', req.user.role);

  const users = await User.find()
    .select('-password')
    .populate('subscriptionPlan');
  
  console.log(`Found ${users.length} users`);
  
  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
}));

// Get user by ID
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subscription.plan');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user verification status
router.patch('/users/:id/verify', async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid verification status', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'doctor') {
      throw new AppError('Only doctors can be verified', 400);
    }

    user.verificationStatus = status;
    user.isVerified = status === 'approved';
    
    if (status === 'approved') {
      user.verificationDocuments.forEach(doc => {
        doc.verified = true;
        doc.verifiedAt = new Date();
        doc.verifiedBy = req.user._id;
      });
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Manage user subscription
router.post('/users/:id/subscription', async (req, res, next) => {
  try {
    const { planId, duration } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const subscription = await Subscription.findById(planId);
    if (!subscription) {
      throw new AppError('Invalid subscription plan', 400);
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (duration || subscription.duration) * 24 * 60 * 60 * 1000);

    user.subscription = {
      plan: subscription._id,
      startDate,
      endDate,
      status: 'active',
      autoRenew: true
    };

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscription: user.subscription
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Subscription Plan Routes
router.get('/subscriptions', protect, isAdmin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ price: 1 });
    res.status(200).json({
      status: 'success',
      data: {
        subscriptions
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription plans'
    });
  }
});

router.post('/subscriptions', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;

    // Validate required fields
    if (!name || !description || !price || !duration || !features) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Convert features string to array if it's not already
    const featuresArray = Array.isArray(features) ? features : features.split('\n').filter(f => f.trim());

    const subscription = await Subscription.create({
      name,
      description,
      price: Number(price),
      duration: Number(duration),
      features: featuresArray
    });

    res.status(201).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subscription plan'
    });
  }
});

router.patch('/subscriptions/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    // Convert features string to array if it's not already
    const featuresArray = Array.isArray(features) ? features : features.split('\n').filter(f => f.trim());

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        name: name || subscription.name,
        description: description || subscription.description,
        price: price ? Number(price) : subscription.price,
        duration: duration ? Number(duration) : subscription.duration,
        features: featuresArray.length > 0 ? featuresArray : subscription.features
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        subscription: updatedSubscription
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update subscription plan'
    });
  }
});

router.delete('/subscriptions/:id', protect, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription plan not found'
      });
    }

    // Check if any users are currently subscribed to this plan
    const subscribedUsers = await User.find({ subscriptionPlan: req.params.id });
    if (subscribedUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete subscription plan that has active subscribers'
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete subscription plan'
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const verifiedDoctors = await User.countDocuments({ 
      role: 'doctor', 
      isVerified: true 
    });
    const activeSubscriptions = await User.countDocuments({
      'subscription.status': 'active'
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalDoctors,
          totalPatients,
          verifiedDoctors,
          activeSubscriptions
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get pending doctors
router.get('/pending-doctors', async (req, res, next) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      isVerified: false,
      verificationStatus: 'pending'
    }).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        doctors
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify doctor
router.post('/verify-doctor/:id', async (req, res, next) => {
  try {
    const { approved } = req.body;
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor'
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    doctor.isVerified = approved;
    doctor.verificationStatus = approved ? 'approved' : 'rejected';
    
    if (approved) {
      // Add notification for approved doctor
      doctor.notifications.push({
        type: 'verification',
        message: 'Your account has been approved. You can now start accepting patients.',
        read: false
      });
    } else {
      // Add notification for rejected doctor
      doctor.notifications.push({
        type: 'verification',
        message: 'Your account verification has been rejected. Please contact support for more information.',
        read: false
      });
    }

    await doctor.save();

    res.status(200).json({
      status: 'success',
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          isVerified: doctor.isVerified,
          verificationStatus: doctor.verificationStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all doctors
router.get('/doctors', async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        doctors
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all patients
router.get('/patients', async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        patients
      }
    });
  } catch (error) {
    next(error);
  }
});

// Patient Subscription Routes
router.post('/patients/:id/renew-subscription', protect, isAdmin, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    if (patient.role !== 'patient') {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a patient'
      });
    }

    // Get the patient's current subscription plan
    const subscription = await Subscription.findById(patient.subscriptionPlan);
    if (!subscription) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient has no active subscription plan'
      });
    }

    // Calculate new subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + subscription.duration);

    // Update patient's subscription
    patient.subscriptionStartDate = startDate;
    patient.subscriptionEndDate = endDate;
    patient.subscriptionStatus = 'active';

    // Add to subscription history
    patient.subscriptionHistory.push({
      plan: subscription._id,
      startDate,
      endDate,
      status: 'active',
      paymentAmount: subscription.price,
      paymentDate: new Date()
    });

    await patient.save();

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to renew subscription'
    });
  }
});

router.post('/patients/:id/cancel-subscription', protect, isAdmin, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    if (patient.role !== 'patient') {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a patient'
      });
    }

    if (patient.subscriptionStatus !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Patient has no active subscription to cancel'
      });
    }

    // Update patient's subscription status
    patient.subscriptionStatus = 'cancelled';

    // Update the latest subscription history entry
    if (patient.subscriptionHistory.length > 0) {
      const latestHistory = patient.subscriptionHistory[patient.subscriptionHistory.length - 1];
      latestHistory.status = 'cancelled';
      latestHistory.endDate = new Date();
    }

    await patient.save();

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel subscription'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    // Get total counts
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const pendingVerifications = await User.countDocuments({ 
      role: 'doctor', 
      verificationStatus: 'pending' 
    });
    const activeSubscriptions = await User.countDocuments({
      'subscription.status': 'active'
    });

    // Get total appointments (you'll need to import the Appointment model)
    const Appointment = mongoose.model('Appointment');
    const totalAppointments = await Appointment.countDocuments();

    // Calculate total revenue (sum of all consultation fees)
    const doctors = await User.find({ role: 'doctor' });
    const totalRevenue = doctors.reduce((sum, doctor) => sum + (doctor.consultationFee || 0), 0);

    // Get recent activity (last 5 appointments)
    const recentActivity = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'name')
      .populate('doctor', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalDoctors,
          totalPatients,
          pendingVerifications,
          activeSubscriptions,
          totalAppointments,
          totalRevenue
        },
        recentActivity: recentActivity.map(activity => ({
          description: `Appointment scheduled between ${activity.patient.name} and Dr. ${activity.doctor.name}`,
          timestamp: activity.createdAt,
          type: activity.status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(error);
  }
});

// Approve or reject account
router.post('/accounts/:id/verify', async (req, res, next) => {
  try {
    const { approved, rejectionReason } = req.body;
    const account = await User.findById(req.params.id);

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    if (account.isVerified) {
      throw new AppError('Account is already verified', 400);
    }

    account.isVerified = approved;
    account.verificationStatus = approved ? 'approved' : 'rejected';

    // If approved and it's a doctor, start their trial subscription
    if (approved && account.role === 'doctor') {
      try {
        await account.startTrialSubscription();
      } catch (error) {
        console.error('Error starting trial subscription:', error);
        // Continue with verification even if trial subscription fails
      }
    }

    // Add notification for the user
    account.notifications.push({
      type: 'verification',
      message: approved 
        ? 'Your account has been approved. You can now access all features. A 14-day trial subscription has been activated for you.'
        : `Your account verification has been rejected. ${rejectionReason || 'Please contact support for more information.'}`,
      read: false,
      createdAt: new Date()
    });

    await account.save();

    res.status(200).json({
      status: 'success',
      data: {
        account: {
          id: account._id,
          name: account.name,
          email: account.email,
          role: account.role,
          isVerified: account.isVerified,
          verificationStatus: account.verificationStatus,
          trialSubscription: account.trialSubscription
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get pending accounts with trial status
router.get('/pending-accounts', async (req, res, next) => {
  try {
    const pendingAccounts = await User.find({
      isVerified: false,
      verificationStatus: 'pending'
    }).select('-password');

    // Add trial status information
    const accountsWithTrialStatus = pendingAccounts.map(account => ({
      ...account.toObject(),
      hasActiveTrial: account.hasActiveTrial(),
      trialEndDate: account.trialSubscription?.endDate
    }));

    res.status(200).json({
      status: 'success',
      data: {
        accounts: accountsWithTrialStatus
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get account verification history
router.get('/accounts/:id/verification-history', async (req, res, next) => {
  try {
    const account = await User.findById(req.params.id)
      .select('verificationStatus isVerified notifications');

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    const verificationHistory = account.notifications
      .filter(notification => notification.type === 'verification')
      .map(notification => ({
        status: notification.message.includes('approved') ? 'approved' : 'rejected',
        message: notification.message,
        date: notification.createdAt
      }));

    res.status(200).json({
      status: 'success',
      data: {
        verificationHistory
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check if admin exists
router.get('/check-admin', asyncHandler(async (req, res) => {
  const adminExists = await User.exists({ role: 'admin' });
  
  res.status(200).json({
    status: 'success',
    data: {
      adminExists
    }
  });
}));

// Get pending approvals
router.get('/pending-approvals', asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({
    $or: [
      { role: 'doctor', verificationStatus: 'pending' },
      { role: 'patient', isVerified: false }
    ]
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      pendingUsers
    }
  });
}));

// Approve user
router.patch('/users/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'doctor') {
    user.verificationStatus = status;
    user.isVerified = status === 'approved';
    
    if (status === 'approved') {
      // Mark all verification documents as verified
      if (user.verificationDocuments) {
        user.verificationDocuments.forEach(doc => {
          doc.verified = true;
          doc.verifiedAt = new Date();
          doc.verifiedBy = req.user._id;
        });
      }

      // Start trial subscription for approved doctors
      try {
        const trialSubscription = {
          plan: 'trial',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          status: 'active',
          autoRenew: false
        };
        user.subscription = trialSubscription;
      } catch (error) {
        console.error('Error setting up trial subscription:', error);
      }

      // Add notification for approved doctor
      user.notifications.push({
        type: 'verification',
        message: 'Your account has been approved. You can now start accepting patients. A 14-day trial subscription has been activated for you.',
        read: false,
        createdAt: new Date()
      });
    } else if (status === 'rejected') {
      user.verificationRejectionReason = reason;
      user.notifications.push({
        type: 'verification',
        message: `Your account verification has been rejected. ${reason || 'Please contact support for more information.'}`,
        read: false,
        createdAt: new Date()
      });
    }
  } else if (user.role === 'patient') {
    user.isVerified = status === 'approved';
    if (status === 'rejected') {
      user.verificationRejectionReason = reason;
    }
    
    // Add notification for patient
    user.notifications.push({
      type: 'verification',
      message: status === 'approved' 
        ? 'Your account has been approved. You can now access all features.'
        : `Your account verification has been rejected. ${reason || 'Please contact support for more information.'}`,
      read: false,
      createdAt: new Date()
    });
  }

  await user.save();

  // Return updated user data
  const updatedUser = await User.findById(id)
    .select('-password')
    .populate('subscription.plan');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
}));

// Update user status
router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    }
  });
}));

export default router; 
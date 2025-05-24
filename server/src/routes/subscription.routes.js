import { Router } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { protect, restrictTo } from '../middleware/auth.js';
import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Get all subscription plans (public)
router.get('/plans', asyncHandler(async (req, res) => {
  const plans = await Subscription.find({ isActive: true })
    .select('-createdAt -updatedAt -__v')
    .sort({ price: 1 });

  res.status(200).json({
    status: 'success',
    data: plans
  });
}));

// Get subscription plan by ID (public)
router.get('/plans/:id', asyncHandler(async (req, res) => {
  const plan = await Subscription.findById(req.params.id)
    .select('-createdAt -updatedAt -__v');

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: plan
  });
}));

// Create subscription plan (admin only)
router.post('/plans', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  const { name, description, price, duration, features } = req.body;

  const plan = await Subscription.create({
    name,
    description,
    price,
    duration,
    features
  });

  res.status(201).json({
    status: 'success',
    data: plan
  });
}));

// Update subscription plan (admin only)
router.patch('/plans/:id', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  const plan = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: plan
  });
}));

// Delete subscription plan (admin only)
router.delete('/plans/:id', protect, restrictTo('admin'), asyncHandler(async (req, res) => {
  const plan = await Subscription.findByIdAndDelete(req.params.id);

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// Subscribe to a plan (authenticated users)
router.post('/subscribe', protect, asyncHandler(async (req, res) => {
  const { planId } = req.body;

  const plan = await Subscription.findById(planId);
  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.duration);

  // Update user's subscription
  user.subscriptionPlan = plan._id;
  user.subscriptionStartDate = startDate;
  user.subscriptionEndDate = endDate;
  user.subscriptionStatus = 'active';

  // Add to subscription history
  user.subscriptionHistory.push({
    plan: plan._id,
    startDate,
    endDate,
    status: 'active',
    paymentAmount: plan.price,
    paymentDate: new Date()
  });

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Successfully subscribed to plan',
      subscription: {
        plan: plan.name,
        startDate,
        endDate,
        status: 'active'
      }
    }
  });
}));

// Cancel subscription (authenticated users)
router.post('/cancel', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.subscriptionPlan) {
    throw new AppError('No active subscription found', 400);
  }

  user.subscriptionStatus = 'cancelled';
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Subscription cancelled successfully',
      subscription: {
        status: 'cancelled',
        endDate: user.subscriptionEndDate
      }
    }
  });
}));

// Get user's subscription status (authenticated users)
router.get('/status', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('subscriptionPlan');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription: {
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        status: user.subscriptionStatus,
        isActive: user.hasActiveSubscription
      }
    }
  });
}));

export default router; 
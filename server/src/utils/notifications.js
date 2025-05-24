import { AppError } from '../middleware/errorHandler.js';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  appointmentCreated: (appointment) => ({
    subject: 'New Appointment Scheduled',
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Your appointment has been scheduled successfully.</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li>Date: ${appointment.date.toLocaleDateString()}</li>
        <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
        <li>Type: ${appointment.type}</li>
        <li>Doctor: ${appointment.doctor.name}</li>
      </ul>
      <p>Please arrive 10 minutes before your scheduled time.</p>
    `
  }),

  appointmentUpdated: (appointment) => ({
    subject: 'Appointment Updated',
    html: `
      <h2>Appointment Update</h2>
      <p>Your appointment has been updated.</p>
      <h3>Updated Details:</h3>
      <ul>
        <li>Date: ${appointment.date.toLocaleDateString()}</li>
        <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
        <li>Type: ${appointment.type}</li>
        <li>Doctor: ${appointment.doctor.name}</li>
      </ul>
      <p>Please arrive 10 minutes before your scheduled time.</p>
    `
  }),

  appointmentCancelled: (appointment) => ({
    subject: 'Appointment Cancelled',
    html: `
      <h2>Appointment Cancellation</h2>
      <p>Your appointment has been cancelled.</p>
      <h3>Cancelled Appointment Details:</h3>
      <ul>
        <li>Date: ${appointment.date.toLocaleDateString()}</li>
        <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
        <li>Type: ${appointment.type}</li>
        <li>Doctor: ${appointment.doctor.name}</li>
        <li>Reason: ${appointment.cancellationReason || 'Not specified'}</li>
      </ul>
      <p>Please contact us if you need to reschedule.</p>
    `
  }),

  appointmentReminder: (appointment) => ({
    subject: 'Appointment Reminder',
    html: `
      <h2>Appointment Reminder</h2>
      <p>This is a reminder for your upcoming appointment.</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li>Date: ${appointment.date.toLocaleDateString()}</li>
        <li>Time: ${appointment.startTime} - ${appointment.endTime}</li>
        <li>Type: ${appointment.type}</li>
        <li>Doctor: ${appointment.doctor.name}</li>
      </ul>
      <p>Please arrive 10 minutes before your scheduled time.</p>
    `
  })
};

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError('Failed to send email notification', 500);
  }
};

// Send appointment notification
export const sendAppointmentNotification = async (appointment, type) => {
  try {
    // Populate appointment data if not already populated
    if (!appointment.populated('patient') || !appointment.populated('doctor')) {
      await appointment.populate([
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email phone' }
      ]);
    }

    const template = emailTemplates[`appointment${type.charAt(0).toUpperCase() + type.slice(1)}`];
    if (!template) {
      throw new AppError('Invalid notification type', 400);
    }

    const { subject, html } = template(appointment);

    // Send notification to patient
    if (appointment.patient.email) {
      await sendEmail(appointment.patient.email, subject, html);
    }

    // Send notification to doctor
    if (appointment.doctor.email) {
      await sendEmail(appointment.doctor.email, subject, html);
    }

    // Add notification to user's notification list
    await User.updateMany(
      { _id: { $in: [appointment.patient._id, appointment.doctor._id] } },
      {
        $push: {
          notifications: {
            type: `appointment_${type}`,
            message: subject,
            appointment: appointment._id,
            createdAt: new Date()
          }
        }
      }
    );
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    throw new AppError('Failed to send appointment notification', 500);
  }
};

// Send appointment reminder
export const sendAppointmentReminder = async (appointment) => {
  try {
    // Populate appointment data if not already populated
    if (!appointment.populated('patient') || !appointment.populated('doctor')) {
      await appointment.populate([
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email phone' }
      ]);
    }

    const { subject, html } = emailTemplates.appointmentReminder(appointment);

    // Send reminder to patient
    if (appointment.patient.email) {
      await sendEmail(appointment.patient.email, subject, html);
    }

    // Send reminder to doctor
    if (appointment.doctor.email) {
      await sendEmail(appointment.doctor.email, subject, html);
    }

    // Add reminder to user's notification list
    await User.updateMany(
      { _id: { $in: [appointment.patient._id, appointment.doctor._id] } },
      {
        $push: {
          notifications: {
            type: 'appointment_reminder',
            message: subject,
            appointment: appointment._id,
            createdAt: new Date()
          }
        }
      }
    );
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    throw new AppError('Failed to send appointment reminder', 500);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    await User.updateOne(
      { _id: userId, 'notifications._id': notificationId },
      { $set: { 'notifications.$.read': true } }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new AppError('Failed to mark notification as read', 500);
  }
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId)
      .select('notifications')
      .slice('notifications', -limit)
      .sort({ 'notifications.createdAt': -1 });

    return user?.notifications || [];
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw new AppError('Failed to get user notifications', 500);
  }
}; 
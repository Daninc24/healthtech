import Agenda from 'agenda';
import mongoose from 'mongoose';

let agenda = null;

const setupAgenda = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    agenda = new Agenda({
      db: {
        address: MONGODB_URI,
        collection: 'agendaJobs',
        options: {
          useUnifiedTopology: true
        }
      },
      processEvery: '30 seconds',
      maxConcurrency: 20
    });

    // Event handlers
    agenda.on('start', job => {
      console.log(`Job ${job.attrs.name} starting`);
    });

    agenda.on('complete', job => {
      console.log(`Job ${job.attrs.name} completed`);
    });

    agenda.on('fail', (err, job) => {
      console.error(`Job ${job.attrs.name} failed:`, err);
    });

    // Define jobs
    agenda.define('sendAppointmentReminder', async (job) => {
      const { appointmentId, userId } = job.attrs.data;
      // Implement reminder sending logic here
      console.log(`Sending reminder for appointment ${appointmentId} to user ${userId}`);
    });

    agenda.define('sendFollowUpReminder', async (job) => {
      const { patientId, doctorId } = job.attrs.data;
      // Implement follow-up reminder logic here
      console.log(`Sending follow-up reminder for patient ${patientId} to doctor ${doctorId}`);
    });

    await agenda.start();
    console.log('Agenda started successfully');
    return agenda;
  } catch (error) {
    console.error('Agenda setup failed:', error);
    return null;
  }
};

const getAgenda = () => {
  if (!agenda) {
    throw new Error('Agenda not initialized');
  }
  return agenda;
};

// Graceful shutdown
const gracefulShutdown = async () => {
  if (agenda) {
    await agenda.stop();
    console.log('Agenda stopped');
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { setupAgenda, getAgenda }; 
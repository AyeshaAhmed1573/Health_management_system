import mongoose from 'mongoose';
import Appointment from '../Models/Appointment.model.js';
import Prescription from '../Models/Prescription.model.js';
import Notification from '../Models/Notification.model.js';
import Doctor from '../Models/Doctor.model.js';
import { notify } from './notificationService.js';
import { localParts } from '../utils/time.js';

const HOUR = 36e5, DAY = 24 * HOUR;

/** Appointment reminders: 24h and 1h before (SRS 4.8). Flags make each fire once. */
export async function sendAppointmentReminders(now = new Date()) {
  const windows = [
    { flag: 'reminder24hSent', within: DAY, label: 'tomorrow' },
    { flag: 'reminder1hSent', within: HOUR, label: 'in about an hour' },
  ];
  for (const { flag, within, label } of windows) {
    const due = await Appointment.find({
      status: 'confirmed', [flag]: false,
      slotTime: { $gt: now, $lte: new Date(now.getTime() + within) },
    }).populate('profileId', 'name');

    for (const a of due) {
      const when = `${a.slotTime.toISOString()}`;
      const doctor = await Doctor.findById(a.doctorId).select('userId');
      await Promise.all([
        notify(a.userId, {
          type: 'appointment_reminder', title: 'Appointment reminder', email: true,
          message: `${a.profileId?.name || 'Your'} appointment is ${label} (${when}).${a.meetingLink ? ' Join: ' + a.meetingLink : ''}`,
          refModel: 'Appointment', refId: a._id,
        }),
        doctor && notify(doctor.userId, {
          type: 'appointment_reminder', title: 'Appointment reminder',
          message: `You have an appointment ${label} (${when}).`, refModel: 'Appointment', refId: a._id,
        }),
      ]);
      a[flag] = true;
      if (flag === 'reminder24hSent' && a.slotTime.getTime() - now.getTime() <= HOUR) a.reminder1hSent = true; // late booking: don't double-notify
      await a.save();
    }
  }
}

/** Medication reminders at each medicine's reminderTimes (local HH:MM), until durationDays is over. */
export async function sendMedicationReminders(now = new Date()) {
  const { time } = localParts(now);
  const rxs = await Prescription.find({
    remindersEnabled: true,
    'medicines.reminderTimes': time,
    issuedAt: { $gte: new Date(now.getTime() - 365 * DAY) },
  }).populate('profileId', 'name');

  for (const rx of rxs) {
    for (const m of rx.medicines) {
      if (!m.reminderTimes?.includes(time)) continue;
      const days = m.durationDays || parseInt(/(\d+)\s*day/i.exec(m.duration || '')?.[1] || '', 10) || (parseInt(/(\d+)\s*week/i.exec(m.duration || '')?.[1] || '', 10) * 7) || 7;
      if (now > new Date(rx.issuedAt.getTime() + days * DAY)) continue;

      // de-dupe within the same minute (e.g. two instances, or an overlapping tick)
      const already = await Notification.exists({
        userId: rx.userId, type: 'medication_reminder', refId: rx._id,
        message: new RegExp(`^${m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        createdAt: { $gte: new Date(now.getTime() - 60 * 1000) },
      });
      if (already) continue;
      await notify(rx.userId, {
        type: 'medication_reminder', title: 'Medication reminder',
        message: `${m.name} - ${m.dosage}${m.instructions ? ' (' + m.instructions + ')' : ''} for ${rx.profileId?.name || 'your profile'}.`,
        refModel: 'Prescription', refId: rx._id,
      });
    }
  }
}

let timer;
export function startReminderScheduler() {
  if (process.env.REMINDERS_ENABLED === 'false' || timer) return;
  const tick = async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const now = new Date();
      await sendAppointmentReminders(now);
      await sendMedicationReminders(now);
    } catch (err) {
      console.error('Reminder tick failed:', err.message);
    }
  };
  timer = setInterval(tick, 60 * 1000);
  timer.unref();
  console.log('Reminder scheduler started');
}

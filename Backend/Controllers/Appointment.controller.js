import crypto from 'crypto';
import Appointment from '../Models/Appointment.model.js';
import Doctor from '../Models/Doctor.model.js';
import { authorizeProfileAccess, getUserId, isAdmin } from '../utils/access.js';
import { localParts, toMinutes, zonedDateTime, weekdayOf } from '../utils/time.js';
import { notify } from '../Services/notificationService.js';
import { createAuditLog } from '../Services/auditLogService.js';
import { effectiveSlots, validateSlots } from '../utils/availability.js';

const fail = (res, status, error) => res.status(status).json({ success: false, error });
const audit = (req, action, appt, extra = {}) =>
  createAuditLog({
    userId: getUserId(req), action, entityType: 'Appointment', entityId: appt._id,
    ipAddress: req.ip, userAgent: req.get('user-agent'), ...extra,
  });

const feeOf = (d) => d.consultationFee ?? d.clinic?.consultationFee ?? d.hospital?.consultationFee ?? 0;

/** Does `slotTime` sit exactly on one of the doctor's published slots? */
function slotIsOffered(doctor, slotTime) {
  const { day, time } = localParts(slotTime);
  return effectiveSlots(doctor).some((s) => {
    if (s.day !== day) return false;
    const step = s.slotDurationMinutes || 30;
    const t = toMinutes(time), start = toMinutes(s.startTime), end = toMinutes(s.endTime);
    return t >= start && t + step <= end && (t - start) % step === 0;
  });
}

// POST /api/appointments  - book for yourself or a dependent (SRS 4.2 / 4.5)
export async function bookAppointment(req, res) {
  try {
    const { profileId, doctorId, slotTime, type = 'in_person', reason, symptoms } = req.body;
    if (!profileId || !doctorId || !slotTime) return fail(res, 400, 'profileId, doctorId and slotTime are required');
    if (!['in_person', 'online'].includes(type)) return fail(res, 400, 'Invalid appointment type');

    const when = new Date(slotTime);
    if (Number.isNaN(when.getTime()) || when <= new Date()) return fail(res, 400, 'slotTime must be a valid future date');

    const access = await authorizeProfileAccess(req.user, profileId, { write: true });
    if (!access.ok) return fail(res, access.status, access.reason);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.verificationStatus !== 'verified') return fail(res, 404, 'Doctor not available');
    if (!slotIsOffered(doctor, when)) return fail(res, 400, 'This time is outside the doctor\'s available slots');

    const step = effectiveSlots(doctor).find((s) => s.day === localParts(when).day)?.slotDurationMinutes || 30;
    let appointment;
    try {
      appointment = await Appointment.create({
        userId: getUserId(req), profileId, doctorId, type, slotTime: when,
        durationMinutes: step, reason,
        symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
        fee: feeOf(doctor),
      });
    } catch (err) {
      if (err.code === 11000) return fail(res, 409, 'That slot has just been booked. Please choose another time.');
      throw err;
    }

    await Promise.all([
      notify(getUserId(req), {
        type: 'appointment_booked', title: 'Appointment requested',
        message: `Your appointment request for ${access.profile.name} is awaiting the doctor's confirmation.`,
        refModel: 'Appointment', refId: appointment._id,
      }),
      notify(doctor.userId, {
        type: 'appointment_booked', title: 'New appointment request',
        message: `${access.profile.name} requested ${type === 'online' ? 'an online' : 'an in-person'} consultation on ${when.toISOString()}.`,
        refModel: 'Appointment', refId: appointment._id,
      }),
      audit(req, 'appointment_booked', appointment),
    ]);
    res.status(201).json({ success: true, appointment });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/appointments/doctors/:doctorId/availability?date=YYYY-MM-DD
export async function getDoctorAvailability(req, res) {
  try {
    const { date } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return fail(res, 400, 'date=YYYY-MM-DD is required');
    const doctor = await Doctor.findById(req.params.doctorId).select('availableSlots verificationStatus');
    if (!doctor || doctor.verificationStatus !== 'verified') return fail(res, 404, 'Doctor not found');

    const day = weekdayOf(date);
    const candidates = [];
    for (const s of effectiveSlots(doctor).filter((x) => x.day === day)) {
      const step = s.slotDurationMinutes || 30;
      for (let m = toMinutes(s.startTime); m + step <= toMinutes(s.endTime); m += step) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0'), mm = String(m % 60).padStart(2, '0');
        candidates.push(zonedDateTime(date, `${hh}:${mm}`));
      }
    }
    const taken = new Set(
      (await Appointment.find({ doctorId: doctor._id, slotTime: { $in: candidates }, status: { $in: ['pending', 'confirmed'] } })
        .select('slotTime')).map((a) => a.slotTime.getTime())
    );
    const now = Date.now();
    res.json({
      success: true, date,
      slots: candidates.filter((c) => c.getTime() > now && !taken.has(c.getTime())).map((c) => c.toISOString()),
    });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

const populateAppt = (q) =>
  q.populate('profileId', 'name relationship')
    .populate({ path: 'doctorId', select: 'specialization userId', populate: { path: 'userId', select: 'name' } });

// GET /api/appointments/mine?status=&profileId=
export async function getMyAppointments(req, res) {
  try {
    const filter = { userId: getUserId(req) };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.profileId) filter.profileId = req.query.profileId;
    const appointments = await populateAppt(Appointment.find(filter).sort({ slotTime: -1 }));
    res.json({ success: true, appointments });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/appointments/doctor/me?status=&date=
export async function getDoctorAppointments(req, res) {
  try {
    const doctor = await Doctor.findOne({ userId: getUserId(req) }).select('_id');
    if (!doctor) return fail(res, 404, 'Doctor profile not found');
    const filter = { doctorId: doctor._id };
    if (req.query.status) filter.status = req.query.status;
    if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '')) {
      filter.slotTime = { $gte: zonedDateTime(req.query.date, '00:00'), $lt: new Date(zonedDateTime(req.query.date, '00:00').getTime() + 864e5) };
    }
    const appointments = await populateAppt(Appointment.find(filter).sort({ slotTime: 1 }));
    res.json({ success: true, appointments });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// loads an appointment and works out the caller's role on it
async function loadForCaller(req) {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return { status: 404, error: 'Appointment not found' };
  const uid = getUserId(req);
  const doctor = await Doctor.findOne({ userId: uid }).select('_id');
  const isDoctor = doctor && String(doctor._id) === String(appt.doctorId);
  const isOwner = String(appt.userId) === uid;
  if (!isDoctor && !isOwner && !isAdmin(req.user)) return { status: 403, error: 'Not allowed' };
  return { appt, isDoctor, isOwner, isAdminUser: isAdmin(req.user) };
}

// GET /api/appointments/:id
export async function getAppointment(req, res) {
  try {
    const r = await loadForCaller(req);
    if (r.error) return fail(res, r.status, r.error);
    res.json({ success: true, appointment: await populateAppt(Appointment.findById(r.appt._id)) });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

const DOCTOR_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
};

// PATCH /api/appointments/:id/status  { status, reason }
export async function updateAppointmentStatus(req, res) {
  try {
    const { status, reason } = req.body;
    const r = await loadForCaller(req);
    if (r.error) return fail(res, r.status, r.error);
    const { appt } = r;
    const previous = appt.status;

    if (r.isOwner && !r.isDoctor && !r.isAdminUser) {
      if (status !== 'cancelled' || !['pending', 'confirmed'].includes(previous)) return fail(res, 403, 'Patients can only cancel pending or confirmed appointments');
      appt.cancelledBy = 'patient';
    } else {
      if (!(DOCTOR_TRANSITIONS[previous] || []).includes(status)) return fail(res, 400, `Cannot change status from ${previous} to ${status}`);
      if (status === 'cancelled') appt.cancelledBy = r.isDoctor ? 'doctor' : 'admin';
    }
    if (status === 'cancelled') {
      appt.cancellationReason = reason;
      if (appt.paymentStatus === 'paid') appt.paymentStatus = 'refunded'; // actual refund: POST /api/payments/:id/refund
    }
    if (status === 'confirmed' && appt.type === 'online' && !appt.meetingLink) {
      appt.meetingLink = `https://meet.jit.si/vitalis-${crypto.randomBytes(8).toString('hex')}`;
    }
    appt.status = status;
    await appt.save();

    const notifyOwner = status !== 'cancelled' || appt.cancelledBy !== 'patient';
    const typeMap = { confirmed: 'appointment_confirmed', cancelled: 'appointment_cancelled' };
    if (typeMap[status]) {
      await notify(notifyOwner ? appt.userId : (await Doctor.findById(appt.doctorId))?.userId, {
        type: typeMap[status], title: `Appointment ${status}`,
        message: status === 'confirmed'
          ? `Your appointment on ${appt.slotTime.toISOString()} is confirmed.${appt.meetingLink ? ' Join: ' + appt.meetingLink : ''}`
          : `The appointment on ${appt.slotTime.toISOString()} was cancelled.${reason ? ' Reason: ' + reason : ''}`,
        refModel: 'Appointment', refId: appt._id, email: true,
      });
    }
    await audit(req, 'appointment_status_changed', appt, { previousState: { status: previous }, newState: { status }, reason });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// PATCH /api/appointments/:id/notes  { consultationNotes }  (doctor only)
export async function saveConsultationNotes(req, res) {
  try {
    const r = await loadForCaller(req);
    if (r.error) return fail(res, r.status, r.error);
    if (!r.isDoctor) return fail(res, 403, 'Only the treating doctor can write consultation notes');
    if (typeof req.body.consultationNotes !== 'string') return fail(res, 400, 'consultationNotes is required');
    r.appt.consultationNotes = req.body.consultationNotes;
    await r.appt.save();
    res.json({ success: true, appointment: r.appt });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/appointments/doctor/availability  (doctor: my weekly hours)
export async function getMyAvailability(req, res) {
  try {
    const doctor = await Doctor.findOne({ userId: getUserId(req) }).select('availableSlots');
    if (!doctor) return fail(res, 404, 'Doctor profile not found');
    res.json({ success: true, availableSlots: effectiveSlots(doctor), isDefault: !doctor.availableSlots?.length });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// PUT /api/appointments/doctor/availability  { availableSlots: [{ day, startTime, endTime, slotDurationMinutes }] }
export async function setMyAvailability(req, res) {
  try {
    const { slots, error } = validateSlots(req.body.availableSlots);
    if (error) return fail(res, 400, error);
    const doctor = await Doctor.findOneAndUpdate({ userId: getUserId(req) }, { availableSlots: slots }, { new: true });
    if (!doctor) return fail(res, 404, 'Doctor profile not found');
    res.json({ success: true, availableSlots: doctor.availableSlots });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

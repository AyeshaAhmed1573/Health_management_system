import Prescription from '../Models/Prescription.model.js';
import Appointment from '../Models/Appointment.model.js';
import Doctor from '../Models/Doctor.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';
import { authorizeProfileAccess, getUserId } from '../utils/access.js';
import { notify } from '../Services/notificationService.js';
import { createAuditLog } from '../Services/auditLogService.js';

const fail = (res, status, error) => res.status(status).json({ success: false, error });
const audit = (req, action, rx, extra = {}) =>
  createAuditLog({ userId: getUserId(req), action, entityType: 'Prescription', entityId: rx._id, ipAddress: req.ip, userAgent: req.get('user-agent'), ...extra });

// POST /api/prescriptions  (verified doctor, for one of their appointments)
export async function createPrescription(req, res) {
  try {
    const { appointmentId, medicines, diagnosis, notes, validUntil, remindersEnabled } = req.body;
    const doctor = await Doctor.findOne({ userId: getUserId(req) });
    if (!doctor || doctor.verificationStatus !== 'verified') return fail(res, 403, 'Only verified doctors can issue prescriptions');

    const appt = await Appointment.findById(appointmentId);
    if (!appt || String(appt.doctorId) !== String(doctor._id)) return fail(res, 404, 'Appointment not found');
    if (!['confirmed', 'completed'].includes(appt.status)) return fail(res, 400, 'Appointment must be confirmed or completed');

    const rx = await Prescription.create({
      userId: appt.userId, profileId: appt.profileId, doctorId: doctor._id, appointmentId: appt._id,
      medicines, diagnosis, notes, validUntil, remindersEnabled,
    });
    await Promise.all([
      notify(appt.userId, { type: 'prescription_issued', title: 'New prescription', message: 'Your doctor has issued a prescription.', refModel: 'Prescription', refId: rx._id, email: true }),
      audit(req, 'prescription_issued', rx),
    ]);
    res.status(201).json({ success: true, prescription: rx });
  } catch (err) {
    fail(res, err.name === 'ValidationError' ? 400 : 500, err.message);
  }
}

// GET /api/prescriptions/profile/:profileId
export async function getProfilePrescriptions(req, res) {
  try {
    const access = await authorizeProfileAccess(req.user, req.params.profileId);
    if (!access.ok) return fail(res, access.status, access.reason);
    const prescriptions = await Prescription.find({ profileId: req.params.profileId })
      .populate({ path: 'doctorId', select: 'specialization userId', populate: { path: 'userId', select: 'name' } })
      .sort({ issuedAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/prescriptions/:id  (also pharmacies the patient shared it with)
export async function getPrescription(req, res) {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) return fail(res, 404, 'Prescription not found');
    const access = await authorizeProfileAccess(req.user, rx.profileId);
    let allowed = access.ok;
    if (!allowed && req.user.role === 'pharmacy') {
      const ph = await Pharmacy.findOne({ userId: getUserId(req), verificationStatus: 'verified' }).select('_id');
      allowed = Boolean(ph && rx.sharedWith.some((s) => String(s.pharmacyId) === String(ph._id)));
    }
    if (!allowed) return fail(res, 403, 'You do not have access to this prescription');
    res.json({ success: true, prescription: rx });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// POST /api/prescriptions/:id/share  { pharmacyId, consent: true }  (patient)
export async function shareWithPharmacy(req, res) {
  try {
    const { pharmacyId, consent } = req.body;
    if (consent !== true) return fail(res, 400, 'Explicit consent is required to share a prescription');
    const rx = await Prescription.findById(req.params.id);
    if (!rx) return fail(res, 404, 'Prescription not found');
    const access = await authorizeProfileAccess(req.user, rx.profileId, { write: true });
    if (!access.ok) return fail(res, access.status, access.reason);

    const doctor = await Doctor.findById(rx.doctorId).select('verificationStatus');
    if (doctor?.verificationStatus !== 'verified') return fail(res, 400, 'Only prescriptions from verified doctors can be transmitted');
    if (rx.validUntil && rx.validUntil < new Date()) return fail(res, 400, 'Prescription has expired');

    const pharmacy = await Pharmacy.findOne({ _id: pharmacyId, verificationStatus: 'verified' });
    if (!pharmacy) return fail(res, 404, 'Partner pharmacy not found');
    if (rx.sharedWith.some((s) => String(s.pharmacyId) === String(pharmacy._id))) return fail(res, 409, 'Already shared with this pharmacy');

    rx.sharedWith.push({ pharmacyId: pharmacy._id, consentGivenBy: getUserId(req) });
    await rx.save();
    await Promise.all([
      notify(pharmacy.userId, { type: 'prescription_issued', title: 'Prescription received', message: 'A patient shared a verified digital prescription with your pharmacy.', refModel: 'Prescription', refId: rx._id }),
      audit(req, 'prescription_shared', rx, { newState: { pharmacyId: String(pharmacy._id) } }),
    ]);
    res.json({ success: true, prescription: rx });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/prescriptions/shared-with-me  (pharmacy)
export async function getSharedWithPharmacy(req, res) {
  try {
    const ph = await Pharmacy.findOne({ userId: getUserId(req), verificationStatus: 'verified' }).select('_id');
    if (!ph) return fail(res, 403, 'Verified pharmacy account required');
    const prescriptions = await Prescription.find({ 'sharedWith.pharmacyId': ph._id }).sort({ issuedAt: -1 })
      .populate('profileId', 'name allergies');
    res.json({ success: true, prescriptions });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

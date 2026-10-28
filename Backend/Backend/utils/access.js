import PatientProfile from '../Models/PatientProfile.model.js';
import Doctor from '../Models/Doctor.model.js';
import Appointment from '../Models/Appointment.model.js';

export const getUserId = (req) => String(req.user?.id || req.user?._id || '');
export const isAdmin = (user) => ['admin', 'super_admin'].includes(user?.role);

/**
 * Who may see a patient profile's medical data?
 *  - the account that owns it (self or caregiver)
 *  - admins
 *  - a doctor that has a non-cancelled appointment with that profile
 * Returns { ok, profile, reason }.
 */
export async function authorizeProfileAccess(user, profileId, { write = false } = {}) {
  if (!profileId || !/^[a-f\d]{24}$/i.test(String(profileId))) {
    return { ok: false, status: 400, reason: 'Invalid profile id' };
  }
  const profile = await PatientProfile.findById(profileId);
  if (!profile) return { ok: false, status: 404, reason: 'Patient profile not found' };

  const uid = String(user?.id || user?._id || '');
  if (String(profile.userId) === uid) return { ok: true, profile, relation: 'owner' };
  if (isAdmin(user) && !write) return { ok: true, profile, relation: 'admin' };

  if (user?.role === 'doctor' && !write) {
    const doctor = await Doctor.findOne({ userId: uid }).select('_id');
    if (doctor) {
      const linked = await Appointment.exists({
        doctorId: doctor._id,
        profileId: profile._id,
        status: { $in: ['pending', 'confirmed', 'completed'] },
      });
      if (linked) return { ok: true, profile, relation: 'doctor' };
    }
  }
  return { ok: false, status: 403, reason: 'You do not have access to this profile' };
}

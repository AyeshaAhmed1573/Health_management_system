import PatientProfile from '../Models/PatientProfile.model.js';
import { authorizeProfileAccess, getUserId, isAdmin } from '../utils/access.js';
import { createAuditLog } from '../Services/auditLogService.js';

const POPULATE = ['userId', 'name email phone'];
const deny = (res, a) => res.status(a.status).json({ message: a.reason });
const audit = (req, action, entityId, extra = {}) =>
  createAuditLog({
    userId: getUserId(req),
    action,
    entityType: 'PatientProfile',
    entityId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    ...extra,
  });

// CREATE PATIENT PROFILE (self or dependent)
export async function createPatientProfile(req, res) {
  try {
    const {
      name, relationship, gender, dateOfBirth, height, bloodGroup,
      allergies, medicalConditions, avatarUrl, consentConfirmed,
    } = req.body;

    // A profile can only ever be created for the logged-in account.
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const rel = relationship || 'self';

    // SRS 4.2 / 5.1: caregivers must confirm consent before managing a dependent
    if (rel !== 'self' && consentConfirmed !== true && consentConfirmed !== 'true') {
      return res.status(400).json({
        message: 'Consent confirmation is required to manage a dependent profile',
        code: 'CONSENT_REQUIRED',
      });
    }
    if (rel === 'self' && (await PatientProfile.exists({ userId, relationship: 'self' }))) {
      return res.status(409).json({ message: 'A profile for yourself already exists' });
    }

    const patientProfile = await PatientProfile.create({
      userId,
      name: name || 'Patient Profile',
      relationship: rel,
      gender, dateOfBirth, height, bloodGroup,
      allergies: allergies || [],
      medicalConditions: medicalConditions || [],
      avatarUrl,
      consent: rel === 'self' ? undefined : { given: true, givenAt: new Date(), givenBy: userId },
    });

    await audit(req, 'profile_created', patientProfile._id, { newState: { relationship: rel } });
    res.status(201).json({ message: 'Patient profile created successfully', patientProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// LIST PROFILES - always scoped to the caller (admins may pass ?userId=)
export async function getAllPatientProfiles(req, res) {
  try {
    const { userId, bloodGroup, gender } = req.query;
    const filter = {};
    if (isAdmin(req.user)) {
      if (userId) filter.userId = userId;
    } else {
      filter.userId = getUserId(req);
    }
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (gender) filter.gender = gender;

    const patientProfiles = await PatientProfile.find(filter)
      .populate(...POPULATE)
      .sort({ createdAt: -1 });
    res.status(200).json({ patientProfiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PROFILE BY ID
export async function getPatientProfileById(req, res) {
  try {
    const access = await authorizeProfileAccess(req.user, req.params.id);
    if (!access.ok) return deny(res, access);
    const patientProfile = await access.profile.populate(...POPULATE);
    await audit(req, 'profile_viewed', patientProfile._id, { reason: access.relation });
    res.status(200).json({ patientProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PROFILES BY USER ID
export async function getPatientProfileByUserId(req, res) {
  try {
    if (String(req.params.userId) !== getUserId(req) && !isAdmin(req.user)) {
      return res.status(403).json({ message: 'You do not have access to these profiles' });
    }
    const patientProfiles = await PatientProfile.find({ userId: req.params.userId })
      .populate(...POPULATE)
      .sort({ createdAt: -1 });
    if (patientProfiles.length === 0) {
      return res.status(404).json({ message: 'No patient profiles found for this user' });
    }
    res.status(200).json({ patientProfiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE PROFILE (only provided fields are changed)
export async function updatePatientProfile(req, res) {
  try {
    const access = await authorizeProfileAccess(req.user, req.params.id, { write: true });
    if (!access.ok) return deny(res, access);

    const allowed = ['name', 'relationship', 'gender', 'dateOfBirth', 'height', 'bloodGroup',
      'allergies', 'medicalConditions', 'avatarUrl'];
    for (const k of allowed) if (req.body[k] !== undefined) access.profile[k] = req.body[k];
    await access.profile.save();

    const patientProfile = await access.profile.populate(...POPULATE);
    res.status(200).json({ message: 'Patient profile updated successfully', patientProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// helpers for the four list-field endpoints
const listEndpoint = ({ field, bodyKey, label, add }) => async (req, res) => {
  try {
    const value = req.body[bodyKey];
    if (!value) return res.status(400).json({ message: `${label} is required` });

    const access = await authorizeProfileAccess(req.user, req.params.id, { write: true });
    if (!access.ok) return deny(res, access);
    const profile = access.profile;

    if (add) {
      if (profile[field].includes(value)) {
        return res.status(400).json({ message: `${label} already exists` });
      }
      profile[field].push(value);
    } else {
      profile[field] = profile[field].filter((x) => x !== value);
    }
    await profile.save();

    const patientProfile = await profile.populate(...POPULATE);
    res.status(200).json({
      message: `${label} ${add ? 'added' : 'removed'} successfully`,
      patientProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addAllergy = listEndpoint({ field: 'allergies', bodyKey: 'allergy', label: 'Allergy', add: true });
export const removeAllergy = listEndpoint({ field: 'allergies', bodyKey: 'allergy', label: 'Allergy', add: false });
export const addMedicalCondition = listEndpoint({ field: 'medicalConditions', bodyKey: 'condition', label: 'Medical condition', add: true });
export const removeMedicalCondition = listEndpoint({ field: 'medicalConditions', bodyKey: 'condition', label: 'Medical condition', add: false });

// DELETE PROFILE
export async function deletePatientProfile(req, res) {
  try {
    const access = await authorizeProfileAccess(req.user, req.params.id, { write: true });
    if (!access.ok) return deny(res, access);
    if (access.profile.relationship === 'self') {
      return res.status(400).json({ message: 'Your own profile cannot be deleted' });
    }
    await access.profile.deleteOne();
    await audit(req, 'profile_deleted', access.profile._id);
    res.status(200).json({ message: 'Patient profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

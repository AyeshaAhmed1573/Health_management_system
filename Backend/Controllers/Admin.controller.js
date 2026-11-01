import Doctor from '../Models/Doctor.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';
import User from '../Models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ADMIN SIGNUP
export async function adminSignup(req, res) {
  try {
    const { name, email, password, adminSecretKey } = req.body;

    // Validate admin secret key
    if (adminSecretKey !== process.env.ADMIN_SIGNUP_SECRET) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      isVerified: true, // Admins are auto-verified
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL PENDING APPROVALS (for admin dashboard)
export async function getAllPendingApprovals(req, res) {
  try {
    const pendingDoctors = await Doctor.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const pendingLaboratories = await Laboratory.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const pendingPharmacies = await Pharmacy.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    // Add full URLs for documents
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const doctorsWithUrls = pendingDoctors.map(doctor => {
      const doctorObj = doctor.toObject();
      if (doctorObj.documents) {
        Object.keys(doctorObj.documents).forEach(key => {
          if (doctorObj.documents[key]) {
            doctorObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.documents[key]}`;
          }
        });
      }
      if (doctorObj.profileImageUrl) {
        doctorObj.profileImageUrl = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.profileImageUrl}`;
      }
      return doctorObj;
    });

    const labsWithUrls = pendingLaboratories.map(lab => {
      const labObj = lab.toObject();
      if (labObj.documents) {
        Object.keys(labObj.documents).forEach(key => {
          if (labObj.documents[key]) {
            labObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${labObj.documents[key]}`;
          }
        });
      }
      return labObj;
    });

    const pharmaciesWithUrls = pendingPharmacies.map(pharmacy => {
      const pharmacyObj = pharmacy.toObject();
      if (pharmacyObj.documents) {
        Object.keys(pharmacyObj.documents).forEach(key => {
          if (pharmacyObj.documents[key]) {
            pharmacyObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${pharmacyObj.documents[key]}`;
          }
        });
      }
      return pharmacyObj;
    });

    res.status(200).json({
      pendingDoctors: doctorsWithUrls,
      pendingLaboratories: labsWithUrls,
      pendingPharmacies: pharmaciesWithUrls,
      totalPending: pendingDoctors.length + pendingLaboratories.length + pendingPharmacies.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL APPROVED ENTITIES (for admin dashboard)
export async function getAllApprovedEntities(req, res) {
  try {
    const approvedDoctors = await Doctor.find({ verificationStatus: 'verified' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const approvedLaboratories = await Laboratory.find({ verificationStatus: 'verified' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const approvedPharmacies = await Pharmacy.find({ verificationStatus: 'verified' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    // Add full URLs for documents
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const doctorsWithUrls = approvedDoctors.map(doctor => {
      const doctorObj = doctor.toObject();
      if (doctorObj.documents) {
        Object.keys(doctorObj.documents).forEach(key => {
          if (doctorObj.documents[key]) {
            doctorObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.documents[key]}`;
          }
        });
      }
      if (doctorObj.profileImageUrl) {
        doctorObj.profileImageUrl = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.profileImageUrl}`;
      }
      return doctorObj;
    });

    const labsWithUrls = approvedLaboratories.map(lab => {
      const labObj = lab.toObject();
      if (labObj.documents) {
        Object.keys(labObj.documents).forEach(key => {
          if (labObj.documents[key]) {
            labObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${labObj.documents[key]}`;
          }
        });
      }
      return labObj;
    });

    const pharmaciesWithUrls = approvedPharmacies.map(pharmacy => {
      const pharmacyObj = pharmacy.toObject();
      if (pharmacyObj.documents) {
        Object.keys(pharmacyObj.documents).forEach(key => {
          if (pharmacyObj.documents[key]) {
            pharmacyObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${pharmacyObj.documents[key]}`;
          }
        });
      }
      return pharmacyObj;
    });

    res.status(200).json({
      approvedDoctors: doctorsWithUrls,
      approvedLaboratories: labsWithUrls,
      approvedPharmacies: pharmaciesWithUrls,
      totalApproved: approvedDoctors.length + approvedLaboratories.length + approvedPharmacies.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL REJECTED ENTITIES (for admin dashboard)
export async function getAllRejectedEntities(req, res) {
  try {
    const rejectedDoctors = await Doctor.find({ verificationStatus: 'rejected' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const rejectedLaboratories = await Laboratory.find({ verificationStatus: 'rejected' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const rejectedPharmacies = await Pharmacy.find({ verificationStatus: 'rejected' })
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    // Add full URLs for documents
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const doctorsWithUrls = rejectedDoctors.map(doctor => {
      const doctorObj = doctor.toObject();
      if (doctorObj.documents) {
        Object.keys(doctorObj.documents).forEach(key => {
          if (doctorObj.documents[key]) {
            doctorObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.documents[key]}`;
          }
        });
      }
      if (doctorObj.profileImageUrl) {
        doctorObj.profileImageUrl = `${baseUrl}/api/admin/files/doctor-documents/${doctorObj.profileImageUrl}`;
      }
      return doctorObj;
    });

    const labsWithUrls = rejectedLaboratories.map(lab => {
      const labObj = lab.toObject();
      if (labObj.documents) {
        Object.keys(labObj.documents).forEach(key => {
          if (labObj.documents[key]) {
            labObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${labObj.documents[key]}`;
          }
        });
      }
      return labObj;
    });

    const pharmaciesWithUrls = rejectedPharmacies.map(pharmacy => {
      const pharmacyObj = pharmacy.toObject();
      if (pharmacyObj.documents) {
        Object.keys(pharmacyObj.documents).forEach(key => {
          if (pharmacyObj.documents[key]) {
            pharmacyObj.documents[key] = `${baseUrl}/api/admin/files/doctor-documents/${pharmacyObj.documents[key]}`;
          }
        });
      }
      return pharmacyObj;
    });

    res.status(200).json({
      rejectedDoctors: doctorsWithUrls,
      rejectedLaboratories: labsWithUrls,
      rejectedPharmacies: pharmaciesWithUrls,
      totalRejected: rejectedDoctors.length + rejectedLaboratories.length + rejectedPharmacies.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// APPROVE DOCTOR
export async function approveDoctor(req, res) {
  try {
    const { verificationNote } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'verified',
        verificationNote: verificationNote || 'Approved by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Also update user verification status
    await User.findByIdAndUpdate(doctor.userId, { isVerified: true });

    res.status(200).json({
      message: 'Doctor approved successfully',
      doctor
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REJECT DOCTOR
export async function rejectDoctor(req, res) {
  try {
    const { verificationNote } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'rejected',
        verificationNote: verificationNote || 'Rejected by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({
      message: 'Doctor rejected successfully',
      doctor
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// APPROVE LABORATORY
export async function approveLaboratory(req, res) {
  try {
    const { verificationNote } = req.body;

    const laboratory = await Laboratory.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'verified',
        verificationNote: verificationNote || 'Approved by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    // Also update user verification status
    await User.findByIdAndUpdate(laboratory.userId, { isVerified: true });

    res.status(200).json({
      message: 'Laboratory approved successfully',
      laboratory
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REJECT LABORATORY
export async function rejectLaboratory(req, res) {
  try {
    const { verificationNote } = req.body;

    const laboratory = await Laboratory.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'rejected',
        verificationNote: verificationNote || 'Rejected by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    res.status(200).json({
      message: 'Laboratory rejected successfully',
      laboratory
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// APPROVE PHARMACY
export async function approvePharmacy(req, res) {
  try {
    const { verificationNote } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'verified',
        verificationNote: verificationNote || 'Approved by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    // Also update user verification status
    await User.findByIdAndUpdate(pharmacy.userId, { isVerified: true });

    res.status(200).json({
      message: 'Pharmacy approved successfully',
      pharmacy
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REJECT PHARMACY
export async function rejectPharmacy(req, res) {
  try {
    const { verificationNote } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: 'rejected',
        verificationNote: verificationNote || 'Rejected by admin'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role');

    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    res.status(200).json({
      message: 'Pharmacy rejected successfully',
      pharmacy
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ADMIN DASHBOARD STATS
export async function getAdminDashboardStats(req, res) {
  try {
    const pendingDoctors = await Doctor.countDocuments({ verificationStatus: 'pending' });
    const pendingLaboratories = await Laboratory.countDocuments({ verificationStatus: 'pending' });
    const pendingPharmacies = await Pharmacy.countDocuments({ verificationStatus: 'pending' });

    const approvedDoctors = await Doctor.countDocuments({ verificationStatus: 'verified' });
    const approvedLaboratories = await Laboratory.countDocuments({ verificationStatus: 'verified' });
    const approvedPharmacies = await Pharmacy.countDocuments({ verificationStatus: 'verified' });

    const rejectedDoctors = await Doctor.countDocuments({ verificationStatus: 'rejected' });
    const rejectedLaboratories = await Laboratory.countDocuments({ verificationStatus: 'rejected' });
    const rejectedPharmacies = await Pharmacy.countDocuments({ verificationStatus: 'rejected' });

    res.status(200).json({
      pending: {
        doctors: pendingDoctors,
        laboratories: pendingLaboratories,
        pharmacies: pendingPharmacies,
        total: pendingDoctors + pendingLaboratories + pendingPharmacies
      },
      approved: {
        doctors: approvedDoctors,
        laboratories: approvedLaboratories,
        pharmacies: approvedPharmacies,
        total: approvedDoctors + approvedLaboratories + approvedPharmacies
      },
      rejected: {
        doctors: rejectedDoctors,
        laboratories: rejectedLaboratories,
        pharmacies: rejectedPharmacies,
        total: rejectedDoctors + rejectedLaboratories + rejectedPharmacies
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

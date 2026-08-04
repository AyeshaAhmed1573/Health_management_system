import Doctor from '../Models/Doctor.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';
import User from '../Models/User.model.js';

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

    res.status(200).json({
      pendingDoctors,
      pendingLaboratories,
      pendingPharmacies,
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

    res.status(200).json({
      approvedDoctors,
      approvedLaboratories,
      approvedPharmacies,
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

    res.status(200).json({
      rejectedDoctors,
      rejectedLaboratories,
      rejectedPharmacies,
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

import Doctor from '../Models/Doctor.model.js';
import User from '../Models/User.model.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// DOCTOR REGISTRATION WITH DOCUMENTS
export async function registerDoctor(req, res) {
  try {
    const { userId, licenseNumber, specialization, qualification, experienceYears, consultationFee, bio } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }

    // Check if license number is unique
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    const doctorData = {
      userId,
      licenseNumber,
      specialization,
      qualification,
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseInt(consultationFee) || 0,
      bio,
      verificationStatus: 'pending', // Default to pending for admin approval
    };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.profilePhoto) {
        doctorData.profileImageUrl = `data:${req.files.profilePhoto[0].mimetype};base64,${req.files.profilePhoto[0].buffer.toString('base64')}`;
      }
      if (req.files.medicalDegree) {
        doctorData.medicalDegreeUrl = `data:${req.files.medicalDegree[0].mimetype};base64,${req.files.medicalDegree[0].buffer.toString('base64')}`;
      }
      if (req.files.licenseCertificate) {
        doctorData.licenseCertificateUrl = `data:${req.files.licenseCertificate[0].mimetype};base64,${req.files.licenseCertificate[0].buffer.toString('base64')}`;
      }
      if (req.files.cnic) {
        doctorData.cnicUrl = `data:${req.files.cnic[0].mimetype};base64,${req.files.cnic[0].buffer.toString('base64')}`;
      }
    }

    const doctor = await Doctor.create(doctorData);

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully and pending admin approval',
      doctor,
    });
  } catch (err) {
    console.error('Doctor registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// CREATE DOCTOR PROFILE
export async function createDoctorProfile(req, res) {
  try {
    const {
      userId,
      licenseNumber,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      profileImageUrl,
      availableSlots,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if doctor profile already exists for this user
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }

    // Check if license number is unique
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    const doctor = await Doctor.create({
      userId,
      licenseNumber,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      profileImageUrl,
      availableSlots: availableSlots || [],
    });

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL DOCTORS
export async function getAllDoctors(req, res) {
  try {
    const { specialization, verificationStatus } = req.query;
    
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET DOCTOR BY ID
export async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    res.status(200).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET DOCTOR BY USER ID
export async function getDoctorByUserId(req, res) {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId })
      .populate('userId', 'name email phone');
    
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    
    res.status(200).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE DOCTOR PROFILE
export async function updateDoctorProfile(req, res) {
  try {
    const {
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      profileImageUrl,
      hospital,
      clinic,
    } = req.body;

    // Build update object
    const updateData = {};
    if (specialization !== undefined) updateData.specialization = specialization;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (experienceYears !== undefined) updateData.experienceYears = experienceYears;
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
    if (hospital !== undefined) updateData.hospital = hospital;
    if (clinic !== undefined) updateData.clinic = clinic;

    // Handle document file uploads
    if (req.files) {
      const documents = {};
      if (req.files.licenseDocument && req.files.licenseDocument[0]) {
        documents.licenseDocument = req.files.licenseDocument[0].filename;
      }
      if (req.files.medicalDegreeDocument && req.files.medicalDegreeDocument[0]) {
        documents.medicalDegreeDocument = req.files.medicalDegreeDocument[0].filename;
      }
      if (req.files.hospitalProofDocument && req.files.hospitalProofDocument[0]) {
        documents.hospitalProofDocument = req.files.hospitalProofDocument[0].filename;
      }
      if (req.files.clinicProofDocument && req.files.clinicProofDocument[0]) {
        documents.clinicProofDocument = req.files.clinicProofDocument[0].filename;
      }
      if (req.files.idProofDocument && req.files.idProofDocument[0]) {
        documents.idProofDocument = req.files.idProofDocument[0].filename;
      }
      updateData.documents = documents;
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({
      message: 'Doctor profile updated successfully',
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE AVAILABLE SLOTS
export async function updateAvailableSlots(req, res) {
  try {
    const { availableSlots } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availableSlots },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({
      message: 'Available slots updated successfully',
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// VERIFY DOCTOR (Admin only)
export async function verifyDoctor(req, res) {
  try {
    const { verificationStatus, verificationNote } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, verificationNote },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({
      message: `Doctor ${verificationStatus} successfully`,
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE DOCTOR RATING
export async function updateDoctorRating(req, res) {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Calculate new average rating
    const totalRating = doctor.rating.average * doctor.rating.count + rating;
    const newCount = doctor.rating.count + 1;
    const newAverage = totalRating / newCount;

    doctor.rating.average = parseFloat(newAverage.toFixed(2));
    doctor.rating.count = newCount;

    await doctor.save();

    res.status(200).json({
      message: 'Doctor rating updated successfully',
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE DOCTOR
export async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({ message: 'Doctor profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET DOCTORS BY SPECIALIZATION
export async function getDoctorsBySpecialization(req, res) {
  try {
    const { specialization } = req.params;

    const doctors = await Doctor.find({ 
      specialization: { $regex: specialization, $options: 'i' },
      verificationStatus: 'verified'
    })
      .populate('userId', 'name email phone')
      .sort({ 'rating.average': -1 });

    res.status(200).json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

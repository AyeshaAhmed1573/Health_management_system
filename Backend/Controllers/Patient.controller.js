import PatientProfile from '../Models/PatientProfile.model.js';
import User from '../Models/User.model.js';

// CREATE PATIENT PROFILE
export async function createPatientProfile(req, res) {
  try {
    const {
      userId,
      name,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      allergies,
      medicalConditions,
      avatarUrl,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create patient profile
    const patientProfile = await PatientProfile.create({
      userId,
      name,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      allergies: allergies || [],
      medicalConditions: medicalConditions || [],
      avatarUrl,
    });

    res.status(201).json({
      message: 'Patient profile created successfully',
      patientProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL PATIENT PROFILES
export async function getAllPatientProfiles(req, res) {
  try {
    const { userId, bloodGroup, gender } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (gender) filter.gender = gender;

    const patientProfiles = await PatientProfile.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ patientProfiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PATIENT PROFILE BY ID
export async function getPatientProfileById(req, res) {
  try {
    const patientProfile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });
    
    res.status(200).json({ patientProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PATIENT PROFILE BY USER ID
export async function getPatientProfileByUserId(req, res) {
  try {
    const patientProfiles = await PatientProfile.find({ userId: req.params.userId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    if (patientProfiles.length === 0) {
      return res.status(404).json({ message: 'No patient profiles found for this user' });
    }
    
    res.status(200).json({ patientProfiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE PATIENT PROFILE
export async function updatePatientProfile(req, res) {
  try {
    const {
      name,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      allergies,
      medicalConditions,
      avatarUrl,
    } = req.body;

    const patientProfile = await PatientProfile.findByIdAndUpdate(
      req.params.id,
      {
        name,
        relationship,
        gender,
        dateOfBirth,
        bloodGroup,
        allergies,
        medicalConditions,
        avatarUrl,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    res.status(200).json({
      message: 'Patient profile updated successfully',
      patientProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ADD ALLERGY TO PATIENT PROFILE
export async function addAllergy(req, res) {
  try {
    const { allergy } = req.body;

    if (!allergy) {
      return res.status(400).json({ message: 'Allergy is required' });
    }

    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    if (patientProfile.allergies.includes(allergy)) {
      return res.status(400).json({ message: 'Allergy already exists' });
    }

    patientProfile.allergies.push(allergy);
    await patientProfile.save();

    const updatedProfile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Allergy added successfully',
      patientProfile: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REMOVE ALLERGY FROM PATIENT PROFILE
export async function removeAllergy(req, res) {
  try {
    const { allergy } = req.body;

    if (!allergy) {
      return res.status(400).json({ message: 'Allergy is required' });
    }

    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    patientProfile.allergies = patientProfile.allergies.filter(a => a !== allergy);
    await patientProfile.save();

    const updatedProfile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Allergy removed successfully',
      patientProfile: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ADD MEDICAL CONDITION TO PATIENT PROFILE
export async function addMedicalCondition(req, res) {
  try {
    const { condition } = req.body;

    if (!condition) {
      return res.status(400).json({ message: 'Medical condition is required' });
    }

    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    if (patientProfile.medicalConditions.includes(condition)) {
      return res.status(400).json({ message: 'Medical condition already exists' });
    }

    patientProfile.medicalConditions.push(condition);
    await patientProfile.save();

    const updatedProfile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Medical condition added successfully',
      patientProfile: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REMOVE MEDICAL CONDITION FROM PATIENT PROFILE
export async function removeMedicalCondition(req, res) {
  try {
    const { condition } = req.body;

    if (!condition) {
      return res.status(400).json({ message: 'Medical condition is required' });
    }

    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    patientProfile.medicalConditions = patientProfile.medicalConditions.filter(c => c !== condition);
    await patientProfile.save();

    const updatedProfile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Medical condition removed successfully',
      patientProfile: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE PATIENT PROFILE
export async function deletePatientProfile(req, res) {
  try {
    const patientProfile = await PatientProfile.findByIdAndDelete(req.params.id);
    if (!patientProfile) return res.status(404).json({ message: 'Patient profile not found' });

    res.status(200).json({ message: 'Patient profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

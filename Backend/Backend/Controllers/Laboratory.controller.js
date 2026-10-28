import Laboratory from '../Models/Laboratory.model.js';
import User from '../Models/User.model.js';

// CREATE LABORATORY PROFILE
export async function createLaboratoryProfile(req, res) {
  try {
    const {
      userId,
      labName,
      licenseNumber,
      address,
      phone,
      email,
      homeCollection,
      homeCollectionFee,
      availableTests,
      operatingHours,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if laboratory profile already exists for this user
    const existingLab = await Laboratory.findOne({ userId });
    if (existingLab) {
      return res.status(400).json({ message: 'Laboratory profile already exists for this user' });
    }

    // Check if license number is unique
    const existingLicense = await Laboratory.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    const laboratory = await Laboratory.create({
      userId,
      labName,
      licenseNumber,
      address,
      phone,
      email,
      homeCollection,
      homeCollectionFee,
      availableTests: availableTests || [],
      operatingHours,
    });

    res.status(201).json({
      message: 'Laboratory profile created successfully',
      laboratory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL LABORATORIES
export async function getAllLaboratories(req, res) {
  try {
    const { verificationStatus, homeCollection } = req.query;
    
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (homeCollection !== undefined) filter.homeCollection = homeCollection === 'true';

    const laboratories = await Laboratory.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ laboratories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET LABORATORY BY ID
export async function getLaboratoryById(req, res) {
  try {
    const laboratory = await Laboratory.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });
    
    res.status(200).json({ laboratory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET LABORATORY BY USER ID
export async function getLaboratoryByUserId(req, res) {
  try {
    const laboratory = await Laboratory.findOne({ userId: req.params.userId })
      .populate('userId', 'name email phone');
    
    if (!laboratory) return res.status(404).json({ message: 'Laboratory profile not found' });
    
    res.status(200).json({ laboratory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE LABORATORY PROFILE
export async function updateLaboratoryProfile(req, res) {
  try {
    const {
      labName,
      address,
      phone,
      email,
      homeCollection,
      homeCollectionFee,
      operatingHours,
    } = req.body;

    const laboratory = await Laboratory.findByIdAndUpdate(
      req.params.id,
      {
        labName,
        address,
        phone,
        email,
        homeCollection,
        homeCollectionFee,
        operatingHours,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    res.status(200).json({
      message: 'Laboratory profile updated successfully',
      laboratory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ADD LAB TEST
export async function addLabTest(req, res) {
  try {
    const { name, category, price, turnaroundHours, homeCollectionAvailable, description } = req.body;

    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    laboratory.availableTests.push({
      name,
      category,
      price,
      turnaroundHours,
      homeCollectionAvailable,
      description,
    });

    await laboratory.save();

    const updatedLab = await Laboratory.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Lab test added successfully',
      laboratory: updatedLab,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE LAB TEST
export async function updateLabTest(req, res) {
  try {
    const { testId } = req.params;
    const { name, category, price, turnaroundHours, homeCollectionAvailable, description } = req.body;

    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    const testIndex = laboratory.availableTests.findIndex(test => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    laboratory.availableTests[testIndex] = {
      ...laboratory.availableTests[testIndex].toObject(),
      name,
      category,
      price,
      turnaroundHours,
      homeCollectionAvailable,
      description,
    };

    await laboratory.save();

    const updatedLab = await Laboratory.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Lab test updated successfully',
      laboratory: updatedLab,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE LAB TEST
export async function deleteLabTest(req, res) {
  try {
    const { testId } = req.params;

    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    laboratory.availableTests = laboratory.availableTests.filter(test => test._id.toString() !== testId);
    await laboratory.save();

    const updatedLab = await Laboratory.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Lab test deleted successfully',
      laboratory: updatedLab,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// VERIFY LABORATORY (Admin only)
export async function verifyLaboratory(req, res) {
  try {
    const { verificationStatus, verificationNote } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const laboratory = await Laboratory.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, verificationNote },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    res.status(200).json({
      message: `Laboratory ${verificationStatus} successfully`,
      laboratory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE LABORATORY RATING
export async function updateLaboratoryRating(req, res) {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const laboratory = await Laboratory.findById(req.params.id);
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    const totalRating = laboratory.rating.average * laboratory.rating.count + rating;
    const newCount = laboratory.rating.count + 1;
    const newAverage = totalRating / newCount;

    laboratory.rating.average = parseFloat(newAverage.toFixed(2));
    laboratory.rating.count = newCount;

    await laboratory.save();

    res.status(200).json({
      message: 'Laboratory rating updated successfully',
      laboratory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE LABORATORY
export async function deleteLaboratory(req, res) {
  try {
    const laboratory = await Laboratory.findByIdAndDelete(req.params.id);
    if (!laboratory) return res.status(404).json({ message: 'Laboratory not found' });

    res.status(200).json({ message: 'Laboratory profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

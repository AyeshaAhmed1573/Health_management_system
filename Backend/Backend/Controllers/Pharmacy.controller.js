import Pharmacy from '../Models/Pharmacy.model.js';
import User from '../Models/User.model.js';

// CREATE PHARMACY PROFILE
export async function createPharmacyProfile(req, res) {
  try {
    const {
      userId,
      pharmacyName,
      licenseNumber,
      address,
      phone,
      email,
      deliveryAvailable,
      deliveryAreas,
      deliveryFee,
      operatingHours,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if pharmacy profile already exists for this user
    const existingPharmacy = await Pharmacy.findOne({ userId });
    if (existingPharmacy) {
      return res.status(400).json({ message: 'Pharmacy profile already exists for this user' });
    }

    // Check if license number is unique
    const existingLicense = await Pharmacy.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    const pharmacy = await Pharmacy.create({
      userId,
      pharmacyName,
      licenseNumber,
      address,
      phone,
      email,
      deliveryAvailable,
      deliveryAreas: deliveryAreas || [],
      deliveryFee,
      operatingHours,
    });

    res.status(201).json({
      message: 'Pharmacy profile created successfully',
      pharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ALL PHARMACIES
export async function getAllPharmacies(req, res) {
  try {
    const { verificationStatus, deliveryAvailable } = req.query;
    
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (deliveryAvailable !== undefined) filter.deliveryAvailable = deliveryAvailable === 'true';

    const pharmacies = await Pharmacy.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ pharmacies });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PHARMACY BY ID
export async function getPharmacyById(req, res) {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'name email phone');
    
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    
    res.status(200).json({ pharmacy });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PHARMACY BY USER ID
export async function getPharmacyByUserId(req, res) {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.params.userId })
      .populate('userId', 'name email phone');
    
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy profile not found' });
    
    res.status(200).json({ pharmacy });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE PHARMACY PROFILE
export async function updatePharmacyProfile(req, res) {
  try {
    const {
      pharmacyName,
      address,
      phone,
      email,
      deliveryAvailable,
      deliveryAreas,
      deliveryFee,
      operatingHours,
    } = req.body;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      {
        pharmacyName,
        address,
        phone,
        email,
        deliveryAvailable,
        deliveryAreas,
        deliveryFee,
        operatingHours,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    res.status(200).json({
      message: 'Pharmacy profile updated successfully',
      pharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// ADD DELIVERY AREA
export async function addDeliveryArea(req, res) {
  try {
    const { area } = req.body;

    if (!area) {
      return res.status(400).json({ message: 'Delivery area is required' });
    }

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    if (pharmacy.deliveryAreas.includes(area)) {
      return res.status(400).json({ message: 'Delivery area already exists' });
    }

    pharmacy.deliveryAreas.push(area);
    await pharmacy.save();

    const updatedPharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Delivery area added successfully',
      pharmacy: updatedPharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REMOVE DELIVERY AREA
export async function removeDeliveryArea(req, res) {
  try {
    const { area } = req.body;

    if (!area) {
      return res.status(400).json({ message: 'Delivery area is required' });
    }

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    pharmacy.deliveryAreas = pharmacy.deliveryAreas.filter(a => a !== area);
    await pharmacy.save();

    const updatedPharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'name email phone');

    res.status(200).json({
      message: 'Delivery area removed successfully',
      pharmacy: updatedPharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// VERIFY PHARMACY (Admin only)
export async function verifyPharmacy(req, res) {
  try {
    const { verificationStatus, verificationNote } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, verificationNote },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    res.status(200).json({
      message: `Pharmacy ${verificationStatus} successfully`,
      pharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE PHARMACY RATING
export async function updatePharmacyRating(req, res) {
  try {
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    const totalRating = pharmacy.rating.average * pharmacy.rating.count + rating;
    const newCount = pharmacy.rating.count + 1;
    const newAverage = totalRating / newCount;

    pharmacy.rating.average = parseFloat(newAverage.toFixed(2));
    pharmacy.rating.count = newCount;

    await pharmacy.save();

    res.status(200).json({
      message: 'Pharmacy rating updated successfully',
      pharmacy,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE PHARMACY
export async function deletePharmacy(req, res) {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    res.status(200).json({ message: 'Pharmacy profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

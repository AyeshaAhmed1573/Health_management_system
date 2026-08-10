import HealthReading from '../Models/HealthReading.model.js';
import PatientProfile from '../Models/PatientProfile.model.js';

// ADD HEALTH READING
export async function addHealthReading(req, res) {
  try {
    const { userId, profileId, type, systolic, diastolic, value, unit, measuredAt, mealContext, notes } = req.body;

    console.log('Received health reading request:', { userId, profileId, type, systolic, diastolic, value, unit, measuredAt, mealContext, notes });

    const targetUserId = userId || req.user?.id || req.user?._id;
    console.log('Target userId:', targetUserId);
    
    if (!targetUserId) {
      console.log('User ID missing');
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!profileId) {
      console.log('Profile ID missing');
      return res.status(400).json({ message: 'Profile ID is required' });
    }

    // Validate profile belongs to user
    console.log('Looking for profile with _id:', profileId, 'and userId:', targetUserId);
    const profile = await PatientProfile.findOne({ _id: profileId, userId: targetUserId });
    console.log('Found profile:', profile);
    
    if (!profile) {
      console.log('Profile validation failed');
      // Try to find profile by ID alone to see if it exists
      const profileExists = await PatientProfile.findById(profileId);
      console.log('Profile exists check:', profileExists);
      if (profileExists) {
        console.log('Profile userId:', profileExists.userId, 'targetUserId:', targetUserId);
      }
      return res.status(403).json({ message: 'Profile not found or does not belong to user' });
    }

    // Validate type-specific fields
    if (type === 'blood_pressure') {
      if (!systolic || !diastolic) {
        return res.status(400).json({ message: 'Systolic and diastolic values required for blood pressure' });
      }
    } else {
      if (!value) {
        return res.status(400).json({ message: 'Value is required' });
      }
    }

    const healthReading = await HealthReading.create({
      userId: targetUserId,
      profileId,
      type,
      systolic: type === 'blood_pressure' ? systolic : undefined,
      diastolic: type === 'blood_pressure' ? diastolic : undefined,
      value: type !== 'blood_pressure' ? value : undefined,
      unit: unit || getDefaultUnit(type),
      measuredAt: measuredAt || new Date(),
      mealContext: type === 'blood_sugar' ? mealContext : null,
      notes,
    });

    console.log('Health reading created:', healthReading);

    res.status(201).json({
      message: 'Health reading added successfully',
      healthReading,
    });
  } catch (err) {
    console.error('Error adding health reading:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET HEALTH READINGS BY PROFILE
export async function getHealthReadingsByProfile(req, res) {
  try {
    const { profileId } = req.params;
    const { type, startDate, endDate, limit = 100 } = req.query;

    const filter = { profileId };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.measuredAt = {};
      if (startDate) filter.measuredAt.$gte = new Date(startDate);
      if (endDate) filter.measuredAt.$lte = new Date(endDate);
    }

    const readings = await HealthReading.find(filter)
      .sort({ measuredAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ readings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET HEALTH READINGS BY USER
export async function getHealthReadingsByUser(req, res) {
  try {
    const { userId } = req.params;
    const { type, startDate, endDate, limit = 100 } = req.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.measuredAt = {};
      if (startDate) filter.measuredAt.$gte = new Date(startDate);
      if (endDate) filter.measuredAt.$lte = new Date(endDate);
    }

    const readings = await HealthReading.find(filter)
      .populate('profileId', 'name relationship')
      .sort({ measuredAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ readings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET LATEST HEALTH READINGS BY TYPE
export async function getLatestReadings(req, res) {
  try {
    const { profileId } = req.params;
    const types = ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate'];

    const latestReadings = {};
    for (const type of types) {
      const reading = await HealthReading.findOne({ profileId, type })
        .sort({ measuredAt: -1 })
        .limit(1);
      latestReadings[type] = reading;
    }

    res.status(200).json({ latestReadings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// CALCULATE ESTIMATED HbA1c
export async function calculateEstimatedHbA1c(req, res) {
  try {
    const { profileId } = req.params;

    // Get blood sugar readings from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const readings = await HealthReading.find({
      profileId,
      type: 'blood_sugar',
      measuredAt: { $gte: threeMonthsAgo },
    }).sort({ measuredAt: -1 });

    if (readings.length === 0) {
      return res.status(404).json({ message: 'Insufficient blood sugar data for HbA1c estimation' });
    }

    // Calculate average blood sugar
    let totalSugar = 0;
    let count = 0;

    readings.forEach(reading => {
      if (reading.value) {
        // Convert mmol/L to mg/dL if needed (assuming mg/dL for calculation)
        const sugarInMgDl = reading.unit === 'mmol/L' ? reading.value * 18 : reading.value;
        totalSugar += sugarInMgDl;
        count++;
      }
    });

    if (count === 0) {
      return res.status(404).json({ message: 'No valid blood sugar readings found' });
    }

    const averageSugar = totalSugar / count;

    // Estimated HbA1c formula: (Average Glucose + 46.7) / 28.6
    const estimatedHbA1c = ((averageSugar + 46.7) / 28.6).toFixed(1);

    // Interpretation
    let interpretation = '';
    if (estimatedHbA1c < 5.7) {
      interpretation = 'Normal';
    } else if (estimatedHbA1c >= 5.7 && estimatedHbA1c < 6.5) {
      interpretation = 'Prediabetes';
    } else {
      interpretation = 'Diabetes';
    }

    res.status(200).json({
      estimatedHbA1c: parseFloat(estimatedHbA1c),
      interpretation,
      averageGlucose: averageSugar.toFixed(0),
      readingsCount: count,
      disclaimer: 'This is an estimated HbA1c based on blood sugar readings. Consult a healthcare provider for accurate diagnosis.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET CHART DATA
export async function getChartData(req, res) {
  try {
    const { profileId, type } = req.params;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const readings = await HealthReading.find({
      profileId,
      type,
      measuredAt: { $gte: startDate },
    }).sort({ measuredAt: 1 });

    // Format for chart
    const chartData = readings.map(reading => ({
      date: reading.measuredAt,
      value: type === 'blood_pressure' ? {
        systolic: reading.systolic,
        diastolic: reading.diastolic,
      } : reading.value,
      unit: reading.unit,
    }));

    res.status(200).json({ chartData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE HEALTH READING
export async function updateHealthReading(req, res) {
  try {
    const { type, systolic, diastolic, value, unit, measuredAt, mealContext, notes } = req.body;

    const reading = await HealthReading.findByIdAndUpdate(
      req.params.id,
      {
        type,
        systolic: type === 'blood_pressure' ? systolic : undefined,
        diastolic: type === 'blood_pressure' ? diastolic : undefined,
        value: type !== 'blood_pressure' ? value : undefined,
        unit,
        measuredAt,
        mealContext: type === 'blood_sugar' ? mealContext : null,
        notes,
      },
      { new: true, runValidators: true }
    );

    if (!reading) return res.status(404).json({ message: 'Health reading not found' });

    res.status(200).json({
      message: 'Health reading updated successfully',
      reading,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE HEALTH READING
export async function deleteHealthReading(req, res) {
  try {
    const reading = await HealthReading.findByIdAndDelete(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Health reading not found' });

    res.status(200).json({ message: 'Health reading deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Helper function to get default unit for type
function getDefaultUnit(type) {
  const units = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    weight: 'kg',
    heart_rate: 'bpm',
    bmi: 'kg/m²',
  };
  return units[type] || '';
}

// Calculate BMI from weight and height
export async function calculateBMI(req, res) {
  try {
    const { profileId } = req.params;
    const { weight, height } = req.body; // height in cm, weight in kg

    if (!weight || !height) {
      return res.status(400).json({ message: 'Weight and height are required for BMI calculation' });
    }

    // BMI formula: weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Interpretation
    let interpretation = '';
    if (bmi < 18.5) {
      interpretation = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
      interpretation = 'Normal weight';
    } else if (bmi >= 25 && bmi < 30) {
      interpretation = 'Overweight';
    } else {
      interpretation = 'Obese';
    }

    // Optionally save the BMI reading
    const targetUserId = req.user?.id || req.user?._id;
    if (targetUserId && profileId) {
      await HealthReading.create({
        userId: targetUserId,
        profileId,
        type: 'bmi',
        value: parseFloat(bmi),
        unit: 'kg/m²',
        measuredAt: new Date(),
      });
    }

    res.status(200).json({
      bmi: parseFloat(bmi),
      interpretation,
      weight,
      height,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

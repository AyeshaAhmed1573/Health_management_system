const mongoose = require('mongoose');

const healthReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate'],
      required: true,
    },
    // For blood_pressure: store systolic + diastolic separately
    systolic: { type: Number },   // mmHg (blood pressure only)
    diastolic: { type: Number },  // mmHg (blood pressure only)
    // For all other types: single numeric value
    value: { type: Number },
    unit: {
      type: String,
      // bp: "mmHg", sugar: "mg/dL" or "mmol/L", weight: "kg", heart_rate: "bpm"
    },
    measuredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    mealContext: {
      // For blood sugar readings
      type: String,
      enum: ['fasting', 'post_meal', 'random', null],
      default: null,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

healthReadingSchema.index({ profileId: 1, type: 1, measuredAt: -1 });

module.exports = mongoose.model('HealthReading', healthReadingSchema);

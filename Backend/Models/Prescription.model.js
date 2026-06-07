const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },   // e.g. "500mg"
    frequency: { type: String, required: true, trim: true }, // e.g. "twice daily"
    duration: { type: String, required: true, trim: true },  // e.g. "7 days"
    instructions: { type: String, trim: true },              // e.g. "take after meals"
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    medicines: {
      type: [medicineItemSchema],
      required: true,
      validate: [arr => arr.length > 0, 'At least one medicine is required'],
    },
    diagnosis: { type: String, trim: true },
    notes: { type: String, trim: true },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    fileUrl: { type: String }, // generated PDF URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);

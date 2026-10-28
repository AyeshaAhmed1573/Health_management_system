import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },   // e.g. "500mg"
    frequency: { type: String, required: true, trim: true }, // e.g. "twice daily"
    duration: { type: String, required: true, trim: true },  // e.g. "7 days"
    instructions: { type: String, trim: true },              // e.g. "take after meals"
    durationDays: { type: Number, min: 1 },                  // used to stop reminders
    reminderTimes: [{ type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }], // e.g. ["08:00","20:00"]
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
    remindersEnabled: { type: Boolean, default: true },
    // Patient-consented transmission to partner pharmacies (SRS 4.6)
    sharedWith: [
      {
        pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
        sharedAt: { type: Date, default: Date.now },
        consentGivenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);

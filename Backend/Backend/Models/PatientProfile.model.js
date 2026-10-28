import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Profile name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      enum: ['self', 'mother', 'father', 'child', 'spouse', 'sibling', 'other'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
    },
    height: {
      type: Number, // in cm
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown',
    },
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    medicalConditions: [
      {
        type: String,
        trim: true,
      },
    ],
    avatarUrl: {
      type: String,
    },
    // Caregiver consent for managing a dependent (SRS 4.2 / 5.1)
    consent: {
      given: { type: Boolean, default: false },
      givenAt: { type: Date },
      givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('PatientProfile', patientProfileSchema);

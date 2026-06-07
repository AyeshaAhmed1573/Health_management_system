const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);

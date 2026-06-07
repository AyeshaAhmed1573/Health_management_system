const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        'CBC',
        'HbA1c',
        'Lipid Profile',
        'Liver Function Test',
        'Kidney Function Test',
        'X-Ray',
        'CT Scan',
        'MRI',
        'Ultrasound',
        'Other',
      ],
      default: 'Other',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png'],
      required: true,
    },
    fileSize: { type: Number }, // bytes
    // AI analysis fields
    aiSummary: {
      type: String,
    },
    aiHighlights: [
      {
        label: String,     // e.g. "Hemoglobin"
        value: String,     // e.g. "10.2 g/dL"
        status: {
          type: String,
          enum: ['normal', 'low', 'high', 'critical'],
        },
      },
    ],
    aiAnalyzedAt: { type: Date },
    // Uploaded by a lab
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
    },
    labBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabBooking',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

medicalReportSchema.index({ profileId: 1, category: 1 });
medicalReportSchema.index({ profileId: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);

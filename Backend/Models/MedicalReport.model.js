import mongoose from 'mongoose';

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
    title: {
      type: String,
      required: true,
      trim: true,
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
        'Thyroid Profile',
        'Urine Test',
        'Blood Sugar',
        'Stool Test',
        'Hormone Test',
        'Vitamins & Minerals',
        'Cardiac Markers',
        'Inflammation & Autoimmune',
        'Infection & Microbiology',
        'Tumor Markers',
        'Coagulation Test',
        'Nuclear Medicine',
        'Biopsy & Pathology',
        'Other',
      ],
      default: 'Other',
    },
    // New fields for enhanced report management
    testType: {
      type: String,
      trim: true,
      index: true,
    },
    isCustomTestType: {
      type: Boolean,
      default: false,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    extractedValues: [
      {
        parameterName: {
          type: String,
          trim: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
        },
        unit: {
          type: String,
          trim: true,
        },
        referenceRange: {
          type: String,
          trim: true,
        },
        isAbnormal: {
          type: Boolean,
          default: false,
        },
      },
    ],
    needsManualReview: {
      type: Boolean,
      default: false,
    },
    // Original fields
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
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
    fileSize: {
      type: Number,
    },
    folderPath: {
      type: String,
    },
    autoCategorized: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
    },
    aiHighlights: [
      {
        label: String,
        value: String,
        status: {
          type: String,
          enum: ['normal', 'low', 'high', 'critical'],
        },
        normalRange: String,
      },
    ],
    aiOverallStatus: {
      type: String,
      enum: ['Normal', 'Needs Attention', 'Concerning', 'Critical'],
    },
    aiRecommendations: [
      {
        type: String,
      },
    ],
    aiAnalyzedAt: {
      type: Date,
    },
    extractedText: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for folder-style querying
medicalReportSchema.index({ userId: 1, testType: 1 });
medicalReportSchema.index({ profileId: 1, category: 1, createdAt: -1 });
medicalReportSchema.index({ profileId: 1, testType: 1, testDate: -1 });

const MedicalReport = mongoose.models.MedicalReport || mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;

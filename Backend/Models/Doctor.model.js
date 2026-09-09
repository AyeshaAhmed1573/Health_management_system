import mongoose from 'mongoose';



const availableSlotSchema = new mongoose.Schema(

  {

    day: {

      type: String,

      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],

      required: true,

    },

    startTime: { type: String, required: true }, // e.g. "09:00"

    endTime: { type: String, required: true },   // e.g. "17:00"

    slotDurationMinutes: { type: Number, default: 30 },

  },

  { _id: false }

);



const doctorSchema = new mongoose.Schema(

  {

    userId: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User',

      required: true,

      unique: true,

    },

    hospital: {
      name: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      workingHours: {
        type: String,
        trim: true,
      },
      consultationFee: {
        type: Number,
        min: 0,
      },
    },
    clinic: {
      name: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      workingHours: {
        type: String,
        trim: true,
      },
      consultationFee: {
        type: Number,
        min: 0,
      },
    },
    licenseNumber: {

      type: String,

      required: true,

      unique: true,

      trim: true,

    },

    specialization: {

      type: String,

      required: true,

      trim: true,

    },

    qualification: {

      type: String,

      required: true,

      trim: true,

    },

    experienceYears: {

      type: Number,

      min: 0,

    },

    consultationFee: {

      type: Number,

      min: 0,

    },

    bio: {

      type: String,

      trim: true,

    },

    profileImageUrl: {

      type: String,

    },

    // Proof documents uploaded during signup
    documents: {
      licenseDocument: {
        type: String,
      },
      medicalDegreeDocument: {
        type: String,
      },
      hospitalProofDocument: {
        type: String,
      },
      clinicProofDocument: {
        type: String,
      },
      idProofDocument: {
        type: String,
      },
    },

    availableSlots: [availableSlotSchema],

    verificationStatus: {

      type: String,

      enum: ['pending', 'verified', 'rejected'],

      default: 'pending',

    },

    verificationNote: {

      type: String,

    },

    rating: {

      average: { type: Number, default: 0, min: 0, max: 5 },

      count: { type: Number, default: 0 },

    },

  },

  { timestamps: true }

);



export default mongoose.model('Doctor', doctorSchema);


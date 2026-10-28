import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    if (file.fieldname === 'licenseDocument') {
      cb(null, path.join(__dirname, '../public/uploads/licenses'));
    } else if (file.fieldname === 'logo') {
      cb(null, path.join(__dirname, '../public/uploads/logos'));
    } else if (file.fieldname === 'productImage') {
      cb(null, path.join(__dirname, '../public/uploads/products'));
    } else if (file.fieldname === 'prescription') {
      cb(null, path.join(__dirname, '../public/uploads/prescriptions'));
    } else if (file.fieldname === 'report') {
      cb(null, path.join(__dirname, '../public/uploads/reports'));
    } else {
      cb(null, path.join(__dirname, '../public/uploads'));
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  const allowedPrescriptionTypes = /jpeg|jpg|png|pdf/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'logo' || file.fieldname === 'productImage') {
    if (allowedImageTypes.test(extname) && allowedImageTypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed for logos and product images'));
    }
  } else if (file.fieldname === 'licenseDocument') {
    if (allowedDocTypes.test(extname) && allowedDocTypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (pdf, doc, docx) are allowed for license documents'));
    }
  } else if (file.fieldname === 'prescription') {
    if (allowedPrescriptionTypes.test(extname) && allowedPrescriptionTypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image (jpeg, jpg, png) or PDF files are allowed for prescriptions'));
    }
  } else if (file.fieldname === 'report') {
    if (allowedDocTypes.test(extname) && allowedDocTypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for reports'));
    }
  } else {
    cb(new Error('Invalid file field'));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Specific upload configurations
export const uploadVendorDocuments = upload.fields([
  { name: 'licenseDocument', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
]);

export const uploadProductImages = upload.fields([
  { name: 'productImage', maxCount: 5 },
]);

export const uploadPrescription = upload.single('prescription');

export const uploadReport = upload.single('report');

// Error handling middleware for multer
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files uploaded',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field',
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
}

// Optional documents sent with /api/auth/register (doctor / lab / pharmacy signup).
// Kept in memory and validated; the controller decides what to persist.
const registrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or PDF files are allowed'));
  },
});

export const uploadDoctorDocuments = registrationUpload;

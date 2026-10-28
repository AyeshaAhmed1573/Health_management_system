import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import cookieparser from 'cookie-parser';
import connectToDB from './Database/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './Routes/Auth.routes.js';
import chatbotRoutes from './Routes/chatbotRoutes.js';
import userRoutes from './Routes/User.routes.js';
import doctorRoutes from './Routes/Doctor.routes.js';
import patientRoutes from './Routes/Patient.routes.js';
import laboratoryRoutes from './Routes/Laboratory.routes.js';
import pharmacyRoutes from './Routes/Pharmacy.routes.js';
import reportRoutes from './Routes/report.routes.js';
import adminRoutes from './Routes/Admin.routes.js';
import otpRoutes from './Routes/otp.routes.js';
import healthReadingRoutes from './Routes/HealthReading.routes.js';
import notificationRoutes from './Routes/Notification.routes.js';
import chatRoutes from './Routes/Chat.routes.js';
import vendorRoutes from './Routes/Vendor.routes.js';
import vendorStaffRoutes from './Routes/VendorStaff.routes.js';
import productRoutes from './Routes/Product.routes.js';
import pharmacyOrderRoutes from './Routes/PharmacyOrder.routes.js';
import dashboardRoutes from './Routes/Dashboard.routes.js';
import labTestRoutes from './Routes/LabTest.routes.js';
import labBookingRoutes from './Routes/LabBooking.routes.js';
import patientMarketplaceRoutes from './Routes/PatientMarketplace.routes.js';
import appointmentRoutes from './Routes/Appointment.routes.js';
import prescriptionRoutes from './Routes/Prescription.routes.js';
import paymentRoutes from './Routes/Payment.routes.js';

const app = express();
app.set('trust proxy', 1); // correct client IPs for rate limiting / audit logs behind a proxy

// multer's relative destination needs these to exist
for (const dir of ['uploads', 'public/uploads']) fs.mkdirSync(path.join(__dirname, dir), { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // files are loaded by the SPA on another origin

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(cookieparser());
// keep the raw body so payment webhooks can be signature-checked
app.use(json({ limit: '10mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Only non-sensitive public assets are served statically. Patient reports, prescriptions,
// licenses and doctor ID documents must never be world-readable (SRS 5.1).
for (const dir of ['logos', 'products']) {
  app.use(`/uploads/${dir}`, express.static(path.join(__dirname, 'public', 'uploads', dir)));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

connectToDB();

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/chatbot/sessions', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/profiles', patientRoutes); // Alias for patients/profiles endpoints
app.use('/api/laboratories', laboratoryRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/health-readings', healthReadingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendor-staff', vendorStaffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pharmacy-orders', pharmacyOrderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/lab-bookings', labBookingRoutes);
app.use('/api/marketplace', patientMarketplaceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);

// 404 + central error handler (multer / JSON parse errors no longer leak stack traces)
app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: status >= 500 ? 'Internal server error' : err.message });
});

export default app;
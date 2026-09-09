import express, { json, urlencoded } from 'express';
import cors from 'cors';
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

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(cookieparser());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public/uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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

export default app;
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectToDB from './Database/db.js';
import authRoutes from './Routes/Auth.routes.js';
import chatbotRoutes from './Routes/chatbotRoutes.js';
import userRoutes from './Routes/User.routes.js';
import doctorRoutes from './Routes/Doctor.routes.js';
import patientRoutes from './Routes/Patient.routes.js';
import laboratoryRoutes from './Routes/Laboratory.routes.js';
import pharmacyRoutes from './Routes/Pharmacy.routes.js';
import reportRoutes from './Routes/report.routes.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieparser());

connectToDB();

app.use('/api/auth', authRoutes);
app.use('/api/chatbot/sessions', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/profiles', patientRoutes); // Alias for patients/profiles endpoints
app.use('/api/laboratories', laboratoryRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reports', reportRoutes);

export default app;
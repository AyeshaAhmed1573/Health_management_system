import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectToDB from './Database/db.js';
import authRoutes from './Routes/Auth.routes.js';
<<<<<<< HEAD
import chatbotRoutes from './Routes/chatbotRoutes.js';
=======
import userRoutes from './Routes/User.routes.js';
import doctorRoutes from './Routes/Doctor.routes.js';
import patientRoutes from './Routes/Patient.routes.js';
import laboratoryRoutes from './Routes/Laboratory.routes.js';
import pharmacyRoutes from './Routes/Pharmacy.routes.js';

config();
>>>>>>> cf47cbe (Update fee structure and module details)

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieparser());

connectToDB();

app.use('/api/auth', authRoutes);
<<<<<<< HEAD
app.use('/api/chatbot/sessions', chatbotRoutes);
=======
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/laboratories', laboratoryRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
>>>>>>> cf47cbe (Update fee structure and module details)

export default app;
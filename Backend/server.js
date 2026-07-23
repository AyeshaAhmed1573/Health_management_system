import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectToDB from './Database/db.js';
import authRoutes from './Routes/Auth.routes.js';
import chatbotRoutes from './Routes/chatbotRoutes.js';

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
app.use('/api/chatbot/sessions', chatbotRoutes);

export default app;
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieparser from 'cookie-parser';
import connectToDB from './Database/db.js';
import authRoutes from './Routes/Auth.routes.js';

config();

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieparser());

connectToDB();

app.use('/api/auth', authRoutes);

export default app;
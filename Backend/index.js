import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env full content:');
  console.log(envContent);
  console.log('--- END .env ---');
}

const result = dotenv.config({ path: envPath });
console.log('dotenv config result:', result.error ? result.error.message : 'Success');
console.log('EMAIL_USER after config:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_APP_PASSWORD after config:', process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');

import http from 'http';
import app from './server.js';

const port = 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
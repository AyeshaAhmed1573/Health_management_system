import './config/env.js';
import http from 'http';
import app from './server.js';
import { startReminderScheduler } from './Services/reminderService.js';
import { checkCloudinary } from './Services/cloudinaryService.js';

const port = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startReminderScheduler();
  checkCloudinary();
});

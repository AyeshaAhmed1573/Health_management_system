import { Router } from 'express';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import {
  bookAppointment, getDoctorAvailability, getMyAppointments, getDoctorAppointments,
  getAppointment, updateAppointmentStatus, saveConsultationNotes, getMyAvailability, setMyAvailability,
} from '../Controllers/Appointment.controller.js';
import {
  getAppointmentChat,
  getAppointmentChatUnreadCounts,
  markAppointmentChatRead,
  sendAppointmentChatMessage,
} from '../Controllers/AppointmentChat.controller.js';

const router = Router();
router.use(protect);

router.post('/', restrictTo('patient'), bookAppointment);
router.get('/mine', getMyAppointments);
router.get('/doctor/me', restrictTo('doctor'), getDoctorAppointments);
router.get('/doctor/availability', restrictTo('doctor'), getMyAvailability);
router.put('/doctor/availability', restrictTo('doctor'), setMyAvailability);
router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.get('/chat/unread-counts', getAppointmentChatUnreadCounts);
router.get('/:id', getAppointment);
router.get('/:id/chat', getAppointmentChat);
router.post('/:id/chat/messages', sendAppointmentChatMessage);
router.post('/:id/chat/read', markAppointmentChatRead);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/notes', restrictTo('doctor'), saveConsultationNotes);

export default router;

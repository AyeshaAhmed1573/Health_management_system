import { Router } from 'express';
import { protect, restrictTo } from '../Middleware/Auth.middleware.js';
import {
  bookAppointment, getDoctorAvailability, getMyAppointments, getDoctorAppointments,
  getAppointment, updateAppointmentStatus, saveConsultationNotes,
} from '../Controllers/Appointment.controller.js';

const router = Router();
router.use(protect);

router.post('/', restrictTo('patient'), bookAppointment);
router.get('/mine', getMyAppointments);
router.get('/doctor/me', restrictTo('doctor'), getDoctorAppointments);
router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.get('/:id', getAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/notes', restrictTo('doctor'), saveConsultationNotes);

export default router;

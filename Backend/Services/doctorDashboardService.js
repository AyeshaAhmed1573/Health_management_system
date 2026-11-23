import mongoose from 'mongoose';
import Appointment from '../Models/Appointment.model.js';
import Prescription from '../Models/Prescription.model.js';
import PatientProfile from '../Models/PatientProfile.model.js';
import MedicalReport from '../Models/MedicalReport.model.js';
import Order from '../Models/Order.model.js';
import Doctor from '../Models/Doctor.model.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const REPORT_ACCESS_STATUSES = ['pending', 'confirmed', 'completed'];
const PENDING_LAB_STATUSES = ['booked', 'sample_collected', 'processing'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_COUNT = 6;

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const sid = (value) => String(value?._id || value || '');
const startOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (key) => new Date(`${key}-01T00:00:00`).toLocaleString('en', { month: 'short' });
const timeLabel = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function lastMonthKeys(count = MONTH_COUNT) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return monthKey(date);
  });
}

function patientLabel(profile, user) {
  const name = profile?.name || user?.name || 'Patient';
  if (profile?.relationship && profile.relationship !== 'self') return `${name} (${profile.relationship})`;
  return name;
}

function statusChart(statusCounts) {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No-show',
  };
  return Object.entries(labels).map(([key, label]) => ({ n: label, v: statusCounts[key] || 0 }));
}

async function getStatusCounts(doctorId) {
  const rows = await Appointment.aggregate([
    { $match: { doctorId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
}

async function getWeeklySchedule(doctorId, weekStart, weekEnd) {
  const rows = await Appointment.aggregate([
    { $match: { doctorId, slotTime: { $gte: weekStart, $lt: weekEnd } } },
    { $group: { _id: { $dayOfWeek: '$slotTime' }, count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  // Mongo $dayOfWeek: 1=Sunday ... 7=Saturday. Map to Mon..Sun labels.
  const byLabel = { Mon: counts[2] || 0, Tue: counts[3] || 0, Wed: counts[4] || 0, Thu: counts[5] || 0, Fri: counts[6] || 0, Sat: counts[7] || 0, Sun: counts[1] || 0 };
  return WEEKDAYS.map((d) => ({ d, v: byLabel[d] || 0 }));
}

async function getMonthlySeries(doctorId, keys) {
  const monthStart = new Date(`${keys[0]}-01T00:00:00`);
  const appointmentRows = await Appointment.aggregate([
    { $match: { doctorId, slotTime: { $gte: monthStart } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$slotTime' } }, count: { $sum: 1 } } },
  ]);
  const appointmentCounts = Object.fromEntries(appointmentRows.map((row) => [row._id, row.count]));

  const prescriptionRows = await Prescription.aggregate([
    { $match: { doctorId, $expr: { $gte: [{ $ifNull: ['$issuedAt', '$createdAt'] }, monthStart] } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: { $ifNull: ['$issuedAt', '$createdAt'] } } }, count: { $sum: 1 } } },
  ]);
  const prescriptionCounts = Object.fromEntries(prescriptionRows.map((row) => [row._id, row.count]));

  return {
    monthlyActivity: keys.map((key) => ({ m: monthLabel(key), v: appointmentCounts[key] || 0 })),
    prescriptionTrend: keys.map((key) => ({ m: monthLabel(key), v: prescriptionCounts[key] || 0 })),
  };
}

async function getDemographics(profileIds) {
  if (!profileIds.length) return [];
  const profiles = await PatientProfile.find({ _id: { $in: profileIds } }).select('dateOfBirth').lean();
  const groups = { '0-18': 0, '19-35': 0, '36-55': 0, '56+': 0, Unknown: 0 };
  const now = new Date();

  profiles.forEach((profile) => {
    if (!profile.dateOfBirth) {
      groups.Unknown += 1;
      return;
    }
    const birth = new Date(profile.dateOfBirth);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
    if (age <= 18) groups['0-18'] += 1;
    else if (age <= 35) groups['19-35'] += 1;
    else if (age <= 55) groups['36-55'] += 1;
    else groups['56+'] += 1;
  });

  return Object.entries(groups)
    .map(([n, v]) => ({ n, v }))
    .filter((item) => item.v > 0);
}

async function getDiagnoses(doctorId) {
  const since = new Date(Date.now() - 90 * DAY_MS);
  const rows = await Prescription.aggregate([
    { $match: { doctorId, diagnosis: { $exists: true, $nin: [null, ''] }, issuedAt: { $gte: since } } },
    { $group: { _id: '$diagnosis', v: { $sum: 1 } } },
    { $sort: { v: -1 } },
    { $limit: 5 },
  ]);
  return rows.map((row) => ({ d: row._id, v: row.v }));
}

async function getLabReportData(profileIds) {
  const empty = { pendingCount: 0, completedCount: 0, needsReviewCount: 0, pendingItems: [] };
  if (!profileIds.length) return empty;

  const [statusRows, needsReviewCount, orders] = await Promise.all([
    Order.aggregate([
      { $match: { profileId: { $in: profileIds } } },
      { $unwind: '$subOrders' },
      { $match: { 'subOrders.vendorType': 'laboratory', 'subOrders.bookingStatus': { $ne: 'cancelled' } } },
      { $group: { _id: '$subOrders.bookingStatus', count: { $sum: 1 } } },
    ]),
    MedicalReport.countDocuments({ profileId: { $in: profileIds }, needsManualReview: true }),
    Order.find({
      profileId: { $in: profileIds },
      'subOrders.vendorType': 'laboratory',
      'subOrders.bookingStatus': { $in: PENDING_LAB_STATUSES },
    })
      .populate('profileId', 'name relationship')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
  ]);

  const statusCounts = Object.fromEntries(statusRows.map((row) => [row._id, row.count]));
  const pendingCount = PENDING_LAB_STATUSES.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);

  const pendingItems = orders.flatMap((order) =>
    (order.subOrders || [])
      .filter((subOrder) => subOrder.vendorType === 'laboratory' && PENDING_LAB_STATUSES.includes(subOrder.bookingStatus))
      .map((subOrder) => ({
        orderId: sid(order._id),
        subOrderId: sid(subOrder._id),
        orderNumber: order.orderNumber,
        patient: patientLabel(order.profileId),
        tests: (subOrder.items || []).map((item) => item.name).filter(Boolean).join(', ') || 'Lab tests',
        status: subOrder.bookingStatus,
        scheduledAt: order.scheduledDate || order.createdAt,
      }))
  ).slice(0, 10);

  return {
    pendingCount,
    completedCount: statusCounts.report_ready || 0,
    needsReviewCount,
    pendingItems,
  };
}

export async function getDoctorDashboardOverview(userId) {
  const uid = sid(userId);
  const doctor = await Doctor.findOne({ userId: uid }).select('_id rating specialization userId').lean();
  if (!doctor) throw httpError(404, 'Doctor profile not found');

  const doctorId = doctor._id;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = addDays(todayStart, 1);
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const weekStart = startOfDay(addDays(now, -day));
  const weekEnd = addDays(weekStart, 7);
  const monthKeys = lastMonthKeys(MONTH_COUNT);

  const [patientProfileIds, reportProfileIds, statusCounts, totalAppointments, todayCount, prescriptionsWritten, monthlySeries, diagnoses, weeklySchedule] = await Promise.all([
    Appointment.distinct('profileId', { doctorId }),
    Appointment.distinct('profileId', { doctorId, status: { $in: REPORT_ACCESS_STATUSES } }),
    getStatusCounts(doctorId),
    Appointment.countDocuments({ doctorId }),
    Appointment.countDocuments({ doctorId, slotTime: { $gte: todayStart, $lt: todayEnd } }),
    Prescription.countDocuments({ doctorId }),
    getMonthlySeries(doctorId, monthKeys),
    getDiagnoses(doctorId),
    getWeeklySchedule(doctorId, weekStart, weekEnd),
  ]);

  const [demographics, todayScheduleDocs, recentActivityDocs, labReports] = await Promise.all([
    getDemographics(patientProfileIds),
    Appointment.find({ doctorId, slotTime: { $gte: todayStart, $lt: todayEnd } })
      .populate('profileId', 'name relationship')
      .populate('userId', 'name')
      .sort({ slotTime: 1 })
      .limit(20)
      .lean(),
    Appointment.find({ doctorId })
      .populate('profileId', 'name relationship')
      .populate('userId', 'name')
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
    getLabReportData(reportProfileIds),
  ]);

  const ratingCount = doctor.rating?.count || 0;
  const averageRating = ratingCount ? Number((doctor.rating?.average || 0).toFixed(1)) : null;

  return {
    doctor: {
      id: sid(doctor._id),
      specialization: doctor.specialization,
      ratingCount,
    },
    stats: {
      totalAppointments,
      pendingAppointments: statusCounts.pending || 0,
      confirmedAppointments: statusCounts.confirmed || 0,
      completedAppointments: statusCounts.completed || 0,
      totalPatients: patientProfileIds.length,
      prescriptionsWritten,
      averageRating,
      ratingCount,
      todaysAppointments: todayCount,
      pendingLabReports: labReports.pendingCount,
      completedLabReports: labReports.completedCount,
      needsReviewReports: labReports.needsReviewCount,
    },
    charts: {
      weeklySchedule,
      demographics,
      diagnoses,
      appointmentOutcomes: statusChart(statusCounts),
      prescriptionTrend: monthlySeries.prescriptionTrend,
      monthlyActivity: monthlySeries.monthlyActivity,
    },
    todaySchedule: todayScheduleDocs.map((appointment) => ({
      id: sid(appointment._id),
      time: timeLabel(appointment.slotTime),
      patient: patientLabel(appointment.profileId, appointment.userId),
      type: appointment.type === 'online' ? 'Online consultation' : 'In-person visit',
      status: appointment.status,
      reason: appointment.reason || '',
    })),
    recentActivity: recentActivityDocs.map((appointment) => ({
      id: sid(appointment._id),
      time: appointment.updatedAt || appointment.createdAt,
      title: patientLabel(appointment.profileId, appointment.userId),
      detail: `${appointment.status.replace('_', ' ')} · ${appointment.type === 'online' ? 'online' : 'in person'}`,
    })),
    pendingReports: labReports.pendingItems,
  };
}

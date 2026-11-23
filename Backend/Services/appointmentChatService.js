import mongoose from 'mongoose';
import Appointment from '../Models/Appointment.model.js';
import AppointmentConversation from '../Models/AppointmentConversation.model.js';
import AppointmentMessage from '../Models/AppointmentMessage.model.js';
import Doctor from '../Models/Doctor.model.js';
import PatientProfile from '../Models/PatientProfile.model.js';
import User from '../Models/User.model.js';

const sid = (value) => (value?._id ? String(value._id) : String(value));
const SENDABLE_STATUSES = new Set(['confirmed', 'completed', 'no_show']);
const CHAT_VISIBLE_STATUSES = new Set(['confirmed', 'completed', 'no_show', 'cancelled']);

export class ChatHttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const loadDoctor = (appointment) =>
  Doctor.findById(appointment.doctorId)
    .select('userId specialization profileImageUrl')
    .populate('userId', 'name email');

function upsertParticipant(conversation, { userId, role, name }) {
  let participant = conversation.participants.find((p) => sid(p.userId) === sid(userId));
  if (!participant) {
    participant = { userId, role, name, unreadCount: 0, lastReadAt: new Date() };
    conversation.participants.push(participant);
  } else {
    if (name) participant.name = name;
    if (participant.role !== role) participant.role = role;
  }
  conversation.markModified('participants');
  return participant;
}

export async function ensureAppointmentConversation(appointment) {
  if (!CHAT_VISIBLE_STATUSES.has(appointment.status) || appointment.status === 'cancelled') {
    if (appointment.status === 'cancelled' && appointment.conversationId) {
      return AppointmentConversation.findById(appointment.conversationId);
    }
    return null;
  }

  if (appointment.conversationId) {
    const existing = await AppointmentConversation.findById(appointment.conversationId);
    if (existing) return existing;
  }

  const doctor = await loadDoctor(appointment);
  const doctorUserId = doctor?.userId?._id || doctor?.userId;
  if (!doctor || !doctorUserId) throw new ChatHttpError(404, 'Doctor profile not found');

  const [patientUser, profile] = await Promise.all([
    User.findById(appointment.userId).select('name'),
    PatientProfile.findById(appointment.profileId).select('name relationship'),
  ]);

  const profileName = profile?.name || patientUser?.name || 'Patient';
  const patientName = profile?.name && profile.relationship && profile.relationship !== 'self'
    ? `${profile.name} (${profile.relationship})`
    : profileName;
  const doctorName = doctor.userId?.name || 'Doctor';

  let conversation = await AppointmentConversation.findOne({ appointmentId: appointment._id });
  if (!conversation) {
    try {
      conversation = await AppointmentConversation.create({
        appointmentId: appointment._id,
        patientUserId: appointment.userId,
        doctorUserId,
        patientProfileId: appointment.profileId,
        patientName,
        doctorName,
        participants: [
          { userId: appointment.userId, role: 'patient', name: patientName, unreadCount: 0, lastReadAt: new Date() },
          { userId: doctorUserId, role: 'doctor', name: doctorName, unreadCount: 0, lastReadAt: new Date() },
        ],
      });
    } catch (err) {
      if (err.code !== 11000) throw err;
      conversation = await AppointmentConversation.findOne({ appointmentId: appointment._id });
    }
  }

  upsertParticipant(conversation, { userId: appointment.userId, role: 'patient', name: patientName });
  upsertParticipant(conversation, { userId: doctorUserId, role: 'doctor', name: doctorName });
  conversation.patientName = patientName;
  conversation.doctorName = doctorName;
  await conversation.save();

  if (sid(appointment.conversationId || '') !== sid(conversation._id)) {
    appointment.conversationId = conversation._id;
    await Appointment.updateOne({ _id: appointment._id }, { $set: { conversationId: conversation._id } });
  }

  return conversation;
}

export async function getAppointmentChatContext(appointmentId, userId) {
  if (!mongoose.isValidObjectId(appointmentId)) throw new ChatHttpError(404, 'Appointment not found');
  const uid = sid(userId);
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ChatHttpError(404, 'Appointment not found');

  const doctor = await loadDoctor(appointment);
  const doctorUserId = sid(doctor?.userId || '');
  const isPatient = sid(appointment.userId) === uid;
  const isDoctor = doctorUserId === uid;
  if (!isPatient && !isDoctor) throw new ChatHttpError(403, 'Only the patient and doctor can access this chat');

  if (appointment.status === 'pending') {
    throw new ChatHttpError(400, 'Chat is available after the appointment is confirmed');
  }

  let conversation;
  if (appointment.status === 'cancelled') {
    conversation = appointment.conversationId
      ? await AppointmentConversation.findById(appointment.conversationId)
      : await AppointmentConversation.findOne({ appointmentId: appointment._id });
  } else {
    conversation = await ensureAppointmentConversation(appointment);
  }
  if (!conversation) throw new ChatHttpError(404, 'Chat is not available for this appointment');

  const participant = conversation.participants.find((p) => sid(p.userId) === uid);
  const otherParticipant = conversation.participants.find((p) => sid(p.userId) !== uid);
  if (!participant || !otherParticipant) throw new ChatHttpError(403, 'Chat participants are invalid');

  return {
    appointment,
    doctor,
    conversation,
    participant,
    otherParticipant,
    participantRole: participant.role,
    canSend: SENDABLE_STATUSES.has(appointment.status),
  };
}

export async function listConversationMessages(conversationId, { limit = 200 } = {}) {
  const boundedLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const messages = await AppointmentMessage.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(boundedLimit)
    .lean();
  return messages.reverse();
}

export async function createConversationMessage(conversationId, userId, text) {
  if (!mongoose.isValidObjectId(conversationId)) throw new ChatHttpError(404, 'Conversation not found');
  const uid = sid(userId);
  const conversation = await AppointmentConversation.findById(conversationId);
  if (!conversation) throw new ChatHttpError(404, 'Conversation not found');

  const appointment = await Appointment.findById(conversation.appointmentId);
  if (!appointment) throw new ChatHttpError(404, 'Appointment not found');

  const sender = conversation.participants.find((p) => sid(p.userId) === uid);
  const recipient = conversation.participants.find((p) => sid(p.userId) !== uid);
  if (!sender || !recipient) throw new ChatHttpError(403, 'Only the patient and doctor can send messages');
  if (!SENDABLE_STATUSES.has(appointment.status)) {
    throw new ChatHttpError(400, 'Messages are disabled for this appointment');
  }

  const cleanText = String(text || '').trim();
  if (!cleanText) throw new ChatHttpError(400, 'Message cannot be empty');
  if (cleanText.length > 2000) throw new ChatHttpError(400, 'Message is too long');

  const message = await AppointmentMessage.create({
    conversationId: conversation._id,
    appointmentId: appointment._id,
    senderId: uid,
    senderRole: sender.role,
    senderName: sender.name || 'User',
    text: cleanText,
  });

  recipient.unreadCount = (recipient.unreadCount || 0) + 1;
  conversation.lastMessageText = cleanText.slice(0, 140);
  conversation.lastMessageAt = message.createdAt;
  conversation.markModified('participants');
  await conversation.save();

  return {
    message: message.toObject(),
    conversation: conversation.toObject(),
    appointmentId: sid(appointment._id),
    conversationId: sid(conversation._id),
    senderUserId: uid,
    recipientUserId: sid(recipient.userId),
    unreadCount: recipient.unreadCount,
  };
}

export async function markConversationRead(conversationId, userId) {
  if (!mongoose.isValidObjectId(conversationId)) throw new ChatHttpError(404, 'Conversation not found');
  const uid = sid(userId);
  const conversation = await AppointmentConversation.findById(conversationId);
  if (!conversation) throw new ChatHttpError(404, 'Conversation not found');

  const participant = conversation.participants.find((p) => sid(p.userId) === uid);
  if (!participant) throw new ChatHttpError(403, 'Only the patient and doctor can access this chat');

  participant.unreadCount = 0;
  participant.lastReadAt = new Date();
  conversation.markModified('participants');
  await conversation.save();

  return {
    appointmentId: sid(conversation.appointmentId),
    conversationId: sid(conversation._id),
    userId: uid,
    unreadCount: 0,
  };
}

export async function getConversationAccess(conversationId, userId) {
  if (!mongoose.isValidObjectId(conversationId)) throw new ChatHttpError(404, 'Conversation not found');
  const uid = sid(userId);
  const conversation = await AppointmentConversation.findById(conversationId);
  if (!conversation) throw new ChatHttpError(404, 'Conversation not found');

  const appointment = await Appointment.findById(conversation.appointmentId);
  if (!appointment) throw new ChatHttpError(404, 'Appointment not found');

  const participant = conversation.participants.find((p) => sid(p.userId) === uid);
  const otherParticipant = conversation.participants.find((p) => sid(p.userId) !== uid);
  if (!participant || !otherParticipant) throw new ChatHttpError(403, 'Only the patient and doctor can access this chat');

  return {
    conversation,
    appointment,
    participant,
    otherParticipant,
    canSend: SENDABLE_STATUSES.has(appointment.status),
  };
}

export async function getRelatedParticipantIds(userId) {
  const uid = sid(userId);
  const conversations = await AppointmentConversation.find({ 'participants.userId': uid })
    .select('participants')
    .lean();
  const related = new Set();
  conversations.forEach((conversation) => {
    conversation.participants.forEach((participant) => {
      const participantId = sid(participant.userId);
      if (participantId !== uid) related.add(participantId);
    });
  });
  return Array.from(related);
}

export async function getUnreadSummaries(userId) {
  const uid = sid(userId);
  const conversations = await AppointmentConversation.find({ 'participants.userId': uid })
    .select('appointmentId participants')
    .lean();

  return conversations.map((conversation) => {
    const participant = conversation.participants.find((p) => sid(p.userId) === uid);
    return {
      appointmentId: sid(conversation.appointmentId),
      conversationId: sid(conversation._id),
      unreadCount: participant?.unreadCount || 0,
    };
  });
}

export async function attachChatInfo(appointments, userId) {
  const docs = appointments.map((appointment) =>
    typeof appointment?.toObject === 'function' ? appointment.toObject() : appointment
  );
  const ids = docs.map((a) => a?._id).filter(Boolean);
  if (!ids.length) return docs;

  const uid = sid(userId);
  const conversations = await AppointmentConversation.find({
    appointmentId: { $in: ids },
    'participants.userId': uid,
  }).select('appointmentId participants').lean();
  const byAppointment = new Map(conversations.map((c) => [sid(c.appointmentId), c]));

  return docs.map((appointment) => {
    if (!appointment || appointment.status === 'pending') return appointment;
    const conversation = byAppointment.get(sid(appointment._id));
    const participant = conversation?.participants?.find((p) => sid(p.userId) === uid);
    if (conversation || appointment.status !== 'cancelled') {
      appointment.chat = {
        conversationId: conversation?._id ? sid(conversation._id) : null,
        unreadCount: participant?.unreadCount || 0,
      };
    }
    return appointment;
  });
}

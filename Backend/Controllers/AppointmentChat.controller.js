import { getUserId } from '../utils/access.js';
import {
  createConversationMessage,
  getAppointmentChatContext,
  getUnreadSummaries,
  listConversationMessages,
  markConversationRead,
} from '../Services/appointmentChatService.js';
import { emitChatMessage, emitChatRead, isUserOnline } from '../socket/socketServer.js';

const fail = (res, status, error) => res.status(status).json({ success: false, error });
const sid = (value) => (value?._id ? String(value._id) : String(value));

export async function getAppointmentChat(req, res) {
  try {
    const context = await getAppointmentChatContext(req.params.id, getUserId(req));
    const messages = await listConversationMessages(context.conversation._id, { limit: req.query.limit });
    const otherRaw = context.otherParticipant.toObject?.() || context.otherParticipant;
    const other = {
      userId: sid(otherRaw.userId),
      role: otherRaw.role,
      name: otherRaw.name,
      online: isUserOnline(sid(otherRaw.userId)),
    };

    res.json({
      success: true,
      appointment: {
        _id: sid(context.appointment._id),
        status: context.appointment.status,
        slotTime: context.appointment.slotTime,
        type: context.appointment.type,
        meetingLink: context.appointment.meetingLink,
      },
      conversation: {
        _id: sid(context.conversation._id),
        appointmentId: sid(context.conversation.appointmentId),
        lastMessageAt: context.conversation.lastMessageAt,
        lastMessageText: context.conversation.lastMessageText,
      },
      messages,
      otherParticipant: other,
      canSend: context.canSend,
    });
  } catch (err) {
    fail(res, err.status || 500, err.message);
  }
}

export async function sendAppointmentChatMessage(req, res) {
  try {
    const context = await getAppointmentChatContext(req.params.id, getUserId(req));
    const result = await createConversationMessage(context.conversation._id, getUserId(req), req.body?.text);
    emitChatMessage(result);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    fail(res, err.status || 500, err.message);
  }
}

export async function markAppointmentChatRead(req, res) {
  try {
    const context = await getAppointmentChatContext(req.params.id, getUserId(req));
    const result = await markConversationRead(context.conversation._id, getUserId(req));
    emitChatRead(result);
    res.json({ success: true, ...result });
  } catch (err) {
    fail(res, err.status || 500, err.message);
  }
}

export async function getAppointmentChatUnreadCounts(req, res) {
  try {
    const counts = await getUnreadSummaries(getUserId(req));
    res.json({ success: true, counts });
  } catch (err) {
    fail(res, err.status || 500, err.message);
  }
}

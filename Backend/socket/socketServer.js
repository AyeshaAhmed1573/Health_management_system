import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/auth.js';
import Appointment from '../Models/Appointment.model.js';
import Doctor from '../Models/Doctor.model.js';
import {
  createConversationMessage,
  getConversationAccess,
  getRelatedParticipantIds,
  markConversationRead,
} from '../Services/appointmentChatService.js';

const sid = (value) => (value?._id ? String(value._id) : String(value));
const chatRoom = (conversationId) => `appointment-chat:${conversationId}`;
const userRoom = (userId) => `user:${userId}`;

let io = null;
const onlineUsers = new Set();
const userSockets = new Map();

const emitPresenceToRelated = (userId, online) => {
  getRelatedParticipantIds(userId)
    .then((relatedUserIds) => {
      relatedUserIds.forEach((relatedUserId) => {
        io?.to(userRoom(relatedUserId)).emit('presence:update', { userId, online });
      });
    })
    .catch((err) => console.error('Failed to emit chat presence:', err));
};

const trackSocket = (userId, socket) => {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socket.id);
  const wasOnline = onlineUsers.has(userId);
  onlineUsers.add(userId);
  if (!wasOnline) emitPresenceToRelated(userId, true);
};

const untrackSocket = (userId, socket) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.delete(socket.id);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    onlineUsers.delete(userId);
    emitPresenceToRelated(userId, false);
  }
};

export function emitChatMessage(result) {
  if (!io) return;
  io.to(chatRoom(result.conversationId)).emit('message:new', {
    conversationId: result.conversationId,
    appointmentId: result.appointmentId,
    message: result.message,
  });
  io.to(userRoom(result.recipientUserId)).emit('conversation:unread', {
    appointmentId: result.appointmentId,
    conversationId: result.conversationId,
    unreadCount: result.unreadCount,
  });
}

export function emitChatRead(result) {
  if (!io || !result?.userId) return;
  io.to(userRoom(result.userId)).emit('conversation:unread', {
    appointmentId: result.appointmentId,
    conversationId: result.conversationId,
    unreadCount: result.unreadCount,
  });
}

export function emitDoctorDashboardRefresh(userId) {
  if (!io || !userId) return;
  io.to(userRoom(sid(userId))).emit('doctor-dashboard:refresh', { userId: sid(userId) });
}

export async function emitProfileDashboardRefresh(profileId) {
  try {
    if (!io || !profileId) return;
    const doctorIds = await Appointment.distinct('doctorId', {
      profileId,
      status: { $in: ['pending', 'confirmed', 'completed'] },
    });
    if (!doctorIds.length) return;
    const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('userId').lean();
    doctors.forEach((doctor) => emitDoctorDashboardRefresh(doctor.userId));
  } catch (err) {
    console.error('Failed to emit doctor dashboard refresh:', err);
  }
}

export function isUserOnline(userId) {
  return onlineUsers.has(sid(userId));
}

export function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    try {
      socket.data.user = verifyAccessToken(Array.isArray(token) ? token[0] : token);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = sid(socket.data.user?.id || socket.data.user?._id);
    socket.data.userId = userId;
    socket.join(userRoom(userId));
    trackSocket(userId, socket);
    getRelatedParticipantIds(userId)
      .then((relatedUserIds) => {
        socket.emit('presence:snapshot', {
          userIds: relatedUserIds.filter((relatedUserId) => onlineUsers.has(relatedUserId)),
        });
      })
      .catch((err) => console.error('Failed to load chat presence:', err));

    socket.on('join:conversation', async ({ conversationId } = {}, ack) => {
      try {
        const access = await getConversationAccess(conversationId, userId);
        socket.join(chatRoom(sid(conversationId)));
        ack?.({
          success: true,
          canSend: access.canSend,
          appointmentStatus: access.appointment.status,
          otherParticipant: {
            userId: sid(access.otherParticipant.userId),
            role: access.otherParticipant.role,
            name: access.otherParticipant.name,
          },
        });
      } catch (err) {
        ack?.({ success: false, error: err.message });
      }
    });

    socket.on('leave:conversation', ({ conversationId } = {}) => {
      if (conversationId) socket.leave(chatRoom(sid(conversationId)));
    });

    socket.on('send:message', async ({ conversationId, text } = {}, ack) => {
      try {
        const result = await createConversationMessage(conversationId, userId, text);
        emitChatMessage(result);
        ack?.({ success: true, message: result.message });
      } catch (err) {
        ack?.({ success: false, error: err.message });
      }
    });

    const typingHandler = (isTyping) => async ({ conversationId } = {}, ack) => {
      try {
        const access = await getConversationAccess(conversationId, userId);
        if (!access.canSend) return ack?.({ success: false, error: 'Messages are disabled for this appointment' });
        socket.to(chatRoom(sid(conversationId))).emit('typing:update', {
          conversationId: sid(conversationId),
          userId,
          senderName: access.participant.name || 'User',
          isTyping: Boolean(isTyping),
        });
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false, error: err.message });
      }
    };
    socket.on('typing:start', typingHandler(true));
    socket.on('typing:stop', typingHandler(false));

    socket.on('conversation:read', async ({ conversationId } = {}, ack) => {
      try {
        await getConversationAccess(conversationId, userId);
        const result = await markConversationRead(conversationId, userId);
        emitChatRead(result);
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => untrackSocket(userId, socket));
  });

  return io;
}

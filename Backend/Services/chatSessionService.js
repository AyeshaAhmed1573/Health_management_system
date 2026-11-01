import ChatSession from '../Models/chatSessions.js';

export const createSession = async (userId, title = 'Health Chat') => {
  const session = new ChatSession({ userId, title, messages: [] });
  await session.save();
  return session;
};

export const getSessionById = (sessionId, userId) =>
  ChatSession.findOne({ _id: sessionId, isActive: true });

export const getUserSessions = (userId) =>
  ChatSession.find({ userId, isActive: true })
    .select('title totalMessages lastMessageAt createdAt')
    .sort({ lastMessageAt: -1 });

export const appendMessages = async (session, userContent, assistantContent, isEmergency = false) => {
  session.messages.push({ role: 'user',      content: userContent });
  session.messages.push({ role: 'assistant', content: assistantContent, isEmergency });
  await session.save();
  return session;
};

export const generateTitle = (firstMessage) => {
  const words = firstMessage.trim().split(/\s+/).slice(0, 6).join(' ');
  return words.length > 40 ? words.substring(0, 40) + '…' : words;
};

export const deleteSession = (sessionId, userId) =>
  ChatSession.findOneAndUpdate(
    { _id: sessionId, isActive: true },
    { isActive: false },
    { new: true }
  );

export const clearSessionMessages = (sessionId, userId) =>
  ChatSession.findOneAndUpdate(
    { _id: sessionId, isActive: true },
    { $set: { messages: [], totalMessages: 0, title: 'Health Chat' } },
    { new: true }
  );
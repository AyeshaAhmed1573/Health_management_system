import { generateReply } from '../Services/geminiService.js';
import {
  createSession, getSessionById, getUserSessions,
  appendMessages, generateTitle, deleteSession, clearSessionMessages,
} from '../Services/chatSessionService.js';
import { isEmergency, getEmergencyNotice } from '../utils/emergencyDetector.js';
import { validateMessage, trimHistory } from '../utils/validators.js';

const createChatSession = async (req, res) => {
  try {
    // Use user ID if authenticated, otherwise use a guest ID from session
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const session = await createSession(userId, req.body.title);
    res.status(201).json({ success: true, data: { sessionId: session._id, title: session.title } });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ success: false, error: 'Failed to create session.' });
  }
};

const getChatSessions = async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const sessions = await getUserSessions(userId);
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions.' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const session = await getSessionById(req.params.sessionId, userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch history.' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const validation = validateMessage(req.body.message);
    if (!validation.valid)
      return res.status(400).json({ success: false, error: validation.error });

    const userText = validation.trimmed;
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const session  = await getSessionById(req.params.sessionId, userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.messages.length === 0) session.title = generateTitle(userText);

    const emergency = isEmergency(userText);

    const history = trimHistory([
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userText },
    ]);

    let aiReply = await generateReply(history);
    if (emergency) aiReply = getEmergencyNotice() + aiReply;

    await appendMessages(session, userText, aiReply, emergency);

    res.status(200).json({
      success: true,
      data: { sessionId: session._id, userMessage: userText, reply: aiReply, isEmergency: emergency },
    });
  } catch (err) {
    console.error('Send message error:', err);
    // TEMP DEBUG: surfacing the real error message to the client so we can see
    // what's actually failing. Revert this to the generic message before deploying.
    res.status(502).json({ success: false, error: err.message || 'AI service unavailable. Try again shortly.' });
  }
};

const clearMessages = async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const session = await clearSessionMessages(req.params.sessionId, userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
    res.status(200).json({ success: true, message: 'Chat cleared.' });
  } catch (err) {
    console.error('Clear messages error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear messages.' });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID || 'guest-' + Date.now();
    const session = await deleteSession(req.params.sessionId, userId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
    res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete session.' });
  }
};

export default {
  createChatSession, getChatSessions, getChatHistory,
  sendMessage, clearMessages, deleteChatSession,
};
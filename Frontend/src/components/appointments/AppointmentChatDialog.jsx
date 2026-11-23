import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { appointmentChatApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getSocket } from "@/lib/socket";

const sid = (value) => String(value?._id || value || "");
const messageId = (message) => String(message?._id || message?.id || "");
const byCreatedAt = (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0);

function upsertMessage(messages, message) {
  const id = messageId(message);
  if (messages.some((item) => messageId(item) === id)) return messages;
  return [...messages, message].sort(byCreatedAt);
}

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatAppointmentTime = (value) =>
  new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function AppointmentChatDialog({ appointment, open, onOpenChange }) {
  const { user } = useAuth();
  const currentUserId = sid(user?.id || user?._id);
  const appointmentId = sid(appointment?._id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState(appointment?.status || "");
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingStopRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const loadChat = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError("");
    try {
      const data = await appointmentChatApi.get(appointmentId);
      setConversationId(sid(data.conversation?._id));
      setMessages((data.messages || []).slice().sort(byCreatedAt));
      setCanSend(Boolean(data.canSend));
      setAppointmentStatus(data.appointment?.status || appointment?.status || "");
      setOtherParticipant(data.otherParticipant || null);
      const otherId = sid(data.otherParticipant?.userId);
      if (otherId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.otherParticipant.online) next.add(otherId);
          else next.delete(otherId);
          return next;
        });
      }
      appointmentChatApi.markRead(appointmentId).catch(() => {});
    } catch (err) {
      setConversationId(null);
      setMessages([]);
      setOtherParticipant(null);
      setCanSend(false);
      setError(err.message || "Could not load chat");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, appointment?.status]);

  useEffect(() => {
    if (open && appointmentId) loadChat();
  }, [open, appointmentId, loadChat]);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setConversationId(null);
      setDraft("");
      setTypingUsers({});
      setError("");
      setSending(false);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typingUsers]);

  useEffect(() => {
    if (!open || !conversationId || !currentUserId) return;
    const socket = getSocket();
    if (!socket) {
      setRealtimeConnected(false);
      return;
    }
    socketRef.current = socket;

    const onConnect = () => setRealtimeConnected(true);
    const onDisconnect = () => setRealtimeConnected(false);
    const onPresenceSnapshot = ({ userIds = [] } = {}) => {
      const onlineSet = new Set(userIds.map(sid));
      setOnlineUsers(onlineSet);
      setOtherParticipant((prev) => (prev ? { ...prev, online: onlineSet.has(sid(prev.userId)) } : prev));
    };
    const onPresenceUpdate = ({ userId, online } = {}) => {
      const id = sid(userId);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(id);
        else next.delete(id);
        return next;
      });
      setOtherParticipant((prev) => (prev && sid(prev.userId) === id ? { ...prev, online: Boolean(online) } : prev));
    };
    const onMessage = ({ conversationId: incomingConversationId, message } = {}) => {
      if (sid(incomingConversationId) !== sid(conversationId) || !message) return;
      setMessages((prev) => upsertMessage(prev, message));
      if (sid(message.senderId) !== currentUserId) {
        socket.emit("conversation:read", { conversationId });
      }
    };
    const onTyping = ({ conversationId: incomingConversationId, userId, senderName, isTyping } = {}) => {
      if (sid(incomingConversationId) !== sid(conversationId) || sid(userId) === currentUserId) return;
      const id = sid(userId);
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[id] = senderName || "User";
        else delete next[id];
        return next;
      });
      if (isTyping) {
        window.setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }, 4000);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence:snapshot", onPresenceSnapshot);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("message:new", onMessage);
    socket.on("typing:update", onTyping);
    setRealtimeConnected(socket.connected);

    socket.emit("join:conversation", { conversationId }, (response) => {
      if (!response?.success) return;
      setCanSend(Boolean(response.canSend));
      setAppointmentStatus((prev) => response.appointmentStatus || prev);
      setOtherParticipant((prev) => ({ ...(prev || {}), ...(response.otherParticipant || {}) }));
    });
    socket.emit("conversation:read", { conversationId });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence:snapshot", onPresenceSnapshot);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("message:new", onMessage);
      socket.off("typing:update", onTyping);
      socket.emit("typing:stop", { conversationId });
      socket.emit("leave:conversation", { conversationId });
      socketRef.current = null;
      setRealtimeConnected(false);
    };
  }, [open, conversationId, currentUserId]);

  useEffect(() => () => {
    if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
  }, []);

  const emitTyping = useCallback((isTyping) => {
    const socket = socketRef.current;
    if (!socket?.connected || !conversationId) return;
    socket.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
  }, [conversationId]);

  const scheduleTypingStop = useCallback(() => {
    if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
    typingStopRef.current = window.setTimeout(() => emitTyping(false), 1800);
  }, [emitTyping]);

  const handleDraftChange = (event) => {
    const value = event.target.value;
    setDraft(value);
    if (!value.trim() || !canSend) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 1200) {
      lastTypingSentRef.current = now;
      emitTyping(true);
      scheduleTypingStop();
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending || !canSend || !conversationId) return;
    setSending(true);
    setError("");
    emitTyping(false);
    if (typingStopRef.current) window.clearTimeout(typingStopRef.current);

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("send:message", { conversationId, text }, (response) => {
        setSending(false);
        if (response?.success) {
          setDraft("");
          if (response.message) setMessages((prev) => upsertMessage(prev, response.message));
        } else {
          setError(response?.error || "Message failed to send");
        }
      });
      return;
    }

    try {
      const data = await appointmentChatApi.sendMessage(appointmentId, text);
      setDraft("");
      if (data.message) setMessages((prev) => upsertMessage(prev, data.message));
    } catch (err) {
      setError(err.message || "Message failed to send");
    } finally {
      setSending(false);
    }
  };

  const otherId = sid(otherParticipant?.userId);
  const otherName = otherParticipant?.name || "Participant";
  const otherDisplayName = otherParticipant?.role === "doctor" && !otherName.startsWith("Dr.")
    ? `Dr. ${otherName}`
    : otherName;
  const otherOnline = Boolean(otherId && (otherParticipant?.online || onlineUsers.has(otherId)));
  const typingNames = Object.values(typingUsers);
  const composerDisabled = !canSend || !conversationId || sending;

  return (
    <Dialog open={open && Boolean(appointment)} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl h-[85vh] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="w-4 h-4 text-primary" />
                {otherDisplayName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {appointment?.slotTime ? formatAppointmentTime(appointment.slotTime) : "Appointment chat"}
                {appointment?.type ? ` · ${appointment.type === "online" ? "Online" : "In person"}` : ""}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${otherOnline ? "bg-green-500" : "bg-gray-300"}`} />
              {otherOnline ? "Online" : "Offline"}
              {!realtimeConnected && <span className="text-amber-600">· Reconnecting</span>}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-secondary/20">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading conversation…</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-600">{error}</p>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-primary/60" />
              <p className="font-semibold text-foreground">Start a conversation.</p>
              <p className="mt-1 text-sm text-muted-foreground">This chat is private to you and the other appointment participant.</p>
            </div>
          ) : (
            messages.map((message) => {
              const mine = sid(message.senderId) === currentUserId;
              return (
                <div key={messageId(message)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "bg-primary text-white rounded-br-sm" : "bg-card border rounded-bl-sm"}`}>
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                      {!mine && message.senderName ? `${message.senderName} · ` : ""}
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {typingNames.length > 0 && (
            <p className="text-xs text-muted-foreground animate-pulse">
              {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing…
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-background p-3">
          {canSend ? (
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={handleDraftChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                onBlur={() => emitTyping(false)}
                placeholder="Type a message…"
                className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl"
                disabled={sending || !conversationId}
              />
              <Button size="icon" className="h-11 w-11 rounded-xl" onClick={sendMessage} disabled={composerDisabled || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
              {appointmentStatus === "cancelled"
                ? "This appointment was cancelled. Chat history is read-only."
                : "Messages are disabled for this appointment."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

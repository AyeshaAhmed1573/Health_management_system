import { useState, useRef, useEffect } from "react";

import {

  Send, Mic, Paperclip, Bot, User,

  Activity, Heart, Calculator, Stethoscope, FileText,

  ChevronRight, Sparkles, Clock, X, AlertCircle

} from "lucide-react";

import { chatbotService } from "../../services/chatbotService";



const INITIAL_MESSAGES = [

  {

    id: "1",

    role: "ai",

    text: "Hello! I'm your AI Health Assistant 👋\n\nI can help you with:\n• Symptom assessment & triage\n• Medical report explanations\n• Health calculations (BMI, etc.)\n• First aid guidance\n• Connecting you with doctors\n\nWhat can I help you with today?",

    timestamp: new Date(Date.now() - 60000),

  }

];



export function AIChat({ onNavigate, initialPrompt }) {

  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [activeConv, setActiveConv] = useState("current");

  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [sessions, setSessions] = useState([]);

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const inputRef = useRef(null);



  useEffect(() => {

    loadSessions();

    if (initialPrompt) setTimeout(() => sendMessage(initialPrompt), 400);

  }, []);



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages, isTyping]);



  const loadSessions = async () => {

    try {

      const response = await chatbotService.getSessions();

      if (response.success) {

        setSessions(response.data || []);

      }

    } catch (err) {

      console.error('Failed to load sessions:', err);

      // Don't show error for session loading, just continue with local state

    }

  };



  const createNewSession = async () => {

    try {

      setLoading(true);

      const response = await chatbotService.createSession();

      if (response.success) {

        setCurrentSessionId(response.data.sessionId);

        setMessages(INITIAL_MESSAGES);

        setActiveConv("current");

        await loadSessions();

      }

    } catch (err) {

      setError('Failed to create new session. Please try again.');

      console.error('Session creation error:', err);

    } finally {

      setLoading(false);

    }

  };



  const loadSessionHistory = async (sessionId) => {

    try {

      setLoading(true);

      const response = await chatbotService.getChatHistory(sessionId);

      if (response.success && response.data) {

        const sessionMessages = response.data.messages || [];

        const formattedMessages = sessionMessages.map(msg => ({

          id: msg._id || Date.now().toString(),

          role: msg.role,

          text: msg.content,

          timestamp: new Date(msg.createdAt || Date.now())

        }));

        

        if (formattedMessages.length === 0) {

          formattedMessages.push(...INITIAL_MESSAGES);

        }

        

        setMessages(formattedMessages);

        setCurrentSessionId(sessionId);

        setActiveConv(sessionId);

      }

    } catch (err) {

      setError('Failed to load chat history. Please try again.');

      console.error('Load history error:', err);

    } finally {

      setLoading(false);

    }

  };



  async function sendMessage(text) {

    if (!text.trim()) return;

    

    // If no session exists, create one first

    let sessionId = currentSessionId;

    if (!sessionId) {

      try {

        const sessionResponse = await chatbotService.createSession();

        if (sessionResponse.success) {

          sessionId = sessionResponse.data.sessionId;

          setCurrentSessionId(sessionId);

        } else {

          throw new Error('Failed to create session');

        }

      } catch (err) {

        setError('Failed to connect to chat service. Please try again.');

        return;

      }

    }



    const userMsg = { id: Date.now().toString(), role: "user", text, timestamp: new Date() };

    setMessages(prev => [...prev, userMsg]);

    setInput("");

    setIsTyping(true);

    setError(null);



    try {

      const response = await chatbotService.sendMessage(sessionId, text);

      if (response.success) {

        const aiMsg = { 

          id: (Date.now() + 1).toString(), 

          role: "ai", 

          text: response.data.reply, 

          timestamp: new Date(),

          isEmergency: response.data.isEmergency 

        };

        setMessages(prev => [...prev, aiMsg]);

        await loadSessions(); // Refresh sessions to update titles

      } else {

        throw new Error(response.error || 'Failed to send message');

      }

    } catch (err) {

      setError('Failed to send message. Please try again.');

      console.error('Send message error:', err);

      // Remove the user message if it failed

      setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));

    } finally {

      setIsTyping(false);

    }

  }



  return (

    <div className="flex h-full min-h-0">

      {/* Conversation history sidebar — visible lg+ */}

      <div className="hidden lg:flex flex-col w-64 border-r flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>

        <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>

          <button

            onClick={createNewSession}

            disabled={loading}

            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"

            style={{ background: "var(--primary)", color: "white" }}

          >

            <Sparkles size={14} />

            New Conversation

          </button>

        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" style={{ scrollbarWidth: "none" }}>

          <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: "var(--muted-foreground)" }}>History</p>

          {/* Current */}

          <button

            onClick={() => {

              setCurrentSessionId(null);

              setMessages(INITIAL_MESSAGES);

              setActiveConv("current");

            }}

            className="w-full text-left px-3 py-2.5 rounded-xl transition-all"

            style={{ background: activeConv === "current" ? "white" : "transparent", boxShadow: activeConv === "current" ? "0 1px 4px rgba(0,0,0,0.06)" : "none" }}

          >

            <p className="text-xs font-semibold text-foreground">Current conversation</p>

            <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI Health Assistant</p>

          </button>

          {sessions.map(session => (

            <button

              key={session._id}

              onClick={() => loadSessionHistory(session._id)}

              className="w-full text-left px-3 py-2.5 rounded-xl transition-all hover:bg-white"

              style={{ background: activeConv === session._id ? "white" : "transparent" }}

            >

              <p className="text-xs font-semibold text-foreground truncate">{session.title}</p>

              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>

                {new Date(session.createdAt).toLocaleDateString()}

              </p>

            </button>

          ))}

        </div>

      </div>



      {/* Chat area */}

      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* Chat header */}

        <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-white flex-shrink-0" style={{ borderColor: "var(--border)" }}>

          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>

            <Bot size={20} color="white" />

          </div>

          <div>

            <p className="text-sm font-bold text-foreground">AI Health Assistant</p>

            <div className="flex items-center gap-1.5">

              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2F8F8F" }} />

              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Always available · Powered by HealthAI</p>

            </div>

          </div>

          {/* Quick nav chips */}

          <div className="ml-auto hidden sm:flex items-center gap-2">

            {[

              { icon: <Stethoscope size={12} />, label: "Symptoms", screen: "symptoms" },

              { icon: <Heart size={12} />, label: "First Aid", screen: "firstaid" },

              { icon: <Calculator size={12} />, label: "BMI", screen: "bmi" },

              { icon: <FileText size={12} />, label: "Reports", screen: "report" },

            ].map(item => (

              <button

                key={item.screen}

                onClick={() => onNavigate(item.screen)}

                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"

                style={{ background: "var(--secondary)", color: "var(--primary)" }}

              >

                {item.icon}

                {item.label}

              </button>

            ))}

          </div>

        </div>



        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none", background: "linear-gradient(180deg, #BFD8E6 0%, #FFFFFF 50%, #8FCED1 100%" }}>

          {error && (

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">

              <AlertCircle size={16} className="text-red-600" />

              <p className="text-sm text-red-700">{error}</p>

              <button 

                onClick={() => setError(null)}

                className="ml-auto text-red-600 hover:text-red-800"

              >

                <X size={16} />

              </button>

            </div>

          )}

          {messages.map(msg => (

            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

              {msg.role === "ai" && (

                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>

                  <Bot size={16} color="white" />

                </div>

              )}

              <div className={`max-w-[72%] lg:max-w-[60%] space-y-2.5 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>

                <div

                  className="px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"

                  style={msg.role === "user"

                    ? { background: "var(--primary)", color: "white", borderBottomRightRadius: "6px", boxShadow: "0 2px 12px rgba(47,143,143,0.25)" }

                    : { background: "white", color: "var(--foreground)", borderBottomLeftRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }

                  }

                >

                  {msg.text}

                </div>

                {msg.isEmergency && (

                  <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200">

                    <p className="text-xs font-semibold text-red-700">⚠️ Emergency detected</p>

                  </div>

                )}

                <div className="flex items-center gap-1.5">

                  <Clock size={10} style={{ color: "var(--muted-foreground)" }} />

                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>

                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}

                  </p>

                </div>

              </div>

              {msg.role === "user" && (

                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>

                  <User size={16} style={{ color: "var(--primary)" }} />

                </div>

              )}

            </div>

          ))}

          {isTyping && (

            <div className="flex gap-3 items-end">

              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>

                <Bot size={16} color="white" />

              </div>

              <div className="px-4 py-3.5 rounded-2xl bg-white" style={{ borderBottomLeftRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

                <div className="flex gap-1.5">

                  {[0, 1, 2].map(i => (

                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--primary)", animationDelay: `${i * 0.18}s` }} />

                  ))}

                </div>

              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>



        {/* Input area */}

        <div className="px-5 py-4 border-t bg-white flex-shrink-0" style={{ borderColor: "var(--border)" }}>

          <div className="flex items-end gap-3 p-3 rounded-2xl border transition-colors focus-within:border-primary" style={{ borderColor: "var(--border)", background: "var(--input-background)" }}>

            <div className="flex items-center gap-1.5">

              <button className="p-2 rounded-xl transition-colors hover:bg-white">

                <Paperclip size={17} style={{ color: "var(--muted-foreground)" }} />

              </button>

              <button className="p-2 rounded-xl transition-colors hover:bg-white">

                <FileText size={17} style={{ color: "var(--muted-foreground)" }} />

              </button>

            </div>

            <textarea

              ref={inputRef}

              value={input}

              onChange={e => setInput(e.target.value)}

              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}

              placeholder="Ask about your health, symptoms, or upload a report..."

              rows={1}

              className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground leading-relaxed"

              style={{ color: "var(--foreground)", maxHeight: "120px" }}

            />

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl transition-colors hover:bg-white">
                <Mic size={17} style={{ color: "var(--muted-foreground)" }} />
              </button>
              <button
                onClick={() => input.trim() && sendMessage(input)}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: "#2F8F8F" }}
              >
                <Send size={18} color="white" strokeWidth={2} />
              </button>
            </div>

          </div>

          <p className="text-xs text-center mt-2.5" style={{ color: "var(--muted-foreground)" }}>

            AI responses are for informational purposes only. Always consult a qualified healthcare professional.

          </p>

        </div>

      </div>

    </div>

  );

}


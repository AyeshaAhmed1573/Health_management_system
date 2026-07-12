import { useState, useRef, useEffect } from "react";
import {
  Send, Mic, Paperclip, Bot, User,
  Activity, Heart, Calculator, Stethoscope, FileText,
  ChevronRight, Sparkles, Clock, X
} from "lucide-react";

const SMART_RESPONSES = {
  fever: { text: "I understand you have a fever. A fever is usually a sign your body is fighting an infection. Let me help you assess your symptoms more precisely.\n\nCan you tell me your current temperature and how long you've had it?\n\nFor a thorough assessment, I recommend using our Symptoms Checker.", suggestions: ["My temperature is 38.5°C", "I also have chills", "How do I reduce fever?"], action: { type: "symptoms", label: "Open Symptoms Checker" } },
  blood_test: { text: "I can help you understand your blood test results. Blood tests reveal a great deal about your overall health. Upload your report and our AI will analyze each value and explain it in plain language.\n\nOur Report Analysis feature provides detailed, personalized insights.", suggestions: ["Upload my report", "What is CBC?", "Explain my cholesterol"], action: { type: "report", label: "Upload & Analyze Report" } },
  bmi: { text: "BMI (Body Mass Index) is a screening tool calculated from your height and weight.\n\n**Reference ranges:**\n• Underweight < 18.5\n• Normal weight 18.5–24.9\n• Overweight 25–29.9\n• Obese ≥ 30\n\nLet me calculate your BMI right now!", suggestions: ["Calculate my BMI", "What's a healthy BMI?", "How to improve BMI?"], action: { type: "bmi", label: "Open BMI Calculator" } },
  blood_pressure: { text: "High blood pressure (hypertension) occurs when the force of blood against your artery walls is consistently too high. Normal BP is below 120/80 mmHg.\n\n**Common causes:**\n• High-sodium diet\n• Lack of physical activity\n• Chronic stress\n• Genetics\n• Obesity\n\nI recommend a consultation with a cardiologist for proper evaluation.", suggestions: ["My BP is 140/90", "How to lower blood pressure?", "See a cardiologist"], action: { type: "doctor", label: "Consult a Cardiologist" } },
  emergency: { text: "⚠️ If this is life-threatening, call emergency services (911) immediately!\n\nFor first aid guidance on common emergencies, I'm opening the First Aid section for you now.", suggestions: ["CPR instructions", "Choking response", "Allergic reaction"], action: { type: "firstaid", label: "Open First Aid Guide" } },
  doctor: { text: "Connecting you with our network of verified healthcare professionals. You can consult with doctors specializing in various fields via text, voice, or video call.\n\nWould you like me to find a specialist based on your needs?", suggestions: ["Find a cardiologist", "General physician", "Mental health specialist"], action: { type: "doctor", label: "Browse Doctors" } },
};

function getAIResponse(msg) {
  const l = msg.toLowerCase();
  if (l.includes("fever") || l.includes("temperature")) return SMART_RESPONSES.fever;
  if (l.includes("blood test") || l.includes("report") || l.includes("lab")) return SMART_RESPONSES.blood_test;
  if (l.includes("bmi") || l.includes("weight") || l.includes("body mass")) return SMART_RESPONSES.bmi;
  if (l.includes("blood pressure") || l.includes("hypertension")) return SMART_RESPONSES.blood_pressure;
  if (l.includes("emergency") || l.includes("first aid") || l.includes("urgent")) return SMART_RESPONSES.emergency;
  if (l.includes("doctor") || l.includes("consult") || l.includes("specialist")) return SMART_RESPONSES.doctor;
  return {
    text: "Thank you for sharing that. I'm here to assist with all your health questions. Could you provide more details so I can give you the most accurate guidance?\n\nI can help with symptom assessment, report analysis, BMI calculation, first aid, and connecting you with doctors.",
    suggestions: ["Check my symptoms", "Analyze a report", "Calculate BMI", "Find a doctor"],
  };
}

const INITIAL_MESSAGES = [
  {
    id: "1",
    role: "ai",
    text: "Hello! I'm your AI Health Assistant 👋\n\nI can help you with:\n• Symptom assessment & triage\n• Medical report explanations\n• Health calculations (BMI, etc.)\n• First aid guidance\n• Connecting you with doctors\n\nWhat can I help you with today?",
    timestamp: new Date(Date.now() - 60000),
    suggestions: ["I have a fever", "Explain my blood test", "What is BMI?", "Why is blood pressure high?"],
  }
];

const ACTION_NAV = {
  symptoms: "symptoms", report: "report", bmi: "bmi", firstaid: "firstaid", doctor: "doctors"
};

const CONVERSATION_HISTORY = [
  { id: "c1", title: "Fever & headache symptoms", time: "Today, 9:14 AM", preview: "Based on your symptoms..." },
  { id: "c2", title: "Blood test explanation", time: "Yesterday", preview: "Your CBC results show..." },
  { id: "c3", title: "BMI & weight guidance", time: "Jun 10", preview: "Your BMI of 24.3 is..." },
  { id: "c4", title: "Vitamin D deficiency", time: "Jun 8", preview: "Vitamin D levels below 30..." },
];

export function AIChat({ onNavigate, initialPrompt }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState("current");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) setTimeout(() => sendMessage(initialPrompt), 400);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text) {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), role: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg = { id: (Date.now() + 1).toString(), role: "ai", text: response.text, timestamp: new Date(), suggestions: response.suggestions, action: response.action };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Conversation history sidebar — visible lg+ */}
      <div className="hidden lg:flex flex-col w-64 border-r flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
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
            onClick={() => setActiveConv("current")}
            className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
            style={{ background: activeConv === "current" ? "white" : "transparent", boxShadow: activeConv === "current" ? "0 1px 4px rgba(0,0,0,0.06)" : "none" }}
          >
            <p className="text-xs font-semibold text-foreground">Current conversation</p>
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI Health Assistant</p>
          </button>
          {CONVERSATION_HISTORY.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveConv(c.id)}
              className="w-full text-left px-3 py-2.5 rounded-xl transition-all hover:bg-white"
              style={{ background: activeConv === c.id ? "white" : "transparent" }}
            >
              <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.time}</p>
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
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none", background: "linear-gradient(180deg, #BFD8E6 0%, #FFFFFF 50%, #8FCED1 100%)" }}>
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
                {msg.action && (
                  <button
                    onClick={() => onNavigate(ACTION_NAV[msg.action?.type] || "home")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "var(--accent)", color: "white", boxShadow: "0 2px 8px rgba(47,143,143,0.25)" }}
                  >
                    <Activity size={13} />
                    {msg.action.label}
                    <ChevronRight size={13} />
                  </button>
                )}
                {msg.suggestions && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 rounded-xl text-xs border font-medium transition-all hover:shadow-sm active:scale-95 bg-white"
                        style={{ borderColor: "rgba(47,143,143,0.25)", color: "var(--primary)" }}
                      >
                        {s}
                      </button>
                    ))}
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
            <div className="flex items-center gap-1.5">
              <button className="p-2 rounded-xl transition-colors hover:bg-white">
                <Mic size={17} style={{ color: "var(--muted-foreground)" }} />
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "var(--primary)" }}
              >
                <Send size={15} color="white" />
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

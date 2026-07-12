import { useState } from "react";
import {
  Bot, Stethoscope, Heart, Calculator, FileText,
  MessageSquare, Search, Star, Clock, ChevronRight,
  Activity, Zap, Shield, TrendingUp
} from "lucide-react";
import { DOCTORS } from "./DoctorList";

const SUGGESTED_PROMPTS = [
  { text: "I have a fever", emoji: "🌡️", color: "#ef4444" },
  { text: "Explain my blood test", emoji: "🩸", color: "#2F8F8F" },
  { text: "What is BMI?", emoji: "⚖️", color: "#5FAFB6" },
  { text: "Why is blood pressure high?", emoji: "❤️", color: "#8FD0D3" },
];

const QUICK_ACTIONS = [
  { id: "symptoms", icon: <Stethoscope size={24} />, label: "Symptoms Checker", desc: "AI-powered symptom assessment", color: "#2F8F8F", bg: "linear-gradient(135deg, #BFD8E6, #EEF7F8)", border: "rgba(47,143,143,0.15)" },
  { id: "firstaid", icon: <Heart size={24} />, label: "First Aid Guide", desc: "Step-by-step emergency help", color: "#ef4444", bg: "linear-gradient(135deg, #FEF2F2, #FFF5F5)", border: "rgba(239,68,68,0.15)" },
  { id: "bmi", icon: <Calculator size={24} />, label: "BMI Calculator", desc: "Body mass index tool", color: "#5FAFB6", bg: "linear-gradient(135deg, #E8F6F6, #F5FAFB)", border: "rgba(95,175,182,0.15)" },
  { id: "report", icon: <FileText size={24} />, label: "Medical Reports", desc: "AI report analysis", color: "#8FD0D3", bg: "linear-gradient(135deg, #EEF7F8, #BFD8E6)", border: "rgba(143,208,211,0.15)" },
];

const STATS = [
  { label: "AI Consultations", value: "1,247", icon: <Bot size={16} />, color: "#2F8F8F", change: "+12% this week" },
  { label: "Doctors Online", value: "38", icon: <Activity size={16} />, color: "#5FAFB6", change: "Available now" },
  { label: "Reports Analyzed", value: "89", icon: <FileText size={16} />, color: "#8FD0D3", change: "This month" },
  { label: "Health Score", value: "92", icon: <TrendingUp size={16} />, color: "#2F8F8F", change: "+4 pts" },
];

const RECENT_CHATS = [
  { id: "ai", name: "AI Health Assistant", isAI: true, lastMessage: "Based on your symptoms, I recommend checking your temperature and staying hydrated.", time: "2m ago", unread: 0 },
  { id: "doc1", doctorId: "1", name: "Dr. Sarah Mitchell", specialty: "Cardiologist", photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f", isAI: false, lastMessage: "Your blood pressure readings look stable. Let's monitor for another week.", time: "1h ago", unread: 0 },
  { id: "doc2", doctorId: "2", name: "Dr. James Chen", specialty: "General Physician", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d", isAI: false, lastMessage: "I've reviewed your latest report. Schedule a follow-up appointment soon.", time: "Yesterday", unread: 0 },
];

export function ChatCenter({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = DOCTORS.filter(
    d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full" style={{ background: "var(--background)" }}>
      {/* Hero header */}
      <div className="relative overflow-hidden px-6 lg:px-8 pt-8 pb-10" style={{ background: "linear-gradient(135deg, #BFD8E6 0%, #5FAFB6 40%, #2F8F8F 70%, #8FCED1 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translateY(50%)" }} />

        <div className="relative">
          <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Good Morning 👋</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Healthcare Chat Center</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>Your AI-powered health companion — always here for you</p>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
          {STATS.map(stat => (
            <div key={stat.label} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: "rgba(255,255,255,0.8)" }}>{stat.icon}</span>
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-7 space-y-8">
        {/* AI Assistant + Quick Actions row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* AI Card — spans 2 cols */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden border" style={{ background: "white", borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(47,143,143,0.08)" }}>
            <div className="p-6" style={{ background: "linear-gradient(160deg, #EEF7F8 0%, #BFD8E6 100%)" }}>
              {/* Avatar + title */}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)", boxShadow: "0 8px 24px rgba(47,143,143,0.35)" }}>
                    <Bot size={32} color="white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ background: "#2F8F8F" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">AI Health Assistant</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#2F8F8F20", color: "#2F8F8F" }}>Live</span>
                  </div>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    Get instant health guidance, symptom assessment, report explanations, and wellness information.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { icon: <Zap size={12} />, label: "Instant responses" },
                  { icon: <Shield size={12} />, label: "Medically verified" },
                  { icon: <FileText size={12} />, label: "Report analysis" },
                  { icon: <Activity size={12} />, label: "Smart referrals" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    <span style={{ color: "var(--primary)" }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

              {/* Suggested prompts */}
              <p className="text-xs font-semibold mb-2.5 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Try asking:</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {SUGGESTED_PROMPTS.map(p => (
                  <button
                    key={p.text}
                    onClick={() => onNavigate("ai-chat", p.text)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm active:scale-95 bg-white"
                    style={{ borderColor: "rgba(47,143,143,0.15)" }}
                  >
                    <span className="text-base flex-shrink-0">{p.emoji}</span>
                    <span className="text-xs leading-snug text-foreground">{p.text}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => onNavigate("ai-chat")}
                className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--primary)", color: "white", boxShadow: "0 4px 16px rgba(47,143,143,0.35)" }}
              >
                <Bot size={16} />
                Start AI Chat
              </button>
            </div>
          </div>

          {/* Quick Actions — spans 3 cols */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
              <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>4 tools available</span>
            </div>
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-2.5rem)]">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="flex flex-col p-5 rounded-2xl border text-left transition-all hover:shadow-lg active:scale-[0.98] group"
                  style={{ background: action.bg, borderColor: action.border }}
                >
                  <div className="flex items-start justify-between mb-auto">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "white", color: action.color, boxShadow: `0 4px 12px ${action.color}25` }}>
                      {action.icon}
                    </div>
                    <ChevronRight size={16} style={{ color: action.color, opacity: 0.5 }} className="group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-foreground">{action.label}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Consultation + Recent Chats row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Doctors — 2 cols */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Consult Healthcare Professionals</h2>
              <button onClick={() => onNavigate("doctors")} className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-70" style={{ color: "var(--primary)" }}>
                See all <ChevronRight size={12} />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border mb-4" style={{ borderColor: "var(--border)", background: "var(--input-background)" }}>
              <Search size={15} style={{ color: "var(--muted-foreground)" }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search doctors, specialties..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                style={{ color: "var(--foreground)" }}
              />
            </div>

            {/* Doctor grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDoctors.slice(0, 3).map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* Recent Conversations — 1 col */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Recent Conversations</h2>
              <Clock size={14} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="space-y-2">
              {RECENT_CHATS.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    if (chat.isAI) {
                      onNavigate("ai-chat");
                    } else {
                      const doctor = DOCTORS.find(d => d.id === (chat).doctorId);
                      if (doctor) onNavigate("doctor-chat", doctor);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-border transition-all hover:shadow-md text-left active:scale-[0.98]"
                >
                  {chat.isAI ? (
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>
                      <Bot size={20} color="white" />
                    </div>
                  ) : (
                    <div className="relative flex-shrink-0">
                      <img src={`${(chat).photo}?w=80&h=80&fit=crop&auto=format`} alt={chat.name} className="w-11 h-11 rounded-2xl object-cover" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#2F8F8F" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{chat.time}</span>
                    </div>
                    {!chat.isAI && (
                      <p className="text-xs" style={{ color: "var(--primary)" }}>{(chat).specialty}</p>
                    )}
                    <p className="text-xs truncate mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0" style={{ background: "var(--primary)" }}>
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onNavigate }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-border transition-all hover:shadow-lg" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <img src={`${doctor.photo}?w=80&h=80&fit=crop&auto=format`} alt={doctor.name} className="w-12 h-12 rounded-xl object-cover" />
          {doctor.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: "#2F8F8F" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">Dr. {doctor.name.split(" ")[0]}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--primary)" }}>{doctor.specialty}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={10} fill="#5FAFB6" stroke="none" />
            <span className="text-xs font-semibold text-foreground">{doctor.rating}</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>· {doctor.experience}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate("doctor-chat", doctor)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: doctor.online ? "var(--primary)" : "var(--muted)", color: doctor.online ? "white" : "var(--muted-foreground)" }}
        >
          <MessageSquare size={11} />
          {doctor.online ? "Chat Now" : "Schedule"}
        </button>
      </div>
    </div>
  );
}

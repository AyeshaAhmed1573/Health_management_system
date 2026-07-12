import { useState, useRef, useEffect } from "react";
import {
  Search, Star, Filter, MessageSquare, Video, Clock, ChevronRight, X,
  CheckCircle, Send, Mic, Paperclip, FileText, Bot
} from "lucide-react";

export const DOCTORS = [
  { id: "1", name: "Sarah Mitchell", specialty: "Cardiologist", photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f", online: true, rating: 4.9, reviews: 128, experience: "14 yrs", consultFee: "$45", languages: ["English", "Spanish"], education: "Harvard Medical School", about: "Specialist in cardiac diseases, hypertension, and preventive cardiology. Evidence-based treatment with a focus on long-term wellness.", nextAvailable: "Now" },
  { id: "2", name: "James Chen", specialty: "General Physician", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d", online: true, rating: 4.8, reviews: 95, experience: "10 yrs", consultFee: "$35", languages: ["English", "Mandarin"], education: "Johns Hopkins University", about: "Primary care physician specializing in preventive medicine, chronic disease management, and holistic health wellness.", nextAvailable: "Now" },
  { id: "3", name: "Priya Sharma", specialty: "Endocrinologist", photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54", online: true, rating: 4.7, reviews: 82, experience: "12 yrs", consultFee: "$50", languages: ["English", "Hindi"], education: "AIIMS New Delhi", about: "Diabetes, thyroid disorders, hormonal imbalances, and metabolic syndrome specialist with extensive research background.", nextAvailable: "Today 3 PM" },
  { id: "4", name: "Michael Torres", specialty: "Neurologist", photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d", online: true, rating: 4.9, reviews: 156, experience: "18 yrs", consultFee: "$60", languages: ["English", "Portuguese"], education: "Stanford University", about: "Expert in headaches, migraines, epilepsy, and neurological disorders with 18 years of clinical and research experience.", nextAvailable: "Now" },
  { id: "5", name: "Aisha Rahman", specialty: "Dermatologist", photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f", online: false, rating: 4.6, reviews: 73, experience: "9 yrs", consultFee: "$40", languages: ["English", "French"], education: "University of London", about: "Treats skin conditions including acne, eczema, and psoriasis. Also offers cosmetic dermatology consultations.", nextAvailable: "Tomorrow 10 AM" },
  { id: "6", name: "David Park", specialty: "Psychiatrist", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d", online: true, rating: 4.8, reviews: 91, experience: "11 yrs", consultFee: "$55", languages: ["English", "Korean"], education: "Yale School of Medicine", about: "Mental health specialist focused on anxiety, depression, ADHD, and stress management through evidence-based therapy.", nextAvailable: "Now" },
];

const SPECIALTIES = ["All", "Cardiologist", "General Physician", "Endocrinologist", "Neurologist", "Dermatologist", "Psychiatrist"];

export function DoctorList({ onSelectDoctor, selectedDoctorId }) {
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const filtered = DOCTORS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = activeSpec === "All" || d.specialty === activeSpec;
    return matchSearch && matchSpec && (!onlineOnly || d.online);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 space-y-3 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--input-background)" }}>
            <Search size={14} style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search doctors..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ color: "var(--foreground)" }}
            />
            {search && <button onClick={() => setSearch("")}><X size={12} style={{ color: "var(--muted-foreground)" }} /></button>}
          </div>
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0"
            style={{ borderColor: onlineOnly ? "var(--accent)" : "var(--border)", background: onlineOnly ? "#E8F6F6" : "var(--input-background)", color: onlineOnly ? "var(--accent)" : "var(--muted-foreground)" }}
          >
            <Filter size={11} />
            Online
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveSpec(spec)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{ background: activeSpec === spec ? "var(--primary)" : "var(--secondary)", color: activeSpec === spec ? "white" : "var(--muted-foreground)" }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        <p className="text-xs px-1 mb-2" style={{ color: "var(--muted-foreground)" }}>{filtered.length} available</p>
        {filtered.map(doctor => {
          const selected = selectedDoctorId === doctor.id;
          return (
            <button
              key={doctor.id}
              onClick={() => onSelectDoctor(doctor)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all hover:shadow-sm"
              style={{
                background: selectedDoctor?.id === doctor.id ? "#EEF7F8" : "white",
                borderColor: selectedDoctor?.id === doctor.id ? "var(--primary)" : "var(--border)",
                borderWidth: selectedDoctor?.id === doctor.id ? "1.5px" : "1px",
              }}
            >
              <div className="relative flex-shrink-0">
                <img src={`${doctor.photo}?w=80&h=80&fit=crop&auto=format`} alt={doctor.name} className="w-11 h-11 rounded-xl object-cover" />
                {doctor.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#2F8F8F" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">Dr. {doctor.name}</p>
                  {selected && <CheckCircle size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--primary)" }}>{doctor.specialty}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star size={10} fill="#5FAFB6" stroke="none" />
                  <span className="text-xs font-semibold text-foreground">{doctor.rating}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>· {doctor.experience}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="block text-xs px-2 py-0.5 rounded-full mb-1" style={{ background: doctor.online ? "#E8F6F6" : "var(--muted)", color: doctor.online ? "#2F8F8F" : "var(--muted-foreground)" }}>
                  {doctor.online ? "● Now" : "Offline"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>${doctor.consultFee}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Doctor Chat
// ─────────────────────────────────────────────

const INITIAL_MESSAGES = [
  { id: "1", sender: "doctor", text: "Hello! I've reviewed your medical history. What brings you in today?", timestamp: new Date(Date.now() - 300000), type: "text", read: true },
  { id: "2", sender: "user", text: "I've been experiencing persistent headaches for the past week, especially in the mornings.", timestamp: new Date(Date.now() - 240000), type: "text", read: true },
  { id: "3", sender: "doctor", text: "I understand. Morning headaches can have several causes. On a scale of 1–10, how severe is the pain? Where exactly is it located?", timestamp: new Date(Date.now() - 180000), type: "text", read: true },
  { id: "4", sender: "doctor", text: "I'm sharing a consultation note for your reference.", timestamp: new Date(Date.now() - 120000), type: "note", fileLabel: "Consultation_Note_June2025.pdf", read: true },
  { id: "5", sender: "user", text: "It's about a 6/10. The pain is at the back of my head, sometimes behind my eyes.", timestamp: new Date(Date.now() - 60000), type: "text", read: true },
];

const DOCTOR_REPLIES = [
  "Based on your description, this sounds like tension-type headaches, possibly from posture or prolonged screen time. I'd recommend tracking your BP daily.",
  "I'm going to prescribe a mild analgesic. Take it as needed and contact me if symptoms persist beyond 3 days.",
  "Are you drinking enough water and getting 7–8 hours of sleep? Dehydration and sleep deprivation are very common triggers.",
  "I'd like a follow-up in 5 days. I'll send a prescription now — please have it filled at your nearest pharmacy.",
  "Avoid extended screen sessions without breaks. I may refer you to a neurologist if symptoms continue.",
];

export function DoctorChat({ doctor }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: "user", text: input, timestamp: new Date(), type: "text" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const m = { id: (Date.now() + 1).toString(), sender: "doctor", text: DOCTOR_REPLIES[responseIndex % DOCTOR_REPLIES.length], timestamp: new Date(), type: "text" };
      setMessages(prev => [...prev, m]);
      setIsTyping(false);
      setResponseIndex(p => p + 1);
    }, 1400 + Math.random() * 900);
  }

  const firstName = doctor.name.split(" ")[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b bg-white flex-shrink-0 space-y-2.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={`${doctor.photo}?w=80&h=80&fit=crop&auto=format`} alt={doctor.name} className="w-11 h-11 rounded-xl object-cover" />
            {doctor.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#2F8F8F" }} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Dr. {doctor.name}</p>
            <p className="text-xs" style={{ color: doctor.online ? "#2F8F8F" : "var(--muted-foreground)" }}>
              {doctor.online ? "Online now" : "Offline"} · {doctor.specialty}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
              <Video size={14} />
              Video Call
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <Clock size={14} />
              Schedule
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
          <Clock size={12} style={{ color: "var(--primary)" }} />
          <p className="text-xs" style={{ color: "var(--primary)" }}>Next appointment: <strong>June 18, 2025 at 10:00 AM</strong></p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: "none", background: "linear-gradient(180deg, #BFD8E6 0%, #FFFFFF 50%, #8FCED1 100%)" }}>
        <div className="text-center">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>Today</span>
        </div>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
            {msg.sender === "doctor" && (
              <img src={`${doctor.photo}?w=60&h=60&fit=crop&auto=format`} alt={doctor.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0 mt-0.5" />
            )}
            <div className={`max-w-[70%] space-y-1 flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              {msg.type === "text" && (
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.sender === "user"
                    ? { background: "var(--primary)", color: "white", borderBottomRightRadius: "6px", boxShadow: "0 2px 10px rgba(47,143,143,0.2)" }
                    : { background: "white", color: "var(--foreground)", borderBottomLeftRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }
                  }
                >
                  {msg.text}
                </div>
              )}
              {(msg.type === "prescription" || msg.type === "note") && (
                <div className="space-y-1 w-full">
                  <div className="px-4 py-3 rounded-2xl text-sm bg-white" style={{ borderBottomLeftRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", color: "var(--foreground)" }}>{msg.text}</div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ background: msg.type === "prescription" ? "#E8F6F6" : "var(--secondary)", borderColor: msg.type === "prescription" ? "#C7E8E8" : "var(--border)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: msg.type === "prescription" ? "#2F8F8F" : "var(--primary)" }}>
                      <FileText size={14} color="white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{msg.fileLabel}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{msg.type === "prescription" ? "Prescription" : "Document"} · PDF</p>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                  </div>
                </div>
              )}
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>AJ</div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 items-end">
            <img src={`${doctor.photo}?w=60&h=60&fit=crop&auto=format`} alt={doctor.name} className="w-8 h-8 rounded-xl object-cover" />
            <div className="px-4 py-3 rounded-2xl bg-white" style={{ borderBottomLeftRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--primary)", animationDelay: `${i * 0.18}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t bg-white flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl border transition-all hover:bg-secondary flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            <Paperclip size={15} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-colors focus-within:border-primary" style={{ borderColor: "var(--border)", background: "var(--input-background)" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Message Dr. ${firstName}...`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              style={{ color: "var(--foreground)" }}
            />
          </div>
          <button className="p-2.5 rounded-xl border transition-all hover:bg-secondary flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            <Mic size={15} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <Send size={15} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

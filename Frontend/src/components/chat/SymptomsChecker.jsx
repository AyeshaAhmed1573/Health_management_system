import { useState } from "react";
import { ChevronRight, AlertCircle, CheckCircle, Info, Thermometer, Wind, Zap, Eye, Heart, Bone } from "lucide-react";

const CATEGORIES = [
  { id: "head", label: "Head & Neck", icon: <Zap size={20} />, color: "#2F8F8F", bg: "#BFD8E6", symptoms: ["Headache", "Migraine", "Dizziness", "Neck pain", "Sore throat", "Earache"] },
  { id: "respiratory", label: "Respiratory", icon: <Wind size={20} />, color: "#5FAFB6", bg: "#EEF7F8", symptoms: ["Cough", "Shortness of breath", "Wheezing", "Chest tightness", "Runny nose", "Congestion"] },
  { id: "temperature", label: "Temperature", icon: <Thermometer size={20} />, color: "#5FAFB6", bg: "#EEF7F8", symptoms: ["Fever", "Chills", "Night sweats", "Hot flashes"] },
  { id: "cardiovascular", label: "Heart & Chest", icon: <Heart size={20} />, color: "#8FD0D3", bg: "#E8F6F6", symptoms: ["Chest pain", "Palpitations", "Rapid heartbeat", "Irregular heartbeat"] },
  { id: "eyes", label: "Eyes & Vision", icon: <Eye size={20} />, color: "#8FCED1", bg: "#F5FAFB", symptoms: ["Blurred vision", "Eye pain", "Redness", "Sensitivity to light", "Dry eyes"] },
  { id: "musculoskeletal", label: "Muscles & Joints", icon: <Bone size={20} />, color: "#2F8F8F", bg: "#E8F6F6", symptoms: ["Joint pain", "Muscle aches", "Back pain", "Stiffness", "Swelling"] },
];

const SEVERITIES = [
  { value: "mild", emoji: "😐", label: "Mild", desc: "Noticeable but manageable", color: "#2F8F8F" },
  { value: "moderate", emoji: "😟", label: "Moderate", desc: "Affects daily activities", color: "#5FAFB6" },
  { value: "severe", emoji: "😰", label: "Severe", desc: "Very disruptive or alarming", color: "#ef4444" },
];

const DURATIONS = ["Less than 24 hours", "1–3 days", "4–7 days", "1–2 weeks", "2–4 weeks", "More than a month"];

export function SymptomsChecker({ onNavigate }) {
  const [step, setStep] = useState("category");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState(null);
  const [duration, setDuration] = useState(null);

  const category = CATEGORIES.find(c => c.id === selectedCategory);

  function toggleSymptom(s) {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function back() {
    if (step === "symptoms") { setStep("category"); }
    else if (step === "severity") { setStep("symptoms"); }
    else if (step === "duration") { setStep("severity"); }
    else if (step === "result") { setStep("duration"); }
  }

  function restart() {
    setStep("category"); setSelectedCategory(null); setSelectedSymptoms([]); setSeverity(null); setDuration(null);
  }

  const assessment = step === "result" ? (
    severity === "severe" ? { level: "urgent", title: "Urgent Attention Needed", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: <AlertCircle size={20} style={{ color: "#ef4444" }} />, message: "Your symptoms suggest you should seek immediate medical attention. Please consult a doctor or visit an emergency room without delay.", recommend: "Call emergency services" } :
    severity === "moderate" ? { level: "consult", title: "Medical Consultation Advised", color: "#5FAFB6", bg: "#EEF7F8", border: "#BFD8E6", icon: <Info size={20} style={{ color: "#5FAFB6" }} />, message: "Your symptoms warrant a medical evaluation soon. We recommend scheduling a consultation with a healthcare professional this week.", recommend: "Schedule appointment" } :
    { level: "monitor", title: "Monitor & Self-Care", color: "#2F8F8F", bg: "#E8F6F6", border: "#C7E8E8", icon: <CheckCircle size={20} style={{ color: "#2F8F8F" }} />, message: "Your symptoms appear mild. Rest, hydration, and over-the-counter remedies may help. Monitor your condition and consult a doctor if symptoms worsen.", recommend: "Monitor at home" }
  ) : null;

  const stepIndex = ["category", "symptoms", "severity", "duration"].indexOf(step);
  const steps = ["Body Area", "Symptoms", "Severity", "Duration"];

  return (
    <div className="min-h-full p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Symptoms Checker</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>AI-powered symptom assessment — answer a few questions to get personalized guidance</p>
      </div>

      <div className="max-w-4xl">
        {/* Progress stepper — shown when not on result */}
        {step !== "result" && (
          <div className="flex items-center gap-0 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={i < stepIndex ? { background: "var(--accent)", color: "white" } : i === stepIndex ? { background: "var(--primary)", color: "white", boxShadow: "0 0 0 4px rgba(47,143,143,0.2)" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}
                  >
                    {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <p className="text-xs mt-1.5 font-medium whitespace-nowrap hidden sm:block" style={{ color: i === stepIndex ? "var(--primary)" : "var(--muted-foreground)" }}>{s}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mt-0 sm:-mt-4" style={{ background: i < stepIndex ? "var(--accent)" : "var(--muted)" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step */}
        {step === "category" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Where are your symptoms located?</h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Select the body area that best describes your condition</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setStep("symptoms"); }} className="p-5 rounded-2xl border text-left transition-all hover:shadow-lg active:scale-[0.98] group" style={{ background: cat.bg, borderColor: cat.color + "25" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "white", color: cat.color, boxShadow: `0 4px 12px ${cat.color}20` }}>{cat.icon}</div>
                  <p className="text-sm font-bold text-foreground">{cat.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{cat.symptoms.length} symptoms</p>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium" style={{ color: cat.color }}>Select</p>
                    <ChevronRight size={12} style={{ color: cat.color }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step */}
        {step === "symptoms" && category && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{category.label} Symptoms</h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Select all symptoms you are currently experiencing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {category.symptoms.map(symptom => {
                const sel = selectedSymptoms.includes(symptom);
                return (
                  <button key={symptom} onClick={() => toggleSymptom(symptom)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all hover:shadow-sm text-left" style={{ borderColor: sel ? category.color : "var(--border)", background: sel ? category.color + "10" : "white" }}>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: sel ? category.color : "var(--border)", background: sel ? category.color : "transparent" }}>
                      {sel && <CheckCircle size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-foreground">{symptom}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Back</button>
              <button onClick={() => setStep("severity")} disabled={selectedSymptoms.length === 0} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40" style={{ background: "var(--primary)", color: "white" }}>
                Continue ({selectedSymptoms.length} selected) →
              </button>
            </div>
          </div>
        )}

        {/* Step */}
        {step === "severity" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">How severe are your symptoms?</h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Rate the overall intensity</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {SEVERITIES.map(s => (
                <button key={s.value} onClick={() => { setSeverity(s.value); setStep("duration"); }} className="p-5 rounded-2xl border text-center transition-all hover:shadow-lg active:scale-[0.98]" style={{ borderColor: severity === s.value ? s.color : "var(--border)", background: severity === s.value ? s.color + "10" : "white" }}>
                  <span className="text-4xl block mb-3">{s.emoji}</span>
                  <p className="text-base font-bold text-foreground">{s.label}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={back} className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Back</button>
          </div>
        )}

        {/* Step */}
        {step === "duration" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">How long have you had these symptoms?</h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>Duration helps our AI assess the situation more accurately</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => { setDuration(d); setStep("result"); }} className="px-4 py-4 rounded-2xl border text-sm font-medium text-center transition-all hover:shadow-md active:scale-[0.98] text-foreground" style={{ borderColor: duration === d ? "var(--primary)" : "var(--border)", background: duration === d ? "var(--secondary)" : "white" }}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={back} className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Back</button>
          </div>
        )}

        {/* Result */}
        {step === "result" && assessment && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl border" style={{ background: assessment.bg, borderColor: assessment.border }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: assessment.color + "20" }}>{assessment.icon}</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: assessment.color }}>{assessment.title}</h2>
                  <p className="text-sm mt-1 leading-relaxed text-foreground">{assessment.message}</p>
                </div>
              </div>
            </div>

            {/* Summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Reported Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "var(--secondary)", color: "var(--primary)" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Severity Level</p>
                <p className="text-xl font-bold capitalize" style={{ color: assessment.color }}>{severity}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Self-reported rating</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Duration</p>
                <p className="text-sm font-bold text-foreground">{duration}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Time since onset</p>
              </div>
            </div>

            <div className="flex gap-3">
              {assessment.recommend && (
                <button onClick={() => onNavigate("doctors")} className="flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: "var(--primary)", color: "white" }}>
                  Consult a Doctor Now <ChevronRight size={16} />
                </button>
              )}
              <button onClick={restart} className="px-6 py-3.5 rounded-2xl text-sm font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

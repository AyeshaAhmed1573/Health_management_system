import { useState } from "react";
import { AlertTriangle, Phone, Clock, CheckCircle, ChevronRight, ArrowLeft } from "lucide-react";

const EMERGENCIES = [
  { id: "cpr", title: "CPR — Cardiac Arrest", icon: "❤️", urgency: "critical", callFirst: true, steps: ["Call emergency services (911) immediately.", "Place the person on their back on a firm, flat surface.", "Kneel beside the person's neck and shoulders.", "Place the heel of your hand on the center of the chest (lower half of sternum).", "Place your other hand on top, interlace fingers, keep arms straight.", "Push hard and fast at least 2 inches at 100–120 compressions per minute.", "If trained, give 2 rescue breaths after every 30 compressions.", "Continue until emergency services arrive or normal breathing resumes."] },
  { id: "choking", title: "Choking — Adult", icon: "🫁", urgency: "critical", callFirst: true, steps: ["Ask 'Are you choking?' — if unable to speak or cough forcefully, act immediately.", "Stand behind the person and lean them slightly forward.", "Give 5 firm back blows between the shoulder blades with the heel of your hand.", "Perform the Heimlich maneuver above the navel, thrust inward and upward sharply.", "Alternate 5 back blows and 5 abdominal thrusts until the object is dislodged.", "If the person loses consciousness, call 911 and begin CPR."] },
  { id: "burns", title: "Burns & Scalds", icon: "🔥", urgency: "moderate", callFirst: false, steps: ["Move the person away from the heat source safely.", "Cool the burn under cool (not cold) running water for at least 20 minutes.", "Do NOT use ice, butter, toothpaste, or oily substances — these worsen damage.", "Remove jewelry and clothing near the burn area (if not stuck to skin).", "Cover loosely with sterile non-fluffy material or cling wrap.", "Seek immediate care for burns larger than a palm, or on face, hands, or genitals."] },
  { id: "bleeding", title: "Severe Bleeding", icon: "🩸", urgency: "critical", callFirst: true, steps: ["Call 911 for uncontrolled or severe bleeding immediately.", "Apply firm, direct pressure to the wound using a clean cloth.", "Maintain continuous pressure — do not lift to check the wound.", "If blood soaks through, add more material on top without removing.", "Elevate the injured area above heart level if possible.", "For limb injuries, apply a tourniquet if needed — note the time of application.", "Do not remove embedded objects — stabilize them in place."] },
  { id: "fracture", title: "Bone Fracture", icon: "🦴", urgency: "moderate", callFirst: false, steps: ["Do not attempt to realign or straighten the bone.", "Immobilize the injured area as-is using a splint and padding.", "Extend the splint beyond the joints above and below the fracture.", "Secure with bandages — not so tight as to restrict circulation.", "Elevate the limb to reduce swelling.", "Apply ice wrapped in cloth for 20 minutes to reduce pain.", "Seek immediate medical attention."] },
  { id: "allergic", title: "Severe Allergic Reaction", icon: "⚠️", urgency: "critical", callFirst: true, steps: ["Call 911 immediately for severe reactions (anaphylaxis).", "Use an epinephrine auto-injector (EpiPen) if available — inject into outer thigh.", "Lay the person flat with legs elevated (unless breathing is difficult).", "If unconscious or not breathing, begin CPR.", "A second EpiPen can be given after 5–15 minutes if symptoms return.", "Do not give antihistamines alone for severe reactions — epinephrine is required.", "Transport to hospital even if symptoms improve."] },
  { id: "stroke", title: "Stroke — FAST Response", icon: "🧠", urgency: "critical", callFirst: true, steps: ["Use FAST drooping, Arm weakness, Speech difficulty, Time to call 911.", "Call emergency services immediately — every minute counts.", "Note the time symptoms began — this is critical for treatment decisions.", "Keep the person calm and still. Do not give food or water.", "If unconscious and not breathing, begin CPR.", "Do not leave the person alone until help arrives."] },
  { id: "diabetic", title: "Diabetic Emergency", icon: "💉", urgency: "moderate", callFirst: false, steps: ["Check if the person is conscious and able to swallow safely.", "For low blood sugar 15g of fast-acting carbs (glucose tablets, juice, or regular soda).", "Wait 15 minutes, recheck blood sugar — repeat if still low.", "If unconscious NOT give anything by mouth. Call 911.", "Place an unconscious person in the recovery position.", "Inform paramedics of their diabetes and any medications taken."] },
];

const URGENCY = {
  critical: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Critical" },
  moderate: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Moderate" },
};

export function FirstAidGuidance() {
  const [selected, setSelected] = useState(null);
  const emergency = EMERGENCIES.find(e => e.id === selected);
  const urgencyStyle = emergency ? URGENCY[emergency.urgency] : null;

  return (
    <div className="min-h-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-foreground">First Aid Guidance</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Step-by-step instructions for common medical emergencies</p>
        </div>
        <a
          href="tel:911"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: "#ef4444", color: "white", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
        >
          <Phone size={15} />
          Call 911
        </a>
      </div>

      {/* Emergency banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 border" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
        <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
        <p className="text-sm text-foreground">
          <strong>Important:</strong> In any life-threatening emergency, call <strong>911</strong> immediately. This guide supplements — it does not replace — professional emergency care.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Emergency list */}
        <div className={selected ? "hidden xl:block" : ""}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Select an Emergency Type</h2>
          <div className="space-y-2">
            {EMERGENCIES.map(em => {
              const style = URGENCY[em.urgency];
              const active = selected === em.id;
              return (
                <button
                  key={em.id}
                  onClick={() => setSelected(em.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all hover:shadow-md"
                  style={{ background: active ? style.bg : "white", borderColor: active ? style.color : "var(--border)", borderWidth: active ? "1.5px" : "1px" }}
                >
                  <span className="text-2xl flex-shrink-0">{em.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{em.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: style.color }} />
                      <span className="text-xs font-medium" style={{ color: style.color }}>{style.label}</span>
                      {em.callFirst && <span className="text-xs" style={{ color: "#ef4444" }}>· Call 911 first</span>}
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-2">
          {!emergency ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-3xl border-2 border-dashed text-center" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              <span className="text-5xl mb-3">🩺</span>
              <p className="text-sm font-semibold text-foreground">Select an emergency type</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Step-by-step instructions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Emergency hero */}
              <div className="p-5 rounded-3xl border" style={{ background: urgencyStyle.bg, borderColor: urgencyStyle.border }}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl">{emergency.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{emergency.title}</h2>
                    <span className="text-sm font-semibold" style={{ color: urgencyStyle.color }}>{urgencyStyle.label} urgency</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="ml-auto p-2 rounded-xl xl:hidden hover:bg-white transition-colors">
                    <ArrowLeft size={16} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
                {emergency.callFirst && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#ef4444" }}>
                    <Phone size={14} color="white" />
                    <p className="text-sm font-bold text-white">Call 911 BEFORE starting first aid</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                <Clock size={14} style={{ color: "var(--primary)" }} />
                <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>Stay calm. Read each step carefully before acting. Do not skip steps.</p>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergency.steps.map((s, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white border border-border">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: urgencyStyle.color }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-4 rounded-2xl border" style={{ background: "#E8F6F6", borderColor: "#C7E8E8" }}>
                <CheckCircle size={16} style={{ color: "#2F8F8F", flexShrink: 0 }} />
                <p className="text-sm text-foreground">Always seek professional medical evaluation after providing first aid, even if the person appears stable.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

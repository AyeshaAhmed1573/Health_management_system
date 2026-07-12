import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

const MOCK_REPORT = [
  { name: "Hemoglobin", value: "13.2", unit: "g/dL", reference: "13.5–17.5", status: "low", explanation: "Slightly below normal. May indicate mild anemia. Increase iron-rich foods (spinach, lentils, red meat) and consider iron supplements after consulting your doctor.", category: "Blood Count" },
  { name: "White Blood Cells", value: "7.2", unit: "K/μL", reference: "4.5–11.0", status: "normal", explanation: "Normal range. Your immune system appears healthy and functioning well.", category: "Blood Count" },
  { name: "Platelets", value: "210", unit: "K/μL", reference: "150–400", status: "normal", explanation: "Normal platelet count. Blood clotting function is healthy.", category: "Blood Count" },
  { name: "Fasting Blood Glucose", value: "118", unit: "mg/dL", reference: "70–100", status: "high", explanation: "Elevated. This falls in the pre-diabetic range (100–125 mg/dL). Reduce sugary foods and refined carbohydrates, increase fiber intake, and schedule a follow-up HbA1c test.", category: "Metabolic" },
  { name: "Total Cholesterol", value: "205", unit: "mg/dL", reference: "<200", status: "high", explanation: "Slightly elevated. Consider reducing saturated and trans fats, increasing dietary fiber (oats, legumes), and maintaining regular aerobic exercise.", category: "Lipid Panel" },
  { name: "LDL Cholesterol", value: "128", unit: "mg/dL", reference: "<100", status: "high", explanation: "LDL ('bad' cholesterol) is elevated. Lifestyle modifications are recommended. Your doctor may consider medication if levels remain high.", category: "Lipid Panel" },
  { name: "HDL Cholesterol", value: "52", unit: "mg/dL", reference: ">40", status: "normal", explanation: "Good HDL ('good' cholesterol) level. Regular aerobic exercise can further raise HDL.", category: "Lipid Panel" },
  { name: "Triglycerides", value: "145", unit: "mg/dL", reference: "<150", status: "normal", explanation: "Within normal range. Maintain by limiting sugar, alcohol, and refined carbohydrates.", category: "Lipid Panel" },
  { name: "Creatinine", value: "0.9", unit: "mg/dL", reference: "0.7–1.2", status: "normal", explanation: "Normal kidney function indicator.", category: "Kidney Function" },
  { name: "eGFR", value: "88", unit: "mL/min", reference: ">60", status: "normal", explanation: "Normal kidney filtration rate. Continue staying well hydrated.", category: "Kidney Function" },
  { name: "TSH (Thyroid)", value: "2.1", unit: "mIU/L", reference: "0.4–4.0", status: "normal", explanation: "Thyroid function is within normal limits.", category: "Thyroid" },
  { name: "Vitamin D", value: "18", unit: "ng/mL", reference: "30–100", status: "low", explanation: "Vitamin D deficiency detected. Supplement with Vitamin D3 (1000–2000 IU/day), spend 15 minutes daily in morning sunlight, and consume fatty fish and fortified dairy.", category: "Vitamins" },
];

const STATUS = {
  normal: { color: "#2F8F8F", bg: "#E8F6F6", icon: <CheckCircle size={13} />, label: "Normal", trend: <Minus size={12} /> },
  high: { color: "#f59e0b", bg: "#fffbeb", icon: <TrendingUp size={13} />, label: "High", trend: <TrendingUp size={12} /> },
  low: { color: "#3b82f6", bg: "#eff6ff", icon: <TrendingDown size={13} />, label: "Low", trend: <TrendingDown size={12} /> },
};

const CATEGORIES = Array.from(new Set(MOCK_REPORT.map(r => r.category)));

const PREVIOUS_REPORTS = [
  { name: "Blood_Test_June2025.pdf", date: "Today", size: "2.1 MB", icon: "🩸", analyzed: true },
  { name: "ECG_Report_May2025.pdf", date: "May 15, 2025", size: "1.4 MB", icon: "🫀", analyzed: true },
  { name: "Urine_Analysis_Apr2025.pdf", date: "Apr 3, 2025", size: "0.8 MB", icon: "🧪", analyzed: true },
  { name: "Lipid_Panel_Mar2025.pdf", date: "Mar 20, 2025", size: "1.1 MB", icon: "💊", analyzed: true },
];

export function ReportAnalysis({ onNavigate }) {
  const [stage, setStage] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");

  function startAnalysis() {
    setStage("analyzing");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 5;
      if (p >= 100) { clearInterval(interval); p = 100; setTimeout(() => setStage("result"), 500); }
      setProgress(Math.min(p, 100));
    }, 250);
  }

  const abnormal = MOCK_REPORT.filter(i => i.status !== "normal").length;
  const filtered = MOCK_REPORT.filter(item => {
    const matchFilter = activeFilter === "all" || item.status === activeFilter;
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    return matchFilter && matchCategory;
  });

  const ANALYSIS_STEPS = ["Parsing document structure", "Extracting laboratory values", "Cross-referencing medical database", "Applying clinical reference ranges", "Generating personalized insights"];

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Medical Report Analysis</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Upload your medical reports for instant AI-powered analysis and plain-language explanations</p>
      </div>

      {stage === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl">
          {/* Upload zone — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div
              onClick={startAnalysis}
              className="border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all hover:border-primary hover:bg-secondary/50 group"
              style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all group-hover:scale-110" style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(47,143,143,0.3)" }}>
                <Upload size={28} color="white" />
              </div>
              <p className="text-base font-bold text-foreground mb-1">Drop your report here</p>
              <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>or <span style={{ color: "var(--primary)", fontWeight: 600 }}>click to browse files</span></p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Supports PDF, JPG, PNG, HEIC · Max 10MB per file · AES-256 encrypted</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", label: "HIPAA Compliant", desc: "End-to-end encrypted" },
                { icon: "🤖", label: "AI Analysis", desc: "95%+ accuracy rate" },
                { icon: "⚡", label: "Instant Results", desc: "Under 60 seconds" },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-2xl text-center bg-white border border-border">
                  <span className="text-2xl block mb-1">{f.icon}</span>
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Previous reports — 2 cols */}
          <div className="lg:col-span-2">
            <p className="text-sm font-bold text-foreground mb-3">Previous Reports</p>
            <div className="space-y-2">
              {PREVIOUS_REPORTS.map(file => (
                <div key={file.name} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-border">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "var(--secondary)" }}>{file.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{file.date} · {file.size}</p>
                  </div>
                  <button onClick={file.analyzed ? () => setStage("result") : undefined} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 flex-shrink-0" style={{ background: file.analyzed ? "var(--secondary)" : "var(--primary)", color: file.analyzed ? "var(--primary)" : "white" }}>
                    {file.analyzed ? "View" : "Analyze"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === "analyzing" && (
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #2F8F8F20, #2F8F8F35)" }}>
            <FileText size={40} style={{ color: "var(--primary)" }} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Analyzing Your Report</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>Our AI is reading your medical data and cross-referencing with clinical databases</p>
          <div className="w-full h-2 rounded-full mb-2" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "var(--primary)" }} />
          </div>
          <p className="text-xs mb-6" style={{ color: "var(--muted-foreground)" }}>{Math.round(progress)}% complete</p>
          <div className="text-left space-y-2">
            {ANALYSIS_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: progress > (i + 1) * 18 ? "#E8F6F6" : "var(--muted)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: progress > (i + 1) * 18 ? "#2F8F8F" : "var(--muted-foreground)" }}>
                  {progress > (i + 1) * 18 ? <CheckCircle size={12} color="white" /> : <span className="text-white" style={{ fontSize: "10px" }}>{i + 1}</span>}
                </div>
                <p className="text-sm" style={{ color: progress > (i + 1) * 18 ? "var(--foreground)" : "var(--muted-foreground)" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "result" && (
        <div className="max-w-5xl space-y-5">
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Markers", value: MOCK_REPORT.length, color: "var(--foreground)", bg: "white" },
              { label: "Normal", value: MOCK_REPORT.filter(r => r.status === "normal").length, color: "#2F8F8F", bg: "#E8F6F6" },
              { label: "Need Attention", value: abnormal, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Report Date", value: "Jun 13, 2025", color: "var(--primary)", bg: "var(--secondary)" },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl border border-border" style={{ background: s.bg }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* AI summary */}
          <div className="p-5 rounded-3xl border" style={{ background: "linear-gradient(135deg, #EEF7F8, #BFD8E6)", borderColor: "rgba(47,143,143,0.15)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary)" }}>
                <Info size={18} color="white" />
              </div>
              <div>
                <p className="text-sm font-bold mb-1 text-foreground">🤖 AI Summary</p>
                <p className="text-sm leading-relaxed text-foreground">
                  Your blood work is mostly within healthy ranges. Key areas requiring follow-up: <strong>mild anemia</strong> (low hemoglobin), <strong>Vitamin D deficiency</strong>, and <strong>elevated fasting glucose and LDL cholesterol</strong>. These are manageable with dietary changes and supplementation. I recommend a follow-up consultation in 4–6 weeks.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => onNavigate("doctors")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90" style={{ background: "var(--primary)", color: "white" }}>
                Share with Doctor <ChevronRight size={13} />
              </button>
              <button className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-white" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                Download Report
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {(["all", "normal", "high", "low"]).map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all" style={{ background: activeFilter === f ? "var(--primary)" : "var(--secondary)", color: activeFilter === f ? "white" : "var(--muted-foreground)" }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex gap-1.5 flex-wrap">
              {(["All", ...CATEGORIES]).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all" style={{ background: activeCategory === cat ? "var(--foreground)" : "var(--muted)", color: activeCategory === cat ? "white" : "var(--muted-foreground)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lab values table */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              {["Test Name", "Result", "Reference", "Status", ""].map((h, i) => (
                <div key={i} className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? "col-span-4" : i === 1 ? "col-span-2" : i === 2 ? "col-span-3" : i === 3 ? "col-span-2" : "col-span-1"}`} style={{ color: "var(--muted-foreground)" }}>{h}</div>
              ))}
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(item => {
                const s = STATUS[item.status];
                const expanded = expandedItem === item.name;
                return (
                  <div key={item.name}>
                    <button className="w-full grid grid-cols-12 gap-0 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left" onClick={() => setExpandedItem(expanded ? null : item.name)}>
                      <div className="col-span-4">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.category}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm font-bold" style={{ color: s.color }}>{item.value} <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>{item.unit}</span></span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-xs text-foreground">{item.reference} {item.unit}</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
                          {s.icon}
                          {s.label}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {expanded ? <ChevronUp size={14} style={{ color: "var(--muted-foreground)" }} /> : <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: "var(--border)", background: s.bg }}>
                        <div className="flex gap-2">
                          <AlertCircle size={14} style={{ color: s.color, flexShrink: 0, marginTop: "2px" }} />
                          <p className="text-sm leading-relaxed text-foreground">{item.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setStage("upload")} className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-secondary" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            ← Upload Another Report
          </button>
        </div>
      )}
    </div>
  );
}

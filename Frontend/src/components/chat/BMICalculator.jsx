import { useState } from "react";
import { Info, TrendingUp, TrendingDown, Minus, CheckCircle } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { healthReadingsApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: "Underweight", color: "#5FAFB6", advice: "Consider speaking with a nutritionist to develop a healthy weight gain plan. Increase caloric intake with nutrient-dense foods." },
  { min: 18.5, max: 25, label: "Normal weight", color: "#2F8F8F", advice: "Excellent! Maintain your healthy weight through a balanced diet and regular physical activity (150 min/week)." },
  { min: 25, max: 30, label: "Overweight", color: "#8FD0D3", advice: "Consider dietary changes and increasing physical activity. Aim for gradual weight loss of 0.5–1 kg per week." },
  { min: 30, max: 35, label: "Obese Class I", color: "#8FCED1", advice: "Medical consultation is recommended. A supervised weight loss program combining diet, exercise, and behavioral support is advised." },
  { min: 35, max: 100, label: "Obese Class II+", color: "#ef4444", advice: "Please consult a healthcare professional promptly. Medically supervised treatment options are available." },
];

function getCategory(bmi) {
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

export function BMICalculator({ profileId }) {
  const { user } = useAuth();
  const [unit, setUnit] = useState("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bmi, setBmi] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calculate() {
    let h = 0, w = parseFloat(weight);
    if (unit === "metric") {
      h = parseFloat(height) / 100;
    } else {
      h = ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 0.0254;
      w = w * 0.453592;
    }
    if (h > 0 && w > 0) setBmi(Math.round((w / (h * h)) * 10) / 10);
    setSaved(false);
  }

  const saveToDashboard = async () => {
    if (!bmi || !profileId) return;
    
    setSaving(true);
    try {
      // Convert height to cm for storage
      const heightCm = unit === "metric" ? parseFloat(height) : 
        ((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54;
      
      // Convert weight to kg for storage
      const weightKg = unit === "metric" ? parseFloat(weight) : parseFloat(weight) * 0.453592;

      // Save BMI reading
      const bmiData = {
        profileId,
        type: 'bmi',
        value: bmi,
        unit: 'kg/m²',
        measuredAt: new Date().toISOString(),
      };
      console.log('Saving BMI reading:', bmiData);
      const bmiResponse = await healthReadingsApi.add(bmiData);
      console.log('BMI save response:', bmiResponse);

      // Save weight reading
      const weightData = {
        profileId,
        type: 'weight',
        value: weightKg,
        unit: 'kg',
        measuredAt: new Date().toISOString(),
      };
      console.log('Saving weight reading:', weightData);
      const weightResponse = await healthReadingsApi.add(weightData);
      console.log('Weight save response:', weightResponse);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save BMI:', error);
      alert('Failed to save to dashboard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const category = bmi ? getCategory(bmi) : null;
  const gaugeValue = bmi ? Math.min(Math.max(((bmi - 10) / 30) * 100, 5), 95) : 0;

  const scaleData = BMI_CATEGORIES.filter(c => c.max < Infinity).map(c => ({
    name: c.label,
    range: c.max - c.min,
    color: c.color,
    active: category?.label === c.label,
  }));

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">BMI Calculator</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Calculate your Body Mass Index and understand what it means for your health</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 max-w-5xl">
        {/* Input form — 2 cols */}
        <div className="xl:col-span-2 space-y-5">
          <div className="p-5 rounded-3xl bg-white border border-border space-y-4">
            {/* Unit toggle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Measurement System</p>
              <div className="flex p-1 rounded-xl gap-1" style={{ background: "var(--muted)" }}>
                {["metric", "imperial"].map(u => (
                  <button key={u} onClick={() => { setUnit(u); setBmi(null); }} className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all" style={{ background: unit === u ? "white" : "transparent", color: unit === u ? "var(--primary)" : "var(--muted-foreground)", boxShadow: unit === u ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                    {u === "metric" ? "Metric (kg/cm)" : "Imperial (lb/ft)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Age</label>
                <div className="relative">
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="w-full px-3 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--muted-foreground)" }}>yrs</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Gender</label>
                <div className="flex gap-1.5">
                  {(["male", "female"]).map(g => (
                    <button key={g} onClick={() => setGender(g)} className="flex-1 py-3 rounded-xl text-sm font-medium capitalize border transition-all" style={{ borderColor: gender === g ? "var(--primary)" : "var(--border)", background: gender === g ? "var(--secondary)" : "var(--input-background)", color: gender === g ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {g === "male" ? "♂" : "♀"} {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Height</label>
              {unit === "metric" ? (
                <div className="relative">
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-12" style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>cm</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-9" style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>ft</span>
                  </div>
                  <div className="relative flex-1">
                    <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="8" className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-9" style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>in</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>Weight</label>
              <div className="relative">
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === "metric" ? "70" : "155"} className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-12" style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{unit === "metric" ? "kg" : "lb"}</span>
              </div>
            </div>

            <button onClick={calculate} className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: "var(--primary)", color: "white" }}>
              Calculate BMI
            </button>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-2xl border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
            <div className="flex gap-2">
              <Info size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass, bone density, age, or ethnic differences. Consult a healthcare provider for a comprehensive health assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Results — 3 cols */}
        <div className="xl:col-span-3 space-y-4">
          {!bmi ? (
            <div className="flex flex-col items-center justify-center h-72 rounded-3xl border-2 border-dashed" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              <span className="text-5xl mb-3">⚖️</span>
              <p className="text-sm font-semibold text-foreground">Enter your measurements</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Your BMI result and analysis will appear here</p>
            </div>
          ) : (
            <>
              {/* BMI gauge card */}
              <div className="p-6 rounded-3xl bg-white border border-border">
                <div className="flex items-center gap-6">
                  <div className="relative w-36 h-36 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="60%" innerRadius="62%" outerRadius="80%" startAngle={180} endAngle={0} data={[{ value: gaugeValue }]}>
                        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--muted)" }}>
                          <Cell fill={category.color} />
                        </RadialBar>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                      <p className="text-3xl font-black" style={{ color: category.color }}>{bmi}</p>
                      <p className="text-xs font-semibold mt-0.5 text-foreground">BMI</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: category.color }} />
                      <p className="text-xl font-bold text-foreground">{category.label}</p>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{category.advice}</p>
                  </div>
                </div>
              </div>

              {/* BMI scale bar chart */}
              <div className="p-5 rounded-2xl bg-white border border-border">
                <p className="text-sm font-bold mb-4 text-foreground">BMI Reference Scale</p>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scaleData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                      <YAxis hide />
                      <Tooltip formatter={(val) => [`${val} BMI units`, "Range"]} contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid var(--border)" }} />
                      <Bar dataKey="range" radius={[6, 6, 0, 0]}>
                        {scaleData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} opacity={entry.active ? 1 : 0.3} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Healthy weight range */}
              <div className="p-4 rounded-2xl border" style={{ background: "#E8F6F6", borderColor: "#C7E8E8" }}>
                <p className="text-sm font-bold text-foreground mb-1">Your Healthy Weight Range</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  For your height, a healthy weight is approximately <strong style={{ color: "var(--foreground)" }}>
                    {unit === "metric"
                      ? `${Math.round(18.5 * Math.pow(parseFloat(height) / 100, 2))}–${Math.round(24.9 * Math.pow(parseFloat(height) / 100, 2))} kg`
                      : `${Math.round(18.5 * Math.pow(((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 0.0254, 2) / 0.453592)}–${Math.round(24.9 * Math.pow(((parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 0.0254, 2) / 0.453592)} lb`
                    }
                  </strong>. This is the range associated with the lowest health risks.
                </p>
              </div>

              {/* Save to Dashboard button */}
              {profileId && (
                <button
                  onClick={saveToDashboard}
                  disabled={saving || saved}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ 
                    background: saved ? "#2F8F8F" : "var(--primary)", 
                    color: "white",
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saved ? (
                    <>
                      <CheckCircle size={16} />
                      Saved to Dashboard
                    </>
                  ) : saving ? (
                    'Saving...'
                  ) : (
                    'Save to Dashboard'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

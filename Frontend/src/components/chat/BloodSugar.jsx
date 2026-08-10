import { useState } from "react";
import { Droplet, CheckCircle, TrendingUp } from "lucide-react";
import { healthReadingsApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

export function BloodSugar({ profileId }) {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("mg/dL");
  const [mealContext, setMealContext] = useState("fasting");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const category = value ? getSugarCategory(parseFloat(value), unit, mealContext) : null;

  const saveToDashboard = async () => {
    if (!value || !profileId) return;
    
    setSaving(true);
    try {
      const readingData = {
        profileId,
        type: 'blood_sugar',
        value: parseFloat(value),
        unit,
        mealContext,
        measuredAt: new Date().toISOString(),
        notes: notes || undefined,
      };
      
      console.log('Saving blood sugar reading:', readingData);
      const response = await healthReadingsApi.add(readingData);
      console.log('Blood sugar save response:', response);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Reset form
      setValue("");
      setNotes("");
    } catch (error) {
      console.error('Failed to save blood sugar:', error);
      alert('Failed to save to dashboard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  function getSugarCategory(val, unit, context) {
    // Convert to mg/dL if in mmol/L
    const mgdl = unit === "mmol/L" ? val * 18.018 : val;
    
    if (context === "fasting") {
      if (mgdl < 70) {
        return { label: "Low", color: "#ef4444", advice: "Your blood sugar is low. Consider consuming fast-acting carbohydrates." };
      } else if (mgdl >= 70 && mgdl < 100) {
        return { label: "Normal", color: "#2F8F8F", advice: "Excellent! Your fasting blood sugar is within the healthy range." };
      } else if (mgdl >= 100 && mgdl < 126) {
        return { label: "Prediabetic", color: "#5FAFB6", advice: "Your fasting blood sugar is elevated. Consult your doctor." };
      } else {
        return { label: "Diabetic", color: "#8FCED1", advice: "Your fasting blood sugar indicates diabetes. Medical consultation is recommended." };
      }
    } else if (context === "post_meal") {
      if (mgdl < 140) {
        return { label: "Normal", color: "#2F8F8F", advice: "Great! Your post-meal blood sugar is within the healthy range." };
      } else if (mgdl >= 140 && mgdl < 200) {
        return { label: "Elevated", color: "#5FAFB6", advice: "Your post-meal blood sugar is elevated. Consider dietary changes." };
      } else {
        return { label: "High", color: "#8FCED1", advice: "Your post-meal blood sugar is high. Consult your doctor." };
      }
    } else {
      // Random
      if (mgdl < 70) {
        return { label: "Low", color: "#ef4444", advice: "Your blood sugar is low. Consider consuming fast-acting carbohydrates." };
      } else if (mgdl >= 70 && mgdl < 140) {
        return { label: "Normal", color: "#2F8F8F", advice: "Your blood sugar is within the healthy range." };
      } else {
        return { label: "High", color: "#8FCED1", advice: "Your blood sugar is high. Consult your doctor." };
      }
    }
  }

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Blood Sugar Tracker</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Record and track your blood glucose readings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
        {/* Input form */}
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white border border-border space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Blood Sugar Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-16"
                  style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }}
                />
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium bg-transparent outline-none"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <option value="mg/dL">mg/dL</option>
                  <option value="mmol/L">mmol/L</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Meal Context
              </label>
              <div className="flex gap-2">
                {["fasting", "post_meal", "random"].map(ctx => (
                  <button
                    key={ctx}
                    onClick={() => setMealContext(ctx)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium capitalize border transition-all"
                    style={{
                      borderColor: mealContext === ctx ? "var(--primary)" : "var(--border)",
                      background: mealContext === ctx ? "var(--secondary)" : "var(--input-background)",
                      color: mealContext === ctx ? "var(--primary)" : "var(--muted-foreground)"
                    }}
                  >
                    {ctx.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-3 py-3 rounded-xl border text-sm outline-none resize-none"
                style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }}
              />
            </div>

            <button
              onClick={saveToDashboard}
              disabled={!value || saving || saved}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ 
                background: saved ? "#2F8F8F" : "#2F8F8F", 
                color: "white",
                opacity: !value || saving ? 0.5 : 1
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
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!category ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-3xl border-2 border-dashed" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              <Droplet size={48} style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm font-semibold text-foreground mt-4">Enter your blood sugar</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Your reading and category will appear here</p>
            </div>
          ) : (
            <>
              <div className="p-6 rounded-3xl bg-white border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: category.color + "20" }}>
                    <Droplet size={32} style={{ color: category.color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-black" style={{ color: category.color }}>
                      {value} {unit}
                    </p>
                    <p className="text-xs font-medium text-foreground capitalize">{mealContext.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: category.color + "15" }}>
                  <p className="text-sm font-bold text-foreground mb-1">{category.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{category.advice}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: "#E8F6F6", borderColor: "#C7E8E8" }}>
                <p className="text-sm font-bold text-foreground mb-2">Blood Sugar Ranges (mg/dL)</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>Fasting:</span>
                    <span className="ml-2" style={{ color: "#2F8F8F" }}>Normal: &lt;100</span>
                    <span className="ml-2" style={{ color: "#5FAFB6" }}>Prediabetic: 100-125</span>
                    <span className="ml-2" style={{ color: "#8FCED1" }}>Diabetic: ≥126</span>
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>Post-meal (2h):</span>
                    <span className="ml-2" style={{ color: "#2F8F8F" }}>Normal: &lt;140</span>
                    <span className="ml-2" style={{ color: "#8FCED1" }}>High: ≥200</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Heart, CheckCircle, Activity } from "lucide-react";
import { healthReadingsApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

export function BloodPressure({ profileId }) {
  const { user } = useAuth();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const category = systolic && diastolic ? getBPCategory(parseInt(systolic), parseInt(diastolic)) : null;

  const saveToDashboard = async () => {
    if (!systolic || !diastolic || !profileId) return;
    
    setSaving(true);
    try {
      const readingData = {
        profileId,
        type: 'blood_pressure',
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        unit: 'mmHg',
        measuredAt: new Date().toISOString(),
        notes: notes || undefined,
      };
      
      console.log('Saving BP reading:', readingData);
      const response = await healthReadingsApi.add(readingData);
      console.log('BP save response:', response);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Reset form
      setSystolic("");
      setDiastolic("");
      setNotes("");
    } catch (error) {
      console.error('Failed to save BP:', error);
      alert('Failed to save to dashboard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  function getBPCategory(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
      return { label: "Normal", color: "#2F8F8F", advice: "Great! Your blood pressure is within the healthy range." };
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return { label: "Elevated", color: "#5FAFB6", advice: "Consider lifestyle changes to prevent progression." };
    } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
      return { label: "High BP Stage 1", color: "#8FD0D3", advice: "Consult your doctor about lifestyle changes or medication." };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { label: "High BP Stage 2", color: "#8FCED1", advice: "Medical consultation is recommended." };
    } else if (systolic > 180 || diastolic > 120) {
      return { label: "Hypertensive Crisis", color: "#ef4444", advice: "Seek emergency medical attention immediately!" };
    }
    return { label: "Unknown", color: "#7A8A92", advice: "Enter valid values to see your category." };
  }

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Blood Pressure Tracker</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Record and track your blood pressure readings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
        {/* Input form */}
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white border border-border space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Systolic (top number)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={systolic}
                  onChange={e => setSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-12"
                  style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                  mmHg
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Diastolic (bottom number)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={diastolic}
                  onChange={e => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-3 rounded-xl border text-sm outline-none pr-12"
                  style={{ borderColor: "var(--border)", background: "var(--input-background)", color: "var(--foreground)" }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                  mmHg
                </span>
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
              disabled={!systolic || !diastolic || saving || saved}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ 
                background: saved ? "#2F8F8F" : "#2F8F8F", 
                color: "white",
                opacity: (!systolic || !diastolic || saving) ? 0.5 : 1
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
              <Heart size={48} style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm font-semibold text-foreground mt-4">Enter your blood pressure</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Your reading and category will appear here</p>
            </div>
          ) : (
            <>
              <div className="p-6 rounded-3xl bg-white border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: category.color + "20" }}>
                    <Activity size={32} style={{ color: category.color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-black" style={{ color: category.color }}>
                      {systolic}/{diastolic}
                    </p>
                    <p className="text-xs font-medium text-foreground">mmHg</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: category.color + "15" }}>
                  <p className="text-sm font-bold text-foreground mb-1">{category.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{category.advice}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: "#E8F6F6", borderColor: "#C7E8E8" }}>
                <p className="text-sm font-bold text-foreground mb-2">Blood Pressure Categories</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>Normal</span>
                    <span className="font-semibold" style={{ color: "#2F8F8F" }}>&lt;120/&lt;80</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>Elevated</span>
                    <span className="font-semibold" style={{ color: "#5FAFB6" }}>120-129/&lt;80</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>High Stage 1</span>
                    <span className="font-semibold" style={{ color: "#8FD0D3" }}>130-139/80-89</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>High Stage 2</span>
                    <span className="font-semibold" style={{ color: "#8FCED1" }}>≥140/≥90</span>
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

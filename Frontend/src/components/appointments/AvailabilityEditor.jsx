import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { appointmentsApi } from "@/lib/api";
import { Clock } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const blank = () => Object.fromEntries(DAYS.map((d) => [d, { on: false, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 }]));

/** Doctor sets the weekly hours patients can book. Until saved, the default Mon-Sat 9-5 applies. */
export default function AvailabilityEditor() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState(blank());
  const [isDefault, setIsDefault] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    appointmentsApi.getAvailability().then((d) => {
      const w = blank();
      d.availableSlots.forEach((s) => { w[s.day] = { on: true, startTime: s.startTime, endTime: s.endTime, slotDurationMinutes: s.slotDurationMinutes || 30 }; });
      setWeek(w);
      setIsDefault(d.isDefault);
    }).catch((e) => toast({ title: "Could not load hours", description: e.message, variant: "destructive" }));
  }, [open, toast]);

  const set = (day, k, v) => setWeek((w) => ({ ...w, [day]: { ...w[day], [k]: v } }));

  const save = async () => {
    setBusy(true);
    try {
      const availableSlots = DAYS.filter((d) => week[d].on).map((d) => ({ day: d, startTime: week[d].startTime, endTime: week[d].endTime, slotDurationMinutes: Number(week[d].slotDurationMinutes) }));
      await appointmentsApi.setAvailability(availableSlots);
      setIsDefault(false);
      toast({ title: "Availability saved" });
    } catch (e) {
      toast({ title: "Could not save", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 mb-6">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 font-bold w-full text-left">
        <Clock className="w-4 h-4 text-primary" /> My available hours
        <span className="ml-auto text-xs font-normal text-muted-foreground">{open ? "Hide" : "Edit"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-2">
          {isDefault && <p className="text-xs rounded-lg bg-amber-50 text-amber-800 p-2">You haven't set your hours yet, so patients currently see Mon–Sat, 09:00–17:00. Save to use your own.</p>}
          {DAYS.map((d) => (
            <div key={d} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex items-center gap-2 w-32 capitalize"><input type="checkbox" checked={week[d].on} onChange={(e) => set(d, "on", e.target.checked)} /> {d}</label>
              <input type="time" disabled={!week[d].on} value={week[d].startTime} onChange={(e) => set(d, "startTime", e.target.value)} className="rounded-lg border bg-background px-2 py-1 disabled:opacity-40" />
              <span>to</span>
              <input type="time" disabled={!week[d].on} value={week[d].endTime} onChange={(e) => set(d, "endTime", e.target.value)} className="rounded-lg border bg-background px-2 py-1 disabled:opacity-40" />
              <select disabled={!week[d].on} value={week[d].slotDurationMinutes} onChange={(e) => set(d, "slotDurationMinutes", e.target.value)} className="rounded-lg border bg-background px-2 py-1 disabled:opacity-40">
                {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          ))}
          <Button onClick={save} disabled={busy} className="rounded-xl mt-2">{busy ? "Saving…" : "Save hours"}</Button>
        </div>
      )}
    </div>
  );
}

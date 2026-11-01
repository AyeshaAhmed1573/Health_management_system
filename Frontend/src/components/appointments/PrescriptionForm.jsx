import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { prescriptionsApi } from "@/lib/api";
import { X, Plus, Trash2 } from "lucide-react";

const blank = () => ({ name: "", dosage: "", frequency: "", durationDays: "", instructions: "", reminderTimes: "" });

/** Doctor writes a prescription for an appointment. Reminder times are optional ("08:00, 20:00"). */
export default function PrescriptionForm({ appointment, onClose, onSaved }) {
  const { toast } = useToast();
  const [meds, setMeds] = useState([blank()]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (i, k, v) => setMeds((m) => m.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const submit = async () => {
    const medicines = meds.map((m) => ({
      name: m.name.trim(), dosage: m.dosage.trim(), frequency: m.frequency.trim(),
      duration: m.durationDays ? `${m.durationDays} days` : "As directed",
      ...(m.durationDays ? { durationDays: Number(m.durationDays) } : {}),
      ...(m.instructions.trim() ? { instructions: m.instructions.trim() } : {}),
      reminderTimes: m.reminderTimes.split(",").map((t) => t.trim()).filter(Boolean),
    }));
    if (medicines.some((m) => !m.name || !m.dosage || !m.frequency)) {
      return toast({ title: "Incomplete", description: "Each medicine needs a name, dosage and frequency.", variant: "destructive" });
    }
    setBusy(true);
    try {
      await prescriptionsApi.create({ appointmentId: appointment._id, medicines, diagnosis, notes });
      toast({ title: "Prescription issued" });
      onSaved?.();
      onClose();
    } catch (e) { toast({ title: "Could not save", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Write prescription · {appointment.profileId?.name}</h2>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {meds.map((m, i) => (
            <div key={i} className="rounded-xl border p-3 grid grid-cols-2 gap-2">
              <Input placeholder="Medicine *" value={m.name} onChange={(e) => set(i, "name", e.target.value)} className="col-span-2 rounded-lg" />
              <Input placeholder="Dosage * (500mg)" value={m.dosage} onChange={(e) => set(i, "dosage", e.target.value)} className="rounded-lg" />
              <Input placeholder="Frequency * (twice daily)" value={m.frequency} onChange={(e) => set(i, "frequency", e.target.value)} className="rounded-lg" />
              <Input type="number" min="1" placeholder="Days" value={m.durationDays} onChange={(e) => set(i, "durationDays", e.target.value)} className="rounded-lg" />
              <Input placeholder="Reminder times (08:00, 20:00)" value={m.reminderTimes} onChange={(e) => set(i, "reminderTimes", e.target.value)} className="rounded-lg" />
              <Input placeholder="Instructions (after meals)" value={m.instructions} onChange={(e) => set(i, "instructions", e.target.value)} className="col-span-2 rounded-lg" />
              {meds.length > 1 && <button className="col-span-2 text-xs text-red-600 flex items-center gap-1" onClick={() => setMeds(meds.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3" /> Remove</button>}
            </div>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setMeds([...meds, blank()])}><Plus className="w-4 h-4" /> Add medicine</Button>
          <Input placeholder="Diagnosis (optional)" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="rounded-xl" />
          <textarea placeholder="Notes for the patient (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border bg-background px-3 py-2" />
          <Button onClick={submit} disabled={busy} className="w-full rounded-xl py-6">{busy ? "Saving…" : "Issue prescription"}</Button>
        </div>
      </div>
    </div>
  );
}

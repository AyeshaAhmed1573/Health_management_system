import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { appointmentsApi } from "@/lib/api";
import { X, Calendar } from "lucide-react";

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Book an appointment for yourself or a dependent. Slots come from the doctor's availability. */
export default function BookAppointmentDialog({ doctor, onClose }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profiles = [], isLoading } = useProfiles();

  const [profileId, setProfileId] = useState("");
  const [type, setType] = useState("in_person");
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!profileId && profiles.length) setProfileId(profiles[0].id); }, [profiles, profileId]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlot("");
    appointmentsApi.availability(doctor._id, date)
      .then((d) => { if (!cancelled) { setSlots(d.slots || []); setSlotError(""); } })
      .catch((e) => { if (!cancelled) { setSlots([]); setSlotError(e.message); } })
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => { cancelled = true; };
  }, [date, doctor._id]);

  const fee = doctor.consultationFee ?? doctor.clinic?.consultationFee ?? doctor.hospital?.consultationFee;

  const submit = async () => {
    setBusy(true);
    try {
      await appointmentsApi.book({ profileId, doctorId: doctor._id, slotTime: slot, type, reason });
      toast({ title: "Request sent", description: "The doctor will confirm your appointment shortly." });
      onClose();
      navigate("/appointments");
    } catch (err) {
      toast({ title: "Could not book", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Book appointment</h2>
            <p className="text-sm text-muted-foreground">Dr. {doctor.userId?.name} · {doctor.specialization}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {user?.role !== "patient" ? (
          <p className="text-sm py-6">
            Please <a className="text-primary font-semibold underline" href="/patient-login">sign in as a patient</a> to book an appointment.
          </p>
        ) : isLoading ? (
          <p className="text-sm py-6">Loading profiles…</p>
        ) : profiles.length === 0 ? (
          <p className="text-sm py-6">
            You need a profile first. <a className="text-primary font-semibold underline" href="/profiles">Create one</a>.
          </p>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Who is the appointment for?
              <select value={profileId} onChange={(e) => setProfileId(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5">
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[["in_person", "In person"], ["online", "Online (video)"]].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setType(v)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${type === v ? "border-primary bg-primary/10 text-primary" : ""}`}>{l}</button>
              ))}
            </div>

            <label className="block text-sm font-semibold">Date
              <Input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-xl" />
            </label>

            <div>
              <p className="text-sm font-semibold mb-2">Available times</p>
              {loadingSlots ? <p className="text-sm text-muted-foreground">Checking availability…</p>
                : slotError ? <p className="text-sm text-red-600">{slotError}</p>
                : slots.length === 0 ? <p className="text-sm text-muted-foreground">No free slots on this day. Try another date.</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => setSlot(s)}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${slot === s ? "border-primary bg-primary text-white" : "hover:bg-secondary"}`}>{fmtTime(s)}</button>
                    ))}
                  </div>
                )}
            </div>

            <label className="block text-sm font-semibold">Reason / symptoms (optional)
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={500}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2" />
            </label>

            <p className="text-xs text-muted-foreground">
              This platform provides appointments with licensed doctors; it does not diagnose or prescribe by itself.
            </p>

            <Button onClick={submit} disabled={!slot || !profileId || busy} className="w-full rounded-xl py-6">
              <Calendar className="w-4 h-4 mr-2" />
              {busy ? "Booking…" : `Request appointment${fee ? ` · PKR ${fee}` : ""}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

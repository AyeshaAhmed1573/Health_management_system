import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { appointmentsApi } from "@/lib/api";
import StatusBadge from "@/components/appointments/StatusBadge";
import PrescriptionForm from "@/components/appointments/PrescriptionForm";
import AvailabilityEditor from "@/components/appointments/AvailabilityEditor";
import { Stethoscope, Video } from "lucide-react";

const FILTERS = ["all", "pending", "confirmed", "completed"];
const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function DoctorAppointments() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rxFor, setRxFor] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await appointmentsApi.doctorSchedule(filter === "all" ? {} : { status: filter });
      setItems(d.appointments || []);
      setNotes(Object.fromEntries((d.appointments || []).map((a) => [a._id, a.consultationNotes || ""])));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn, okMsg) => {
    try { await fn(); toast({ title: okMsg }); load(); }
    catch (e) { toast({ title: "Action failed", description: e.message, variant: "destructive" }); }
  };

  return (
    <div>
      <PageHeader title="Patient appointments" description="Confirm requests, run consultations, add notes and issue prescriptions." icon={Stethoscope} />
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <AvailabilityEditor />
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize border ${filter === f ? "bg-primary text-white border-primary" : "hover:bg-secondary"}`}>{f}</button>
          ))}
        </div>
        {loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p>
          : error ? <p className="py-12 text-center text-red-600">{error}</p>
          : items.length === 0 ? <p className="py-12 text-center text-muted-foreground">Nothing here.</p>
          : (
            <div className="space-y-4">
              {items.map((a) => (
                <div key={a._id} className="rounded-2xl border bg-card p-5 space-y-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-bold">{a.profileId?.name} <span className="font-normal text-muted-foreground">({a.profileId?.relationship})</span></p>
                      <p className="text-sm text-muted-foreground">{fmt(a.slotTime)} · {a.type === "online" ? "Online" : "In person"}{a.reason ? ` · ${a.reason}` : ""}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {a.status === "pending" && (<>
                      <Button size="sm" className="rounded-xl" onClick={() => act(() => appointmentsApi.setStatus(a._id, "confirmed"), "Appointment confirmed")}>Confirm</Button>
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { const r = window.prompt("Reason for declining (optional)") ; if (r !== null) act(() => appointmentsApi.setStatus(a._id, "cancelled", r), "Appointment declined"); }}>Decline</Button>
                    </>)}
                    {a.status === "confirmed" && (<>
                      {a.type === "online" && a.meetingLink && <a href={a.meetingLink} target="_blank" rel="noopener noreferrer"><Button size="sm" className="rounded-xl gap-1.5"><Video className="w-4 h-4" /> Start call</Button></a>}
                      <Button size="sm" className="rounded-xl" onClick={() => act(() => appointmentsApi.setStatus(a._id, "completed"), "Marked completed")}>Mark completed</Button>
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => act(() => appointmentsApi.setStatus(a._id, "no_show"), "Marked no-show")}>No-show</Button>
                    </>)}
                    {["confirmed", "completed"].includes(a.status) && (
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setRxFor(a)}>Write prescription</Button>
                    )}
                  </div>

                  {["confirmed", "completed"].includes(a.status) && (
                    <div className="space-y-2">
                      <textarea rows={2} value={notes[a._id] ?? ""} onChange={(e) => setNotes({ ...notes, [a._id]: e.target.value })} placeholder="Consultation notes (visible to the patient)" className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => act(() => appointmentsApi.saveNotes(a._id, notes[a._id] || ""), "Notes saved")}>Save notes</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
      {rxFor && <PrescriptionForm appointment={rxFor} onClose={() => setRxFor(null)} onSaved={load} />}
    </div>
  );
}

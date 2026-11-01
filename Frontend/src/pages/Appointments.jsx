import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { appointmentsApi } from "@/lib/api";
import StatusBadge from "@/components/appointments/StatusBadge";
import PayButton from "@/components/payments/PayButton";
import { CalendarCheck, Video, MapPin } from "lucide-react";

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];
const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function Appointments() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await appointmentsApi.mine(filter === "all" ? {} : { status: filter });
      setItems(d.appointments || []);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (a) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try { await appointmentsApi.setStatus(a._id, "cancelled", "Cancelled by patient"); toast({ title: "Appointment cancelled" }); load(); }
    catch (e) { toast({ title: "Could not cancel", description: e.message, variant: "destructive" }); }
  };

  return (
    <div>
      <PageHeader title="My appointments" description="Appointments for you and your family profiles." icon={CalendarCheck} />
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize border ${filter === f ? "bg-primary text-white border-primary" : "hover:bg-secondary"}`}>{f}</button>
          ))}
          <a href="/doctors" className="ml-auto"><Button className="rounded-xl">Book new</Button></a>
        </div>

        {loading ? <p className="py-12 text-center text-muted-foreground">Loading…</p>
          : error ? <p className="py-12 text-center text-red-600">{error}</p>
          : items.length === 0 ? <p className="py-12 text-center text-muted-foreground">No appointments yet.</p>
          : (
            <div className="space-y-4">
              {items.map((a) => (
                <div key={a._id} className="rounded-2xl border bg-card p-5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">Dr. {a.doctorId?.userId?.name || "Doctor"} <span className="font-normal text-muted-foreground">· {a.doctorId?.specialization}</span></p>
                      <p className="text-sm text-muted-foreground">For {a.profileId?.name} · {fmt(a.slotTime)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {a.type === "online" ? <Video className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                    {a.type === "online" ? "Online consultation" : "In-person visit"}
                    {a.reason && <span className="text-muted-foreground">· {a.reason}</span>}
                  </div>
                  {a.consultationNotes && <p className="text-sm rounded-xl bg-secondary p-3"><b>Doctor's notes:</b> {a.consultationNotes}</p>}
                  <div className="flex flex-wrap items-center gap-3">
                    {a.status === "confirmed" && a.type === "online" && a.meetingLink && (
                      <a href={a.meetingLink} target="_blank" rel="noopener noreferrer"><Button size="sm" className="rounded-xl gap-1.5"><Video className="w-4 h-4" /> Join video call</Button></a>
                    )}
                    {a.fee > 0 && a.status !== "cancelled" && (
                      <PayButton kind="appointment" refId={a._id} amount={a.fee} paid={a.paymentStatus === "paid"} onPaid={load} />
                    )}
                    {["pending", "confirmed"].includes(a.status) && (
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => cancel(a)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

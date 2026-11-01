import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { prescriptionsApi, pharmaciesApi } from "@/lib/api";
import { Pill, Send } from "lucide-react";

const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { dateStyle: "medium" });

function MedicineList({ medicines }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {medicines.map((m, i) => (
        <li key={i} className="rounded-lg bg-secondary px-3 py-2">
          <b>{m.name}</b> · {m.dosage} · {m.frequency} · {m.duration}
          {m.instructions ? <span className="text-muted-foreground"> — {m.instructions}</span> : null}
          {m.reminderTimes?.length ? <span className="block text-xs text-muted-foreground">Reminders at {m.reminderTimes.join(", ")}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** Patients: prescriptions per profile + consent-based sharing with a pharmacy. Pharmacies: their inbox. */
export default function Prescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isPharmacy = user?.role === "pharmacy";
  const { data: profiles = [] } = useProfiles();
  const [profileId, setProfileId] = useState("");
  const [items, setItems] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [pick, setPick] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!profileId && profiles.length) setProfileId(profiles[0].id); }, [profiles, profileId]);
  useEffect(() => { if (!isPharmacy) pharmaciesApi.listVerified().then(setPharmacies).catch(() => {}); }, [isPharmacy]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const d = isPharmacy ? await prescriptionsApi.sharedWithMe() : profileId ? await prescriptionsApi.byProfile(profileId) : { prescriptions: [] };
      setItems(d.prescriptions || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [profileId, isPharmacy]);

  const share = async (rx) => {
    const pharmacyId = pick[rx._id];
    if (!pharmacyId) return;
    if (!window.confirm("Share this prescription with the selected pharmacy? They will be able to see the medicines.")) return;
    try { await prescriptionsApi.shareWithPharmacy(rx._id, pharmacyId); toast({ title: "Prescription sent to pharmacy" }); load(); }
    catch (e) { toast({ title: "Could not share", description: e.message, variant: "destructive" }); }
  };

  return (
    <div>
      <PageHeader title="Prescriptions" description={isPharmacy ? "Prescriptions patients have shared with your pharmacy." : "Digital prescriptions from your doctors."} icon={Pill} />
      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-4">
        {!isPharmacy && (
          <select value={profileId} onChange={(e) => setProfileId(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5">
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>)}
          </select>
        )}
        {loading ? <p className="py-10 text-center text-muted-foreground">Loading…</p>
          : error ? <p className="py-10 text-center text-red-600">{error}</p>
          : items.length === 0 ? <p className="py-10 text-center text-muted-foreground">No prescriptions yet.</p>
          : items.map((rx) => (
            <div key={rx._id} className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">
                  {isPharmacy ? rx.profileId?.name : `Dr. ${rx.doctorId?.userId?.name || "Doctor"}`}
                  <span className="font-normal text-muted-foreground"> · {fmtDate(rx.issuedAt)}</span>
                </p>
                {rx.validUntil && <span className="text-xs text-muted-foreground">Valid until {fmtDate(rx.validUntil)}</span>}
              </div>
              {isPharmacy && rx.profileId?.allergies?.length > 0 && <p className="text-sm text-red-700">Allergies: {rx.profileId.allergies.join(", ")}</p>}
              {rx.diagnosis && <p className="text-sm"><b>Diagnosis:</b> {rx.diagnosis}</p>}
              <MedicineList medicines={rx.medicines || []} />
              {rx.notes && <p className="text-sm text-muted-foreground">{rx.notes}</p>}

              {!isPharmacy && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {rx.sharedWith?.length > 0 && <span className="text-xs text-green-700 font-semibold">Shared with {rx.sharedWith.length} pharmacy</span>}
                  <select value={pick[rx._id] || ""} onChange={(e) => setPick({ ...pick, [rx._id]: e.target.value })} className="rounded-xl border bg-background px-3 py-2 text-sm">
                    <option value="">Send to pharmacy…</option>
                    {pharmacies.map((p) => <option key={p._id} value={p._id}>{p.pharmacyName}</option>)}
                  </select>
                  <Button size="sm" disabled={!pick[rx._id]} onClick={() => share(rx)} className="rounded-xl gap-1.5"><Send className="w-4 h-4" /> Share</Button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

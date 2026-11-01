import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { paymentsApi } from "@/lib/api";
import { Receipt } from "lucide-react";

const LABELS = { appointment: "Doctor consultation", lab_booking: "Laboratory booking", pharmacy_order: "Pharmacy order" };
const COLORS = { succeeded: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800", failed: "bg-red-100 text-red-700", refunded: "bg-gray-200 text-gray-700" };

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    paymentsApi.history().then((d) => setRows(d.transactions || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const total = rows.filter((r) => r.status === "succeeded").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader title="Payment history" description="Every consultation, lab and pharmacy payment in one place." icon={Receipt} />
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {loading ? <p className="py-10 text-center text-muted-foreground">Loading…</p>
          : error ? <p className="py-10 text-center text-red-600">{error}</p>
          : rows.length === 0 ? <p className="py-10 text-center text-muted-foreground">No payments yet.</p>
          : (<>
            <p className="mb-4 text-sm text-muted-foreground">Total paid: <b className="text-foreground">PKR {total.toLocaleString()}</b></p>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left"><tr><th className="p-3">Date</th><th className="p-3">For</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">{LABELS[r.kind] || r.kind}</td>
                      <td className="p-3 font-semibold">{r.currency} {r.amount.toLocaleString()}</td>
                      <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${COLORS[r.status]}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>)}
      </div>
    </div>
  );
}

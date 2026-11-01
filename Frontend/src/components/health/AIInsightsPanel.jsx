import { useCallback, useEffect, useState } from "react";
import { API_BASE, getStoredToken } from "@/lib/session";
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

const COLORS = { text: "#2F3A40", muted: "#7A8A92", primary: "#6FB3B5", primaryDark: "#4E8C8E", secondary: "#DCE8EE", card: "#FFFFFF" };

function Section({ icon: Icon, color, title, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={14} /> {title}
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: COLORS.text, lineHeight: 1.6 }}>
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}

/** Real AI overview built from the selected profile's recent reports and health readings. */
export default function AIInsightsPanel({ profileId, refreshKey }) {
  const [state, setState] = useState({ loading: false, error: "", data: null });

  const load = useCallback(async () => {
    if (!profileId) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetch(`${API_BASE}/reports/insights/${profileId}`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load insights");
      setState({ loading: false, error: "", data });
    } catch (e) {
      setState({ loading: false, error: e.message, data: null });
    }
  }, [profileId]);

  // reload when the profile changes or the amount of data changes (new report / reading)
  useEffect(() => { load(); }, [load, refreshKey]);

  const { loading, error, data } = state;
  const ins = data?.insights;

  return (
    <div style={{ background: COLORS.card, borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 2px rgba(47,58,64,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} color={COLORS.primaryDark} /> AI Health Insights
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
            {data?.basedOn ? `Based on ${data.basedOn.reports} report(s) and ${data.basedOn.readings} recent reading(s)` : "Powered by AI analysis"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading || !profileId}
          style={{ border: `1px solid ${COLORS.secondary}`, background: "transparent", borderRadius: 8, padding: "6px 10px", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.primaryDark, fontWeight: 600 }}
        >
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : undefined} /> {loading ? "Analyzing…" : "Refresh"}
        </button>
      </div>

      <div style={{ padding: 16, background: "#F0F7F9", borderRadius: 12, border: `1px solid ${COLORS.secondary}` }}>
        {loading && !ins ? (
          <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>Analyzing your reports and readings…</p>
        ) : error ? (
          <p style={{ margin: 0, fontSize: 13, color: "#991B1B" }}>{error}</p>
        ) : data?.empty ? (
          <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>{data.message}</p>
        ) : ins ? (
          <>
            <p style={{ margin: 0, fontSize: 13.5, color: COLORS.text, lineHeight: 1.6, fontWeight: 600 }}>{ins.summary}</p>
            <Section icon={CheckCircle2} color="#2E6B4E" title="Looking good" items={ins.positives} />
            <Section icon={AlertTriangle} color="#92400E" title="Worth attention" items={ins.concerns} />
            <Section icon={Lightbulb} color={COLORS.primaryDark} title="Suggestions" items={ins.suggestions} />
            {ins.followUp && <p style={{ margin: "14px 0 0", fontSize: 12.5, color: COLORS.text }}><b>Follow-up:</b> {ins.followUp}</p>}
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>Select a profile to see insights.</p>
        )}
        <p style={{ margin: "14px 0 0", fontSize: 11, color: COLORS.primaryDark, fontStyle: "italic" }}>
          ⚠️ AI insights are for information only and are not a diagnosis. Always consult a doctor about your results.
        </p>
      </div>
    </div>
  );
}

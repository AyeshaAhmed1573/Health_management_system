import { useState } from "react";
import { HeartPulse, LogIn, ChevronDown, AlertCircle } from "lucide-react";
import { useAuth, mockUsers, type Role } from "./auth";

const C = {
  primary: "#6FB3B5",
  secondary: "#DCE8EE",
  accent: "#9BD3D5",
  bg: "#F4F6F8",
  card: "#FFFFFF",
  text: "#2F3A40",
  muted: "#7A8A92",
  primaryDark: "#4E8C8E",
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "patient", label: "Patient" },
  { value: "lab", label: "Lab Staff" },
  { value: "pharmacy", label: "Pharmacy Staff" },
];

function usersByRole(role: Role) {
  return Object.values(mockUsers).filter((u) => u.role === role);
}

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  const candidates = usersByRole(selectedRole);

  function handleRoleChange(role: Role) {
    setSelectedRole(role);
    setSelectedId("");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setError("Please select a user.");
      return;
    }
    const ok = login(selectedId);
    if (!ok) setError("User not found. Please try again.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Manrope','Segoe UI',system-ui,sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: C.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(111,179,181,0.35)",
            }}
          >
            <HeartPulse size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
              Vitalis
            </p>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 600 }}>
              Intelligent Healthcare Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: C.card,
            borderRadius: 18,
            padding: "32px 30px",
            boxShadow: "0 2px 24px rgba(47,58,64,0.08)",
            border: `1px solid ${C.secondary}`,
          }}
        >
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.text }}>
            Sign in
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 13.5, color: C.muted }}>
            Select your role and account to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Role select */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                Role
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  style={{
                    width: "100%",
                    appearance: "none",
                    padding: "11px 36px 11px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    color: C.text,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  color={C.muted}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
              </div>
            </div>

            {/* User select */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                User account
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedId}
                  onChange={(e) => { setSelectedId(e.target.value); setError(""); }}
                  style={{
                    width: "100%",
                    appearance: "none",
                    padding: "11px 36px 11px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${error ? "#C97B63" : C.secondary}`,
                    background: C.bg,
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    color: selectedId ? C.text : C.muted,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="">-- Select user --</option>
                  {candidates.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.specialization ? ` — ${u.specialization}` : ""}
                      {u.condition ? ` (${u.condition})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  color={C.muted}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
              </div>
              {error && (
                <p style={{ margin: "7px 0 0", fontSize: 12, color: "#C97B63", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                  <AlertCircle size={13} />
                  {error}
                </p>
              )}
            </div>

            {/* User info preview */}
            {selectedId && (() => {
              const u = mockUsers[selectedId];
              if (!u) return null;
              return (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: C.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: C.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.text }}>{u.name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: C.primaryDark, fontWeight: 600 }}>
                      ID: {u.id}
                      {u.specialization ? ` · ${u.specialization}` : ""}
                      {u.age != null ? ` · Age ${u.age}` : ""}
                    </p>
                  </div>
                </div>
              );
            })()}

            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px",
                borderRadius: 11,
                border: "none",
                background: C.primary,
                color: "#fff",
                fontFamily: "inherit",
                fontSize: 14.5,
                fontWeight: 800,
                cursor: "pointer",
                marginTop: 4,
                boxShadow: "0 4px 14px rgba(111,179,181,0.4)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
            >
              <LogIn size={16} />
              Sign in
            </button>
          </form>
        </div>

        {/* Quick-reference IDs */}
        <div
          style={{
            marginTop: 20,
            padding: "14px 18px",
            borderRadius: 12,
            background: C.card,
            border: `1px solid ${C.secondary}`,
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: C.text, display: "block", marginBottom: 4 }}>Demo accounts</strong>
          admin1 · admin2 · doc1 – doc4 · pat1 – pat11 · lab1 · lab2 · pharm1 · pharm2
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { KeyRound } from "lucide-react";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) return setError("Use at least 8 characters, including a letter and a number.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try { await authApi.resetPassword({ email, token, newPassword: password }); setDone(true); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl bg-card border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10"><KeyRound className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Choose a new password</h1>
        </div>
        {!token || !email ? (
          <p className="text-sm">This reset link is incomplete. <a href="/forgot-password" className="text-primary font-semibold">Request a new one</a>.</p>
        ) : done ? (
          <p className="text-sm">Password updated. <a href="/patient-login" className="text-primary font-semibold">Sign in</a> with your new password.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="rounded-xl" />
            <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="rounded-xl" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-xl py-6">{busy ? "Saving…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}

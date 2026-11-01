import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await authApi.forgotPassword(email); setSent(true); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl bg-card border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10"><KeyRound className="w-6 h-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Forgot password</h1>
        </div>
        {sent ? (
          <p className="text-sm leading-relaxed">If that email is registered, a reset link is on its way. It expires in 30 minutes.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your account email and we'll send you a reset link.</p>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-xl py-6">{busy ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}
        <a href="/patient-login" className="block mt-6 text-sm text-primary font-semibold">← Back to sign in</a>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function Security() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(null);
  const [step, setStep] = useState("idle"); // idle | code | disable
  const [code, setCode] = useState("");
  const [disablePw, setDisablePw] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = (err) => toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
  const wrap = async (fn) => { setBusy(true); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };

  useEffect(() => { authApi.me().then((d) => setEnabled(!!d.user?.twoFactorEnabled)).catch(() => setEnabled(false)); }, []);

  return (
    <div>
      <PageHeader title="Account security" description="Protect your health records with a strong password and two-step verification." icon={ShieldCheck} />
      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Two-step verification</h2>
          <p className="text-sm text-muted-foreground">When enabled, signing in also requires a 6-digit code sent to your email. Status: <b>{enabled === null ? "…" : enabled ? "On" : "Off"}</b></p>

          {enabled === false && step === "idle" && (
            <Button disabled={busy} className="rounded-xl" onClick={() => wrap(async () => { await authApi.startEnableTwoFactor(); setStep("code"); toast({ title: "Code sent", description: "Check your email." }); })}>Turn on</Button>
          )}
          {step === "code" && (
            <div className="flex gap-2 max-w-sm">
              <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} maxLength={6} placeholder="6-digit code" className="rounded-xl" />
              <Button disabled={busy || code.length !== 6} className="rounded-xl" onClick={() => wrap(async () => { await authApi.confirmEnableTwoFactor(code); setEnabled(true); setStep("idle"); setCode(""); toast({ title: "Two-step verification is on" }); })}>Confirm</Button>
            </div>
          )}
          {enabled && step === "idle" && <Button variant="outline" className="rounded-xl" onClick={() => setStep("disable")}>Turn off</Button>}
          {step === "disable" && (
            <div className="flex gap-2 max-w-sm">
              <Input type="password" value={disablePw} onChange={(e) => setDisablePw(e.target.value)} placeholder="Confirm with your password" className="rounded-xl" />
              <Button disabled={busy || !disablePw} className="rounded-xl" onClick={() => wrap(async () => { await authApi.disableTwoFactor(disablePw); setEnabled(false); setStep("idle"); setDisablePw(""); toast({ title: "Two-step verification is off" }); })}>Turn off</Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Change password</h2>
          <div className="grid gap-3 max-w-sm">
            <Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" className="rounded-xl" />
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (8+ chars, letter and number)" className="rounded-xl" />
            <Button disabled={busy || !cur || !next} className="rounded-xl" onClick={() => wrap(async () => { await authApi.changePassword(cur, next); setCur(""); setNext(""); toast({ title: "Password updated" }); })}>Update password</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

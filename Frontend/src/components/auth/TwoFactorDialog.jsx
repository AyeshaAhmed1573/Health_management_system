import { useState } from 'react';
import { API_BASE } from '@/lib/session';
import { ShieldCheck } from 'lucide-react';

/** Second step of login when the account has two-factor authentication enabled. */
export default function TwoFactorDialog({ email, twoFactorToken, onSuccess, onCancel }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorToken, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Verification failed');
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Two-step verification</h2>
            <p className="text-xs text-muted-foreground">We emailed a 6-digit code to {email}</p>
          </div>
        </div>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.5em] font-semibold outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border py-2.5 font-semibold">Cancel</button>
          <button type="submit" disabled={busy || code.length !== 6} className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-white disabled:opacity-50">
            {busy ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

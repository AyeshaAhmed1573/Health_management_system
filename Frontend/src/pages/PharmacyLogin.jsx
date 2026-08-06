import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';
import { HeartPulse, LogIn, AlertCircle, Pill } from 'lucide-react';

const C = {
  primary: '#6FB3B5',
  secondary: '#DCE8EE',
  accent: '#9BD3D5',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#2F3A40',
  muted: '#7A8A92',
  primaryDark: '#4E8C8E',
};

export default function PharmacyLogin() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, 'pharmacy');

    if (result.success) {
      navigate('/pharmacy/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Manrope','Segoe UI',system-ui,sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(111,179,181,0.35)',
            }}
          >
            <Pill size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
              Vitalis
            </p>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 600 }}>
              Pharmacy Portal
            </p>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            borderRadius: 18,
            padding: '32px 30px',
            boxShadow: '0 2px 24px rgba(47,58,64,0.08)',
            border: `1px solid ${C.secondary}`,
          }}
        >
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: C.text }}>
            Pharmacy Login
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: C.muted }}>
            Sign in to access your pharmacy dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pharmacy@vitalis.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${error ? '#C97B63' : C.secondary}`,
                  background: C.bg,
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  color: C.text,
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${error ? '#C97B63' : C.secondary}`,
                  background: C.bg,
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  color: C.text,
                  outline: 'none',
                }}
                required
              />
            </div>

            {error && (
              <p style={{ margin: '7px 0 0', fontSize: 12, color: '#C97B63', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <AlertCircle size={13} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px',
                borderRadius: 11,
                border: 'none',
                background: C.primary,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 14.5,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                boxShadow: '0 4px 14px rgba(111,179,181,0.4)',
                transition: 'background .15s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = C.primaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
            >
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            borderRadius: 12,
            background: C.card,
            border: `1px solid ${C.secondary}`,
            fontSize: 12,
            color: C.muted,
            textAlign: 'center',
          }}
        >
          <a href="/pharmacy-signup" style={{ color: C.primary, textDecoration: 'none', fontWeight: 600 }}>
            Create a pharmacy account →
          </a>
          <br />
          <a href="/" style={{ color: C.muted, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

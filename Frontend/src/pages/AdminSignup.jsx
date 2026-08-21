import { useState } from 'react';
import { useLocation } from 'wouter';
import { HeartPulse, UserPlus, AlertCircle, ShieldCheck, Key } from 'lucide-react';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSignup() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminSecretKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.adminSecretKey) {
      setError('Admin passcode is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          adminSecretKey: formData.adminSecretKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin signup failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/admin-login');
    } catch (err) {
      setError(err.message);
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
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
              Vitalis
            </p>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 600 }}>
              Admin Registration
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
            Create Admin Account
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: C.muted }}>
            Register to access the admin dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7 }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${C.secondary}`,
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@vitalis.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${C.secondary}`,
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
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${C.secondary}`,
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${C.secondary}`,
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
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${C.secondary}`,
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
                Admin Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <Key 
                  size={16} 
                  color={C.muted} 
                  style={{ 
                    position: 'absolute', 
                    left: 14, 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }} 
                />
                <input
                  type="password"
                  name="adminSecretKey"
                  value={formData.adminSecretKey}
                  onChange={handleChange}
                  placeholder="Enter admin passcode"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: 10,
                    border: `1.5px solid ${C.secondary}`,
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
              <p style={{ margin: '5px 0 0', fontSize: 11, color: C.muted }}>
                Contact system administrator for the admin passcode
              </p>
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
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
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
          <a href="/admin-login" style={{ color: C.primary, textDecoration: 'none', fontWeight: 600 }}>
            Already have an account? Sign in →
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

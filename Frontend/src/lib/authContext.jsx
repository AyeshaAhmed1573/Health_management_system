import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API_BASE, getStoredSession, saveSession, clearSession } from './session';
import TwoFactorDialog from '@/components/auth/TwoFactorDialog';

const AuthContext = createContext(null);

// roles that appear in "roleX" login pages -> must match the backend's User.role values
const ROLE_ALIASES = { lab: 'laboratory' };
const normalizeRole = (r) => ROLE_ALIASES[r] || r;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // Pending second step of a 2FA login: { email, twoFactorToken, resolve }
  const [twoFactor, setTwoFactor] = useState(null);
  const twoFactorRef = useRef(null);
  twoFactorRef.current = twoFactor;

  useEffect(() => {
    const { token: t, user: u } = getStoredSession();
    if (t && u) {
      // migrate the legacy plain keys (written by AdminSignup) to role-scoped ones
      if (localStorage.getItem('token')) saveSession(t, u);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const startSession = (data, expectedRole) => {
    if (expectedRole && data.user.role !== normalizeRole(expectedRole)) {
      throw new Error(`Invalid credentials for ${expectedRole} role`);
    }
    clearSession();
    saveSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return { success: true, user: data.user };
  };

  // Asks the user for the e-mailed code and resolves with the final login response.
  const askTwoFactorCode = (email, twoFactorToken) =>
    new Promise((resolve) => setTwoFactor({ email, twoFactorToken, resolve }));

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Login failed');

      // Optional two-factor step (backend returns requiresTwoFactor instead of a token)
      if (data.requiresTwoFactor) {
        const verified = await askTwoFactorCode(email, data.twoFactorToken);
        if (!verified) throw new Error('Two-factor verification cancelled');
        data = verified;
      }
      return startSession(data, role);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData, role, files = null) => {
    try {
      clearSession();
      const backendRole = normalizeRole(role);
      const hasFiles = files && Object.values(files).some(Boolean);

      let response;
      if (hasFiles) {
        // multipart: nested objects must travel as JSON text (backend parses them back)
        const form = new FormData();
        Object.entries({ ...userData, role: backendRole }).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        });
        // frontend file names -> field names the backend expects
        const FIELD_MAP = {
          medicalDegree: 'medicalDegreeDocument',
          licenseCertificate: 'licenseDocument',
          hospitalProof: 'hospitalProofDocument',
          clinicProof: 'clinicProofDocument',
          cnic: 'idProofDocument',
          profilePhoto: 'profileImage',
        };
        Object.entries(files).forEach(([k, file]) => {
          if (file) form.append(FIELD_MAP[k] || k, file);
        });
        response = await fetch(`${API_BASE}/auth/register`, { method: 'POST', body: form });
      } else {
        response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userData, role: backendRole }),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Registration failed');

      // doctor / lab / pharmacy accounts wait for admin approval and get no token
      if (data.requiresApproval || !data.token) {
        return { success: true, user: data.user, requiresApproval: true };
      }
      return startSession(data);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: () => !!token && !!user,
    hasRole: (requiredRole) => user?.role === normalizeRole(requiredRole),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {twoFactor && (
        <TwoFactorDialog
          email={twoFactor.email}
          twoFactorToken={twoFactor.twoFactorToken}
          onSuccess={(data) => { twoFactor.resolve(data); setTwoFactor(null); }}
          onCancel={() => { twoFactor.resolve(null); setTwoFactor(null); }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

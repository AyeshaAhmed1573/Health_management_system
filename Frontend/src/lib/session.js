// Single source of truth for the logged-in session in the browser.
// The auth context stores tokens under role-scoped keys (token_patient, token_doctor, ...),
// but older code read a plain "token" key that never exists - everything goes through here now.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export const ROLES = [
  'patient', 'doctor', 'admin', 'super_admin', 'laboratory', 'pharmacy', 'vendor_owner', 'vendor_staff',
];

const safeParse = (v) => { try { return JSON.parse(v); } catch { return null; } };

export function getStoredSession() {
  // legacy keys first (AdminSignup still writes them; AuthProvider migrates them on load)
  const legacyToken = localStorage.getItem('token');
  const legacyUser = safeParse(localStorage.getItem('user'));
  if (legacyToken && legacyUser) return { token: legacyToken, user: legacyUser };
  for (const role of ROLES) {
    const token = localStorage.getItem(`token_${role}`);
    const user = safeParse(localStorage.getItem(`user_${role}`));
    if (token && user) return { token, user };
  }
  return { token: null, user: null };
}

export const getStoredToken = () => getStoredSession().token;
export const getStoredUser = () => getStoredSession().user;

export function saveSession(token, user) {
  localStorage.setItem(`token_${user.role || 'default'}`, token);
  localStorage.setItem(`user_${user.role || 'default'}`, JSON.stringify(user));
}

export function clearSession() {
  for (const role of [...ROLES, 'default']) {
    localStorage.removeItem(`token_${role}`);
    localStorage.removeItem(`user_${role}`);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Many components call fetch('/api/...') with a relative URL and/or without an
 * Authorization header. Since the backend now requires login for medical data, patch fetch once:
 *  - relative /api/... URLs are sent to the API server (there is no dev proxy)
 *  - the stored token is attached to every request to the API
 */
export function installFetchAuth() {
  if (window.__fetchAuthInstalled) return;
  window.__fetchAuthInstalled = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    let url = typeof input === 'string' ? input : input?.url;
    const isRelativeApi = typeof url === 'string' && url.startsWith('/api/');
    if (isRelativeApi) url = API_ORIGIN + url;
    // Many pages hard-code http://localhost:5000; follow VITE_API_URL if the backend runs elsewhere.
    const HARDCODED = 'http://localhost:3000';
    const rewritten = typeof url === 'string' && url.startsWith(HARDCODED + '/') && API_ORIGIN !== HARDCODED;
    if (rewritten) url = API_ORIGIN + url.slice(HARDCODED.length);

    const toApi = typeof url === 'string' && (url.startsWith(API_BASE) || url.startsWith(`${API_ORIGIN}/api/`));
    if (!toApi) return nativeFetch(input, init);

    const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
    const token = getStoredToken();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return nativeFetch(typeof input === 'string' || isRelativeApi || rewritten ? url : input, { ...init, headers });
  };
}

/**
 * Open a file that now sits behind authentication (admin documents, legacy local report files).
 * <a href> and window.open cannot send an Authorization header, so fetch it and open a blob.
 */
export async function openProtectedFile(url) {
  // Old records store '/uploads/<folder>/<file>' (no longer public); map to the admin-only file route.
  if (url.startsWith('/uploads/')) url = '/api/admin/files/' + url.slice('/uploads/'.length);
  const absolute = url.startsWith('http') ? url : API_ORIGIN + url;
  const res = await fetch(absolute);
  if (!res.ok) throw new Error('Could not open the file (access denied or missing)');
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    const data = await res.json();
    if (data.url) { window.open(data.url, '_blank', 'noopener'); return; }
    throw new Error('File not available');
  }
  const blobUrl = URL.createObjectURL(await res.blob());
  window.open(blobUrl, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

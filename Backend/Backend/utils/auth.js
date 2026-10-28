import jwt from 'jsonwebtoken';

// No hard-coded fallback secrets: a missing secret must fail loudly, otherwise
// anyone could forge tokens signed with the well-known default.
const accessSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
};
// If no dedicated refresh secret is configured, derive one from the access secret
// so the two token types are still never interchangeable.
const refreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || `${accessSecret()}::refresh`;

// Access token (short-lived)
export function generateAccessToken(payload) {
  return jwt.sign(payload, accessSecret(), { expiresIn: '15m' });
}

// Refresh token (long-lived)
export function generateRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret(), { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret());
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}

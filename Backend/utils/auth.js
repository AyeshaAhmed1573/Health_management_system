import jwt from 'jsonwebtoken';

// Generate access token (short-lived, e.g., 15 minutes)
export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  });
}

// Generate refresh token (long-lived, e.g., 7 days)
export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: '7d',
  });
}

// Verify access token
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
}

// Verify refresh token
export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
}

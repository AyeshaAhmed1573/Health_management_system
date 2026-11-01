import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/User.model.js';
import { sendMail } from '../Services/mailService.js';
import { notify } from '../Services/notificationService.js';
import { createAuditLog } from '../Services/auditLogService.js';
import { getUserId } from '../utils/access.js';

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const safeEq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const normEmail = (e) => String(e || '').toLowerCase().trim();
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const weak = (p) => !PASSWORD_RULE.test(String(p || ''));
const audit = (req, userId, action) =>
  createAuditLog({ userId, action, entityType: 'User', entityId: userId, ipAddress: req.ip, userAgent: req.get('user-agent') });

export const signSession = (user) =>
  jwt.sign({ id: user._id, role: user.role, ...(user.vendorId ? { vendorId: user.vendorId } : {}) }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ---------------------------------------------------------------- password reset
// POST /api/auth/forgot-password { email } - always answers 200 so accounts can't be enumerated
export async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: normEmail(req.body.email) });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = sha256(token);
      user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const base = process.env.FRONTEND_URL || 'http://localhost:5173';
      const link = `${base}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
      await sendMail({
        to: user.email, subject: 'Reset your Vitalis password',
        text: `Use this link within 30 minutes to reset your password:\n${link}\n\nIf you didn't ask for this, ignore this email.`,
      });
      await audit(req, user._id, 'password_reset_requested');
    }
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not process the request' });
  }
}

// POST /api/auth/reset-password { email, token, newPassword }
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    if (weak(newPassword)) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and include a letter and a number' });
    const user = await User.findOne({ email: normEmail(email) }).select('+resetPasswordToken +resetPasswordExpiry');
    const valid = user?.resetPasswordToken && user.resetPasswordExpiry > new Date() && safeEq(user.resetPasswordToken, sha256(token));
    if (!valid) return res.status(400).json({ success: false, error: 'Reset link is invalid or has expired' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    await notify(user._id, { type: 'security', title: 'Password changed', message: 'Your password was reset. If this was not you, contact support immediately.', email: true });
    await audit(req, user._id, 'password_reset_completed');
    res.json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not reset password' });
  }
}

// POST /api/auth/change-password { currentPassword, newPassword } (logged in)
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (weak(newPassword)) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and include a letter and a number' });
    const user = await User.findById(getUserId(req));
    if (!user || !(await bcrypt.compare(String(currentPassword || ''), user.passwordHash))) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not change password' });
  }
}

// ---------------------------------------------------------------- optional 2FA (email code)
const MAX_ATTEMPTS = 5;

/** Generate + email a 6-digit code. Stored hashed on the user. */
export async function issueTwoFactorCode(user) {
  const code = String(crypto.randomInt(100000, 1000000));
  user.otpSecret = sha256(code);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.twoFactorAttempts = 0;
  await user.save();
  await sendMail({ to: user.email, subject: 'Your Vitalis verification code', text: `Your code is ${code}. It expires in 10 minutes.` });
}

async function checkCode(user, code) {
  if (!user.otpSecret || !user.otpExpiry || user.otpExpiry < new Date()) return false;
  if ((user.twoFactorAttempts || 0) >= MAX_ATTEMPTS) return false;
  const ok = safeEq(user.otpSecret, sha256(code));
  if (!ok) { user.twoFactorAttempts = (user.twoFactorAttempts || 0) + 1; await user.save(); return false; }
  user.otpSecret = undefined; user.otpExpiry = undefined; user.twoFactorAttempts = 0;
  return true;
}
const loadWithOtp = (id) => User.findById(id).select('+otpSecret +otpExpiry +twoFactorAttempts');

// POST /api/auth/2fa/enable -> emails a confirmation code
export async function startEnableTwoFactor(req, res) {
  try {
    const user = await loadWithOtp(getUserId(req));
    if (user.twoFactorEnabled) return res.status(409).json({ success: false, error: 'Two-factor authentication is already enabled' });
    await issueTwoFactorCode(user);
    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/auth/2fa/confirm { code }
export async function confirmEnableTwoFactor(req, res) {
  try {
    const user = await loadWithOtp(getUserId(req));
    if (!(await checkCode(user, String(req.body.code || '')))) return res.status(400).json({ success: false, error: 'Invalid or expired code' });
    user.twoFactorEnabled = true;
    await user.save();
    await audit(req, user._id, 'two_factor_changed');
    res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/auth/2fa/disable { password }
export async function disableTwoFactor(req, res) {
  try {
    const user = await User.findById(getUserId(req));
    if (!(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(400).json({ success: false, error: 'Password is incorrect' });
    user.twoFactorEnabled = false;
    await user.save();
    await audit(req, user._id, 'two_factor_changed');
    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/auth/2fa/verify { twoFactorToken, code } - second step of login
export async function verifyTwoFactorLogin(req, res) {
  try {
    let payload;
    try { payload = jwt.verify(String(req.body.twoFactorToken || ''), process.env.JWT_SECRET); } catch { payload = null; }
    if (!payload || payload.purpose !== '2fa') return res.status(401).json({ success: false, error: 'Login session expired. Please log in again.' });

    const user = await loadWithOtp(payload.id);
    if (!user || !(await checkCode(user, String(req.body.code || '')))) return res.status(400).json({ success: false, error: 'Invalid or expired code' });
    await user.save();
    await audit(req, user._id, 'user_login');
    res.json({
      message: 'Login successful', token: signSession(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
}

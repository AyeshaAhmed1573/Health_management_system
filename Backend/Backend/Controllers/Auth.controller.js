import User from '../Models/User.model.js';
import Doctor from '../Models/Doctor.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { issueTwoFactorCode } from './AccountSecurity.controller.js';
import { createAuditLog } from '../Services/auditLogService.js';

// Roles that need admin approval -> their profile model.
const PROFILE_MODELS = {
  doctor: Doctor,
  laboratory: Laboratory,
  pharmacy: Pharmacy,
};

// Roles a person may self-register as ('admin' is deliberately excluded)
const SELF_REGISTER_ROLES = ['patient', ...Object.keys(PROFILE_MODELS)];

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const placeholderLicense = () => `PENDING-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const buildProfile = (role, userId, b) => {
  const base = { userId, licenseNumber: b.licenseNumber || placeholderLicense() };
  if (role === 'doctor') {
    return {
      ...base,
      specialization: b.specialization || 'Not specified',
      qualification: b.qualification || 'Not specified',
      experienceYears: b.experienceYears,
      hospital: typeof b.hospital === 'string' ? { name: b.hospital } : b.hospital,
      clinic: typeof b.clinic === 'string' ? { name: b.clinic } : b.clinic,
    };
  }
  if (role === 'pharmacy') {
    return {
      ...base,
      pharmacyName: b.pharmacyName || 'Not specified',
      address: b.address || 'Not specified',
    };
  }
  // lab / laboratory
  return {
    ...base,
    labName: b.labName || 'Not specified',
    address: b.address || 'Not specified',
  };
};

// REGISTER
export async function register(req, res) {
  try {
    const { name, email, password, phone, role = 'patient' } = req.body;

    if (!SELF_REGISTER_ROLES.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ email: email?.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const ProfileModel = PROFILE_MODELS[role];
    const requiresApproval = Boolean(ProfileModel);

    const user = await User.create({
      name, email, passwordHash, phone, role,
      isVerified: !requiresApproval,
    });

    if (requiresApproval) {
      try {
        await ProfileModel.create({
          ...buildProfile(role, user._id, req.body),
          verificationStatus: 'pending',
        });
      } catch (profileErr) {
        await User.findByIdAndDelete(user._id); // don't leave an orphan user
        throw profileErr;
      }
    }

    const userData = {
      id: user._id, name: user.name, email: user.email,
      role: user.role, isVerified: user.isVerified,
    };

    // Unapproved accounts get no token until an admin approves them
    if (requiresApproval) {
      return res.status(201).json({
        message: 'Registration successful. Please wait for admin approval.',
        user: userData,
        requiresApproval: true,
      });
    }

    res.status(201).json({
      message: 'Registered successfully',
      token: generateToken(user),
      user: userData,
      requiresApproval: false,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!isMatch) {
      createAuditLog({ userId: user._id, action: 'user_login_failed', entityType: 'User', entityId: user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const ProfileModel = PROFILE_MODELS[user.role];
    if (ProfileModel) {
      const profile = await ProfileModel.findOne({ userId: user._id });
      const label = user.role === 'doctor' ? 'doctor'
        : user.role === 'pharmacy' ? 'pharmacy' : 'laboratory';

      if (profile?.verificationStatus === 'rejected') {
        return res.status(403).json({
          message: `Your ${label} registration has been rejected. Please contact support for assistance.`,
          reason: profile.verificationNote,
        });
      }
      if (profile?.verificationStatus === 'pending' || !user.isVerified) {
        return res.status(403).json({
          message: `Your ${label} registration is pending admin approval. Please wait for verification.`,
          requiresApproval: true,
        });
      }
    }

    // Optional two-factor step (SRS 4.1)
    if (user.twoFactorEnabled) {
      await issueTwoFactorCode(user);
      return res.status(200).json({
        requiresTwoFactor: true,
        twoFactorToken: jwt.sign({ id: user._id, purpose: '2fa' }, process.env.JWT_SECRET, { expiresIn: '10m' }),
        message: 'A verification code was sent to your email',
      });
    }

    createAuditLog({ userId: user._id, action: 'user_login', entityType: 'User', entityId: user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user),
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET ME
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET PENDING USERS (Admin only, enforced by requireAdmin middleware)
export async function getPendingUsers(req, res) {
  try {
    const profileLists = await Promise.all(
      [Doctor, Laboratory, Pharmacy].map((M) =>
        M.find({ verificationStatus: 'pending' }).select('userId')
      )
    );
    const userIds = profileLists.flat().map((p) => p.userId);

    const pendingUsers = await User.find({ _id: { $in: userIds } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({ pendingUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// APPROVE USER (Admin only)
export async function approveUser(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ProfileModel = PROFILE_MODELS[user.role];
    if (!ProfileModel)
      return res.status(400).json({ message: 'This user does not require approval' });

    await ProfileModel.updateOne(
      { userId: user._id },
      { verificationStatus: 'verified', verificationNote: 'Approved by admin' }
    );
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: 'User approved successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// REJECT USER (Admin only) - keeps the record so the user sees the reason on login
export async function rejectUser(req, res) {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ProfileModel = PROFILE_MODELS[user.role];
    if (!ProfileModel)
      return res.status(400).json({ message: 'This user does not require approval' });

    await ProfileModel.updateOne(
      { userId: user._id },
      { verificationStatus: 'rejected', verificationNote: reason || 'Not specified' }
    );
    user.isVerified = false;
    await user.save();

    res.status(200).json({ message: 'User rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

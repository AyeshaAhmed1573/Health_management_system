import User from '../Models/User.model.js';  // ✅ default import
import Doctor from '../Models/Doctor.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// REGISTER
export async function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, passwordHash, phone, role: role || 'patient',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    // Check verification status for professional roles
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor && doctor.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Your doctor registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (doctor && doctor.verificationStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your doctor registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    if (user.role === 'laboratory') {
      const laboratory = await Laboratory.findOne({ userId: user._id });
      if (laboratory && laboratory.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Your laboratory registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (laboratory && laboratory.verificationStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your laboratory registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    if (user.role === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ userId: user._id });
      if (pharmacy && pharmacy.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Your pharmacy registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (pharmacy && pharmacy.verificationStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Your pharmacy registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
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
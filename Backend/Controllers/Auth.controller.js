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

    const { name, email, password, phone, role, specialization, licenseNumber, qualification, experienceYears, labName, pharmacyName, address, hospital, clinic } = req.body;



    const existing = await User.findOne({ email });

    if (existing)

      return res.status(400).json({ message: 'Email already registered' });



    const passwordHash = await bcrypt.hash(password, 10);



    // Roles that require admin approval

    const rolesRequiringApproval = ['doctor', 'lab', 'pharmacy'];

    const requiresApproval = rolesRequiringApproval.includes(role);

    

    const user = await User.create({

      name, email, passwordHash, phone, role: role || 'patient',

      isVerified: !requiresApproval, // Auto-verify patients, others need approval

    });



    // Create profile record for roles requiring approval

    if (role === 'doctor') {

      await Doctor.create({

        userId: user._id,

        licenseNumber: 'PENDING-' + Date.now(), // Temporary placeholder

        specialization: 'Not specified',

        qualification: 'Not specified',

      });

    } else if (role === 'lab') {

      await Laboratory.create({

        userId: user._id,

        licenseNumber: 'PENDING-' + Date.now(), // Temporary placeholder

        labName: 'Not specified',

        address: 'Not specified',

      });

    } else if (role === 'pharmacy') {

      await Pharmacy.create({

        userId: user._id,

        licenseNumber: 'PENDING-' + Date.now(), // Temporary placeholder

        pharmacyName: 'Not specified',

        address: 'Not specified',

      });

    }



    const token = generateToken(user);



    res.status(201).json({

      message: requiresApproval 

        ? 'Registration successful. Please wait for admin approval.' 

        : 'Registered successfully',

      token,

      user: { 

        id: user._id, 

        name: user.name, 

        email: user.email, 

        role: user.role,

        isVerified: user.isVerified 

      },

      requiresApproval,

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



    // Check if user is verified (for roles requiring approval)

    if (!user.isVerified) {

      return res.status(403).json({ 

        message: 'Your account is pending admin approval. Please wait for approval.',

        requiresApproval: true 

      });

    }



    const token = generateToken(user);



    res.status(200).json({

      message: 'Login successful',

      token,

      user: { 

        id: user._id, 

        name: user.name, 

        email: user.email, 

        role: user.role,

        isVerified: user.isVerified 

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



// GET PENDING USERS (Admin only)

export async function getPendingUsers(req, res) {

  try {

    // Check if user is admin

    const currentUser = await User.findById(req.user.id);

    if (currentUser.role !== 'admin') {

      return res.status(403).json({ message: 'Admin access required' });

    }



    const pendingUsers = await User.find({ 

      isVerified: false,

      role: { $in: ['doctor', 'lab', 'pharmacy'] }

    }).select('-passwordHash').sort({ createdAt: -1 });



    res.status(200).json({ pendingUsers });

  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });

  }

}



// APPROVE USER (Admin only)

export async function approveUser(req, res) {

  try {

    const { userId } = req.params;

    

    // Check if current user is admin

    const currentUser = await User.findById(req.user.id);

    if (currentUser.role !== 'admin') {

      return res.status(403).json({ message: 'Admin access required' });

    }



    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }



    user.isVerified = true;

    await user.save();



    res.status(200).json({ 

      message: 'User approved successfully',

      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }

    });

  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });

  }

}



// REJECT USER (Admin only)

export async function rejectUser(req, res) {

  try {

    const { userId } = req.params;

    

    // Check if current user is admin

    const currentUser = await User.findById(req.user.id);

    if (currentUser.role !== 'admin') {

      return res.status(403).json({ message: 'Admin access required' });

    }



    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }



    // Delete associated profile records

    if (user.role === 'doctor') {

      await Doctor.deleteOne({ userId });

    } else if (user.role === 'lab') {

      await Laboratory.deleteOne({ userId });

    } else if (user.role === 'pharmacy') {

      await Pharmacy.deleteOne({ userId });

    }



    await User.findByIdAndDelete(userId);



    res.status(200).json({ message: 'User rejected and removed successfully' });

  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });

  }

}
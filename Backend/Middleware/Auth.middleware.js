import jwt from 'jsonwebtoken';
import Doctor from '../Models/Doctor.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Pharmacy from '../Models/Pharmacy.model.js';

// protect any route — must be logged in
export function protect(req, res, next) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ success: false, error: msg });
  }
}

// restrict to specific roles
// usage: restrictTo('admin')  or  restrictTo('doctor', 'admin')
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        error: `Access restricted to: ${roles.join(', ')}.`
      });
    }
    next();
  };
}

// check verification status for professional roles
// this middleware re-checks approval status on each request to block rejected users
export async function checkVerificationStatus(req, res, next) {
  try {
    if (req.user?.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (doctor && doctor.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          success: false,
          error: 'Your doctor registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (doctor && doctor.verificationStatus === 'pending') {
        return res.status(403).json({ 
          success: false,
          error: 'Your doctor registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    if (req.user?.role === 'laboratory') {
      const laboratory = await Laboratory.findOne({ userId: req.user.id });
      if (laboratory && laboratory.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          success: false,
          error: 'Your laboratory registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (laboratory && laboratory.verificationStatus === 'pending') {
        return res.status(403).json({ 
          success: false,
          error: 'Your laboratory registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    if (req.user?.role === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
      if (pharmacy && pharmacy.verificationStatus === 'rejected') {
        return res.status(403).json({ 
          success: false,
          error: 'Your pharmacy registration has been rejected. Please contact support for assistance.' 
        });
      }
      if (pharmacy && pharmacy.verificationStatus === 'pending') {
        return res.status(403).json({ 
          success: false,
          error: 'Your pharmacy registration is pending admin approval. Please wait for verification.' 
        });
      }
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error checking verification status.' });
  }
}
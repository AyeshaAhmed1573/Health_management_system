import nodemailer from 'nodemailer';
import Otp from '../Models/Otp.model.js';
import User from '../Models/User.model.js';

// Email transporter configuration
const createTransporter = () => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    // Add these options for better compatibility
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// HTML email template
const createEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #6FB3B5;
        }
        .title {
          font-size: 24px;
          color: #2F3A40;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #7A8A92;
          margin-bottom: 30px;
        }
        .otp-box {
          background-color: #DCE8EE;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #6FB3B5;
          letter-spacing: 8px;
        }
        .info {
          font-size: 14px;
          color: #7A8A92;
          text-align: center;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #7A8A92;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Vitalis Healthcare</div>
        </div>
        <h1 class="title">Verify Your Email</h1>
        <p class="subtitle">Thank you for signing up. Please use the following OTP to verify your email address.</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p class="info">This OTP will expire in 5 minutes.</p>
        <p class="info">If you didn't request this code, please ignore this email.</p>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists',
      });
    }

    // Delete any existing unverified OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase(), verified: false });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5* 60 * 1000); // 5 minutes from now

    // Save OTP to database
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
    });

    // Send email
    const transporter = createTransporter();
    
    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        error: 'Email configuration invalid. Please check EMAIL_USER and EMAIL_APP_PASSWORD.',
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Vitalis Healthcare',
      html: createEmailTemplate(otp),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      success: false,
      error: `Failed to send OTP: ${error.message}`,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required',
      });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.',
      });
    }

    // Mark as verified and delete the record (one-time use)
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again later.',
    });
  }
};

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, Clock, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const C = {
  primary: '#6FB3B5',
  secondary: '#DCE8EE',
  accent: '#9BD3D5',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#2F3A40',
  muted: '#7A8A92',
  primaryDark: '#4E8C8E',
  error: '#C97B63',
};

export function OtpVerification({ onVerified, email: initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Countdown timer
  useEffect(() => {
    if (otpSent && timeLeft > 0 && !isVerified) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [otpSent, timeLeft, isVerified]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setTimeLeft(300);
        setCanResend(false);
        setError('');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        setError('');
        // Call the callback with verified email
        onVerified(email);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtpSent(false);
    setOtp('');
    setTimeLeft(120);
    setCanResend(false);
    handleSendOtp();
  };

  // Handle OTP input (6 digits)
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  if (isVerified) {
    return (
      <div
        style={{
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: '#DCE8EE',
          borderLeft: '4px solid #6FB3B5',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <CheckCircle style={{ color: '#6FB3B5', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: C.text }}>
            Email Verified Successfully
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: C.muted }}>
            {email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {!otpSent ? (
        // Step 1: Email input
        <div>
          <Label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: C.text }}>
            Email Address <span style={{ color: C.primary }}>*</span>
          </Label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.muted,
                  width: '18px',
                  height: '18px',
                }}
              />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: `1.5px solid ${error ? C.error : C.secondary}`,
                  fontSize: '14px',
                }}
              />
            </div>
            <Button
              onClick={handleSendOtp}
              disabled={!email || loading}
              style={{
                padding: '12px 24px',
                backgroundColor: email && !loading ? C.primary : C.secondary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: email && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
          {error && (
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: C.error, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              {error}
            </p>
          )}
        </div>
      ) : (
        // Step 2: OTP input
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Label htmlFor="otp" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: C.text }}>
              Enter OTP <span style={{ color: C.primary }}>*</span>
            </Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1.5px solid ${error ? C.error : C.secondary}`,
                fontSize: '18px',
                letterSpacing: '4px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            />
          </div>

          {/* Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: C.secondary,
              borderRadius: '8px',
            }}
          >
            <Clock style={{ width: '16px', height: '16px', color: C.primaryDark }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: C.primaryDark }}>
              {formatTime(timeLeft)}
            </span>
            <span style={{ fontSize: '13px', color: C.muted }}>remaining</span>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: otp.length === 6 && !loading ? C.primary : C.secondary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          {/* Resend OTP */}
          {canResend ? (
            <Button
              onClick={handleResendOtp}
              disabled={loading}
              variant="outline"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FFFFFF',
                color: C.primary,
                border: `1.5px solid ${C.primary}`,
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Resend OTP
            </Button>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '13px', color: C.muted }}>
              Didn't receive the code? Wait for the timer to expire to resend.
            </p>
          )}

          {/* Error Message */}
          {error && (
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: C.error, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <AlertCircle style={{ width: '14px', height: '14px' }} />
              {error}
            </p>
          )}

          {/* Change Email */}
          <button
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setError('');
            }}
            style={{
              display: 'block',
              margin: '16px auto 0',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: C.primary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Change email address
          </button>
        </div>
      )}
    </div>
  );
}

import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';



export function AccountSetup({ formData, updateFormData, error, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div>
      <h2 className="mb-6" style={{ color: '#2F3A40' }}>
        Account Setup
      </h2>

      <div className="space-y-6">
        {/* Username */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Username <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => updateFormData('username', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Choose a username"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Password <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all pr-12"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" style={{ color: '#7A8A92' }} />
              ) : (
                <Eye className="w-5 h-5" style={{ color: '#7A8A92' }} />
              )}
            </button>
          </div>
          <p className="text-sm mt-2" style={{ color: '#7A8A92' }}>
            Password must be at least 8 characters with uppercase, lowercase, and numbers
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Confirm Password <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all pr-12"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" style={{ color: '#7A8A92' }} />
              ) : (
                <Eye className="w-5 h-5" style={{ color: '#7A8A92' }} />
              )}
            </button>
          </div>
          {formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-sm mt-2" style={{ color: '#d4183d' }}>
                Passwords do not match
              </p>
            )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Terms and Conditions */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: '#F4F6F8',
            borderLeft: '4px solid #6FB3B5',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer mt-0.5"
              style={{
                borderColor: formData.termsAccepted ? '#6FB3B5' : '#DCE8EE',
                backgroundColor: formData.termsAccepted ? '#6FB3B5' : '#FFFFFF',
              }}
              onClick={() => updateFormData('termsAccepted', !formData.termsAccepted)}
            >
              {formData.termsAccepted && (
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div>
              <p style={{ color: '#2F3A40' }}>
                I agree to the{' '}
                <span style={{ color: '#6FB3B5', cursor: 'pointer' }}>
                  Terms and Conditions
                </span>{' '}
                and{' '}
                <span style={{ color: '#6FB3B5', cursor: 'pointer' }}>
                  Privacy Policy
                </span>{' '}
                of the Medix Healthcare Platform
              </p>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#DCE8EE',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                  fill="#6FB3B5"
                />
              </svg>
            </div>
            <div>
              <p style={{ color: '#2F3A40' }}>
                After submitting your registration, your pharmacy account will be reviewed by our admin team. You will receive a confirmation email once your account is verified and approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, ChevronLeft, CheckCircle, Info } from 'lucide-react';

export function AccountForm({
  formData,
  updateFormData,
  onSubmit,
  onPrevious,
}) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#2F3A40' }}>
          Account Setup
        </h3>
        <p className="text-base" style={{ color: '#7A8A92' }}>
          Set up your password to secure your account
        </p>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Lock className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => updateFormData({ password: e.target.value })}
            className="h-12 text-base"
            style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
          />
          <p className="text-sm flex items-center gap-2 mt-2" style={{ color: '#7A8A92' }}>
            <Info className="w-4 h-4" />
            Use at least 8 characters with a mix of letters, numbers, and symbols
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Lock className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) =>
              updateFormData({ confirmPassword: e.target.value })
            }
            className="h-12 text-base"
            style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
          />
          {formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                <Info className="w-4 h-4" />
                Passwords do not match
              </p>
            )}
        </div>

        {/* Information Panel */}
        <div className="border rounded-xl p-5 mt-8" style={{ backgroundColor: '#DCE8EE', borderColor: '#9BD3D5', borderWidth: '1px' }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#6FB3B5' }} />
            <div className="text-sm">
              <p className="font-semibold text-base mb-3" style={{ color: '#2F3A40' }}>
                Before you submit:
              </p>
              <ul className="space-y-2" style={{ color: '#2F3A40' }}>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#6FB3B5' }}></span>
                  <span>All information provided is accurate and complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#6FB3B5' }}></span>
                  <span>All uploaded documents are valid and authentic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#6FB3B5' }}></span>
                  <span>Your account will be under "Pending Approval" status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#6FB3B5' }}></span>
                  <span>Admin verification is required before you can consult</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-10 h-12 text-base font-medium rounded-lg shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: '#DCE8EE', color: '#2F3A40', borderWidth: '1px' }}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={onSubmit}
          disabled={
            !formData.password ||
            !formData.confirmPassword ||
            formData.password !== formData.confirmPassword
          }
          className="text-white px-10 h-12 text-base font-medium rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6FB3B5' }}
        >
          Submit for Verification
        </Button>
      </div>
    </div>
  );
}
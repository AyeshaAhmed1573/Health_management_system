import { Card } from './ui/card';
import { CheckCircle, Clock, Mail, Stethoscope } from 'lucide-react';
import { Button } from './ui/button';

export function SubmissionSuccess() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <Card 
        className="border-0 shadow-xl text-center" 
        style={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '64px 48px'
        }}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-8 rounded-full shadow-lg" style={{ backgroundColor: '#9BD3D5' }}>
            <CheckCircle className="w-20 h-20" style={{ color: '#6FB3B5' }} />
          </div>
        </div>

        {/* Header with Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg shadow-md" style={{ backgroundColor: '#6FB3B5' }}>
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#6FB3B5' }}>
            Medix
          </h1>
        </div>

        <h2 className="text-3xl font-bold mb-4" style={{ color: '#2F3A40' }}>
          Registration Submitted Successfully!
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#7A8A92' }}>
          Thank you for submitting your registration. Your account is now under review by our admin team.
        </p>

        {/* Status Card */}
        <div 
          className="border-2 rounded-xl p-6 mb-8 shadow-sm" 
          style={{ 
            backgroundColor: '#FFF9E6', 
            borderColor: '#F5D547' 
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Clock className="w-7 h-7" style={{ color: '#D4A017' }} />
            <h3 className="text-2xl font-bold" style={{ color: '#8B6F00' }}>
              Status Approval
            </h3>
          </div>
          <p className="text-base" style={{ color: '#8B6F00' }}>
            An admin must verify the account before the doctor can start consultations. This process typically takes 2-3 business days.
          </p>
        </div>

        {/* Next Steps */}
        <div 
          className="text-left border rounded-xl p-6 mb-10 shadow-sm" 
          style={{ 
            backgroundColor: '#DCE8EE', 
            borderColor: '#9BD3D5',
            borderWidth: '1px'
          }}
        >
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#2F3A40' }}>
            <Mail className="w-6 h-6" style={{ color: '#6FB3B5' }} />
            What happens next?
          </h4>
          <ul className="space-y-3 text-base" style={{ color: '#2F3A40' }}>
            <li className="flex items-start gap-3">
              <span className="font-bold text-lg flex-shrink-0" style={{ color: '#6FB3B5' }}>1.</span>
              <span>
                Our admin team will verify your credentials and uploaded documents
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-lg flex-shrink-0" style={{ color: '#6FB3B5' }}>2.</span>
              <span>
                You will receive an email notification once your account is approved
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-lg flex-shrink-0" style={{ color: '#6FB3B5' }}>3.</span>
              <span>
                After approval, you can log in and start consulting with patients on Medix
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="outline"
            className="h-12 px-8 text-base font-medium rounded-lg shadow-sm hover:opacity-80 transition-opacity"
            style={{ borderColor: '#DCE8EE', color: '#2F3A40', borderWidth: '1px' }}
          >
            Check Application Status
          </Button>
          <Button 
            className="h-12 px-8 text-base font-medium text-white rounded-lg shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6FB3B5' }}
          >
            Go to Login
          </Button>
        </div>

        {/* Support */}
        <div className="pt-8 border-t" style={{ borderColor: '#DCE8EE' }}>
          <p className="text-base" style={{ color: '#7A8A92' }}>
            Need help? Contact us at{' '}
            <a
              href="mailto:support@medix.com"
              className="font-semibold hover:underline"
              style={{ color: '#6FB3B5' }}
            >
              support@medix.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
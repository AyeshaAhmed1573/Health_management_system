import { CheckCircle } from 'lucide-react';

export function SuccessMessage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#6FB3B5' }}
          >
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 style={{ color: '#2F3A40' }}>Medix Healthcare Platform</h1>
        </div>

        {/* Success Card */}
        <div
          className="rounded-2xl p-12 shadow-lg text-center"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#DCE8EE' }}
            >
              <CheckCircle
                className="w-12 h-12"
                style={{ color: '#6FB3B5' }}
                strokeWidth={2}
              />
            </div>
          </div>

          <h2 className="mb-4" style={{ color: '#2F3A40' }}>
            Registration Submitted Successfully
          </h2>

          <div
            className="inline-block px-6 py-2 rounded-full mb-6"
            style={{
              backgroundColor: '#9BD3D5',
            }}
          >
            <p style={{ color: '#2F3A40' }}>
              Pharmacy Account Status:{' '}
              <span className="font-semibold">Pending Approval</span>
            </p>
          </div>

          <p className="mb-8" style={{ color: '#7A8A92', lineHeight: '1.6' }}>
            An administrator must verify the pharmacy before it can start providing medicine services.
            You will receive a confirmation email once your account has been reviewed and approved.
          </p>

          <div
            className="p-6 rounded-lg text-left"
            style={{
              backgroundColor: '#F4F6F8',
              borderLeft: '4px solid #6FB3B5',
            }}
          >
            <h3 className="mb-3" style={{ color: '#2F3A40' }}>
              What happens next?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#9BD3D5' }}
                >
                  <span style={{ color: '#2F3A40' }}>1</span>
                </div>
                <p style={{ color: '#2F3A40' }}>
                  Our admin team will review your submitted documents and information
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#9BD3D5' }}
                >
                  <span style={{ color: '#2F3A40' }}>2</span>
                </div>
                <p style={{ color: '#2F3A40' }}>
                  You will receive a verification email within 2-3 business days
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#9BD3D5' }}
                >
                  <span style={{ color: '#2F3A40' }}>3</span>
                </div>
                <p style={{ color: '#2F3A40' }}>
                  Once approved, you can log in and start managing your pharmacy services
                </p>
              </li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-3 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: '#6FB3B5',
              color: '#FFFFFF',
            }}
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    </div>
  );
}

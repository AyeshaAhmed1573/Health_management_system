import { useState } from 'react';

import { Check, AlertCircle } from 'lucide-react';

import { PharmacyInformation } from './PharmacyInformation';

import { ContactDetails } from './ContactDetails';

import { UploadDocuments } from './UploadDocuments';

import { AccountSetup } from './AccountSetup';

import { SuccessMessage } from './SuccessMessage';

import { useAuth } from '@/lib/authContext';



const steps = [

  { id: 1, title: 'Pharmacy Information' },

  { id: 2, title: 'Contact Details' },

  { id: 3, title: 'Upload Documents' },

  { id: 4, title: 'Account Setup' },

];



export function PharmacyRegistrationForm() {

  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    pharmacyName: '',

    licenseNumber: '',

    pharmacyType: '',

    servicesOffered: [],

    yearsOfOperation: '',

    operatingHours: '',

    pharmacyDescription: '',

    contactPersonName: '',

    contactEmail: '',

    contactPhone: '',

    alternatePhone: '',

    pharmacyAddress: '',

    city: '',

    province: '',

    postalCode: '',

    googleMapsLocation: '',

    emergencyContact: '',

    licenseCertificate: null,

    governmentRegistration: null,

    taxRegistration: null,

    pharmacistQualification: null,

    pharmacyLogo: null,

    username: '',

    password: '',

    confirmPassword: '',

    termsAccepted: false,

  });



  const handleNext = () => {

    if (currentStep < 4) {

      setCurrentStep(currentStep + 1);

    }

  };



  const handlePrevious = () => {

    if (currentStep > 1) {

      setCurrentStep(currentStep - 1);

    }

  };



  const handleSubmit = async () => {

    setError('');



    if (formData.password !== formData.confirmPassword) {

      setError('Passwords do not match');

      return;

    }



    if (formData.password.length < 6) {

      setError('Password must be at least 6 characters');

      return;

    }



    setLoading(true);

    // Prepare address object
    const address = {
      street: formData.pharmacyAddress,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
    };

    // Prepare operating hours object
    const operatingHours = {
      open: formData.operatingHours?.split('-')[0]?.trim() || '',
      close: formData.operatingHours?.split('-')[1]?.trim() || '',
    };

    // Prepare files object
    const files = {
      licenseDocument: formData.licenseCertificate,
      registrationDocument: formData.governmentRegistration,
      addressProofDocument: formData.taxRegistration,
      idProofDocument: formData.pharmacistQualification,
    };

    const result = await register(

      {

        name: formData.pharmacyName,

        email: formData.contactEmail,

        password: formData.password,

        phone: formData.contactPhone,

        pharmacyName: formData.pharmacyName,
        licenseNumber: formData.licenseNumber,
        address: address,
        operatingHours: operatingHours,

      },

      'pharmacy',

      files

    );



    if (result.success) {

      setIsSubmitted(true);

    } else {

      setError(result.error);

    }



    setLoading(false);

  };



  const updateFormData = (field, value) => {

    setFormData({ ...formData, [field]: value });

  };



  if (isSubmitted) {

    return <SuccessMessage />;

  }



  return (

    <div className="flex items-center justify-center min-h-screen py-12 px-4">

      <div className="w-full max-w-4xl">

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

          <p style={{ color: '#7A8A92' }}>Pharmacy Registration</p>

        </div>



        {/* Progress Indicator */}

        <div className="mb-8">

          <div className="flex items-center justify-between relative">

            {/* Progress Line */}

            <div

              className="absolute top-5 left-0 h-0.5 transition-all duration-300"

              style={{

                backgroundColor: '#DCE8EE',

                width: 'calc(100% - 40px)',

                marginLeft: '20px',

              }}

            >

              <div

                className="h-full transition-all duration-300"

                style={{

                  backgroundColor: '#6FB3B5',

                  width: `${((currentStep - 1) / 3) * 100}%`,

                }}

              />

            </div>



            {/* Steps */}

            {steps.map((step, index) => (

              <div key={step.id} className="flex flex-col items-center relative z-10">

                <div

                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"

                  style={{

                    backgroundColor:

                      currentStep > step.id

                        ? '#6FB3B5'

                        : currentStep === step.id

                        ? '#6FB3B5'

                        : '#DCE8EE',

                    border:

                      currentStep === step.id

                        ? '3px solid #9BD3D5'

                        : 'none',

                  }}

                >

                  {currentStep > step.id ? (

                    <Check className="w-5 h-5" style={{ color: '#FFFFFF' }} />

                  ) : (

                    <span

                      style={{

                        color: currentStep === step.id ? '#FFFFFF' : '#7A8A92',

                      }}

                    >

                      {step.id}

                    </span>

                  )}

                </div>

                <span

                  className="mt-2 text-sm text-center max-w-[120px]"

                  style={{

                    color: currentStep === step.id ? '#2F3A40' : '#7A8A92',

                  }}

                >

                  {step.title}

                </span>

              </div>

            ))}

          </div>

        </div>



        {/* Form Card */}

        <div

          className="rounded-2xl p-8 shadow-lg"

          style={{ backgroundColor: '#FFFFFF' }}

        >

          {currentStep === 1 && (

            <PharmacyInformation

              formData={formData}

              updateFormData={updateFormData}

            />

          )}

          {currentStep === 2 && (

            <ContactDetails formData={formData} updateFormData={updateFormData} />

          )}

          {currentStep === 3 && (

            <UploadDocuments formData={formData} updateFormData={updateFormData} />

          )}

          {currentStep === 4 && (

            <AccountSetup formData={formData} updateFormData={updateFormData} error={error} loading={loading} />

          )}



          {/* Navigation Buttons */}

          <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: '#DCE8EE' }}>

            {currentStep > 1 && (

              <button

                onClick={handlePrevious}

                className="px-6 py-3 rounded-lg transition-all duration-200"

                style={{

                  backgroundColor: '#FFFFFF',

                  color: '#2F3A40',

                  border: '2px solid #DCE8EE',

                }}

              >

                Previous

              </button>

            )}



            {currentStep === 1 && <div></div>}



            {currentStep === 4 ? (

              <button

                onClick={handleSubmit}

                disabled={!formData.termsAccepted || loading}

                className="px-6 py-3 rounded-lg transition-all duration-200"

                style={{

                  backgroundColor: formData.termsAccepted ? '#6FB3B5' : '#DCE8EE',

                  color: '#FFFFFF',

                  cursor: formData.termsAccepted && !loading ? 'pointer' : 'not-allowed',

                }}

              >

                {loading ? 'Submitting...' : 'Submit for Verification'}

              </button>

            ) : (

              <button

                onClick={handleNext}

                className="px-6 py-3 rounded-lg transition-all duration-200"

                style={{

                  backgroundColor: '#6FB3B5',

                  color: '#FFFFFF',

                }}

              >

                Next

              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}
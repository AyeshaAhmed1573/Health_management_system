import { useState } from 'react';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ProfessionalDetailsForm } from './ProfessionalDetailsForm';
import { UploadDocumentsForm } from './UploadDocumentsForm';
import { AccountForm } from './AccountForm';
import { SubmissionSuccess } from './SubmissionSuccess';
import { Card } from './ui/card';
import { Stethoscope, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export function DoctorRegistration() {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
    pmdcNumber: '',
    yearsExperience: '',
    hospitalName: '',
    medicalDegree: null,
    licenseCertificate: null,
    cnic: null,
    profilePhoto: null,
    password: '',
    confirmPassword: '',
  });

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

    try {
      // Step 1: Register user
      const registerResult = await register(
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        },
        'doctor'
      );

      if (!registerResult.success) {
        setError(registerResult.error);
        setLoading(false);
        return;
      }

      // Step 2: Create doctor profile with all details
      const formDataToSend = new FormData();
      formDataToSend.append('userId', registerResult.user.id);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('qualification', formData.medicalDegree?.name || '');
      formDataToSend.append('experienceYears', formData.yearsExperience);
      formDataToSend.append('consultationFee', '500');
      formDataToSend.append('bio', 'Professional doctor');
      
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }
      if (formData.medicalDegree?.file) {
        formDataToSend.append('medicalDegree', formData.medicalDegree.file);
      }
      if (formData.licenseCertificate) {
        formDataToSend.append('licenseCertificate', formData.licenseCertificate);
      }
      if (formData.cnic) {
        formDataToSend.append('cnic', formData.cnic);
      }

      const response = await fetch('http://localhost:5000/api/doctors/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Failed to create doctor profile');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error('Registration error:', err);
    }

    setLoading(false);
  };

  if (isSubmitted) {
    return <SubmissionSuccess />;
  }

  return (
    <div className="container mx-auto py-12 px-4" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: '#6FB3B5' }}>
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#6FB3B5' }}>
            Medix
          </h1>
        </div>
        <h2 className="text-3xl font-semibold mb-3" style={{ color: '#2F3A40' }}>
          Doctor Registration
        </h2>
        <p className="text-lg" style={{ color: '#7A8A92' }}>
          Complete your registration to start consulting patients
        </p>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4 relative">
          <div
            className="absolute top-5 left-0 right-0 h-1 -z-10"
            style={{ backgroundColor: '#DCE8EE', marginLeft: '40px', marginRight: '40px' }}
          >
            <div
              className="h-1 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%`, backgroundColor: '#6FB3B5' }}
            ></div>
          </div>

          {[
            { num: 1, label: 'Personal Info' },
            { num: 2, label: 'Professional Details' },
            { num: 3, label: 'Upload Documents' },
            { num: 4, label: 'Account Setup' },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col items-center z-10"
              style={{ color: currentStep >= step.num ? '#6FB3B5' : '#7A8A92' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 transition-all shadow-md"
                style={{
                  backgroundColor: currentStep >= step.num ? '#6FB3B5' : '#FFFFFF',
                  color: currentStep >= step.num ? '#FFFFFF' : '#7A8A92',
                  border: currentStep >= step.num ? 'none' : '2px solid #DCE8EE',
                }}
              >
                {step.num}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center max-w-[80px]">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card
        className="border-0 shadow-lg"
        style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '48px' }}
      >
        {currentStep === 1 && (
          <PersonalInfoForm formData={formData} updateFormData={updateFormData} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <ProfessionalDetailsForm formData={formData} updateFormData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 3 && (
          <UploadDocumentsForm formData={formData} updateFormData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 4 && (
          <AccountForm
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            error={error}
            loading={loading}
          />
        )}
      </Card>
    </div>
  );
}
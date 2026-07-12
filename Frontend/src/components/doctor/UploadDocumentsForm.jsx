import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Upload,
  FileText,
  Award,
  CreditCard,
  UserCircle,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export function UploadDocumentsForm({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) {
  const handleFileChange = (field, file) => {
    updateFormData({ [field]: file });
  };

  const FileUploadField = ({
    id,
    label,
    icon: Icon,
    field,
  }) => {
    const file = formData[field];

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
          <Icon className="w-4 h-4" style={{ color: '#6FB3B5' }} />
          {label}
        </Label>
        <div className="relative">
          <input
            id={id}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              handleFileChange(field, e.target.files?.[0] || null)
            }
            className="hidden"
          />
          <label
            htmlFor={id}
            className="flex items-center justify-center gap-3 w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all group"
            style={{ 
              borderColor: file ? '#6FB3B5' : '#DCE8EE',
              backgroundColor: file ? '#F4F6F8' : '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              if (!file) {
                e.currentTarget.style.borderColor = '#9BD3D5';
                e.currentTarget.style.backgroundColor = '#F4F6F8';
              }
            }}
            onMouseLeave={(e) => {
              if (!file) {
                e.currentTarget.style.borderColor = '#DCE8EE';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {file ? (
              <div className="flex items-center gap-3" style={{ color: '#6FB3B5' }}>
                <CheckCircle2 className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold text-base">{file.name}</p>
                  <p className="text-sm" style={{ color: '#7A8A92' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3" style={{ color: '#7A8A92' }}>
                <div className="p-3 rounded-full" style={{ backgroundColor: '#DCE8EE' }}>
                  <Upload className="w-6 h-6" style={{ color: '#6FB3B5' }} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-base" style={{ color: '#2F3A40' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm mt-1">
                    PDF or Image (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#2F3A40' }}>
          Upload Verification Documents
        </h3>
        <p className="text-base" style={{ color: '#7A8A92' }}>
          Please upload all required documents for verification
        </p>
      </div>

      <div className="space-y-5">
        <FileUploadField
          id="medicalDegree"
          label="Upload Medical Degree"
          icon={FileText}
          field="medicalDegree"
        />

        <FileUploadField
          id="licenseCertificate"
          label="Upload License Certificate"
          icon={Award}
          field="licenseCertificate"
        />

        <FileUploadField
          id="cnic"
          label="Upload CNIC"
          icon={CreditCard}
          field="cnic"
        />

        <FileUploadField
          id="profilePhoto"
          label="Upload Profile Photo"
          icon={UserCircle}
          field="profilePhoto"
        />
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
          onClick={onNext}
          className="text-white px-10 h-12 text-base font-medium rounded-lg shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6FB3B5' }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
import { Upload, FileText, X } from 'lucide-react';

function FileUploadBox({ label, file, onFileSelect, required = true }) {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <label className="block mb-2" style={{ color: '#2F3A40' }}>
        {label} {required && <span style={{ color: '#6FB3B5' }}>*</span>}
      </label>

      {file ? (
        <div
          className="w-full px-4 py-4 rounded-lg border flex items-center justify-between"
          style={{
            borderColor: '#9BD3D5',
            backgroundColor: '#F4F6F8',
          }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" style={{ color: '#6FB3B5' }} />
            <div>
              <p style={{ color: '#2F3A40' }}>{file.name}</p>
              <p className="text-sm" style={{ color: '#7A8A92' }}>
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all"
            style={{
              backgroundColor: '#DCE8EE',
            }}
          >
            <X className="w-4 h-4" style={{ color: '#2F3A40' }} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="w-full px-6 py-8 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-opacity-70"
          style={{
            borderColor: '#9BD3D5',
            backgroundColor: '#F4F6F8',
          }}
          onClick={() => document.getElementById(`file-${label}`)?.click()}
        >
          <Upload className="w-8 h-8 mb-3" style={{ color: '#6FB3B5' }} />
          <p style={{ color: '#2F3A40' }}>
            Drag and drop or{' '}
            <span style={{ color: '#6FB3B5' }}>browse</span>
          </p>
          <p className="text-sm mt-1" style={{ color: '#7A8A92' }}>
            Supported formats, JPG, PNG (Max 5MB)
          </p>
          <input
            id={`file-${label}`}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      )}
    </div>
  );
}

export function UploadDocuments({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="mb-6" style={{ color: '#2F3A40' }}>
        Upload Documents
      </h2>

      <div className="space-y-6">
        <FileUploadBox
          label="Upload Pharmacy License Certificate"
          file={formData.licenseCertificate}
          onFileSelect={(file) => updateFormData('licenseCertificate', file)}
        />

        <FileUploadBox
          label="Upload Government Registration Document"
          file={formData.governmentRegistration}
          onFileSelect={(file) => updateFormData('governmentRegistration', file)}
        />

        <FileUploadBox
          label="Upload Tax Registration Document"
          file={formData.taxRegistration}
          onFileSelect={(file) => updateFormData('taxRegistration', file)}
        />

        <FileUploadBox
          label="Upload Pharmacist Qualification Certificate"
          file={formData.pharmacistQualification}
          onFileSelect={(file) => updateFormData('pharmacistQualification', file)}
        />

        <FileUploadBox
          label="Upload Pharmacy Logo"
          file={formData.pharmacyLogo}
          onFileSelect={(file) => updateFormData('pharmacyLogo', file)}
          required={false}
        />

        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: '#DCE8EE',
          }}
        >
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
              Please ensure all documents are clear, valid, and up-to-date. Documents will be verified by our admin team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

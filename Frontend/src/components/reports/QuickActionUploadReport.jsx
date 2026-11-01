import { getStoredToken, getStoredUser } from '@/lib/session';
import React, { useState } from 'react';
import { Upload, X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { reportsApi } from '@/lib/api';

const STANDARD_TEST_TYPES = [
  'CBC',
  'HbA1c',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'Thyroid Profile',
  'Urine Test',
  'Blood Sugar',
  'Stool Test',
  'Hormone Test',
  'Vitamins & Minerals',
  'Cardiac Markers',
  'Inflammation & Autoimmune',
  'Infection & Microbiology',
  'Tumor Markers',
  'Coagulation Test',
  'Nuclear Medicine',
  'Biopsy & Pathology',
];

export default function QuickActionUploadReport({ isOpen, onClose, profileId, onSuccess }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [testType, setTestType] = useState('');
  const [customTestType, setCustomTestType] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!testType || (testType === 'Other' && !customTestType.trim())) {
      setError('Please select or enter a test type');
      return;
    }

    if (!profileId) {
      setError('No patient profile selected. Please create a profile first.');
      return;
    }

    setIsUploading(true);

    try {
      const finalTestType = testType === 'Other' ? customTestType.trim() : testType;

      // Upload file directly to backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      formData.append('profileId', profileId);
      formData.append('testType', finalTestType);
      formData.append('testDate', testDate);
      formData.append('notes', notes.trim());

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success || result.report) {
        onSuccess?.();
        handleClose();
      } else {
        setError(result.message || 'Failed to upload report');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTestType('');
    setCustomTestType('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#2F3A40' }}>
            Upload Medical Report
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <X size={20} color="#7A8A92" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#2F3A40', marginBottom: 8 }}>
              Report File
            </label>
            <div
              style={{
                border: '2px dashed #DCE8EE',
                borderRadius: 8,
                padding: 24,
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? '#F4F6F8' : 'white',
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {file ? (
                <div>
                  <FileText size={32} color="#6FB3B5" style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2F3A40' }}>
                    {file.name}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#7A8A92' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} color="#7A8A92" style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, color: '#7A8A92' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#7A8A92' }}>
                    PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#2F3A40', marginBottom: 8 }}>
              Test Type
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #DCE8EE',
                fontSize: 14,
                color: '#2F3A40',
                background: 'white',
              }}
              required
            >
              <option value="">Select test type</option>
              {STANDARD_TEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="Other">Other / Custom</option>
            </select>
          </div>

          {/* Custom Test Type Input */}
          {testType === 'Other' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#2F3A40', marginBottom: 8 }}>
                Custom Test Type
              </label>
              <input
                type="text"
                value={customTestType}
                onChange={(e) => setCustomTestType(e.target.value)}
                placeholder="e.g., Vitamin D Test, Thyroid Panel"
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #DCE8EE',
                  fontSize: 14,
                  color: '#2F3A40',
                }}
                required={testType === 'Other'}
              />
            </div>
          )}

          {/* Test Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#2F3A40', marginBottom: 8 }}>
              Test Date
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar
                size={18}
                color="#7A8A92"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: 8,
                  border: '1px solid #DCE8EE',
                  fontSize: 14,
                  color: '#2F3A40',
                }}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#2F3A40', marginBottom: 8 }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this report..."
              rows={3}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #DCE8EE',
                fontSize: 14,
                color: '#2F3A40',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 12,
                borderRadius: 8,
                background: '#FEE2E2',
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} color="#991B1B" />
              <p style={{ margin: 0, fontSize: 13, color: '#991B1B' }}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#6FB3B5',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.7 : 1,
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

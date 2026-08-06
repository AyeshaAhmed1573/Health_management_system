import React, { useState } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { reportsApi } from '@/lib/api';

const COLORS = {
  primary: '#6FB3B5',
  secondary: '#DCE8EE',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#2F3A40',
  muted: '#7A8A92',
  danger: '#C97B63',
};

export default function ReportValueEditor({ report, onClose }) {
  const [values, setValues] = useState(
    report.extractedValues || [
      { parameterName: '', value: '', unit: '', referenceRange: '', isAbnormal: false }
    ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddValue = () => {
    setValues([...values, { parameterName: '', value: '', unit: '', referenceRange: '', isAbnormal: false }]);
  };

  const handleRemoveValue = (index) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (index, field, value) => {
    const newValues = [...values];
    newValues[index][field] = value;
    setValues(newValues);
  };

  const handleSave = async () => {
    setError('');
    
    // Validate that at least one value has a parameter name
    const validValues = values.filter(v => v.parameterName.trim());
    if (validValues.length === 0) {
      setError('Please add at least one parameter with a name');
      return;
    }

    setSaving(true);

    try {
      await reportsApi.updateValues(report._id, values);
      onClose();
    } catch (err) {
      console.error('Failed to update values:', err);
      setError(err.message || 'Failed to update values');
    } finally {
      setSaving(false);
    }
  };

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
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 700,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
              Edit Extracted Values
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.muted }}>
              {report.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        {/* Values List */}
        <div style={{ marginBottom: 20 }}>
          {values.map((value, index) => (
            <div
              key={index}
              style={{
                background: COLORS.bg,
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                border: `1px solid ${COLORS.secondary}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                  Parameter {index + 1}
                </span>
                {values.length > 1 && (
                  <button
                    onClick={() => handleRemoveValue(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <Trash2 size={16} color={COLORS.danger} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
                    Parameter Name *
                  </label>
                  <input
                    type="text"
                    value={value.parameterName}
                    onChange={(e) => handleValueChange(index, 'parameterName', e.target.value)}
                    placeholder="e.g., Hemoglobin"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.secondary}`,
                      fontSize: 13,
                      color: COLORS.text,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
                    Value *
                  </label>
                  <input
                    type="text"
                    value={value.value}
                    onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                    placeholder="e.g., 13.5"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.secondary}`,
                      fontSize: 13,
                      color: COLORS.text,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={value.unit}
                    onChange={(e) => handleValueChange(index, 'unit', e.target.value)}
                    placeholder="e.g., g/dL"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.secondary}`,
                      fontSize: 13,
                      color: COLORS.text,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
                    Reference Range
                  </label>
                  <input
                    type="text"
                    value={value.referenceRange}
                    onChange={(e) => handleValueChange(index, 'referenceRange', e.target.value)}
                    placeholder="e.g., 12.0 - 15.5 g/dL"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.secondary}`,
                      fontSize: 13,
                      color: COLORS.text,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id={`abnormal-${index}`}
                  checked={value.isAbnormal}
                  onChange={(e) => handleValueChange(index, 'isAbnormal', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  htmlFor={`abnormal-${index}`}
                  style={{ fontSize: 13, color: COLORS.text, cursor: 'pointer' }}
                >
                  Mark as abnormal
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add Value Button */}
        <button
          onClick={handleAddValue}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: `1.5px dashed ${COLORS.secondary}`,
            background: 'transparent',
            color: COLORS.muted,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 20,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.color = COLORS.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.secondary;
            e.currentTarget.style.color = COLORS.muted;
          }}
        >
          <Plus size={16} />
          Add Another Parameter
        </button>

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

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: `1.5px solid ${COLORS.secondary}`,
              background: COLORS.card,
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: COLORS.primary,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

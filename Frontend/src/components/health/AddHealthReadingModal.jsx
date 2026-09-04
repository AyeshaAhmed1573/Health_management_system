import React, { useState } from 'react';
import { X, Activity, Heart, Scale, Droplet, Calculator } from 'lucide-react';
import { healthReadingsApi } from '@/lib/api';

const COLORS = {
  primary: '#6FB3B5',
  secondary: '#DCE8EE',
  accent: '#9BD3D5',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#2F3A40',
  muted: '#7A8A92',
};

export default function AddHealthReadingModal({ isOpen, onClose, profileId, onAdd }) {
  const [type, setType] = useState('bmi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    value: '',
    unit: '',
    mealContext: '',
    measuredAt: new Date().toISOString().slice(0, 16),
    notes: '',
    height: '',
    weight: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const readingData = {
        profileId,
        type,
        measuredAt: formData.measuredAt,
        notes: formData.notes,
      };

      if (type === 'bmi') {
        if (!formData.height || !formData.weight) {
          throw new Error('Height and weight are required for BMI calculation');
        }
        const heightM = parseFloat(formData.height) / 100;
        const weightKg = parseFloat(formData.weight);
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        readingData.value = parseFloat(bmi);
        readingData.unit = 'kg/m²';
        // Also save weight reading
        await healthReadingsApi.add({
          profileId,
          type: 'weight',
          value: weightKg,
          unit: 'kg',
          measuredAt: formData.measuredAt,
        });
      } else if (type === 'blood_pressure') {
        if (!formData.systolic || !formData.diastolic) {
          throw new Error('Systolic and diastolic values are required');
        }
        readingData.systolic = parseFloat(formData.systolic);
        readingData.diastolic = parseFloat(formData.diastolic);
        readingData.unit = 'mmHg';
      } else {
        if (!formData.value) {
          throw new Error('Value is required');
        }
        readingData.value = parseFloat(formData.value);
        readingData.unit = formData.unit || getDefaultUnit(type);
        if (type === 'blood_sugar') {
          readingData.mealContext = formData.mealContext || 'random';
        }
      }

      const result = await healthReadingsApi.add(readingData);
      
      if (result.healthReading || result.success) {
        onAdd && onAdd(result.healthReading);
        onClose();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to add reading');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      systolic: '',
      diastolic: '',
      value: '',
      unit: '',
      mealContext: '',
      measuredAt: new Date().toISOString().slice(0, 16),
      notes: '',
      height: '',
      weight: '',
    });
    setError('');
  };

  const getDefaultUnit = (type) => {
    const units = {
      blood_pressure: 'mmHg',
      blood_sugar: 'mg/dL',
      weight: 'kg',
      bmi: 'kg/m²',
    };
    return units[type] || '';
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
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.text }}>
            Add Health Reading
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={20} color={COLORS.muted} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
              Reading Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1.5px solid ${COLORS.secondary}`,
                background: COLORS.card,
                fontSize: 14,
                color: COLORS.text,
              }}
            >
              <option value="bmi">BMI Calculator</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="blood_sugar">Blood Sugar</option>
              <option value="weight">Weight</option>
            </select>
          </div>

          {type === 'bmi' ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                />
              </div>
            </>
          ) : type === 'blood_pressure' ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.systolic}
                  onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                  placeholder="120"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.diastolic}
                  onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                  placeholder="80"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Value ({getDefaultUnit(type)})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={type === 'blood_sugar' ? '100' : type === 'weight' ? '70' : '72'}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                >
                  {type === 'blood_sugar' && (
                    <>
                      <option value="mg/dL">mg/dL</option>
                      <option value="mmol/L">mmol/L</option>
                    </>
                  )}
                  {type === 'weight' && (
                    <>
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </>
                  )}
                </select>
              </div>
              {type === 'blood_sugar' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                    Meal Context
                  </label>
                  <select
                    value={formData.mealContext}
                    onChange={(e) => setFormData({ ...formData, mealContext: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1.5px solid ${COLORS.secondary}`,
                      background: COLORS.card,
                      fontSize: 14,
                      color: COLORS.text,
                    }}
                  >
                    <option value="fasting">Fasting</option>
                    <option value="post_meal">Post Meal</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.measuredAt}
              onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1.5px solid ${COLORS.secondary}`,
                background: COLORS.card,
                fontSize: 14,
                color: COLORS.text,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1.5px solid ${COLORS.secondary}`,
                background: COLORS.card,
                fontSize: 14,
                color: COLORS.text,
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: `1.5px solid ${COLORS.secondary}`,
                background: COLORS.card,
                color: COLORS.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                background: COLORS.primary,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Adding...' : 'Add Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

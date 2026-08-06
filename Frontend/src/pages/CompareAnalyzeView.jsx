import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Calendar,
  Info,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/lib/authContext';
import { reportsApi, patientProfilesApi } from '@/lib/api';

const COLORS = {
  primary: '#6FB3B5',
  secondary: '#DCE8EE',
  accent: '#9BD3D5',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#2F3A40',
  muted: '#7A8A92',
  danger: '#C97B63',
  warning: '#E8B84A',
  success: '#5C9E7E',
};

const CHART_COLORS = [
  '#6FB3B5', '#C97B63', '#5C9E7E', '#E8B84A', '#9BD3D5',
  '#7A8A92', '#2F3A40', '#4E8C8E', '#DCE8EE', '#F4F6F8'
];

export default function CompareAnalyzeView() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { testType } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?._id || user?.id) {
      loadProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (activeProfile?._id && testType) {
      loadComparisonData();
    }
  }, [activeProfile, testType]);

  const loadProfiles = async () => {
    try {
      const userId = user?._id || user?.id;
      const data = await patientProfilesApi.getAll(userId);
      if (data.patientProfiles && data.patientProfiles.length > 0) {
        setProfiles(data.patientProfiles);
        setActiveProfile(data.patientProfiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    try {
      console.log('Loading comparison data for profile:', activeProfile._id, 'testType:', decodeURIComponent(testType));
      const data = await reportsApi.getComparisonByTestType(activeProfile._id, decodeURIComponent(testType));
      console.log('Comparison data received:', data);
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
      setError(error.message || 'Failed to load comparison data');
    }
  };

  const handleBack = () => {
    navigate(`/reports/folder/${encodeURIComponent(decodeURIComponent(testType))}`);
  };

  // Transform data for Recharts
  const chartData = comparisonData?.dates?.map((date, index) => {
    const dataPoint = { date };
    Object.entries(comparisonData.params || {}).forEach(([param, paramData]) => {
      dataPoint[param] = paramData.values[index];
    });
    return dataPoint;
  }) || [];

  const paramCount = Object.keys(comparisonData?.params || {}).length;
  const reportCount = comparisonData?.count || 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: COLORS.muted }}>Loading comparison data...</p>
      </div>
    );
  }

  const decodedTestType = decodeURIComponent(testType);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            border: `1.5px solid ${COLORS.secondary}`,
            background: COLORS.card,
            color: COLORS.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
            {decodedTestType} - Compare & Analyze
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.muted }}>
            {reportCount} {reportCount === 1 ? 'report' : 'reports'} • {paramCount} parameters tracked
          </p>
        </div>
      </div>

      {/* Profile Switcher */}
      {profiles.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.muted, marginBottom: 8 }}>
            Viewing reports for:
          </label>
          <select
            value={activeProfile?._id}
            onChange={(e) => setActiveProfile(profiles.find(p => p._id === e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1.5px solid ${COLORS.secondary}`,
              background: COLORS.card,
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.text,
              cursor: 'pointer',
            }}
          >
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.name} ({profile.relationship})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 12,
            background: '#FEE2E2',
            marginBottom: 24,
          }}
        >
          <AlertCircle size={24} color="#991B1B" />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#991B1B' }}>
              Error loading comparison data
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#991B1B' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Single Report Notice */}
      {reportCount === 1 && !error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 12,
            background: '#FFF4E5',
            marginBottom: 24,
          }}
        >
          <Info size={24} color="#92400E" />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#92400E' }}>
              Need more reports for comparison
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#92400E' }}>
              Upload at least 2 {decodedTestType} reports to see trend analysis over time.
            </p>
          </div>
        </div>
      )}

      {/* Unverified Values Notice */}
      {comparisonData?.needsReviewCount > 0 && reportCount >= 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 12,
            background: '#FFF4E5',
            marginBottom: 24,
          }}
        >
          <AlertCircle size={24} color="#92400E" />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#92400E' }}>
              {comparisonData.needsReviewCount} {comparisonData.needsReviewCount === 1 ? 'report' : 'reports'} have unverified values
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#92400E' }}>
              Edit the extracted values for more accurate trend analysis.
            </p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {reportCount >= 2 && paramCount > 0 && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${COLORS.secondary}`,
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
            Parameter Trends Over Time
          </h2>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.secondary} />
                <XAxis
                  dataKey="date"
                  stroke={COLORS.muted}
                  fontSize={12}
                  tick={{ fill: COLORS.muted }}
                />
                <YAxis
                  stroke={COLORS.muted}
                  fontSize={12}
                  tick={{ fill: COLORS.muted }}
                />
                <Tooltip
                  contentStyle={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.secondary}`,
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                {Object.entries(comparisonData.params || {}).map(([param, data], index) => (
                  <Line
                    key={param}
                    type="monotone"
                    dataKey={param}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                    activeDot={{ r: 6 }}
                    name={`${param} (${data.unit})`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trend Summary */}
      {comparisonData?.trendSummary && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${COLORS.secondary}`,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: COLORS.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} color={COLORS.primary} />
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>
              AI Trend Analysis
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>
            {comparisonData.trendSummary}
          </p>
        </div>
      )}

      {/* Parameter Summary Table */}
      {paramCount > 0 && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${COLORS.secondary}`,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
            Parameter Summary
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.secondary}` }}>
                  <th style={{ textAlign: 'left', padding: 12, fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                    Parameter
                  </th>
                  <th style={{ textAlign: 'left', padding: 12, fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                    Unit
                  </th>
                  <th style={{ textAlign: 'right', padding: 12, fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                    Latest Value
                  </th>
                  <th style={{ textAlign: 'right', padding: 12, fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                    Previous Value
                  </th>
                  <th style={{ textAlign: 'right', padding: 12, fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(comparisonData?.params || {}).map(([param, data], index) => {
                  const values = data.values.filter(v => v !== null);
                  const latest = values[values.length - 1];
                  const previous = values[values.length - 2];
                  const change = previous !== null && latest !== null ? (latest - previous).toFixed(2) : 'N/A';
                  const isIncrease = parseFloat(change) > 0;
                  const isDecrease = parseFloat(change) < 0;

                  return (
                    <tr key={param} style={{ borderBottom: `1px solid ${COLORS.secondary}` }}>
                      <td style={{ padding: 12, fontSize: 14, color: COLORS.text, fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          {param}
                        </div>
                      </td>
                      <td style={{ padding: 12, fontSize: 14, color: COLORS.muted }}>
                        {data.unit}
                      </td>
                      <td style={{ padding: 12, fontSize: 14, color: COLORS.text, textAlign: 'right', fontWeight: 600 }}>
                        {latest !== null ? latest : 'N/A'}
                      </td>
                      <td style={{ padding: 12, fontSize: 14, color: COLORS.muted, textAlign: 'right' }}>
                        {previous !== null ? previous : 'N/A'}
                      </td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: 'right', fontWeight: 600 }}>
                        {change !== 'N/A' && (
                          <span
                            style={{
                              color: isIncrease ? COLORS.danger : isDecrease ? COLORS.success : COLORS.muted,
                            }}
                          >
                            {isIncrease && '+'}{change}
                          </span>
                        )}
                        {change === 'N/A' && <span style={{ color: COLORS.muted }}>N/A</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

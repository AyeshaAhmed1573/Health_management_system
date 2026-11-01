import { openProtectedFile } from '@/lib/session';
import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  FileText,
  Calendar,
  ExternalLink,
  Edit,
  AlertCircle,
  Download,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { reportsApi, patientProfilesApi } from '@/lib/api';
import ReportValueEditor from '@/components/reports/ReportValueEditor';

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
};

export default function ReportFolderView() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { testType } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState(null);
  const [showValueEditor, setShowValueEditor] = useState(false);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (activeProfile?._id && testType) {
      loadReports();
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

  const loadReports = async () => {
    try {
      const data = await reportsApi.getByTestType(activeProfile._id, decodeURIComponent(testType));
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReports([]);
    }
  };

  const handleEditValues = (report) => {
    setEditingReport(report);
    setShowValueEditor(true);
  };

  const handleValueEditorClose = () => {
    setShowValueEditor(false);
    setEditingReport(null);
    loadReports();
  };

  // Local report files are no longer public static files - they are fetched with the login token.
  const handleViewFile = (report) => {
    const fileUrl = report.fileUrl;
    if (!fileUrl) return;
    if (/^(https?:|data:)/i.test(fileUrl)) {
      window.open(fileUrl, '_blank');
      return;
    }
    openProtectedFile(`/api/reports/${report._id || report.id}/file`).catch((err) => alert(err.message));
  };

  const handleCompare = () => {
    navigate(`/reports/compare/${encodeURIComponent(decodeURIComponent(testType))}`);
  };

  const handleBack = () => {
    navigate('/reports');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal': return '#2E6B4E';
      case 'Needs Attention': return '#92400E';
      case 'Concerning': return '#991B1B';
      case 'Critical': return '#7F1D1D';
      default: return '#2E6B4E';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'Normal': return '#E4F1EA';
      case 'Needs Attention': return '#FFF4E5';
      case 'Concerning': return '#FEE2E2';
      case 'Critical': return '#FECACA';
      default: return '#E4F1EA';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: COLORS.muted }}>Loading reports...</p>
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
            {decodedTestType}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.muted }}>
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </p>
        </div>
        {reports.length >= 2 && (
          <button
            onClick={handleCompare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              border: `1.5px solid ${COLORS.primary}`,
              background: 'transparent',
              color: COLORS.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.primary;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = COLORS.primary;
            }}
          >
            <TrendingUp size={18} />
            Compare & Analyze
          </button>
        )}
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

      {/* Reports List */}
      {reports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            background: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.secondary}`,
          }}
        >
          <FileText size={48} color={COLORS.muted} style={{ marginBottom: 16 }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
            No reports found
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.muted }}>
            Upload your first {decodedTestType} report to get started
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((report) => (
            <div
              key={report._id}
              style={{
                background: COLORS.card,
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${COLORS.secondary}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
                    {report.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: COLORS.muted }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} />
                      <span>
                        {new Date(report.testDate || report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span>•</span>
                    <span>{report.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{(report.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: getStatusBackground(report.aiOverallStatus),
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: getStatusColor(report.aiOverallStatus) }}>
                    {report.aiOverallStatus || 'Normal'}
                  </span>
                </div>
              </div>

              {/* Extracted Values Preview */}
              {report.extractedValues && report.extractedValues.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 8 }}>
                    Extracted Values ({report.extractedValues.length}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {report.extractedValues.slice(0, 5).map((value, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: COLORS.secondary,
                          color: COLORS.text,
                        }}
                      >
                        {value.parameterName}: {value.value} {value.unit}
                      </span>
                    ))}
                    {report.extractedValues.length > 5 && (
                      <span style={{ fontSize: 12, color: COLORS.muted }}>
                        +{report.extractedValues.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {report.aiSummary && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 8 }}>
                    AI Summary:
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>
                    {report.aiSummary.substring(0, 200)}
                    {report.aiSummary.length > 200 && '...'}
                  </p>
                </div>
              )}

              {/* Review Warning */}
              {report.needsManualReview && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#FFF4E5',
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={14} color="#92400E" />
                  <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                    This report needs manual review of extracted values
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleViewFile(report)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = COLORS.card;
                  }}
                >
                  <ExternalLink size={16} />
                  View File
                </button>
                <button
                  onClick={() => handleEditValues(report)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.secondary}`,
                    background: COLORS.card,
                    color: COLORS.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = COLORS.card;
                  }}
                >
                  <Edit size={16} />
                  Edit Values
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Value Editor Modal */}
      {showValueEditor && editingReport && (
        <ReportValueEditor
          report={editingReport}
          onClose={handleValueEditorClose}
        />
      )}
    </div>
  );
}

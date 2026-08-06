import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  FolderOpen, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { reportsApi, patientProfilesApi } from '@/lib/api';
import QuickActionUploadReport from '@/components/reports/QuickActionUploadReport';

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

export default function MedicalReportsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (activeProfile?._id) {
      loadFolders();
    }
  }, [activeProfile]);

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

  const loadFolders = async () => {
    try {
      const data = await reportsApi.getFolders(activeProfile._id);
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleUploadSuccess = () => {
    loadFolders();
  };

  const handleFolderClick = (testType) => {
    navigate(`/reports/folder/${encodeURIComponent(testType)}`);
  };

  const handleCompareClick = (testType, e) => {
    e.stopPropagation();
    navigate(`/reports/compare/${encodeURIComponent(testType)}`);
  };

  const filteredFolders = Object.entries(folders).filter(([testType]) => 
    testType.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
          Medical Reports
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: COLORS.muted }}>
          View and manage your medical test reports organized by type
        </p>
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

      {/* Search and Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search
            size={18}
            color={COLORS.muted}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search test types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: 8,
              border: `1.5px solid ${COLORS.secondary}`,
              fontSize: 14,
              color: COLORS.text,
              background: COLORS.card,
            }}
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: COLORS.primary,
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          Upload Report
        </button>
      </div>

      {/* Folders Grid */}
      {filteredFolders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            background: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.secondary}`,
          }}
        >
          <FolderOpen size={48} color={COLORS.muted} style={{ marginBottom: 16 }} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
            {searchQuery ? 'No matching reports found' : 'No reports uploaded yet'}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
            {searchQuery ? 'Try a different search term' : 'Upload your first medical report to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: COLORS.primary,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Upload Your First Report
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredFolders.map(([testType, folder]) => (
            <div
              key={testType}
              onClick={() => handleFolderClick(testType)}
              style={{
                background: COLORS.card,
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${COLORS.secondary}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(111, 179, 181, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.secondary;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: COLORS.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FolderOpen size={24} color={COLORS.primary} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>
                      {testType}
                    </h3>
                    {folder.isCustomTestType && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: COLORS.warning + '33',
                          color: COLORS.warning,
                        }}
                      >
                        Custom
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} color={COLORS.muted} />
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color={COLORS.muted} />
                  <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>
                    {folder.count} {folder.count === 1 ? 'report' : 'reports'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} color={COLORS.muted} />
                  <span style={{ fontSize: 13, color: COLORS.muted }}>
                    {new Date(folder.latestDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: getStatusBackground(folder.latestStatus),
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: getStatusColor(folder.latestStatus),
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: getStatusColor(folder.latestStatus) }}>
                  {folder.latestStatus}
                </span>
              </div>

              {/* Review Warning */}
              {folder.needsReviewCount > 0 && (
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
                    {folder.needsReviewCount} {folder.needsReviewCount === 1 ? 'report' : 'reports'} need review
                  </span>
                </div>
              )}

              {/* Compare Button */}
              {folder.count >= 2 && (
                <button
                  onClick={(e) => handleCompareClick(testType, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: `1.5px solid ${COLORS.primary}`,
                    background: 'transparent',
                    color: COLORS.primary,
                    fontSize: 13,
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
                  <TrendingUp size={16} />
                  Compare & Analyze
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <QuickActionUploadReport
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        profileId={activeProfile?._id}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

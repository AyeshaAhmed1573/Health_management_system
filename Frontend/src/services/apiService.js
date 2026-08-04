const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Doctor Service
export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/doctors${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  },

  getDoctorById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch doctor');
    return response.json();
  },

  getDoctorsBySpecialization: async (specialization) => {
    const response = await fetch(`${API_BASE_URL}/doctors/specialization/${specialization}`);
    if (!response.ok) throw new Error('Failed to fetch doctors by specialization');
    return response.json();
  },

  verifyDoctor: async (id, verificationStatus, verificationNote) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus, verificationNote }),
    });
    if (!response.ok) throw new Error('Failed to verify doctor');
    return response.json();
  },
};

// Laboratory Service
export const laboratoryService = {
  getAllLaboratories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/laboratories${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch laboratories');
    return response.json();
  },

  getLaboratoryById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/laboratories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch laboratory');
    return response.json();
  },

  verifyLaboratory: async (id, verificationStatus, verificationNote) => {
    const response = await fetch(`${API_BASE_URL}/laboratories/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus, verificationNote }),
    });
    if (!response.ok) throw new Error('Failed to verify laboratory');
    return response.json();
  },
};

// Pharmacy Service
export const pharmacyService = {
  getAllPharmacies: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/pharmacies${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch pharmacies');
    return response.json();
  },

  getPharmacyById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/pharmacies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch pharmacy');
    return response.json();
  },

  verifyPharmacy: async (id, verificationStatus, verificationNote) => {
    const response = await fetch(`${API_BASE_URL}/pharmacies/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus, verificationNote }),
    });
    if (!response.ok) throw new Error('Failed to verify pharmacy');
    return response.json();
  },
};

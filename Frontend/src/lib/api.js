import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const insertProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  userId: z.string(),
});

// API helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  profiles: {
    list: {
      path: "/api/profiles",
      responses: {
        200: z.array(
          z.object({
            id: z.number(),
            userId: z.string(),
            name: z.string(),
            relationship: z.string(),
            createdAt: z.string().nullable().optional(),
          })
        ),
      },
    },
    create: {
      path: "/api/profiles",
      responses: {
        201: z.object({
          id: z.number(),
          userId: z.string(),
          name: z.string(),
          relationship: z.string(),
          createdAt: z.string().nullable().optional(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// Patient Profiles API
export const patientProfilesApi = {
  getAll: async (userId) => {
    console.log('Fetching profiles for userId:', userId);
    const response = await fetch(`${API_BASE_URL}/profiles/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log('Profiles API response:', data);
    return data;
  },
  
  create: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
  
  update: async (id, profileData) => {
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Health Readings API
export const healthReadingsApi = {
  getByProfile: async (profileId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/health-readings/profile/${profileId}?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  add: async (readingData) => {
    const response = await fetch(`${API_BASE_URL}/health-readings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(readingData),
    });
    return response.json();
  },
  
  getLatest: async (profileId) => {
    const response = await fetch(`${API_BASE_URL}/health-readings/profile/${profileId}/latest`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getHbA1c: async (profileId) => {
    const response = await fetch(`${API_BASE_URL}/health-readings/profile/${profileId}/hba1c`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  calculateBMI: async (profileId, weight, height) => {
    const response = await fetch(`${API_BASE_URL}/health-readings/profile/${profileId}/calculate-bmi`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ weight, height }),
    });
    return response.json();
  },
  
  getChartData: async (profileId, type, period = '30') => {
    const response = await fetch(`${API_BASE_URL}/health-readings/profile/${profileId}/chart/${type}?period=${period}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/health-readings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Notifications API
export const notificationsApi = {
  getByUser: async (userId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  markAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  markAllAsRead: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getUnreadCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Medical Reports API
export const reportsApi = {
  uploadToCloudinary: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'medical_reports_preset'); // You need to create this in Cloudinary
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'uvbyxjyx'}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return {
      fileUrl: data.secure_url,
      publicId: data.public_id,
    };
  },
  
  upload: async (reportData) => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    });
    return response.json();
  },
  
  getFolders: async (profileId) => {
    const response = await fetch(`${API_BASE_URL}/reports/folders/${profileId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getByCategory: async (profileId, category) => {
    const response = await fetch(`${API_BASE_URL}/reports/profile/${profileId}/category/${category}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getById: async (reportId) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getComparisonData: async (profileId, category) => {
    const response = await fetch(`${API_BASE_URL}/reports/compare/${profileId}/${category}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getByTestType: async (profileId, testType) => {
    const response = await fetch(`${API_BASE_URL}/reports/folder/${profileId}/${encodeURIComponent(testType)}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getComparisonByTestType: async (profileId, testType) => {
    const response = await fetch(`${API_BASE_URL}/reports/compare/${profileId}/${encodeURIComponent(testType)}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateValues: async (reportId, extractedValues) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/values`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ extractedValues }),
    });
    return response.json();
  },
  
  delete: async (reportId) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  reanalyze: async (reportId) => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Chat API
export const chatApi = {
  createConversation: async (title) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    return response.json();
  },
  
  getUserConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  getConversation: async (conversationId) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
  
  saveMessage: async (conversationId, sender, message) => {
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, sender, message }),
    });
    return response.json();
  },
  
  updateConversation: async (conversationId, title) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    return response.json();
  },
  
  deleteConversation: async (conversationId) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

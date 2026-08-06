const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get or create consistent guest ID
const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Add guest ID header if not authenticated
  if (!token) {
    headers['x-guest-id'] = getGuestId();
  }

  console.log(`Making request to: ${API_BASE_URL}${url}`, { token: token ? 'exists' : 'missing', guestId: token ? 'N/A' : getGuestId() });

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: errorText || 'API request failed' };
    }
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Chatbot API service
export const chatbotService = {
  // Create a new chat session
  createSession: async (title = 'New Conversation') => {
    return authenticatedFetch('/chatbot/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  // Get all user sessions
  getSessions: async () => {
    return authenticatedFetch('/chatbot/sessions', {
      method: 'GET',
    });
  },

  // Get chat history for a specific session
  getChatHistory: async (sessionId) => {
    return authenticatedFetch(`/chatbot/sessions/${sessionId}`, {
      method: 'GET',
    });
  },

  // Send a message in a session
  sendMessage: async (sessionId, message) => {
    return authenticatedFetch(`/chatbot/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Clear messages in a session
  clearMessages: async (sessionId) => {
    return authenticatedFetch(`/chatbot/sessions/${sessionId}/messages`, {
      method: 'DELETE',
    });
  },

  // Delete a session
  deleteSession: async (sessionId) => {
    return authenticatedFetch(`/chatbot/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

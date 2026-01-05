/**
 * API service for DGA Qiyas Copilot
 * Handles all backend communication
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (username, password, email, displayName) => {
    const response = await api.post('/api/auth/register', {
      username,
      password,
      email,
      display_name: displayName,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Admin API
export const adminAPI = {
  getSettings: async () => {
    const response = await api.get('/api/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.post('/api/admin/settings', settings);
    return response.data;
  },

  testConnection: async (serviceType, provider, config) => {
    const response = await api.post('/api/admin/test-connection', {
      service_type: serviceType,
      provider,
      config,
    });
    return response.data;
  },

  getProviderStatus: async () => {
    const response = await api.get('/api/admin/provider-status');
    return response.data;
  },

  getHealth: async () => {
    const response = await api.get('/api/admin/health');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (message, sessionId, files = []) => {
    const formData = new FormData();
    formData.append('message', message);

    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post('/api/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/api/chat/sessions');
    return response.data;
  },

  getSessionHistory: async (sessionId) => {
    const response = await api.get(`/api/chat/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/api/chat/sessions/${sessionId}`);
    return response.data;
  },
};

export default api;

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // If backend provided a user-facing message on success, show it
    try {
      if (response && response.data && typeof response.data.message === 'string' && response.data.message.trim() !== '') {
        toast.success(response.data.message);
      }
    } catch (e) {
      // noop - don't let toast errors break API flow
      // console.error('Toast error:', e);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // If there is no response, it's a network error or request setup error
    if (!error.response) {
      if (error.request) {
        console.error('Network error: No response from server');
        return Promise.reject({ success: false, message: 'Network error. Please check your connection.' } as ApiError);
      }
      console.error('Request error:', error.message);
      return Promise.reject({ success: false, message: error.message } as ApiError);
    }

    const { status, data } = error.response;
    // Show backend-provided error message to user if present
    try {
      if (data && typeof data.message === 'string' && data.message.trim() !== '') {
        toast.error(data.message);
      }
    } catch (e) {
      // noop
    }
    const originalRequest = (error.config as InternalAxiosRequestConfig & { _retry?: boolean }) || {};

    // If the backend indicates the token expired (match exact message), attempt to refresh and retry once
    if (data && data.message === 'jwt expired') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshRes = await axios.post(`${api.defaults.baseURL}/users/refresh-token`, { refreshToken });
          const newAccessToken = refreshRes.data && refreshRes.data.accessToken;
          if (newAccessToken) {
            // Persist new access token
            localStorage.setItem('token', newAccessToken);
            // Update default header for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            }
            // Retry original request
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr);
          // Fall through to the default 401 handling which clears auth and redirects
        }
      }
    }

    // Default handling for other statuses or failed refresh
    switch (status) {
      case 401:
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Access forbidden:', data.message);
        break;
      case 404:
        console.error('Resource not found:', data.message);
        break;
      case 500:
        console.error('Server error:', data.message);
        break;
      default:
        console.error('API error:', data.message);
    }

    return Promise.reject(data);
  }
);

export default api;

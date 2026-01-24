import api from '../utils/api';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/user';

// Backend response structure
interface BackendAuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/users/login', credentials);
    // Transform backend response to match frontend types
    return {
      token: response.data.accessToken,
      user: {
        _id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role as 'ADMIN' | 'CLIENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<BackendAuthResponse>('/users/login', {
      email: data.email,
      password: data.password,
    });
    // Transform backend response to match frontend types
    return {
      token: response.data.accessToken,
      user: {
        _id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role as 'ADMIN' | 'CLIENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },

  // Logout user (clear local storage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Save auth data to localStorage
  saveAuthData: (token: string, user: AuthResponse['user']) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get saved auth data from localStorage
  getAuthData: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },
};

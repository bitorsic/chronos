import api from '../utils/api';
import type { CreateUserDto, CreateUserResponse, UserListItem } from '../types/user';

export const userService = {
  // Create a new user (admin or client)
  createUser: async (data: CreateUserDto): Promise<CreateUserResponse> => {
    const response = await api.post<CreateUserResponse>('/users', data);
    return response.data;
  },

  // Get all admins
  getAllAdmins: async (): Promise<UserListItem[]> => {
    const response = await api.get<{ admins: UserListItem[] }>('/users/admins');
    return response.data.admins;
  },

  // Get all clients
  getAllClients: async (): Promise<UserListItem[]> => {
    const response = await api.get<{ clients: UserListItem[] }>('/users/clients');
    return response.data.clients;
  },

  // Get current user info
  getCurrentUser: async (): Promise<UserListItem> => {
    const response = await api.get<UserListItem>('/users/me');
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (data: { name?: string; email?: string }): Promise<UserListItem> => {
    const response = await api.put<UserListItem>('/users/me', data);
    return response.data;
  },
};

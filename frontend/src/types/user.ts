export const UserRole = {
  ADMIN: 'admin',
  CLIENT: 'client'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// User Management
export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

export interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  temporaryPassword: string;
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

import { createContext } from 'react';
import type { LoginCredentials } from '../features/auth/types/auth';
import type { UserResponse } from '../features/auth/types/user/user.response';

// Auth Context State
export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth Context Actions
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginWithProvider: (provider: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient, tokenManager } from '../lib/api';
import type { AuthResponse, LoginCredentials } from '../features/auth/types/auth';
import type { UserResponse } from '../features/auth/types/user/user.response';
import { AuthContext, type AuthContextValue, type AuthState } from './authContextDef';

// Load user from localStorage
const loadStoredUser = (): UserResponse | null => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => ({
    user: loadStoredUser(),
    isAuthenticated: tokenManager.isAuthenticated(),
    isLoading: false,
  }));
  
  const initializedRef = useRef(false);

  // Check token validity on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const checkAuth = async () => {
      if (tokenManager.isAuthenticated() && tokenManager.isTokenExpired()) {
        // Token is expired, try to refresh
        try {
          await apiClient.get('/auth/me');
        } catch {
          // Refresh failed, clear auth state
          tokenManager.clearTokens();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials, { skipAuth: true });
      
      tokenManager.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed. Please try again.',
      };
    }
  }, []);

  const loginWithProvider = useCallback(async (provider: string): Promise<void> => {
    // For OAuth, redirect to the provider's auth page
    // The backend should handle the OAuth flow and redirect back with tokens
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'}/auth/oauth/${provider}`;
  }, []);

  const logout = useCallback((): void => {
    tokenManager.clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const user = await apiClient.get<UserResponse>('/auth/me');
      localStorage.setItem('user', JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch {
      // If refresh fails, logout
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    loginWithProvider,
    logout,
    refreshUser,
  }), [state, login, loginWithProvider, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

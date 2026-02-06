import { apiClient, tokenManager } from '../../../lib/api';
import type { LoginCredentials, AuthResponse } from '../types/auth';

/**
 * Auth Service - Handles authentication operations
 * Uses the centralized API client with JWT interceptor
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, { skipAuth: true });
    this.saveTokens(response);
    return response;
  },

  async loginWithProvider(provider: string): Promise<void> {
    // Redirect to OAuth provider
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'}/auth/oauth/${provider}`;
  },

  logout(): void {
    tokenManager.clearTokens();
  },

  saveTokens(authResponse: AuthResponse): void {
    tokenManager.setTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  },

  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },

  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  isTokenExpired(): boolean {
    return tokenManager.isTokenExpired();
  },
};

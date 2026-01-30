import { useTransition } from 'react';
import { authService } from '../services/authService';
import type { AuthResponse } from '../types/auth';

interface LoginState {
  error: string | null;
  success: boolean;
}

export function useAuth() {
  const [isPending, startTransition] = useTransition();

  const loginAction = async (
    formData: FormData
  ): Promise<LoginState> => {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { error: 'Username and password are required', success: false };
    }

    try {
      const response: AuthResponse = await authService.login({ username, password });
      authService.saveTokens(response);
      window.location.href = '/dashboard';
      return { error: null, success: true };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Login failed. Please try again.',
        success: false 
      };
    }
  };

  const loginWithProvider = (provider: string): void => {
    startTransition(async () => {
      try {
        const response: AuthResponse = await authService.loginWithProvider(provider);
        authService.saveTokens(response);
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('OAuth login failed:', err);
      }
    });
  };

  const logout = (): void => {
    authService.logout();
    window.location.href = '/login';
  };

  return {
    loginAction,
    loginWithProvider,
    logout,
    isPending
  };
}

import { TOKEN_KEYS } from './config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token Manager - Handles token storage and retrieval
 * Uses localStorage for persistence across sessions
 */
export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  setTokens(tokens: TokenPair): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Decode JWT token payload (without verification)
   * Useful for checking token expiration on client side
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /**
   * Check if access token is expired or about to expire
   * Returns true if token expires within the buffer time (default 30 seconds)
   */
  isTokenExpired(bufferSeconds: number = 30): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded.exp !== 'number') return true;

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = bufferSeconds * 1000;

    return currentTime >= expirationTime - bufferTime;
  },
};

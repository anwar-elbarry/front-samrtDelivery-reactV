import { API_CONFIG, HTTP_STATUS } from './config';
import { tokenManager } from './tokenManager';

// Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  timeout?: number;
}

type RefreshSubscriber = (token: string) => void;

/**
 * API Client with JWT Interceptor
 * 
 * Features:
 * - Automatic token injection
 * - Token refresh on 401
 * - Request queuing during refresh
 * - Timeout handling
 * - Centralized error handling
 */
class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: RefreshSubscriber[] = [];
  private refreshPromise: Promise<string> | null = null;

  /**
   * Subscribe to token refresh completion
   */
  private subscribeToTokenRefresh(callback: RefreshSubscriber): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers with new token
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = (async () => {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        tokenManager.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
        });

        this.onTokenRefreshed(data.accessToken);
        return data.accessToken;
      } catch (error) {
        // Log the error for debugging but DON'T clear tokens or redirect
        // This allows for better debugging of API errors during development
        console.error('[API] Token refresh failed:', error);
        // Only clear tokens if it's a genuine auth failure (not network errors, etc.)
        // tokenManager.clearTokens(); // Commented out for debugging
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(customHeaders?: HeadersInit, skipAuth?: boolean): Headers {
    const headers = new Headers(customHeaders);
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth) {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle no content responses
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson 
        ? await response.json().catch(() => ({}))
        : { message: response.statusText };
      
      const error: ApiError = {
        message: errorData.message || errorData.error || 'An error occurred',
        status: response.status,
        code: errorData.code,
      };
      
      // Log errors for debugging
      console.error('[API Error]', {
        url: response.url,
        status: response.status,
        error: errorData,
      });
      
      throw error;
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * Execute fetch with retry on 401
   */
  private async fetchWithRetry<T>(
    url: string,
    config: RequestConfig,
    isRetry = false
  ): Promise<T> {
    const { body, skipAuth, timeout = API_CONFIG.TIMEOUT, ...restConfig } = config;
    
    const headers = this.buildHeaders(config.headers, skipAuth);
    
    const fetchConfig: RequestInit = {
      ...restConfig,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const fetchPromise = fetch(`${API_CONFIG.BASE_URL}${url}`, fetchConfig);
    
    const response = await Promise.race([
      fetchPromise,
      this.createTimeout(timeout),
    ]);

    // Handle 401 Unauthorized
    if (response.status === HTTP_STATUS.UNAUTHORIZED && !isRetry && !skipAuth) {
      // Check if we're already refreshing
      if (this.isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          this.subscribeToTokenRefresh(async (newToken) => {
            try {
              // Retry with new token
              headers.set('Authorization', `Bearer ${newToken}`);
              const retryResponse = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
                ...fetchConfig,
                headers,
              });
              resolve(await this.handleResponse<T>(retryResponse));
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      // Try to refresh the token
      try {
        await this.refreshToken();
        // Retry the original request
        return this.fetchWithRetry<T>(url, config, true);
      } catch {
        throw {
          message: 'Session expired. Please login again.',
          status: HTTP_STATUS.UNAUTHORIZED,
        } as ApiError;
      }
    }

    return this.handleResponse<T>(response);
  }

  /**
   * GET request
   */
  async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.fetchWithRetry<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.fetchWithRetry<T>(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.fetchWithRetry<T>(url, { ...config, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.fetchWithRetry<T>(url, { ...config, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.fetchWithRetry<T>(url, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

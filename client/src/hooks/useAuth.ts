import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  xp: number;
  streak: number;
  lastActivity?: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class AuthTokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const accessToken = AuthTokenManager.getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (response.status === 401 && accessToken) {
    // Try to refresh token
    const refreshToken = AuthTokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          AuthTokenManager.setTokens(
            refreshData.data.accessToken,
            refreshData.data.refreshToken
          );

          // Retry original request with new token
          return fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshData.data.accessToken}`,
              ...options.headers,
            },
          }).then(res => res.json());
        } else {
          AuthTokenManager.clearTokens();
          window.location.reload();
        }
      } catch (error) {
        AuthTokenManager.clearTokens();
        window.location.reload();
      }
    }
  }

  return response.json();
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiRequest('/api/auth/me'),
    enabled: AuthTokenManager.hasTokens() && isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        AuthTokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        queryClient.setQueryData(['auth', 'me'], { success: true, data: { user: data.data.user } });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        AuthTokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        queryClient.setQueryData(['auth', 'me'], { success: true, data: { user: data.data.user } });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const logout = async () => {
    const refreshToken = AuthTokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }

    AuthTokenManager.clearTokens();
    queryClient.clear();
    window.location.reload();
  };

  const isAuthenticated = !!(user?.success && user?.data?.user && AuthTokenManager.hasTokens());
  const isLoadingAuth = !isInitialized || (AuthTokenManager.hasTokens() && isLoading);

  return {
    user: user?.data?.user,
    isLoading: isLoadingAuth,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
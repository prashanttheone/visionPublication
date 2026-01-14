// lib/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authUtils = {
  // Store auth data in both localStorage and sessionStorage for redundancy
  setAuthToken(token: string, user: any) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  // Get token from storage
  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  // Get user from storage
  getUser(): any | null {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear auth data
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  },

  // Logout user - call API and clear local data
  async logout() {
    try {
      const token = authUtils.getToken();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage regardless of API response
      authUtils.clearAuth();
      // Redirect to login page
      window.location.href = '/';
    }
  },

  // Helper for authenticated fetch calls
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = authUtils.getToken();
    const headers = {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
    };

    return fetch(url, {
      ...options,
      headers,
    });
  },

  // Check if token is valid and not expired
  isTokenValid(token?: string): boolean {
    const authToken = token || authUtils.getToken();
    if (!authToken) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(authToken);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch (error) {
      return false;
    }
  },

  // Get user role
  getUserRole(): string | null {
    const user = authUtils.getUser();
    return user?.role || null;
  },

  // Check if user is admin
  isAdmin(): boolean {
    return authUtils.getUserRole() === 'admin';
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return authUtils.isTokenValid();
  },
};

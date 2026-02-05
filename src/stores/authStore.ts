/**
 * Authentication Store
 * Manages user authentication state
 */

import { create } from 'zustand';
import { authService, AuthResponse, apiClient } from '../services/api';

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  isStudentVerified: boolean;
  studentDiscount: number;
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendOTP: (phone: string) => Promise<{ sessionId: string }>;
  verifyOTP: (sessionId: string, otp: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Send OTP
  sendOTP: async (email: string): Promise<{ sessionId: string }> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.sendOTP({ email });
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (sessionId: string, otp: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authService.verifyOTP({ sessionId, otp });
      await apiClient.setTokens(response.accessToken, response.refreshToken);
      set({
        user: response.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Login with email
  loginWithEmail: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authService.loginWithEmail({ email, password });
      await apiClient.setTokens(response.accessToken, response.refreshToken);
      set({
        user: response.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Load user profile
  loadUser: async (): Promise<void> => {
    // TEMPORARY: Skip loading user for development (no backend)
    set({ isLoading: false, isAuthenticated: false, user: null });
    return;

    /* Uncomment when backend is ready
    set({ isLoading: true });
    try {
      const user = await authService.getProfile();
      set({
        user: user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    */
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(data);
      set({
        user: updatedUser as User,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear error
  clearError: (): void => {
    set({ error: null });
  },
}));

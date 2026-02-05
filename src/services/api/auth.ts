/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  sessionId: string;
  expiresIn: number;
}

export interface VerifyOTPRequest {
  sessionId: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    isStudentVerified: boolean;
    studentDiscount: number;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export const authService = {
  /**
   * Send OTP to email
   */
  sendOTP: async (data: SendOTPRequest): Promise<SendOTPResponse> => {
    return apiClient.post('/auth/send-otp', data);
  },

  /**
   * Verify OTP and authenticate
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
    return apiClient.post('/auth/verify-otp', data);
  },

  /**
   * Login with email and password
   */
  loginWithEmail: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return apiClient.post('/auth/refresh', data);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    await apiClient.logout();
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthResponse['user']> => {
    return apiClient.get('/auth/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> => {
    return apiClient.put('/auth/profile', data);
  },
};

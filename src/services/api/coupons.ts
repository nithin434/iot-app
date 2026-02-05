/**
 * Coupons API Service
 * Handles coupon validation and management
 */

import { apiClient } from './client';

export interface CouponResponse {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  valid: boolean;
  message: string;
}

export const couponsService = {
  /**
   * Validate coupon code with order total
   */
  validateCoupon: async (code: string, orderTotal: number): Promise<CouponResponse> => {
    return apiClient.post('/coupons/validate', { code, orderTotal });
  },

  /**
   * Get all active coupons
   */
  getActiveCoupons: async (): Promise<any[]> => {
    return apiClient.get('/coupons/active');
  },

  /**
   * Get coupon details by code
   */
  getCouponByCode: async (code: string): Promise<any> => {
    return apiClient.get(`/coupons/${code}`);
  },
};

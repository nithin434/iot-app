/**
 * Cart API Service
 * Handles all cart-related API calls
 */

import { apiClient } from './client';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  /**
   * Create order from cart
   */
  createOrder: async (checkoutData: CheckoutData): Promise<Order> => {
    return apiClient.post('/orders', checkoutData);
  },

  /**
   * Get user orders
   */
  getUserOrders: async (): Promise<Order[]> => {
    return apiClient.get('/orders');
  },

  /**
   * Get order details by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId: string): Promise<Order> => {
    return apiClient.post(`/orders/${orderId}/cancel`, {});
  },

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    return apiClient.put(`/orders/${orderId}/status`, { status });
  },

  /**
   * Apply coupon to cart (legacy - use couponsService instead)
   */
  applyCoupon: async (code: string, orderTotal: number) => {
    return apiClient.post('/coupons/validate', { code, orderTotal });
  },
};

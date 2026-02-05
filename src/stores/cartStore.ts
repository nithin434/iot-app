/**
 * Cart Store
 * Manages shopping cart state
 */

import { create } from 'zustand';
import { cartService, Cart, CartItem } from '../services/api';
import { Product } from '../services/api/products';

interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  syncCart: () => Promise<void>;
  clearError: () => void;

  // Computed
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
  hasItem: (productId: string) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  cart: null,
  isLoading: false,
  error: null,

  // Fetch cart
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addToCart({ productId, quantity });
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update item quantity
  updateQuantity: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      if (quantity === 0) {
        await get().removeItem(productId);
      } else {
        const cart = await cartService.updateCartItem(productId, { productId, quantity });
        set({ cart, isLoading: false });
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeFromCart(productId);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({ cart: null, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Apply coupon
  applyCoupon: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.applyCoupon({ code });
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Remove coupon
  removeCoupon: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.removeCoupon();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Sync cart with server
  syncCart: async () => {
    const { cart } = get();
    if (!cart) return;

    set({ isLoading: true, error: null });
    try {
      const syncedCart = await cartService.syncCart(cart.items);
      set({ cart: syncedCart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get total item count
  getItemCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  // Get quantity of specific item
  getItemQuantity: (productId: string) => {
    const { cart } = get();
    if (!cart) return 0;
    const item = cart.items.find((item) => item.product.id === productId);
    return item?.quantity || 0;
  },

  // Check if item exists in cart
  hasItem: (productId: string) => {
    const { cart } = get();
    if (!cart) return false;
    return cart.items.some((item) => item.product.id === productId);
  },
}));

/**
 * Order Store
 * Manages order history and tracking
 */

import { create } from 'zustand';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrderData {
  addressId: string;
  paymentMethod: string;
}

interface OrderState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Fetch all orders
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const orders = await orderService.getOrders();
      const orders: Order[] = []; // Mock data
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch order by ID
  fetchOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const order = await orderService.getOrderById(orderId);
      const order: Order | null = null; // Mock data
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Create new order
  createOrder: async (data: CreateOrderData) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const order = await orderService.createOrder(data);
      const order: Order = {} as Order; // Mock data
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

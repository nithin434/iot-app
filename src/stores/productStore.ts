/**
 * Product Store
 * Manages product catalog and search state
 */

import { create } from 'zustand';
import { productsService, Product, Category, ProductQueryParams } from '../services/api';

interface ProductFilters {
  priceRange?: [number, number];
  difficulty?: string[];
  inStock?: boolean;
}

interface ProductState {
  // State
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  filters: ProductFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;

  // Actions
  fetchProducts: (categoryId?: string, page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  applyFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  setSelectedCategory: (categoryId: string | null) => void;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  categories: [],
  selectedCategory: null,
  filters: {},
  searchQuery: '',
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Fetch products
  fetchProducts: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      // Mock data for development
      const mockProducts = [
        {
          id: '1',
          name: 'Arduino Uno R3',
          description: 'Microcontroller board based on ATmega328P',
          price: 599,
          studentPrice: 499,
          image: 'https://via.placeholder.com/200',
          stock: 45,
          difficulty: 'Beginner',
          rating: 4.5,
          discount: 10,
        },
        {
          id: '2',
          name: 'ESP32 DevKit',
          description: 'WiFi and Bluetooth enabled microcontroller',
          price: 799,
          studentPrice: 699,
          image: 'https://via.placeholder.com/200',
          stock: 32,
          difficulty: 'Intermediate',
          rating: 4.7,
        },
        {
          id: '3',
          name: 'Raspberry Pi 4',
          description: 'Single board computer with 4GB RAM',
          price: 4999,
          studentPrice: 4499,
          image: 'https://via.placeholder.com/200',
          stock: 8,
          difficulty: 'Advanced',
          rating: 4.9,
          discount: 15,
        },
        {
          id: '4',
          name: 'DHT22 Sensor',
          description: 'Temperature and humidity sensor',
          price: 299,
          studentPrice: 249,
          image: 'https://via.placeholder.com/200',
          stock: 120,
          difficulty: 'Beginner',
          rating: 4.3,
        },
        {
          id: '5',
          name: 'HC-SR04 Ultrasonic',
          description: 'Distance measuring sensor',
          price: 149,
          studentPrice: 129,
          image: 'https://via.placeholder.com/200',
          stock: 95,
          difficulty: 'Beginner',
          rating: 4.4,
        },
        {
          id: '6',
          name: 'L298N Motor Driver',
          description: 'Dual H-Bridge motor driver',
          price: 249,
          studentPrice: 199,
          image: 'https://via.placeholder.com/200',
          stock: 67,
          difficulty: 'Intermediate',
          rating: 4.6,
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        products: mockProducts,
        hasMore: false,
        currentPage: 1,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await productsService.getCategories();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Search products
  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const products = await productsService.searchProducts(query);
      set({ products, isLoading: false, hasMore: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Apply filters
  applyFilters: (filters: ProductFilters) => {
    set({ filters });
    get().fetchProducts(get().selectedCategory || undefined, 1);
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} });
    get().fetchProducts(get().selectedCategory || undefined, 1);
  },

  // Set selected category
  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
    get().fetchProducts(categoryId || undefined, 1);
  },

  // Load more products (pagination)
  loadMore: async () => {
    const { hasMore, isLoading, currentPage, selectedCategory } = get();
    if (!hasMore || isLoading) return;
    
    await get().fetchProducts(selectedCategory || undefined, currentPage + 1);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

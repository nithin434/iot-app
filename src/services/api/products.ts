/**
 * Products API Service
 * Handles all product-related API calls
 */

import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  studentPrice?: number;
  images: string[];
  specifications: Record<string, string>;
  pinDiagram?: string;
  datasheet?: string;
  useCases: string[];
  compatibleComponents: string[];
  stock: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

export interface ProductQueryParams {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string[];
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Recommendation {
  type: 'frequently_bought' | 'you_may_need' | 'compatible';
  products: Product[];
  reason: string;
}

export const productsService = {
  /**
   * Get products with filters and pagination
   */
  getProducts: async (params?: ProductQueryParams): Promise<ProductsResponse> => {
    return apiClient.get('/products', { params });
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Search products
   */
  searchProducts: async (query: string): Promise<Product[]> => {
    return apiClient.get('/products/search', { params: { q: query } });
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get('/categories');
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    return apiClient.get(`/categories/${id}`);
  },

  /**
   * Get product recommendations
   */
  getRecommendations: async (productId: string): Promise<Recommendation[]> => {
    return apiClient.get(`/products/${productId}/recommendations`);
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    return apiClient.get('/products/featured');
  },

  /**
   * Get popular products
   */
  getPopularProducts: async (limit?: number): Promise<Product[]> => {
    return apiClient.get('/products/popular', { params: { limit } });
  },
};

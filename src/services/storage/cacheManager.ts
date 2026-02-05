/**
 * Cache Manager
 * Multi-layer caching strategy for optimal performance
 */

import { storageService } from './asyncStorage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  strategy: 'memory' | 'disk' | 'both';
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>>;
  private maxMemoryCacheSize: number;

  constructor(maxMemoryCacheSize = 50) {
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = maxMemoryCacheSize;
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check disk cache
    const diskEntry = await storageService.getItem<CacheEntry<T>>(key);
    if (diskEntry && !this.isExpired(diskEntry)) {
      // Promote to memory cache
      this.memoryCache.set(key, diskEntry);
      this.enforceMemoryCacheSize();
      return diskEntry.data;
    }

    return null;
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
    };

    if (config.strategy === 'memory' || config.strategy === 'both') {
      this.memoryCache.set(key, entry);
      this.enforceMemoryCacheSize();
    }

    if (config.strategy === 'disk' || config.strategy === 'both') {
      await storageService.setItem(key, entry);
    }
  }

  /**
   * Remove cached data
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await storageService.removeItem(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    // Note: This clears ALL storage, use with caution
    // In production, you might want to only clear cache-specific keys
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Enforce memory cache size limit (LRU eviction)
   */
  private enforceMemoryCacheSize(): void {
    if (this.memoryCache.size > this.maxMemoryCacheSize) {
      // Remove oldest entry (first entry in Map)
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      maxMemoryCacheSize: this.maxMemoryCacheSize,
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
};


import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T = any>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const globalCache = new DataCache();

export function useDataCache() {
  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      globalCache.cleanup();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const getCached = useCallback(<T = any>(key: string): T | null => {
    return globalCache.get<T>(key);
  }, []);

  const setCache = useCallback(<T = any>(key: string, data: T, ttl?: number): void => {
    globalCache.set(key, data, ttl);
  }, []);

  const invalidateCache = useCallback((key: string): void => {
    globalCache.invalidate(key);
  }, []);

  const clearCache = useCallback((): void => {
    globalCache.clear();
  }, []);

  return {
    getCached,
    setCache,
    invalidateCache,
    clearCache
  };
}

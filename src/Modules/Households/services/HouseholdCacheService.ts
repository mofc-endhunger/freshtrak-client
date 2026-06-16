/**
 * Household Cache Service
 * Intelligent caching service for household data with TTL, invalidation, and optimistic updates
 */

import { Household, HouseholdMember } from '../types/household.types';
import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: number;
}

interface CacheConfig {
  defaultTTL: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

export class HouseholdCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private apiService: HouseholdsApiService;

  constructor(apiService: HouseholdsApiService, config?: Partial<CacheConfig>) {
    this.apiService = apiService;
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Get cached data or fetch from API
   */
  async get<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const entry = this.cache.get(key);

    // Check if cache entry exists and is not expired
    if (entry && this.isValid(entry)) {
      this.stats.hits++;
      this.updateHitRate();
      return entry.data;
    }

    // Cache miss - fetch from API
    this.stats.misses++;
    this.updateHitRate();

    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // If API call fails and we have stale data, return it
      if (entry) {
        console.warn(`API call failed for ${key}, returning stale data:`, error);
        return entry.data;
      }
      throw error;
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: 1,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    // Evict if cache is too large
    if (this.cache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Update cache entry with optimistic update
   */
  update<T>(key: string, updater: (data: T) => T): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    entry.data = updater(entry.data);
    entry.version++;
    entry.timestamp = Date.now();

    return true;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let invalidated = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.stats.size = this.cache.size;
    return invalidated;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if cache entry is valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  // ==================== HOUSEHOLD-SPECIFIC METHODS ====================

  /**
   * Get household by ID with caching
   */
  async getHousehold(householdId: number): Promise<Household> {
    const key = `household:${householdId}`;

    return this.get(
      key,
      () => this.apiService.getHousehold(householdId).then((response) => response.data),
      10 * 60 * 1000, // 10 minutes TTL
    );
  }

  /**
   * Get household members with caching
   * Note: Members are included in the household response, so we extract them from there
   */
  async getHouseholdMembers(householdId: number): Promise<HouseholdMember[]> {
    const key = `members:${householdId}`;

    return this.get(
      key,
      async () => {
        const householdResponse = await this.apiService.getHousehold(householdId);
        return householdResponse.data.members || [];
      },
      5 * 60 * 1000, // 5 minutes TTL
    );
  }

  /**
   * Update household with optimistic update
   */
  async updateHousehold(householdId: number, data: any): Promise<Household> {
    const key = `household:${householdId}`;
    const currentKey = 'household:current';

    // Optimistic update
    this.update(key, (household: Household) => ({
      ...household,
      ...data,
    }));

    this.update(currentKey, (household: Household) => ({
      ...household,
      ...data,
    }));

    try {
      const response = await this.apiService.updateHousehold(householdId, data);
      const updatedHousehold = response.data;

      // Update cache with actual response
      this.set(key, updatedHousehold);
      this.set(currentKey, updatedHousehold);

      return updatedHousehold;
    } catch (error) {
      // Revert optimistic update on error
      this.invalidate(key);
      this.invalidate(currentKey);
      throw error;
    }
  }

  /**
   * Add member with optimistic update
   * Note: This method is not implemented as the current API doesn't support individual member operations.
   * Members are managed through the household update process.
   */
  async addMember(householdId: number, data: any): Promise<HouseholdMember> {
    // NOTE: Individual member operations are not supported by the current API
    // This feature requires backend API support for per-member CRUD operations
    throw new Error(
      'Individual member operations are not supported by the current API. Use household update instead.',
    );
  }

  /**
   * Update member with optimistic update
   * Note: This method is not implemented as the current API doesn't support individual member operations.
   * Members are managed through the household update process.
   */
  async updateMember(householdId: number, memberId: number, data: any): Promise<HouseholdMember> {
    // NOTE: Individual member operations are not supported by the current API
    // This feature requires backend API support for per-member CRUD operations
    throw new Error(
      'Individual member operations are not supported by the current API. Use household update instead.',
    );
  }

  /**
   * Delete member with optimistic update
   * Note: This method is not implemented as the current API doesn't support individual member operations.
   * Members are managed through the household update process.
   */
  async deleteMember(householdId: number, memberId: number): Promise<void> {
    // NOTE: Individual member operations are not supported by the current API
    // This feature requires backend API support for per-member CRUD operations
    throw new Error(
      'Individual member operations are not supported by the current API. Use household update instead.',
    );
  }

  /**
   * Invalidate household-related cache entries
   */
  invalidateHousehold(householdId: number): void {
    this.invalidatePattern(`household:${householdId}`);
    this.invalidatePattern(`members:${householdId}`);
    this.invalidate('household:current');
  }

  /**
   * Invalidate all household cache entries
   */
  invalidateAllHouseholds(): void {
    this.invalidatePattern('household:');
    this.invalidatePattern('members:');
  }
}

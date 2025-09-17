/**
 * Households API Service
 * 
 * Dedicated service for all household-related API operations.
 * Handles authentication, error handling, caching, and retry logic.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  CreateHouseholdRequest,
  UpdateHouseholdRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  HouseholdResponse,
  MemberResponse,
  MemberListResponse,
  HouseholdApiConfig,
  HouseholdApiError,
  HouseholdApiErrorDetails,
  PaginationParams,
  MemberFilterOptions,
  BulkMemberOperation,
  BulkOperationResponse,
} from '../Modules/Households/types';

/**
 * Configuration for the Households API service
 */
const API_CONFIG: HouseholdApiConfig = {
  baseUrl: process.env.REACT_APP_PANTRY_FINDER_API || '',
  endpoints: {
    createHousehold: '/households',
    getHousehold: '/households',
    getHouseholdById: (id: number) => `/households/${id}`,
    updateHousehold: (id: number) => `/households/${id}`,
    getMembers: (householdId: number) => `/households/${householdId}/members`,
    addMember: (householdId: number) => `/households/${householdId}/members`,
    updateMember: (householdId: number, memberId: number) => `/households/${householdId}/members/${memberId}`,
    deactivateMember: (householdId: number, memberId: number) => `/households/${householdId}/members/${memberId}`,
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Cache configuration for household data
 */
const CACHE_CONFIG = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  keys: {
    household: 'household_data',
    members: 'household_members',
    member: (id: number) => `member_${id}`,
  },
};

/**
 * Simple in-memory cache implementation
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_CONFIG.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Error handling utilities
 */
class ApiErrorHandler {
  static createError(error: any): HouseholdApiErrorDetails {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message || 'API request failed';

      return {
        type: this.getErrorType(status),
        message,
        code: error.response.data?.code,
        details: error.response.data,
        retryable: status >= 500 || status === 429,
      };
    } else if (error.request) {
      // Network error
      return {
        type: 'NETWORK_ERROR',
        message: 'Network error - please check your connection',
        retryable: true,
      };
    } else {
      // Other error
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        retryable: false,
      };
    }
  }

  private static getErrorType(status: number): HouseholdApiError {
    switch (status) {
      case 401:
        return 'AUTHENTICATION_ERROR';
      case 403:
        return 'AUTHORIZATION_ERROR';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'API_RATE_LIMIT';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

/**
 * Main Households API Service class
 */
export class HouseholdsApiService {
  private axiosInstance: AxiosInstance;
  private cache: SimpleCache;

  constructor() {
    this.cache = new SimpleCache();
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create configured Axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add authentication token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and caching
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Cache successful responses
        this.cacheResponse(response);
        return response;
      },
      (error) => {
        const apiError = ApiErrorHandler.createError(error);
        console.error('Households API Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    try {
      const cognitoUser = localStorage.getItem('cognitoUser');
      if (cognitoUser) {
        const userData = JSON.parse(cognitoUser);
        return userData.accessToken || null;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Cache successful responses
   */
  private cacheResponse(response: AxiosResponse): void {
    if (!CACHE_CONFIG.enabled) return;

    const url = response.config.url || '';
    const method = response.config.method || '';

    // Only cache GET requests
    if (method.toLowerCase() !== 'get') return;

    // Cache household data
    if (url.includes('/households') && !url.includes('/members')) {
      this.cache.set(CACHE_CONFIG.keys.household, response.data);
    }
    // Cache members data
    else if (url.includes('/members')) {
      this.cache.set(CACHE_CONFIG.keys.members, response.data);
    }
  }

  /**
   * Retry failed requests
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (attempt < API_CONFIG.retryAttempts && error.retryable) {
        console.log(`Retrying request (attempt ${attempt + 1}/${API_CONFIG.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  // ==================== HOUSEHOLD OPERATIONS ====================

  /**
   * Create a new household
   */
  async createHousehold(data: CreateHouseholdRequest): Promise<HouseholdResponse> {
    const requestFn = () => this.axiosInstance.post(API_CONFIG.endpoints.createHousehold, data);
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Get the current user's household
   */
  async getHousehold(householdId?: number): Promise<HouseholdResponse> {
    // If householdId is provided, use getHouseholdById
    if (householdId) {
      return this.getHouseholdById(householdId);
    }

    // Check cache first
    const cachedData = this.cache.get(CACHE_CONFIG.keys.household);
    if (cachedData) {
      return cachedData;
    }

    const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getHousehold);
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Get household by ID
   */
  async getHouseholdById(id: number): Promise<HouseholdResponse> {
    const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getHouseholdById(id));
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Update household information
   */
  async updateHousehold(id: number, data: UpdateHouseholdRequest): Promise<HouseholdResponse> {
    const requestFn = () => this.axiosInstance.patch(API_CONFIG.endpoints.updateHousehold(id), data);
    const response = await this.retryRequest(requestFn);

    // Clear cache after update
    this.cache.delete(CACHE_CONFIG.keys.household);

    return response.data;
  }

  // ==================== MEMBER OPERATIONS ====================

  /**
   * Get household members
   */
  async getMembers(
    householdId: number,
    options?: PaginationParams & MemberFilterOptions
  ): Promise<MemberListResponse> {
    // Check cache first
    const cachedData = this.cache.get(CACHE_CONFIG.keys.members);
    if (cachedData && !options) {
      return cachedData;
    }

    const params = new URLSearchParams();
    if (options) {
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);
      if (options.status) params.append('status', options.status);
      if (options.memberType) params.append('memberType', options.memberType);
      if (options.searchTerm) params.append('search', options.searchTerm);
    }

    const url = `${API_CONFIG.endpoints.getMembers(householdId)}${params.toString() ? `?${params.toString()}` : ''}`;
    const requestFn = () => this.axiosInstance.get(url);
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Get household members (alias for getMembers)
   */
  async getHouseholdMembers(householdId: number): Promise<MemberListResponse> {
    return this.getMembers(householdId);
  }

  /**
   * Add a new household member
   */
  async addMember(householdId: number, data: CreateMemberRequest): Promise<MemberResponse> {
    const requestFn = () => this.axiosInstance.post(API_CONFIG.endpoints.addMember(householdId), data);
    const response = await this.retryRequest(requestFn);

    // Clear cache after adding member
    this.cache.delete(CACHE_CONFIG.keys.members);
    this.cache.delete(CACHE_CONFIG.keys.household);

    return response.data;
  }

  /**
   * Create household member (alias for addMember)
   */
  async createHouseholdMember(householdId: number, data: CreateMemberRequest): Promise<MemberResponse> {
    return this.addMember(householdId, data);
  }

  /**
   * Update household member
   */
  async updateMember(
    householdId: number,
    memberId: number,
    data: UpdateMemberRequest
  ): Promise<MemberResponse> {
    const requestFn = () => this.axiosInstance.patch(
      API_CONFIG.endpoints.updateMember(householdId, memberId),
      data
    );
    const response = await this.retryRequest(requestFn);

    // Clear cache after update
    this.cache.delete(CACHE_CONFIG.keys.members);
    this.cache.delete(CACHE_CONFIG.keys.household);
    this.cache.delete(CACHE_CONFIG.keys.member(memberId));

    return response.data;
  }

  /**
   * Update household member (alias for updateMember)
   */
  async updateHouseholdMember(
    householdId: number,
    memberId: number,
    data: UpdateMemberRequest
  ): Promise<MemberResponse> {
    return this.updateMember(householdId, memberId, data);
  }

  /**
   * Deactivate household member (soft delete)
   */
  async deactivateMember(householdId: number, memberId: number): Promise<MemberResponse> {
    const requestFn = () => this.axiosInstance.delete(
      API_CONFIG.endpoints.deactivateMember(householdId, memberId)
    );
    const response = await this.retryRequest(requestFn);

    // Clear cache after deactivation
    this.cache.delete(CACHE_CONFIG.keys.members);
    this.cache.delete(CACHE_CONFIG.keys.household);
    this.cache.delete(CACHE_CONFIG.keys.member(memberId));

    return response.data;
  }

  /**
   * Delete household member (alias for deactivateMember)
   */
  async deleteHouseholdMember(householdId: number, memberId: number): Promise<MemberResponse> {
    return this.deactivateMember(householdId, memberId);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Perform bulk operations on multiple members
   */
  async bulkMemberOperation(
    householdId: number,
    operation: BulkMemberOperation
  ): Promise<BulkOperationResponse> {
    const requestFn = () => this.axiosInstance.post(
      `${API_CONFIG.endpoints.getMembers(householdId)}/bulk`,
      operation
    );
    const response = await this.retryRequest(requestFn);

    // Clear cache after bulk operation
    this.cache.delete(CACHE_CONFIG.keys.members);
    this.cache.delete(CACHE_CONFIG.keys.household);

    return response.data;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cached data
   */
  clearCacheForHousehold(householdId?: number): void {
    this.cache.delete(CACHE_CONFIG.keys.household);
    this.cache.delete(CACHE_CONFIG.keys.members);
    if (householdId) {
      // Clear individual member caches if needed
      // This would require tracking member IDs, which we can implement later
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get API configuration
   */
  getConfig(): HouseholdApiConfig {
    return API_CONFIG;
  }
}

// Export singleton instance
export const householdsApiService = new HouseholdsApiService();

// Export types for external use
export type { HouseholdApiError, HouseholdApiErrorDetails };

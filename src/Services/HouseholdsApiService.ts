/**
 * Households API Service
 * 
 * Dedicated service for all household-related API operations.
 * Handles authentication, error handling, caching, and retry logic.
 */

import { handleAuthError } from '../Utils/AuthErrorHandler';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  CreateHouseholdRequest,
  UpdateHouseholdRequest,
  HouseholdResponse,
  HouseholdApiConfig,
  HouseholdApiError,
  HouseholdApiErrorDetails,
  UsersMeResponse,
} from '../Modules/Households/types';
import {
  retryWithBackoff,
  createErrorContext,
  logError,
  DEFAULT_RETRY_CONFIG,
} from '../Modules/Households/utils/errorHandling';
import {
  mockHousehold,
  mockHouseholdResponse,
} from '../Testing/mock-households';

/**
 * Configuration for the Households API service
 */
const API_CONFIG: HouseholdApiConfig = {
  baseUrl: process.env.REACT_APP_REGISTRATION_API || '',
  endpoints: {
    createHousehold: 'api/users',
    getUsersMe: 'api/users/me',
    getHouseholdById: (id: number) => `api/households/${id}`,
    updateHousehold: (id: number) => `api/users/${id}`,
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Enable mock mode when API is not available
const USE_MOCK_DATA = false; // Disabled for now - will show wizard instead

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
  static createError(error: any, context?: any): HouseholdApiErrorDetails {
    const errorContext = createErrorContext('api_request', context);

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message || 'API request failed';

      const errorDetails = {
        type: this.getErrorType(status),
        message,
        code: error.response.data?.code,
        details: error.response.data,
        retryable: status >= 500 || status === 429,
      };

      // Log the error
      logError(new Error(message), errorContext, {
        statusCode: status,
        responseData: error.response.data,
      });

      return errorDetails;
    } else if (error.request) {
      // Network error
      const errorDetails = {
        type: 'NETWORK_ERROR' as HouseholdApiError,
        message: 'Network error - please check your connection',
        retryable: true,
      };

      // Log the error
      logError(new Error(errorDetails.message), errorContext, {
        requestError: true,
      });

      return errorDetails;
    } else {
      // Other error
      const errorDetails = {
        type: 'UNKNOWN_ERROR' as HouseholdApiError,
        message: error.message || 'An unexpected error occurred',
        retryable: false,
      };

      // Log the error
      logError(error, errorContext);

      return errorDetails;
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
        } else {
          console.warn('⚠️ HouseholdsApiService - No token available, request will be unauthenticated');
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
        // Handle authentication errors specifically
        if (handleAuthError(error, {
          userType: "cognito",
          redirectPath: "/login",
        })) {
          // Auth error was handled, return a rejected promise with auth error
          return Promise.reject({
            type: 'AUTHENTICATION_ERROR',
            message: 'Authentication failed',
            handled: true
          });
        }

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

        if (!userData.accessToken) {
          console.warn('⚠️ HouseholdsApiService - No accessToken found in userData:', userData);
        }

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
    const context = createErrorContext('create_household');

    // Use mock data if API is not available
    if (USE_MOCK_DATA) {
      console.log('🔧 Using mock data for createHousehold');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a mock response with the provided data
      const mockResponse: HouseholdResponse = {
        data: {
          ...mockHousehold,
          id: Math.floor(Math.random() * 1000) + 1, // Generate random ID
          primary_first_name: data.primary_first_name || 'User',
          primary_last_name: data.primary_last_name || '',
          address_line_1: data.address_line_1 || '',
          address_line_2: data.address_line_2 || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          preferred_language: data.preferred_language || 'en',
          notes: data.notes || '',
          members: [],
          counts: { children: 0, adults: 1, seniors: 0, total: 1 },
        },
        message: 'Household created successfully (mock)',
        success: true,
        timestamp: new Date().toISOString(),
      };

      return mockResponse;
    }

    // Map the data to the new API format
    const apiData = {
      first_name: data.primary_first_name || '',
      last_name: data.primary_last_name || '',
      phone: data.phone || null,
      address_line_1: data.address_line_1 || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      date_of_birth: data.date_of_birth || null,
      permission_to_email: data.permission_to_email !== undefined ? data.permission_to_email : null,
      children_in_household: data.children_in_household !== undefined ? data.children_in_household : null,
    };

    const requestFn = () => this.axiosInstance.post(API_CONFIG.endpoints.createHousehold, apiData);

    try {
      console.log('📤 POST /users - Request data:', JSON.stringify(apiData, null, 2));
      const response = await retryWithBackoff(requestFn, DEFAULT_RETRY_CONFIG, context);

      console.log('📥 POST /users - Response data:', JSON.stringify(response.data, null, 2));

      // Map the response to match the expected HouseholdResponse format
      const apiResponse = response.data;
      const userResponse = apiResponse.user;
      const householdResponse: HouseholdResponse = {
        data: {
          id: parseInt(apiResponse.household_id) || 0,
          primary_user_id: parseInt(userResponse.id) || 0,
          primary_first_name: userResponse.first_name || '',
          primary_last_name: userResponse.last_name || '',
          address_line_1: userResponse.address_line_1 || '',
          address_line_2: userResponse.address_line_2 || '',
          city: userResponse.city || '',
          state: userResponse.state || '',
          zip_code: userResponse.zip_code || '',
          preferred_language: 'en',
          notes: '',
          members: [],
          counts: { children: userResponse.children_in_household || 0, adults: 1, seniors: 0, total: 1 },
        },
        message: 'User created successfully',
        success: true,
        timestamp: new Date().toISOString(),
      };

      return householdResponse;
    } catch (error) {
      const errorDetails = ApiErrorHandler.createError(error, context);
      const errorMessage = errorDetails?.message || 'Failed to create user';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get household by ID
   */
  async getHousehold(householdId: number): Promise<HouseholdResponse> {
    // Use mock data if API is not available
    if (USE_MOCK_DATA) {
      console.log('🔧 Using mock data for getHousehold');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return mockHouseholdResponse;
    }

    // Check cache first
    const cacheKey = `${CACHE_CONFIG.keys.household}_${householdId}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getHouseholdById(householdId));
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Get household by ID
   */
  async getHouseholdById(id: number): Promise<HouseholdResponse> {
    // Use mock data if API is not available
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        ...mockHouseholdResponse,
        data: {
          ...mockHouseholdResponse.data,
          id: id,
        },
      };
    }

    const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getHouseholdById(id));
    const response = await this.retryRequest(requestFn);
    return response.data;
  }

  /**
   * Get current user information
   */
  /**
   * Get current user information including household data
   * Returns complete household information from /users/me endpoint
   */
  async getUsersMe(): Promise<UsersMeResponse> {
    const context = createErrorContext('getUsersMe', {});

    try {
      const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getUsersMe);
      const response = await retryWithBackoff(requestFn, DEFAULT_RETRY_CONFIG, context);

      console.log('📥 GET /users/me - Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.createError(error, context);
      const errorMessage = errorDetails?.message || 'Failed to get user information';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get household by ID (new API format)
   */
  async getHouseholdByIdNew(householdId: number): Promise<any> {
    const context = createErrorContext('getHouseholdByIdNew', { householdId });

    try {
      const requestFn = () => this.axiosInstance.get(API_CONFIG.endpoints.getHouseholdById(householdId));
      const response = await retryWithBackoff(requestFn, DEFAULT_RETRY_CONFIG, context);

      console.log('📥 GET /households/{id} - Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      const errorDetails = ApiErrorHandler.createError(error, context);
      const errorMessage = errorDetails?.message || 'Failed to get household information';
      throw new Error(errorMessage);
    }
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

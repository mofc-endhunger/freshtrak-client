// Households API TypeScript Interfaces

import { Household, HouseholdMember, CreateHouseholdRequest, UpdateHouseholdRequest, CreateMemberRequest, UpdateMemberRequest } from './household.types';

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// API Error response
export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Household API responses
export interface HouseholdResponse extends ApiResponse<Household> { }
export interface HouseholdListResponse extends ApiResponse<Household[]> { }

// Member API responses
export interface MemberResponse extends ApiResponse<HouseholdMember> { }
export interface MemberListResponse extends ApiResponse<HouseholdMember[]> { }

// API Request types
export interface CreateHouseholdApiRequest extends CreateHouseholdRequest { }
export interface UpdateHouseholdApiRequest extends UpdateHouseholdRequest { }
export interface CreateMemberApiRequest extends CreateMemberRequest { }
export interface UpdateMemberApiRequest extends UpdateMemberRequest { }

// API Endpoint configuration
export interface HouseholdApiEndpoints {
  createHousehold: string;
  getHousehold: string;
  getHouseholdById: (id: number) => string;
  updateHousehold: (id: number) => string;
  getMembers: (householdId: number) => string;
  addMember: (householdId: number) => string;
  updateMember: (householdId: number, memberId: number) => string;
  deactivateMember: (householdId: number, memberId: number) => string;
}

// API Service configuration
export interface HouseholdApiConfig {
  baseUrl: string;
  endpoints: HouseholdApiEndpoints;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Authentication headers
export interface AuthHeaders {
  Authorization: string;
  'Content-Type': string;
  'Accept': string;
}

// API Request options
export interface ApiRequestOptions {
  headers?: Partial<AuthHeaders>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Pagination for member lists
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Member filtering options
export interface MemberFilterOptions {
  status?: 'active' | 'inactive' | 'all';
  memberType?: 'child' | 'adult' | 'senior' | 'all';
  searchTerm?: string;
}

// Bulk operations
export interface BulkMemberOperation {
  operation: 'activate' | 'deactivate' | 'delete';
  memberIds: number[];
}

export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors: Array<{
    memberId: number;
    error: string;
  }>;
}

// API Service method signatures
export interface HouseholdApiService {
  // Household operations
  createHousehold(data: CreateHouseholdApiRequest): Promise<HouseholdResponse>;
  getHousehold(): Promise<HouseholdResponse>;
  getHouseholdById(id: number): Promise<HouseholdResponse>;
  updateHousehold(id: number, data: UpdateHouseholdApiRequest): Promise<HouseholdResponse>;

  // Member operations
  getMembers(householdId: number, options?: PaginationParams & MemberFilterOptions): Promise<MemberListResponse>;
  addMember(householdId: number, data: CreateMemberApiRequest): Promise<MemberResponse>;
  updateMember(householdId: number, memberId: number, data: UpdateMemberApiRequest): Promise<MemberResponse>;
  deactivateMember(householdId: number, memberId: number): Promise<MemberResponse>;

  // Bulk operations
  bulkMemberOperation(householdId: number, operation: BulkMemberOperation): Promise<BulkOperationResponse>;
}

// Cache configuration
export interface HouseholdCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number;
  keys: {
    household: string;
    members: string;
    member: (id: number) => string;
  };
}

// API Error types
export type HouseholdApiError =
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'API_RATE_LIMIT'
  | 'UNKNOWN_ERROR';

export interface HouseholdApiErrorDetails {
  type: HouseholdApiError;
  message: string;
  code?: string;
  details?: any;
  retryable: boolean;
}

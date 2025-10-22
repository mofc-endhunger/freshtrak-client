/**
 * Mock Household Data for Testing
 * 
 * Comprehensive mock data for household testing scenarios.
 */

import {
  Household,
  HouseholdMember,
  HouseholdCounts,
  CreateHouseholdRequest,
  UpdateHouseholdRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  MemberGender,
  LanguagePreference,
} from '../Modules/Households/types';

/**
 * Mock household members
 */
export const mockHouseholdMembers: HouseholdMember[] = [
  {
    id: 1,
    household_id: 1,
    is_primary: true,
    first_name: 'Julie',
    last_name: 'Neeley',
    middle_name: 'Ann',
    gender: 'female' as MemberGender,
    phone: '614-123-4567',
    email: 'jneeley@gmail.com',
    date_of_birth: '1985-03-15',
    status: 'active',
    is_freshtrak_user: true,
    is_active: true,
    head_of_household: true,
  },
  {
    id: 2,
    household_id: 1,
    is_primary: false,
    first_name: 'Johnathon',
    last_name: 'Neeley',
    gender: 'male' as MemberGender,
    phone: '614-123-4568',
    email: 'jneeley@gmail.com',
    date_of_birth: '1955-07-22',
    status: 'active',
    is_freshtrak_user: false,
    is_active: true,
    head_of_household: false,
  },
  {
    id: 3,
    household_id: 1,
    is_primary: false,
    first_name: 'Debra',
    last_name: 'Neeley',
    gender: 'female' as MemberGender,
    phone: '614-123-4569',
    email: 'dneeley@gmail.com',
    date_of_birth: '1988-11-08',
    status: 'active',
    is_freshtrak_user: false,
    is_active: true,
    head_of_household: false,
  },
  {
    id: 4,
    household_id: 1,
    is_primary: false,
    first_name: 'Savannah',
    last_name: 'Neeley',
    gender: 'female' as MemberGender,
    date_of_birth: '2015-05-12',
    status: 'active',
    is_freshtrak_user: false,
    is_active: true,
    head_of_household: false,
  },
];

/**
 * Mock household counts
 */
export const mockHouseholdCounts: HouseholdCounts = {
  children: 1,
  adults: 2,
  seniors: 1,
  total: 4,
};

/**
 * Complete mock household
 */
export const mockHousehold: Household = {
  id: 1,
  primary_user_id: 123,
  primary_first_name: 'Julie',
  primary_last_name: 'Neeley',
  address_line_1: '1223 Cincinnati Rd.',
  address_line_2: 'Unit 304',
  city: 'Hilliard',
  state: 'Ohio',
  zip_code: '43026',
  preferred_language: 'en' as LanguagePreference,
  notes: 'Family of four living in Hilliard',
  members: mockHouseholdMembers,
  counts: mockHouseholdCounts,
};

/**
 * Mock household for creation
 */
export const mockCreateHouseholdRequest: CreateHouseholdRequest = {
  address_line_1: '123 Main St',
  address_line_2: 'Apt 2B',
  city: 'Columbus',
  state: 'OH',
  zip_code: '43004',
  preferred_language: 'en' as LanguagePreference,
  notes: 'New household setup',
  primary_first_name: 'Jane',
  primary_last_name: 'Doe',
  primary_phone: '555-123-4567',
  primary_email: 'jane.doe@example.com',
  primary_date_of_birth: '1990-01-01',
};

/**
 * Mock household update request - matches complete /users/me response structure
 */
export const mockUpdateHouseholdRequest: UpdateHouseholdRequest = {
  id: 1,
  number: 0,
  name: "Mock Household",
  identification_code: "1234567890-123",
  added_by: 123456,
  last_updated_by: 123456,
  deleted_by: null,
  deleted_on: null,
  members: [],
  counts: {
    seniors: 1,
    adults: 2,
    children: 0,
    total: 3,
  },
  address_line_1: '456 Oak Ave',
  address_line_2: null,
  city: 'Columbus',
  state: 'OH',
  zip_code: '43005',
  phone: '555-123-4567',
  email: 'mock@example.com',
};

/**
 * Mock member creation request
 */
export const mockCreateMemberRequest: CreateMemberRequest = {
  first_name: 'John',
  middle_name: 'Michael',
  last_name: 'Smith',
  suffix: 'Jr.',
  gender: 'male' as MemberGender,
  phone: '555-987-6543',
  email: 'john.smith@example.com',
  date_of_birth: '2010-06-15',
};

/**
 * Mock member update request
 */
export const mockUpdateMemberRequest: UpdateMemberRequest = {
  first_name: 'Johnny',
  phone: '555-987-6544',
  email: 'johnny.smith@example.com',
};

/**
 * Mock households for different scenarios
 */
export const mockHouseholds: Household[] = [
  mockHousehold,
  {
    id: 2,
    primary_user_id: 124,
    primary_first_name: 'Maria',
    primary_last_name: 'Garcia',
    address_line_1: '789 Pine St',
    city: 'Dublin',
    state: 'Ohio',
    zip_code: '43017',
    preferred_language: 'es' as LanguagePreference,
    notes: 'Spanish-speaking household',
    members: [
      {
        id: 5,
        household_id: 2,
        is_primary: true,
        first_name: 'Maria',
        last_name: 'Garcia',
        gender: 'female' as MemberGender,
        phone: '614-555-1234',
        email: 'maria.garcia@example.com',
        date_of_birth: '1980-12-03',
        status: 'active',
        is_freshtrak_user: true,
        is_active: true,
        head_of_household: true,
      },
    ],
    counts: {
      children: 0,
      adults: 1,
      seniors: 0,
      total: 1,
    },
  },
];

/**
 * Mock API responses
 */
export const mockHouseholdResponse = {
  data: mockHousehold,
  message: 'Household retrieved successfully',
  success: true,
  timestamp: '2024-01-15T10:00:00Z',
};

export const mockMemberResponse = {
  data: mockHouseholdMembers[0],
  message: 'Member retrieved successfully',
  success: true,
  timestamp: '2024-01-15T10:00:00Z',
};

export const mockMemberListResponse = {
  data: mockHouseholdMembers,
  message: 'Members retrieved successfully',
  success: true,
  timestamp: '2024-01-15T10:00:00Z',
};

/**
 * Mock error responses
 */
export const mockErrorResponse = {
  error: 'HOUSEHOLD_NOT_FOUND',
  message: 'Household not found',
  code: 'HOUSEHOLD_NOT_FOUND',
  timestamp: '2024-01-15T10:00:00Z',
};

/**
 * Mock household setup status
 */
export const mockHouseholdSetupStatus = {
  completionStatus: 'complete' as const,
  userChoice: 'setup' as const,
  lastPromptDate: '2024-01-15T10:00:00Z',
  promptFrequency: 'weekly' as const,
  showSetupPrompt: false,
};

/**
 * Mock incomplete household setup status
 */
export const mockIncompleteHouseholdSetupStatus = {
  completionStatus: 'incomplete' as const,
  userChoice: 'skip' as const,
  lastPromptDate: '2024-01-15T10:00:00Z',
  promptFrequency: 'daily' as const,
  showSetupPrompt: true,
};

/**
 * Mock household with missing data for testing validation
 */
export const mockIncompleteHousehold: Partial<Household> = {
  id: 3,
  primary_user_id: 125,
  address_line_1: '999 Test St',
  city: 'Test City',
  state: 'OH',
  zip_code: '43001',
  // Missing preferred_language
  // Missing members
};

/**
 * Mock member with different demographics for testing
 */
export const mockDiverseMember: HouseholdMember = {
  id: 6,
  household_id: 1,
  is_primary: false,
  first_name: 'Ahmed',
  last_name: 'Hassan',
  gender: 'male' as MemberGender,
  phone: '614-555-9999',
  email: 'ahmed.hassan@example.com',
  date_of_birth: '1992-04-20',
  status: 'active',
  is_freshtrak_user: false,
  is_active: true,
  head_of_household: false,
};

/**
 * Mock household with large family for testing
 */
export const mockLargeHousehold: Household = {
  id: 4,
  primary_user_id: 126,
  primary_first_name: 'Robert',
  primary_last_name: 'Johnson',
  address_line_1: '456 Family Lane',
  city: 'Westerville',
  state: 'Ohio',
  zip_code: '43081',
  preferred_language: 'en' as LanguagePreference,
  notes: 'Large family household',
  members: [
    {
      id: 7,
      household_id: 4,
      is_primary: true,
      first_name: 'Robert',
      last_name: 'Johnson',
      gender: 'male' as MemberGender,
      phone: '614-555-1111',
      email: 'robert.johnson@example.com',
      date_of_birth: '1975-08-10',
      status: 'active',
      is_freshtrak_user: true,
      is_active: true,
      head_of_household: true,
    },
    {
      id: 8,
      household_id: 4,
      is_primary: false,
      first_name: 'Sarah',
      last_name: 'Johnson',
      gender: 'female' as MemberGender,
      phone: '614-555-1112',
      email: 'sarah.johnson@example.com',
      date_of_birth: '1978-03-25',
      status: 'active',
      is_freshtrak_user: false,
      is_active: true,
      head_of_household: false,
    },
    {
      id: 9,
      household_id: 4,
      is_primary: false,
      first_name: 'Michael',
      last_name: 'Johnson',
      gender: 'male' as MemberGender,
      date_of_birth: '2005-12-01',
      status: 'active',
      is_freshtrak_user: false,
      is_active: true,
      head_of_household: false,
    },
    {
      id: 10,
      household_id: 4,
      is_primary: false,
      first_name: 'Emily',
      last_name: 'Johnson',
      gender: 'female' as MemberGender,
      date_of_birth: '2008-07-15',
      status: 'active',
      is_freshtrak_user: false,
      is_active: true,
      head_of_household: false,
    },
    {
      id: 11,
      household_id: 4,
      is_primary: false,
      first_name: 'David',
      last_name: 'Johnson',
      gender: 'male' as MemberGender,
      date_of_birth: '2012-11-20',
      status: 'active',
      is_freshtrak_user: false,
      is_active: true,
      head_of_household: false,
    },
  ],
  counts: {
    children: 3,
    adults: 2,
    seniors: 0,
    total: 5,
  },
};

/**
 * Helper function to create mock household with specific properties
 */
export const createMockHousehold = (overrides: Partial<Household> = {}): Household => {
  return {
    ...mockHousehold,
    ...overrides,
    members: overrides.members || mockHouseholdMembers,
    counts: overrides.counts || mockHouseholdCounts,
  };
};

/**
 * Helper function to create mock member with specific properties
 */
export const createMockMember = (overrides: Partial<HouseholdMember> = {}): HouseholdMember => {
  return {
    ...mockHouseholdMembers[0],
    ...overrides,
  };
};

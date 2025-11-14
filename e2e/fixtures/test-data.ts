import { generateTestEmail, generateTestPhone, formatDateForInput, getPastDate } from '../utils/helpers';

/**
 * Test Data Factories
 * 
 * Factory functions to generate test data for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface TestAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface TestFamilyMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

export interface TestEvent {
  name: string;
  date: string;
  location: string;
  description?: string;
}

/**
 * Create a test user with unique email
 */
export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    email: overrides?.email || generateTestEmail('test'),
    password: overrides?.password || 'TestPassword123!',
    name: overrides?.name || `Test User ${timestamp}`,
    firstName: overrides?.firstName || `Test${random}`,
    lastName: overrides?.lastName || `User${random}`,
  };
}

/**
 * Create a test address
 */
export function createTestAddress(overrides?: Partial<TestAddress>): TestAddress {
  return {
    street: overrides?.street || '123 Test Street',
    city: overrides?.city || 'Test City',
    state: overrides?.state || 'NY',
    zipCode: overrides?.zipCode || '12345',
    phone: overrides?.phone || generateTestPhone(),
  };
}

/**
 * Create a test family member
 */
export function createTestFamilyMember(overrides?: Partial<TestFamilyMember>): TestFamilyMember {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const birthDate = overrides?.dateOfBirth || formatDateForInput(getPastDate(10));
  
  return {
    firstName: overrides?.firstName || `Child${random}`,
    lastName: overrides?.lastName || `Member${timestamp}`,
    dateOfBirth: birthDate,
    gender: overrides?.gender || 'Other',
  };
}

/**
 * Create test event data
 */
export function createTestEvent(overrides?: Partial<TestEvent>): TestEvent {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  return {
    name: overrides?.name || 'Test Food Bank Event',
    date: overrides?.date || formatDateForInput(futureDate),
    location: overrides?.location || '123 Test Street, Test City, NY 12345',
    description: overrides?.description || 'Test event description',
  };
}

/**
 * Create registration form data
 */
export interface RegistrationFormData {
  user: TestUser;
  address: TestAddress;
  adultCount: number;
  childCount: number;
}

export function createRegistrationFormData(
  overrides?: Partial<RegistrationFormData>
): RegistrationFormData {
  return {
    user: overrides?.user || createTestUser(),
    address: overrides?.address || createTestAddress(),
    adultCount: overrides?.adultCount || 1,
    childCount: overrides?.childCount || 0,
  };
}

/**
 * Default test credentials (for use in test environment)
 * 
 * These credentials are used for authenticated test scenarios.
 * Can be overridden via environment variables:
 * - TEST_USER_EMAIL
 * - TEST_USER_PASSWORD
 */
export const DEFAULT_TEST_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'fireigunufra-7274@yopmail.com',
  password: process.env.TEST_USER_PASSWORD || 'Temp123!',
  name: 'Test User',
} as const;


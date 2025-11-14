/**
 * Test Constants
 * 
 * Centralized constants used across E2E tests
 */

// Test URLs - matching actual routes from RENDER_URL
export const TEST_URLS = {
    BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    DASHBOARD: '/',
    LOGIN: '/login',
    EVENTS: '/events/list',  // Base events list URL
    FAMILY: '/family/create',
    ACCOUNT: '/account',
    REGISTRATION_FORM: '/register/form',
    REGISTRATION_EVENT_DETAILS: '/register/event',
    REGISTRATION_CONFIRM: '/register/confirm',
    HOUSEHOLDS: '/households',
    USER_HOME: '/user-home',
} as const;

// Test Timeouts (in milliseconds)
export const TIMEOUTS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    VERY_LONG: 60000,
} as const;

// Test Data Constants
export const TEST_DATA = {
    DEFAULT_ZIP_CODE: '12345',
    DEFAULT_DISTANCE: '10',
    DEFAULT_PASSWORD: 'TestPassword123!',
} as const;

// Selector Constants
export const SELECTORS = {
    // Common
    LOADING_SPINNER: '[data-testid="loading-spinner"]',
    ERROR_MESSAGE: '[data-testid="error-message"]',
    SUCCESS_MESSAGE: '[data-testid="success-message"]',

    // Navigation
    NAV_HOME: '[data-testid="nav-home"]',
    NAV_EVENTS: '[data-testid="nav-events"]',
    NAV_FAMILY: '[data-testid="nav-family"]',
    NAV_ACCOUNT: '[data-testid="nav-account"]',

    // Buttons
    BUTTON_SUBMIT: '[data-testid="button-submit"]',
    BUTTON_CANCEL: '[data-testid="button-cancel"]',
    BUTTON_NEXT: '[data-testid="button-next"]',
    BUTTON_PREVIOUS: '[data-testid="button-previous"]',
} as const;


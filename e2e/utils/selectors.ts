/**
 * Shared Selectors
 * 
 * Centralized selectors for E2E tests
 * Prefer data-testid attributes when available
 */

export const DashboardSelectors = {
  zipCodeInput: '[data-testid="zip-code-input"]',
  distanceSelect: '[data-testid="distance-select"]',
  searchButton: '[data-testid="search-button"]',
  eventCard: '[data-testid="event-card"]',
  noResultsMessage: '[data-testid="no-results-message"]',
} as const;

export const LoginSelectors = {
  // Using id attributes (most stable)
  emailInput: '#email',
  passwordInput: '#password',
  nameInput: '#name',
  confirmPasswordInput: '#confirmPassword',
  codeInput: '#code',
  
  // Buttons - using text content (Playwright's :has-text() is more reliable)
  signInButton: 'button:has-text("Sign In"):not(:has-text("Sign Up"))',
  signUpButton: 'button:has-text("Create Account")',
  guestButton: 'button:has-text("Continue as Guest")',
  confirmButton: 'button:has-text("Confirm Account")',
  resendCodeButton: 'button:has-text("Resend Code")',
  
  // Tab buttons - these are in the tab navigation area
  signInTab: 'button:has-text("Sign In"):not([type="submit"])',
  signUpTab: 'button:has-text("Sign Up"):not([type="submit"])',
  
  // Error message - using class or role
  errorMessage: '.text-red-600, [role="alert"], .error, p.text-red-500',
} as const;

export const EventsSelectors = {
  eventList: '[data-testid="event-list"]',
  eventCard: '[data-testid="event-card"]',
  eventTitle: '[data-testid="event-title"]',
  eventDate: '[data-testid="event-date"]',
  eventLocation: '[data-testid="event-location"]',
  filterDate: '[data-testid="filter-date"]',
  filterLocation: '[data-testid="filter-location"]',
} as const;

export const RegistrationSelectors = {
  // Step 0: Primary Information
  firstNameInput: '[data-testid="first-name-input"]',
  lastNameInput: '[data-testid="last-name-input"]',
  dateOfBirthInput: '[data-testid="date-of-birth-input"]',
  genderSelect: '[data-testid="gender-select"]',
  
  // Step 1: Address Information
  addressInput: '[data-testid="address-input"]',
  cityInput: '[data-testid="city-input"]',
  stateSelect: '[data-testid="state-select"]',
  zipCodeInput: '[data-testid="zip-code-input"]',
  phoneInput: '[data-testid="phone-input"]',
  
  // Step 2: Family Member Counts
  adultCountInput: '[data-testid="adult-count-input"]',
  childCountInput: '[data-testid="child-count-input"]',
  
  // Navigation
  nextButton: '[data-testid="next-button"]',
  previousButton: '[data-testid="previous-button"]',
  submitButton: '[data-testid="submit-button"]',
  
  // Event Slot Selection
  eventSlot: '[data-testid="event-slot"]',
  
  // Confirmation
  confirmationPage: '[data-testid="confirmation-page"]',
  qrCode: '[data-testid="qr-code"]',
} as const;

export const FamilySelectors = {
  familyMemberList: '[data-testid="family-member-list"]',
  addFamilyMemberButton: '[data-testid="add-family-member-button"]',
  familyMemberCard: '[data-testid="family-member-card"]',
  editButton: '[data-testid="edit-button"]',
  deleteButton: '[data-testid="delete-button"]',
  firstNameInput: '[data-testid="first-name-input"]',
  lastNameInput: '[data-testid="last-name-input"]',
  dateOfBirthInput: '[data-testid="date-of-birth-input"]',
  genderSelect: '[data-testid="gender-select"]',
  saveButton: '[data-testid="save-button"]',
  confirmDeleteButton: '[data-testid="confirm-delete-button"]',
} as const;

export const AccountSelectors = {
  accountInfo: '[data-testid="account-info"]',
  editButton: '[data-testid="edit-button"]',
  logoutButton: '[data-testid="logout-button"]',
  emailDisplay: '[data-testid="email-display"]',
  nameDisplay: '[data-testid="name-display"]',
} as const;


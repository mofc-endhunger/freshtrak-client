/**
 * Shared Selectors
 * 
 * Centralized selectors for E2E tests
 * Prefer data-testid attributes when available
 */

export const DashboardSelectors = {
  // Using id attributes from SearchComponent
  zipCodeInput: '#zip_code',
  searchButton: '#search-resource, button[type="submit"]:has-text("Search")',
  streetInput: '#street',
  // Distance and filters are in FilterComponent (may need to check that component)
  distanceSelect: 'select[name="distance"], input[name="distance"]',
  // Event cards - check for various possible structures
  eventCard: '[data-testid="event-card"], .event-card, article, [class*="event"], [class*="card"]',
  noResultsMessage: '[data-testid="no-results-message"], .no-results, text=/no.*events|no.*results/i',
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
  // Event cards - try multiple selectors since data-testid may not exist
  eventCard: '[data-testid="event-card"], article, [class*="event"], [class*="card"], .card, .event-card',
  eventTitle: '[data-testid="event-title"], h3, h4, [class*="title"], [class*="event-name"]',
  eventDate: '[data-testid="event-date"], [class*="date"], time',
  eventLocation: '[data-testid="event-location"], [class*="location"], [class*="address"]',
  filterDate: '[data-testid="filter-date"], input[type="date"], input[name*="date"]',
  filterLocation: '[data-testid="filter-location"], input[name*="location"], input[name*="city"]',
} as const;

export const RegistrationSelectors = {
  // Step 0: Primary Information (using id and data-testid where available)
  firstNameInput: '[data-testid="first-name-input"], #first_name',
  lastNameInput: '[data-testid="last-name-input"], #last_name',
  middleNameInput: '#middle_name',
  suffixInput: '#suffix',
  dateOfBirthInput: '[data-testid="date-of-birth-input"], #date_of_birth',
  genderSelect: '[data-testid="gender-select"], #gender, select[name="gender"]',
  
  // Step 1: Address Information (using id attributes)
  addressInput: '#address_line_1, input[name="address_line_1"]',
  addressLine2Input: '#address_line_2, input[name="address_line_2"]',
  cityInput: '#city, input[name="city"]',
  stateSelect: '#state, select[name="state"]',
  zipCodeInput: '#zip_code, input[name="zip_code"]',
  
  // Step 2: Contact Information
  phoneInput: '#phone, input[name="phone"]',
  emailInput: '#email, input[name="email"]',
  noPhoneCheckbox: '#no_phone_number',
  noEmailCheckbox: '#no_email',
  
  // Step 3: Family Member Counts (using id attributes)
  seniorsCountInput: '#seniors_in_household, input[name="seniors_in_household"]',
  adultsCountInput: '#adults_in_household, input[name="adults_in_household"]',
  childrenCountInput: '#children_in_household, input[name="children_in_household"]',
  
  // Navigation (using data-testid from HouseholdForm - note: both "continue button" and "continue-button" exist)
  nextButton: '[data-testid="continue-button"], [data-testid="continue button"], button:has-text("Continue"), button:has-text("Next")',
  previousButton: '[data-testid="previous button"], button:has-text("Previous"), button:has-text("Back")',
  submitButton: 'button[type="submit"], button:has-text("Register"), button:has-text("Submit")',
  
  // Event Slot Selection
  eventSlot: 'select[name*="slot"], input[name*="slot"], [data-testid="event-slot"]',
  
  // Confirmation
  confirmationPage: '[data-testid="confirmation-page"], .confirmation',
  qrCode: '[data-testid="qr-code"], canvas, img[alt*="qr"]',
  
  // Form container
  householdForm: '[data-testid="household-form"]',
} as const;

export const FamilySelectors = {
  familyMemberList: '[data-testid="family-member-list"]',
  // Add family member button - try multiple selectors
  addFamilyMemberButton: '[data-testid="add-family-member-button"], button:has-text(/add.*family|add.*member/i), button:has-text("Add")',
  familyMemberCard: '[data-testid="family-member-card"], [class*="member-card"], [class*="family-card"]',
  editButton: '[data-testid="edit-button"], button:has-text(/edit/i), [aria-label*="edit"]',
  deleteButton: '[data-testid="delete-button"], button:has-text(/delete/i), [aria-label*="delete"]',
  // Use same selectors as registration form since they share similar structure
  firstNameInput: '[data-testid="first-name-input"], #first_name, input[name="first_name"]',
  lastNameInput: '[data-testid="last-name-input"], #last_name, input[name="last_name"]',
  dateOfBirthInput: '[data-testid="date-of-birth-input"], #date_of_birth, input[name="date_of_birth"], input[type="date"]',
  genderSelect: '[data-testid="gender-select"], #gender, select[name="gender"]',
  // Save button - try multiple selectors
  saveButton: '[data-testid="save-button"], button:has-text(/save/i), button[type="submit"]:has-text(/save|submit/i), button:has-text("Submit")',
  confirmDeleteButton: '[data-testid="confirm-delete-button"], button:has-text(/confirm.*delete|yes.*delete/i), button:has-text("Confirm")',
} as const;

export const AccountSelectors = {
  accountInfo: '[data-testid="account-info"]',
  editButton: '[data-testid="edit-button"]',
  // Logout is in header dropdown menu
  logoutButton: 'button:has-text("Sign Out"), [role="menuitem"]:has-text("Sign Out")',
  emailDisplay: '[data-testid="email-display"]',
  nameDisplay: '[data-testid="name-display"]',
  // Header user account button (opens dropdown with logout)
  userAccountButton: 'button[aria-haspopup="menu"], button:has([class*="rounded-full"])',
} as const;


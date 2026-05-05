/**
 * Centralized data-testid selectors used across E2E tests.
 * Every selector maps to a `data-testid` attribute on a production component.
 */

export const SEL = {
  // Login / Auth
  loginPage: 'login-page',
  signinTab: 'signin-tab',
  signupTab: 'signup-tab',
  emailInput: 'email-input',
  passwordInput: 'password-input',
  signinSubmit: 'signin-submit',
  forgotPasswordLink: 'forgot-password-link',
  guestLoginButton: 'guest-login-button',
  backToHomeButton: 'back-to-home-button',
  authErrorMessage: 'auth-error-message',
  caseManagerLink: 'case-manager-link',

  // Header
  headerNav: 'header-nav',
  headerLogo: 'header-logo',
  headerSigninButton: 'header-signin-button',
  userAccountButton: 'user-account-button',
  languageSelector: 'language-selector',
  mobileMenuButton: 'mobile-menu-button',
  mobileMenuDialog: 'mobile-menu-dialog',

  // Dashboard / Home
  dashboardPage: 'dashboard-page',
  zipCodeInput: 'zip-code-input',
  searchSubmit: 'search-submit',
  featureCard: 'feature-card',

  // Account / Profile
  accountPage: 'account-page',
  tabSummary: 'tab-summary',
  tabAccount: 'tab-account',
  backToHome: 'back-to-home',
  userAvatar: 'user-avatar',
  userDisplayName: 'user-display-name',
  accountInfoSection: 'account-info-section',
  householdMembersSection: 'household-members-section',
  updateHouseholdButton: 'update-household-button',

  // Search Results / Events
  eventListPage: 'event-list-page',
  viewToggleGrid: 'view-toggle-grid',
  viewToggleList: 'view-toggle-list',
  eventCard: 'event-card',
  eventDetailsToggle: 'event-details-toggle',
  eventReserveButton: 'event-reserve-button',
  eventDirectionsLink: 'event-directions-link',
  noEventsMessage: 'no-events-message',

  // Filters
  filterDistance: 'filter-distance',
  filterAvailability: 'filter-availability',
  filterReservations: 'filter-reservations',
  filterClose: 'filter-close',

  // ChatBot
  chatbotToggle: 'chatbot-toggle',
  chatbotWindow: 'chatbot-window',

  // Footer
  footerPrivacy: 'footer-privacy',
  footerTerms: 'footer-terms',

  // Event Details page (RegistrationEventDetailsContainer)
  registerNowButton: 'register-now-button',

  // Timeslot selection dialog (EventSlotsModalComponent)
  timeslotDialog: 'timeslot-dialog',
  timeslotGoBack: 'timeslot-go-back',
  timeslotSaveContinue: 'timeslot-save-continue',
  noTimeslotsMessage: 'no-timeslots-message',

  // Household confirmation modal (HouseholdConfirmationModal)
  householdConfirmationModal: 'household-confirmation-modal',
  householdConfirmButton: 'confirm-register-button',
  householdReviewButton: 'review-update-button',

  // Household info display (HouseholdInfoDisplay)
  householdInfoDisplay: 'household-info-display',
  householdAddress: 'household-address',
  householdMembers: 'household-members',
  householdContact: 'household-contact',

  // Registration form – Your Details step (PrimaryInfoFormComponent)
  firstNameInput: 'first-name-input',
  middleNameInput: 'middle-name-input',
  lastNameInput: 'last-name-input',
  suffixSelect: 'suffix-select',
  dateOfBirthInput: 'date-of-birth-input',
  genderSelect: 'gender-select',
  continueButton: 'continue-button',

  // Registration form – Your Address Details step (AddressComponent + ContactInformationComponent)
  addressComponent: 'address-component',
  addressLine1Input: 'address-line-1-input',
  addressLine1Error: 'address-line-1-error',
  addressLine2Input: 'address-line-2-input',
  cityInput: 'city-input',
  cityError: 'city-error',
  stateSelect: 'state-select',
  phoneInput: 'phone-input',
  phoneError: 'phone-error',
  emailInput: 'email-input',
  emailError: 'email-error',
  phonePermissionLabel: 'phone permission',
  emailPermissionLabel: 'email permission',
  previousButton: 'previous button',
  addressStepContinueButton: 'continue button',

  // Registration form – Your Family Details step (MemberCountFormComponent)
  memberCountForm: 'member-count-form-component',
  seniorCountInput: 'senior-count-input',
  adultCountInput: 'adult-count-input',
  childCountInput: 'child-count-input',
  seniorIncButton: 'count_senior_inc',
  seniorDecButton: 'count_senior_dec',
  adultIncButton: 'count_adult_inc',
  adultDecButton: 'count_adult_dec',
  childIncButton: 'count_kid_inc',
  childDecButton: 'count_kid_dec',
  submitButton: 'submit-button',
} as const;

export type SelectorKey = keyof typeof SEL;

/** Shorthand to build a `[data-testid="..."]` CSS selector string */
export function tid(key: SelectorKey): string {
  return `[data-testid="${SEL[key]}"]`;
}

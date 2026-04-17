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
} as const;

export type SelectorKey = keyof typeof SEL;

/** Shorthand to build a `[data-testid="..."]` CSS selector string */
export function tid(key: SelectorKey): string {
  return `[data-testid="${SEL[key]}"]`;
}

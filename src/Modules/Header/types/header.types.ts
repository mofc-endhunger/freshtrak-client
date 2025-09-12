// Header Module TypeScript Interfaces

// Props for HeaderComponent
export interface HeaderComponentProps {
  /** Whether to use short header variant */
  shortHeader?: string;
}

// Props for HeaderContainer
export interface HeaderContainerProps {
  // Currently no props, but interface for future extensibility
}

// Props for HeaderDataComponent
export interface HeaderDataComponentProps {
  // Currently no props, but interface for future extensibility
}

// Header state interface
export interface HeaderState {
  /** Whether the navbar is shrunk (scrolled) */
  navbarShrink: string;
  /** Whether the user is logged in */
  isLoggedIn: boolean;
  /** Whether the mobile menu is visible */
  showMobileMenu: boolean;
}

// Navigation item interface
export interface NavigationItem {
  /** Display text for the navigation item */
  text: string;
  /** URL for the navigation item */
  url: string;
  /** Whether the item is external link */
  isExternal?: boolean;
  /** Target for external links */
  target?: string;
}

// Page type for background color logic
export type PageType = 'main' | 'search' | 'login' | 'other';

// Background color state interface
export interface BackgroundColorState {
  /** Current page type */
  pageType: PageType;
  /** Whether navbar is scrolled */
  isScrolled: boolean;
  /** Whether background should be visible */
  shouldShowBackground: boolean;
}

// Authentication state interface
export interface AuthState {
  /** Whether user is logged in */
  isLoggedIn: boolean;
  /** User token if available */
  userToken?: string;
  /** Token expiration time */
  tokenExpiresAt?: string;
}

// Localization change handler interface
export interface LocalizationChangeHandler {
  /** Event object */
  event: any;
  /** New language data */
  data: {
    /** Language value */
    value: string;
  };
}

// Scroll event interface
export interface ScrollEvent {
  /** Current page Y offset */
  pageYOffset: number;
}

// Mobile menu section interface
export interface MobileMenuSection {
  /** Section title */
  title: string;
  /** Navigation items in the section */
  items: NavigationItem[];
}

// Environment variables interface
export interface EnvironmentVariables {
  /** FreshTrak partners URL */
  FRESHTRAK_PARTNERS_URL?: string;
}

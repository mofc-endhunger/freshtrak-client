// Authentication Module TypeScript Interfaces

// Props for AuthenticationModal component
export interface AuthenticationModalProps {
  /** Controls whether the modal is visible */
  show: boolean;
  /** Function to control modal visibility */
  setshow: (show: boolean) => void;
  /** Callback function executed on successful login - can be async or sync */
  onLogin: (() => Promise<void>) | (() => void);
}

// Props for GuestLoginButtonComponent
export interface GuestLoginButtonComponentProps {
  /** Function to execute when guest login is clicked */
  onGuestLogin: () => void;
  /** Whether the button should be disabled */
  disabled: boolean;
}

// Authentication state interface
export interface AuthenticationState {
  /** Whether the authentication process is currently loading */
  isLoading: boolean;
}

// Google Tag Manager event interface
export interface GTMEvent {
  event: string;
  [key: string]: any;
}

// Local storage interface for authentication
export interface AuthLocalStorage {
  /** Whether the user is logged in */
  isLoggedIn: boolean;
}

// Error handling interface
export interface AuthenticationError {
  message: string;
  code?: string;
  timestamp: Date;
}

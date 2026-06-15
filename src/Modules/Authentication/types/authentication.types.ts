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

// Cognito-specific types
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface ConfirmSignUpFormData {
  email: string;
  code: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface ConfirmResetPasswordFormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// Authentication context types
export interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Whether the user needs to complete household setup (null = not yet determined) */
  needsHouseholdSetup: boolean | null;
  /** Set whether household setup is needed (called after signup/upgrade) */
  setNeedsHouseholdSetup: (value: boolean | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
}

// Authentication modal tab types
export type AuthModalTab =
  | 'signin'
  | 'signup'
  | 'confirm'
  | 'reset'
  | 'confirmReset'
  | 'guest'
  | 'loading';

// Extended AuthenticationModal props
export interface ExtendedAuthenticationModalProps extends AuthenticationModalProps {
  /** Initial tab to show in the modal */
  initialTab?: AuthModalTab;
  /** Whether to show guest login option */
  showGuestLogin?: boolean;
}

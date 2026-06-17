// Dashboard Module TypeScript Interfaces

// Form data interface for search functionality - must match SearchComponent expectations
export interface SearchFormData {
  zip_code?: string;
  distance?: string;
  serviceCat?: string;
  availability?: string;
  reservations?: string;
  street?: string;
  lat?: string;
  long?: string;
}

// Props for DashBoardContainer component
export interface DashBoardContainerProps {
  // Currently no props, but interface for future extensibility
}

// Props for DashBoardDataComponent component
export interface DashBoardDataComponentProps {
  // Currently no props, but interface for future extensibility
}

// Props for DashboardCreateAccountComponent component
export interface DashboardCreateAccountComponentProps {
  // Currently no props, but interface for future extensibility
}

// Props for DashBoardFoodBankComponent component
export interface DashBoardFoodBankComponentProps {
  // Currently no props, but interface for future extensibility
}

// Localization interface for type safety
export interface LocalizationStrings {
  home_freshtrack: string;
  home_stay: string;
  home_findfood: string;
  home_comming_soon: string;
  home_create_account_button: string;
  home_zip_details: string;
  home_dashboard: string;
  home_dashboard_org: string;
  home_before_footer1: string;
  home_before_footer2: string;
  home_before_footer3: string;
  home_before_footer1_header: string;
  home_before_footer2_header: string;
  home_before_footer3_header: string;
  for_foodbanks: string;
}

// Constants interface
export interface DashboardConstants {
  DEFAULT_DISTANCE: number;
}

// SVG icon types for better type safety
export type DashboardIconType = 'calendar' | 'findfood' | 'predict' | 'serve-food' | 'move-quick';

// Icon mapping type for better type safety
export type IconMapping = {
  [key in DashboardIconType]: string;
};

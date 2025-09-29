// Households Module TypeScript Interfaces

// Core household data structure
export interface Household {
  id: number;
  primary_user_id?: number;
  primary_first_name: string;
  primary_last_name: string;
  primary_email?: string;
  primary_phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  preferred_language: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  members: HouseholdMember[];
  counts: HouseholdCounts;
}

// Household member data structure
export interface HouseholdMember {
  id: number;
  household_id: number;
  is_primary: boolean;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  gender?: MemberGender;
  race?: MemberRace;
  ethnicity?: MemberEthnicity;
  phone?: string;
  email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  status: 'active' | 'inactive';
  is_freshtrak_user: boolean;
  preferred_language?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  head_of_household: boolean;
}

// Derived household counts
export interface HouseholdCounts {
  children: number;
  adults: number;
  seniors: number;
  total: number;
}

// Member status types
export type MemberStatus = 'child' | 'adult' | 'senior';
export type MemberGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type MemberRace = 'american_indian' | 'asian' | 'black' | 'hispanic' | 'native_hawaiian' | 'white' | 'other' | 'prefer_not_to_say';
export type MemberEthnicity = 'hispanic' | 'non_hispanic' | 'prefer_not_to_say';

// Extended member information for UI display
export interface HouseholdMemberDisplay extends HouseholdMember {
  age?: number;
  memberStatus: MemberStatus; // Renamed to avoid conflict with status property
  race?: MemberRace;
  ethnicity?: MemberEthnicity;
  isFreshTrakUser?: boolean;
  avatarInitials?: string;
}

// Household setup completion tracking
export interface HouseholdSetupStatus {
  completionStatus: 'complete' | 'incomplete' | 'not_started';
  userChoice: 'setup' | 'skip' | 'later';
  lastPromptDate?: string;
  promptFrequency: 'daily' | 'weekly' | 'monthly';
  showSetupPrompt: boolean;
}

// Household creation request
export interface CreateHouseholdRequest {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  preferred_language: string;
  notes?: string;
  primary_first_name: string;
  primary_last_name: string;
  primary_phone?: string;
  primary_email?: string;
  primary_date_of_birth: string;
  // Demographics fields
  primary_gender?: string;
  primary_race?: string;
  primary_ethnicity?: string;
  // Household size fields
  adult_count?: number;
  child_count?: number;
  senior_count?: number;
  // Additional fields for new API
  phone?: string;
  date_of_birth?: string;
  permission_to_email?: boolean;
  children_in_household?: number;
}

// Household update request
export interface UpdateHouseholdRequest {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  preferred_language?: string;
  notes?: string;
  members?: CreateMemberRequest[];
}

// Member creation request
export interface CreateMemberRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  gender?: MemberGender;
  race?: MemberRace;
  ethnicity?: MemberEthnicity;
  phone?: string;
  email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth: string;
  status?: 'active' | 'inactive';
  is_freshtrak_user?: boolean;
  preferred_language?: string;
  notes?: string;
}

// Member update request
export interface UpdateMemberRequest {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  gender?: MemberGender;
  race?: MemberRace;
  ethnicity?: MemberEthnicity;
  phone?: string;
  email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  status?: 'active' | 'inactive';
  is_freshtrak_user?: boolean;
  preferred_language?: string;
  notes?: string;
  is_active?: boolean;
}

// Household audit log entry
export interface HouseholdAuditEntry {
  id: number;
  household_id: number;
  member_id?: number;
  change_type: 'created' | 'updated' | 'deactivated' | 'reactivated' | 'removed' | 'primary_changed' | 'address_updated';
  changed_by_user_id?: number;
  changes: {
    before: any;
    after: any;
  };
  created_at: string;
}

// Language preference options
export type LanguagePreference = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

// Utility types for age calculation
export interface AgeCalculation {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

// Member status calculation
export interface MemberStatusCalculation {
  status: MemberStatus;
  age: number;
  isChild: boolean;
  isAdult: boolean;
  isSenior: boolean;
}

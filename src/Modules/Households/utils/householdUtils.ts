/**
 * Household Utility Functions
 * 
 * Utility functions for household data manipulation, validation, and calculations.
 */

import {
  HouseholdMember,
  HouseholdCounts,
  MemberStatus,
  MemberGender,
  MemberRace,
  MemberEthnicity,
  AgeCalculation,
  MemberStatusCalculation,
  LanguagePreference,
} from '../types';
import localization from '../../Localization/LocalizationComponent';

/**
 * Calculate age from date of birth (timezone-safe)
 */
export const calculateAge = (dateOfBirth: string | undefined): AgeCalculation => {
  if (!dateOfBirth || dateOfBirth === "1900-01-01") {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    };
  }

  try {
    // Parse date components directly to avoid timezone issues
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return {
        years: 0,
        months: 0,
        days: 0,
        totalDays: 0,
      };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = today.getDate();

    let years = currentYear - year;
    let months = currentMonth - month;
    let days = currentDay - day;

    // Adjust for negative days
    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(currentYear, currentMonth - 1, 0);
      days += prevMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days using the same timezone-safe approach
    const birthDate = new Date(year, month - 1, day); // month is 0-indexed
    const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
    };
  } catch (error) {
    console.warn("Age calculation failed:", error);
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    };
  }
};

/**
 * Determine member status based on age
 */
export const getMemberStatus = (dateOfBirth: string | undefined): MemberStatusCalculation => {
  if (!dateOfBirth) {
    return {
      status: 'adult',
      age: 0,
      isChild: false,
      isAdult: true,
      isSenior: false,
    };
  }

  const age = calculateAge(dateOfBirth);
  const isChild = age.years < 18;
  const isSenior = age.years >= 60;
  const isAdult = !isChild && !isSenior;

  let status: MemberStatus;
  if (isChild) status = 'child';
  else if (isSenior) status = 'senior';
  else status = 'adult';

  return {
    status,
    age: age.years,
    isChild,
    isAdult,
    isSenior,
  };
};

/**
 * Calculate household counts from members
 */
export const calculateHouseholdCounts = (members: HouseholdMember[]): HouseholdCounts => {
  const activeMembers = members.filter(member => member.is_active);

  let children = 0;
  let adults = 0;
  let seniors = 0;

  activeMembers.forEach(member => {
    if (member.date_of_birth) {
      const status = getMemberStatus(member.date_of_birth);
      if (status.isChild) children++;
      else if (status.isSenior) seniors++;
      else adults++;
    }
  });

  return {
    children,
    adults,
    seniors,
    total: activeMembers.length,
  };
};

/**
 * Compute additional-member counts by subtracting the HOH from the correct
 * age bucket.  The backend counts include the HOH, but the UI shows
 * "additional members besides yourself", so we need to subtract 1 from
 * whichever category the HOH belongs to.
 */
export const getAdditionalMemberCounts = (
  apiCounts: { seniors?: number; adults?: number; children?: number },
  hohDateOfBirth: string | null | undefined,
): { seniors: number; adults: number; children: number } => {
  const hohStatus =
    hohDateOfBirth && hohDateOfBirth !== '1900-01-01'
      ? getMemberStatus(hohDateOfBirth)
      : { isChild: false, isAdult: true, isSenior: false };

  return {
    seniors: Math.max(0, (apiCounts.seniors || 0) - (hohStatus.isSenior ? 1 : 0)),
    adults: Math.max(0, (apiCounts.adults || 0) - (hohStatus.isAdult ? 1 : 0)),
    children: Math.max(0, (apiCounts.children || 0) - (hohStatus.isChild ? 1 : 0)),
  };
};

/**
 * Generate avatar initials from member name
 */
export const generateAvatarInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

/**
 * Format member name for display
 */
export const formatMemberName = (
  firstName: string,
  lastName: string,
  middleName?: string,
  suffix?: string
): string => {
  let name = firstName;
  if (middleName) name += ` ${middleName}`;
  name += ` ${lastName}`;
  if (suffix) name += ` ${suffix}`;
  return name;
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (dateOfBirth: string): { isValid: boolean; error?: string } => {
  if (!dateOfBirth) {
    return { isValid: false, error: localization.error_date_of_birth_required };
  }

  const date = new Date(dateOfBirth);
  const today = new Date();

  if (isNaN(date.getTime())) {
    return { isValid: false, error: localization.error_please_enter_valid_date };
  }

  if (date > today) {
    return { isValid: false, error: localization.error_date_of_birth_future };
  }

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) {
    return { isValid: false, error: localization.error_date_of_birth_too_far_past };
  }

  return { isValid: true };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if it's a valid US phone number (10 digits)
  if (digitsOnly.length === 10) {
    return { isValid: true };
  }

  // Check if it's a valid US phone number with country code (11 digits starting with 1)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return { isValid: true };
  }

  return { isValid: false, error: localization.error_please_enter_valid_phone };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const withoutCountryCode = digitsOnly.slice(1);
    return `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  }

  return phone; // Return original if can't format
};

/**
 * Format date of birth for display
 */
export const formatDateOfBirth = (dateOfBirth: string | undefined): string => {
  if (!dateOfBirth) return localization.label_not_provided;

  try {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) return localization.label_invalid_date;

    const lang = localization.getLanguage() || 'en';
    return date.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return localization.label_invalid_date;
  }
};

/**
 * Get age group from age
 */
export const getAgeGroup = (age: number): 'child' | 'adult' | 'senior' => {
  if (age < 18) return 'child';
  if (age >= 60) return 'senior';
  return 'adult';
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: localization.error_please_enter_valid_email };
  }

  return { isValid: true };
};

/**
 * Validate address components
 */
export const validateAddress = (address: {
  address_line_1: string;
  city: string;
  state: string;
  zip_code: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!address.address_line_1?.trim()) {
    errors.push(localization.error_street_address_required);
  }

  if (!address.city?.trim()) {
    errors.push(localization.error_city_required);
  }

  if (!address.state?.trim()) {
    errors.push(localization.error_state_required);
  }

  if (!address.zip_code?.trim()) {
    errors.push(localization.error_zip_code_required);
  } else {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(address.zip_code)) {
      errors.push(localization.error_please_enter_valid_zip);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get language display name (uses shared language codes: en, spa, som, etc.)
 */
export const getLanguageDisplayName = (language: LanguagePreference): string => {
  const languageKeys: Record<LanguagePreference, string> = {
    en: localization.option_language_english,
    es: localization.option_language_spanish,
    fr: localization.option_language_french,
    de: localization.option_language_german,
    it: localization.option_language_italian,
    pt: localization.option_language_portuguese,
    zh: localization.option_language_chinese,
    ja: localization.option_language_japanese,
    ko: localization.option_language_korean,
    ar: localization.option_language_arabic,
  };

  return languageKeys[language] || language;
};

/**
 * Get gender display name
 */
export const getGenderDisplayName = (gender: MemberGender): string => {
  const genderKeys: Record<MemberGender, string> = {
    male: localization.option_gender_male,
    female: localization.option_gender_female,
    other: localization.option_gender_other,
    prefer_not_to_say: localization.option_gender_prefer_not_to_say,
  };

  return genderKeys[gender] || gender;
};

const GENDER_ID_MAP: [number, MemberGender][] = [
  [1, 'male'],
  [2, 'female'],
  [3, 'other'],
  [4, 'prefer_not_to_say'],
];

export const getGenderFromId = (genderId: number | string | null | undefined): MemberGender | undefined => {
  if (genderId == null) return undefined;
  const id = typeof genderId === 'string' ? parseInt(genderId, 10) : genderId;
  if (isNaN(id)) return undefined;
  return GENDER_ID_MAP.find(([i]) => i === id)?.[1];
};

export const getGenderId = (gender: MemberGender | string): number =>
  GENDER_ID_MAP.find(([, g]) => g === gender)?.[0] ?? 0;

const SUFFIX_ID_MAP: [number, string][] = [
  [1, 'Jr'],
  [2, 'Sr'],
  [3, 'II'],
  [4, 'III'],
  [5, 'IV'],
  [6, 'V'],
];

const SUFFIX_ALIASES: Record<string, string> = {
  'Jr.': 'Jr',
  'Sr.': 'Sr',
};

export const getSuffixFromId = (suffixId: number | string | null | undefined): string => {
  if (!suffixId) return '';
  const id = typeof suffixId === 'string' ? parseInt(suffixId, 10) : suffixId;
  if (isNaN(id)) return '';
  return SUFFIX_ID_MAP.find(([i]) => i === id)?.[1] ?? '';
};

export const getSuffixId = (suffix: string | null | undefined): number => {
  if (!suffix) return 0;
  const normalized = SUFFIX_ALIASES[suffix] ?? suffix;
  return SUFFIX_ID_MAP.find(([, s]) => s === normalized)?.[0] ?? 0;
};

/**
 * Get race display name
 */
export const getRaceDisplayName = (race: MemberRace): string => {
  const raceKeys: Record<MemberRace, string> = {
    american_indian: localization.option_race_american_indian,
    asian: localization.option_race_asian,
    black: localization.option_race_black,
    hispanic: localization.option_race_hispanic,
    native_hawaiian: localization.option_race_native_hawaiian,
    white: localization.option_race_white,
    other: localization.option_race_other,
    prefer_not_to_say: localization.option_race_prefer_not_to_say,
  };

  return raceKeys[race] || race;
};

/**
 * Get ethnicity display name
 */
export const getEthnicityDisplayName = (ethnicity: MemberEthnicity): string => {
  const ethnicityKeys: Record<MemberEthnicity, string> = {
    hispanic: localization.option_ethnicity_hispanic,
    non_hispanic: localization.option_ethnicity_non_hispanic,
    prefer_not_to_say: localization.option_ethnicity_prefer_not_to_say,
  };

  return ethnicityKeys[ethnicity] || ethnicity;
};

/**
 * Sort members by status and name
 */
export const sortMembers = (members: HouseholdMember[]): HouseholdMember[] => {
  return [...members].sort((a, b) => {
    // Primary sort: is_primary (primary members first)
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;

    // Secondary sort: active status (active members first)
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;

    // Tertiary sort: by last name, then first name
    const aName = `${a.last_name}, ${a.first_name}`.toLowerCase();
    const bName = `${b.last_name}, ${b.first_name}`.toLowerCase();
    return aName.localeCompare(bName);
  });
};

/**
 * Filter members by status
 */
export const filterMembersByStatus = (
  members: HouseholdMember[],
  status: 'active' | 'inactive' | 'all'
): HouseholdMember[] => {
  switch (status) {
    case 'active':
      return members.filter(member => member.is_active);
    case 'inactive':
      return members.filter(member => !member.is_active);
    case 'all':
    default:
      return members;
  }
};

/**
 * Search members by name
 */
export const searchMembers = (members: HouseholdMember[], searchTerm: string): HouseholdMember[] => {
  if (!searchTerm.trim()) return members;

  const term = searchTerm.toLowerCase();
  return members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    return fullName.includes(term);
  });
};

/**
 * Check if household setup is complete
 */
export const isHouseholdSetupComplete = (household: any): boolean => {
  if (!household) return false;

  // Check required fields
  const hasAddress = household.address_line_1 && household.city && household.state && household.zip_code;
  const hasLanguage = household.preferred_language;
  const hasPrimaryMember = household.members && household.members.some((member: any) => member.is_primary);

  return hasAddress && hasLanguage && hasPrimaryMember;
};

/**
 * Get household setup completion percentage
 */
export const getHouseholdSetupProgress = (household: any): number => {
  if (!household) return 0;

  let completed = 0;
  let total = 0;

  // Address information
  total += 4;
  if (household.address_line_1) completed++;
  if (household.city) completed++;
  if (household.state) completed++;
  if (household.zip_code) completed++;

  // Language preference
  total += 1;
  if (household.preferred_language) completed++;

  // Primary member
  total += 1;
  if (household.members && household.members.some((member: any) => member.is_primary)) completed++;

  return Math.round((completed / total) * 100);
};

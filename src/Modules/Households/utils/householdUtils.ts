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
    return { isValid: false, error: 'Date of birth is required' };
  }

  const date = new Date(dateOfBirth);
  const today = new Date();

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Check if date is in the future
  if (date > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Check if date is too far in the past (reasonable limit: 150 years)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) {
    return { isValid: false, error: 'Date of birth is too far in the past' };
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

  return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
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
  if (!dateOfBirth) return 'Not provided';

  try {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
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
    return { isValid: false, error: 'Please enter a valid email address' };
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
    errors.push('Street address is required');
  }

  if (!address.city?.trim()) {
    errors.push('City is required');
  }

  if (!address.state?.trim()) {
    errors.push('State is required');
  }

  if (!address.zip_code?.trim()) {
    errors.push('ZIP code is required');
  } else {
    // Validate ZIP code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(address.zip_code)) {
      errors.push('Please enter a valid ZIP code');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get language display name
 */
export const getLanguageDisplayName = (language: LanguagePreference): string => {
  const languageNames: Record<LanguagePreference, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ar: 'Arabic',
  };

  return languageNames[language] || language;
};

/**
 * Get gender display name
 */
export const getGenderDisplayName = (gender: MemberGender): string => {
  const genderNames: Record<MemberGender, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
  };

  return genderNames[gender] || gender;
};

/**
 * Convert gender_id to MemberGender string
 */
export const getGenderFromId = (genderId: number): MemberGender => {
  const genderMap: Record<number, MemberGender> = {
    1: 'male',
    2: 'female',
    3: 'other',
    4: 'prefer_not_to_say',
  };

  return genderMap[genderId] || 'prefer_not_to_say';
};

/**
 * Convert MemberGender string to gender_id
 */
export const getGenderId = (gender: MemberGender): number => {
  const genderIdMap: Record<MemberGender, number> = {
    male: 1,
    female: 2,
    other: 3,
    prefer_not_to_say: 4,
  };

  return genderIdMap[gender] || 4;
};

/**
 * Get race display name
 */
export const getRaceDisplayName = (race: MemberRace): string => {
  const raceNames: Record<MemberRace, string> = {
    american_indian: 'American Indian or Alaska Native',
    asian: 'Asian',
    black: 'Black or African American',
    hispanic: 'Hispanic or Latino',
    native_hawaiian: 'Native Hawaiian or Other Pacific Islander',
    white: 'White',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
  };

  return raceNames[race] || race;
};

/**
 * Get ethnicity display name
 */
export const getEthnicityDisplayName = (ethnicity: MemberEthnicity): string => {
  const ethnicityNames: Record<MemberEthnicity, string> = {
    hispanic: 'Hispanic or Latino',
    non_hispanic: 'Not Hispanic or Latino',
    prefer_not_to_say: 'Prefer not to say',
  };

  return ethnicityNames[ethnicity] || ethnicity;
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

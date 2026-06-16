/**
 * Member Utility Functions
 *
 * Helper functions for household member operations.
 */

import localization from '../../Localization/LocalizationComponent';

/**
 * Age thresholds for member categories
 */
const AGE_THRESHOLDS = {
  SENIOR: 65,
  ADULT: 18,
};

/**
 * Member category type
 */
export type MemberCategory = 'senior' | 'adult' | 'child';

/**
 * Calculate age from date of birth
 */
export const calculateAgeFromDOB = (dateOfBirth: string): number => {
  if (!dateOfBirth || dateOfBirth === '1900-01-01') {
    return 0;
  }

  // Parse components directly to avoid the UTC-to-local timezone shift that
  // new Date("YYYY-MM-DD") introduces (it is interpreted as UTC midnight).
  const parts = dateOfBirth.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [birthYear, birthMonth, birthDay] = parts;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() + 1 - birthMonth;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }

  return age;
};

/**
 * Determine member category based on date of birth
 * - Senior: 65+ years
 * - Adult: 18-64 years
 * - Child: 0-17 years
 */
export const getMemberCategory = (dateOfBirth: string): MemberCategory => {
  const age = calculateAgeFromDOB(dateOfBirth);

  if (age >= AGE_THRESHOLDS.SENIOR) {
    return 'senior';
  } else if (age >= AGE_THRESHOLDS.ADULT) {
    return 'adult';
  } else {
    return 'child';
  }
};

/**
 * Get localized label for member category
 */
export const getMemberCategoryLabel = (category: MemberCategory): string => {
  switch (category) {
    case 'senior':
      return localization.member_category_senior || 'Senior';
    case 'adult':
      return localization.member_category_adult || 'Adult';
    case 'child':
      return localization.member_category_child || 'Child';
    default:
      return '';
  }
};

/**
 * Get member initials from first and last name
 */
export const getMemberInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.trim()?.[0] || '';
  const last = lastName?.trim()?.[0] || '';
  return (first + last).toUpperCase();
};

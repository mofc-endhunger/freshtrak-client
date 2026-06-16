// Date Validation Utility Functions with TypeScript Types

import moment from 'moment';
import localization from '../../Localization/LocalizationComponent';

// Types for date validation
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  formattedDate?: string;
  age?: number;
}

export interface DateValidationOptions {
  minAge?: number;
  maxAge?: number;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  allowFuture?: boolean;
  allowPast?: boolean;
}

export interface DateFormatOptions {
  inputFormat: string;
  outputFormat: string;
  placeholder?: string;
  separator?: string;
}

// Date validation constants
export const DATE_CONSTANTS = {
  MAX_AGE: 123,
  MIN_AGE: 0,
  DEFAULT_FORMAT: 'MM / DD / YYYY',
  SERVER_FORMAT: 'YYYY-MM-DD',
  DISPLAY_FORMAT: 'MM/DD/YYYY',
  SEPARATOR: ' / ',
} as const;

// Age validation constants
export const AGE_CONSTANTS = {
  SENIOR: 60,
  ADULT: 18,
  CHILD: 0,
  INFANT: 2,
} as const;

/**
 * Validates if a string represents a valid date
 */
export const isValidDate = (
  dateString: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const momentDate = moment(dateString, format, true);
  return momentDate.isValid();
};

/**
 * Validates date of birth with age restrictions
 */
export const isValidDateOfBirth = (
  dateString: string,
  options: DateValidationOptions = {},
): DateValidationResult => {
  const {
    minAge = DATE_CONSTANTS.MIN_AGE,
    maxAge = DATE_CONSTANTS.MAX_AGE,
    minDate,
    maxDate,
    format = DATE_CONSTANTS.DEFAULT_FORMAT,
    allowFuture = false,
    allowPast = true,
  } = options;

  // Check if date string is valid
  if (!isValidDate(dateString, format)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  const momentDate = moment(dateString, format);
  const now = moment();

  if (!allowFuture && momentDate.isAfter(now)) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_future,
    };
  }

  if (!allowPast && momentDate.isBefore(now)) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_future,
    };
  }

  // Calculate age
  const age = now.diff(momentDate, 'years');

  // Check minimum age
  if (age < minAge) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  // Check maximum age
  if (age > maxAge) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_too_far_past,
    };
  }

  // Check custom date range
  if (minDate && momentDate.isBefore(moment(minDate))) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_too_far_past,
    };
  }

  if (maxDate && momentDate.isAfter(moment(maxDate))) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_future,
    };
  }

  return {
    isValid: true,
    age,
    formattedDate: momentDate.format(format),
  };
};

/**
 * Helper to validate and auto-correct date part values as user types
 * @param str - The string value to check
 * @param max - Maximum allowed value (12 for month, 31 for day)
 */
const checkDatePartValue = (str: string, max: number): string => {
  if (str.charAt(0) !== '0' || str === '00') {
    const num = parseInt(str);
    if (isNaN(num) || num <= 0 || num > max) return '1';
    const result =
      num > parseInt(max.toString().charAt(0)) && num.toString().length === 1
        ? '0' + num
        : num.toString();
    return result;
  }
  return str;
};

/**
 * Formats date input as user types (MM / DD / YYYY format)
 * Validates month (1-12) and day (1-31) as user types
 */
export const formatDateInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Handle backspace on separator
  if (/\D\/$/.test(input)) {
    input = input.substr(0, input.length - 3);
  }

  // Split by separator and clean each part
  const values = input.split('/').map((v) => v.replace(/\D/g, ''));

  // Validate month (max 12) and day (max 31) as user types
  if (values[0]) values[0] = checkDatePartValue(values[0], 12);
  if (values[1]) values[1] = checkDatePartValue(values[1], 31);

  // Format with separators
  const output = values.map((v, i) => {
    return v.length === 2 && i < 2 ? v + ' / ' : v;
  });

  // Limit to 14 characters (MM / DD / YYYY)
  return output.join('').substr(0, 14);
};

/**
 * Validates and formats date input with proper validation
 */
export const validateAndFormatDateInput = (
  input: string,
  options: DateValidationOptions = {},
): DateValidationResult => {
  const formattedInput = formatDateInput(input);

  // Check if input is complete (MM / DD / YYYY)
  if (formattedInput.length < 10) {
    return {
      isValid: false,
      formattedDate: formattedInput,
    };
  }

  return isValidDateOfBirth(formattedInput, options);
};

/**
 * Calculates age from date of birth
 */
export const calculateAge = (
  dateOfBirth: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): number => {
  if (!isValidDate(dateOfBirth, format)) {
    return 0;
  }

  const birthDate = moment(dateOfBirth, format);
  const now = moment();

  return now.diff(birthDate, 'years');
};

/**
 * Determines age category based on age
 */
export const getAgeCategory = (age: number): 'senior' | 'adult' | 'child' | 'infant' => {
  if (age >= AGE_CONSTANTS.SENIOR) {
    return 'senior';
  } else if (age >= AGE_CONSTANTS.ADULT) {
    return 'adult';
  } else if (age >= AGE_CONSTANTS.INFANT) {
    return 'child';
  } else {
    return 'infant';
  }
};

/**
 * Validates date range (start date before end date)
 */
export const isValidDateRange = (
  startDate: string,
  endDate: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): DateValidationResult => {
  if (!isValidDate(startDate, format) || !isValidDate(endDate, format)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  const start = moment(startDate, format);
  const end = moment(endDate, format);

  if (start.isAfter(end)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  return {
    isValid: true,
    formattedDate: `${start.format(format)} - ${end.format(format)}`,
  };
};

/**
 * Converts date to server format (YYYY-MM-DD)
 */
export const formatDateForServer = (
  dateString: string,
  inputFormat: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): string => {
  if (!isValidDate(dateString, inputFormat)) {
    return '';
  }

  const momentDate = moment(dateString, inputFormat);
  return momentDate.format(DATE_CONSTANTS.SERVER_FORMAT);
};

/**
 * Converts server date to display format
 */
export const formatDateForDisplay = (
  serverDate: string,
  outputFormat: string = DATE_CONSTANTS.DISPLAY_FORMAT,
): string => {
  if (!serverDate) {
    return '';
  }

  const momentDate = moment(serverDate, DATE_CONSTANTS.SERVER_FORMAT);
  if (!momentDate.isValid()) {
    return '';
  }

  return momentDate.format(outputFormat);
};

/**
 * Validates event date (must be in the future)
 */
export const isValidEventDate = (
  eventDate: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): DateValidationResult => {
  if (!isValidDate(eventDate, format)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  const eventMoment = moment(eventDate, format);
  const now = moment();

  if (eventMoment.isBefore(now, 'day')) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_future,
    };
  }

  return {
    isValid: true,
    formattedDate: eventMoment.format(format),
  };
};

/**
 * Validates time format (HH:MM AM/PM)
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }

  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
  return timeRegex.test(timeString);
};

/**
 * Validates time range (start time before end time)
 */
export const isValidTimeRange = (startTime: string, endTime: string): DateValidationResult => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  const start = moment(startTime, 'hh:mm A');
  const end = moment(endTime, 'hh:mm A');

  if (start.isSameOrAfter(end)) {
    return {
      isValid: false,
      error: localization.error_please_enter_valid_date,
    };
  }

  return {
    isValid: true,
    formattedDate: `${start.format('hh:mm A')} - ${end.format('hh:mm A')}`,
  };
};

/**
 * Gets relative time description (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTime = (
  dateString: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): string => {
  if (!isValidDate(dateString, format)) {
    return '';
  }

  const date = moment(dateString, format);
  return date.fromNow();
};

/**
 * Checks if date is today
 */
export const isToday = (
  dateString: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): boolean => {
  if (!isValidDate(dateString, format)) {
    return false;
  }

  const date = moment(dateString, format);
  return date.isSame(moment(), 'day');
};

/**
 * Checks if date is in the past
 */
export const isPastDate = (
  dateString: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): boolean => {
  if (!isValidDate(dateString, format)) {
    return false;
  }

  const date = moment(dateString, format);
  return date.isBefore(moment(), 'day');
};

/**
 * Checks if date is in the future
 */
export const isFutureDate = (
  dateString: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): boolean => {
  if (!isValidDate(dateString, format)) {
    return false;
  }

  const date = moment(dateString, format);
  return date.isAfter(moment(), 'day');
};

/**
 * Gets the number of days between two dates
 */
export const getDaysBetween = (
  startDate: string,
  endDate: string,
  format: string = DATE_CONSTANTS.DEFAULT_FORMAT,
): number => {
  if (!isValidDate(startDate, format) || !isValidDate(endDate, format)) {
    return 0;
  }

  const start = moment(startDate, format);
  const end = moment(endDate, format);

  return end.diff(start, 'days');
};

/**
 * Validates date input with custom validation rules
 */
export const validateDateWithRules = (
  dateString: string,
  rules: {
    required?: boolean;
    minAge?: number;
    maxAge?: number;
    minDate?: string;
    maxDate?: string;
    format?: string;
    allowFuture?: boolean;
    allowPast?: boolean;
  } = {},
): DateValidationResult => {
  const {
    required = true,
    minAge,
    maxAge,
    minDate,
    maxDate,
    format = DATE_CONSTANTS.DEFAULT_FORMAT,
    allowFuture = false,
    allowPast = true,
  } = rules;

  // Check if required
  if (required && (!dateString || dateString.trim() === '')) {
    return {
      isValid: false,
      error: localization.error_date_of_birth_required,
    };
  }

  // If not required and empty, return valid
  if (!required && (!dateString || dateString.trim() === '')) {
    return {
      isValid: true,
    };
  }

  // Validate date format and content
  return isValidDateOfBirth(dateString, {
    minAge,
    maxAge,
    minDate: minDate ? moment(minDate, format).toDate() : undefined,
    maxDate: maxDate ? moment(maxDate, format).toDate() : undefined,
    format,
    allowFuture,
    allowPast,
  });
};

// ============================================================================
// React Hook Form Validation Helpers
// ============================================================================

/**
 * Validates date of birth for react-hook-form (native date input - YYYY-MM-DD format)
 * Returns true if valid, or error message string if invalid
 *
 * @example
 * ```tsx
 * <Input type="date" {...register("date_of_birth", { validate: validateDobNative })} />
 * ```
 */
export const validateDobNative = (value: string): string | true => {
  if (!value) {
    return localization.error_date_of_birth_required;
  }

  const date = moment(value, DATE_CONSTANTS.SERVER_FORMAT, true);

  if (!date.isValid()) {
    return localization.error_please_enter_valid_date;
  }

  if (date.isAfter(moment())) {
    return localization.error_date_of_birth_future;
  }

  const maxAgeDate = moment().subtract(DATE_CONSTANTS.MAX_AGE, 'years');
  if (date.isBefore(maxAgeDate)) {
    return localization.error_please_enter_valid_date;
  }

  return true;
};

/**
 * Validates date of birth for react-hook-form (text input - MM / DD / YYYY format)
 * Returns true if valid, or error message string if invalid
 *
 * @example
 * ```tsx
 * <input type="text" {...register("date_of_birth", { validate: validateDobText })} />
 * ```
 */
export const validateDobText = (value: string): string | true => {
  if (!value) {
    return localization.error_date_of_birth_required;
  }

  const date = moment(value, DATE_CONSTANTS.DEFAULT_FORMAT, true);

  if (!date.isValid()) {
    return localization.error_please_enter_valid_date;
  }

  if (date.isAfter(moment())) {
    return localization.error_date_of_birth_future;
  }

  const maxAgeDate = moment().subtract(DATE_CONSTANTS.MAX_AGE, 'years');
  if (date.isBefore(maxAgeDate)) {
    return localization.error_please_enter_valid_date;
  }

  return true;
};

/**
 * Gets today's date in YYYY-MM-DD format (for native date input max attribute)
 */
export const getTodayForDateInput = (): string => {
  return moment().format(DATE_CONSTANTS.SERVER_FORMAT);
};

/**
 * Gets the minimum allowed date (123 years ago) in YYYY-MM-DD format
 */
export const getMinDateForDateInput = (): string => {
  return moment().subtract(DATE_CONSTANTS.MAX_AGE, 'years').format(DATE_CONSTANTS.SERVER_FORMAT);
};

/**
 * Date input constraints for native date inputs
 * Use with max and min attributes
 *
 * @example
 * ```tsx
 * const { today, minDate } = getDateInputConstraints();
 * <Input type="date" max={today} min={minDate} />
 * ```
 */
export const getDateInputConstraints = (): { today: string; minDate: string } => {
  return {
    today: getTodayForDateInput(),
    minDate: getMinDateForDateInput(),
  };
};

// Phone Formatting Utility Functions with TypeScript Types

// Types for phone formatting
export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedPhone?: string;
  countryCode?: string;
  areaCode?: string;
  prefix?: string;
  lineNumber?: string;
}

export interface PhoneFormatOptions {
  format?: 'US' | 'INTERNATIONAL' | 'E164' | 'NATIONAL';
  countryCode?: string;
  includeCountryCode?: boolean;
  separator?: string;
  placeholder?: string;
}

export interface PhoneNumberParts {
  countryCode: string;
  areaCode: string;
  prefix: string;
  lineNumber: string;
  extension?: string;
}

// Phone formatting constants
export const PHONE_CONSTANTS = {
  US_COUNTRY_CODE: '+1',
  US_AREA_CODE_LENGTH: 3,
  US_PREFIX_LENGTH: 3,
  US_LINE_NUMBER_LENGTH: 4,
  US_TOTAL_LENGTH: 10,
  MAX_EXTENSION_LENGTH: 5,
  DEFAULT_FORMAT: 'US',
  DEFAULT_SEPARATOR: '-',
  PLACEHOLDER: '(555) 123-4567',
} as const;

// Phone number patterns
export const PHONE_PATTERNS = {
  US: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  INTERNATIONAL: /^\+?([0-9]{1,3})[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})[-. ]?([0-9]{1,4})$/,
  E164: /^\+[1-9]\d{1,14}$/,
  DIGITS_ONLY: /[^\d]/g,
} as const;

/**
 * Normalizes phone input by removing non-digit characters
 */
export const normalizePhoneInput = (input: string | number): string => {
  try {
    if (typeof input !== 'string' && typeof input !== 'number') {
      console.error('[phoneFormatting] normalizePhoneInput received invalid value:', input, typeof input);
      return '';
    }

    const strValue = String(input);
    return strValue.replace(PHONE_PATTERNS.DIGITS_ONLY, '');
  } catch (err) {
    console.error('[normalizePhoneInput] Exception:', err, input);
    return '';
  }
};

/**
 * Formats US phone number as user types (XXX) XXX-XXXX
 */
export const formatUSPhoneInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const digits = normalizePhoneInput(input);
  const length = digits.length;

  if (length === 0) return '';
  if (length < 4) return digits;
  if (length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (length < 11) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;

  // Limit to 10 digits for US format
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * Validates US phone number format
 */
export const isValidUSPhoneNumber = (phoneNumber: string): PhoneValidationResult => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  const normalized = normalizePhoneInput(phoneNumber);

  if (normalized.length !== PHONE_CONSTANTS.US_TOTAL_LENGTH) {
    return {
      isValid: false,
      error: 'Phone number must be 10 digits',
    };
  }

  const match = phoneNumber.match(PHONE_PATTERNS.US);
  if (!match) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }

  const [, areaCode, prefix, lineNumber] = match;

  return {
    isValid: true,
    formattedPhone: `(${areaCode}) ${prefix}-${lineNumber}`,
    areaCode,
    prefix,
    lineNumber,
  };
};

/**
 * Parses phone number into its component parts
 */
export const parsePhoneNumber = (phoneNumber: string): PhoneNumberParts | null => {
  if (!phoneNumber) return null;

  const normalized = normalizePhoneInput(phoneNumber);

  if (normalized.length < PHONE_CONSTANTS.US_TOTAL_LENGTH) {
    return null;
  }

  return {
    countryCode: PHONE_CONSTANTS.US_COUNTRY_CODE,
    areaCode: normalized.slice(0, PHONE_CONSTANTS.US_AREA_CODE_LENGTH),
    prefix: normalized.slice(3, 6),
    lineNumber: normalized.slice(6, 10),
  };
};

/**
 * Formats phone number for different display formats
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  options: PhoneFormatOptions = {}
): string => {
  const {
    format = PHONE_CONSTANTS.DEFAULT_FORMAT,
    includeCountryCode = false,
    separator = PHONE_CONSTANTS.DEFAULT_SEPARATOR,
  } = options;

  if (!phoneNumber) return '';

  const normalized = normalizePhoneInput(phoneNumber);

  if (normalized.length !== PHONE_CONSTANTS.US_TOTAL_LENGTH) {
    return phoneNumber; // Return original if not valid US format
  }

  const parts = parsePhoneNumber(normalized);
  if (!parts) return phoneNumber;

  switch (format) {
    case 'US':
      return `(${parts.areaCode}) ${parts.prefix}${separator}${parts.lineNumber}`;

    case 'INTERNATIONAL':
      const countryCode = includeCountryCode ? `${parts.countryCode} ` : '';
      return `${countryCode}${parts.areaCode} ${parts.prefix} ${parts.lineNumber}`;

    case 'E164':
      return `${parts.countryCode}${parts.areaCode}${parts.prefix}${parts.lineNumber}`;

    case 'NATIONAL':
      return `${parts.areaCode}${separator}${parts.prefix}${separator}${parts.lineNumber}`;

    default:
      return `(${parts.areaCode}) ${parts.prefix}${separator}${parts.lineNumber}`;
  }
};

/**
 * Validates and formats phone input with proper validation
 */
export const validateAndFormatPhoneInput = (
  input: string,
  options: PhoneFormatOptions = {}
): PhoneValidationResult => {
  const formattedInput = formatUSPhoneInput(input);

  // Check if input is complete (10 digits)
  const normalized = normalizePhoneInput(formattedInput);
  if (normalized.length < PHONE_CONSTANTS.US_TOTAL_LENGTH) {
    return {
      isValid: false,
      formattedPhone: formattedInput,
    };
  }

  return isValidUSPhoneNumber(formattedInput);
};

/**
 * Extracts area code from phone number
 */
export const getAreaCode = (phoneNumber: string): string => {
  const parts = parsePhoneNumber(phoneNumber);
  return parts?.areaCode || '';
};

/**
 * Checks if phone number is a toll-free number
 */
export const isTollFreeNumber = (phoneNumber: string): boolean => {
  const areaCode = getAreaCode(phoneNumber);
  const tollFreeCodes = ['800', '888', '877', '866', '855', '844', '833'];
  return tollFreeCodes.includes(areaCode);
};

/**
 * Validates phone number with custom validation rules
 */
export const validatePhoneWithRules = (
  phoneNumber: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowTollFree?: boolean;
    format?: 'US' | 'INTERNATIONAL' | 'E164' | 'NATIONAL';
  } = {}
): PhoneValidationResult => {
  const {
    required = true,
    minLength = PHONE_CONSTANTS.US_TOTAL_LENGTH,
    maxLength = PHONE_CONSTANTS.US_TOTAL_LENGTH,
    allowTollFree = true,
    format = 'US',
  } = rules;

  // Check if required
  if (required && (!phoneNumber || phoneNumber.trim() === '')) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  // If not required and empty, return valid
  if (!required && (!phoneNumber || phoneNumber.trim() === '')) {
    return {
      isValid: true,
    };
  }

  const normalized = normalizePhoneInput(phoneNumber);

  // Check length constraints
  if (normalized.length < minLength) {
    return {
      isValid: false,
      error: `Phone number must be at least ${minLength} digits`,
    };
  }

  if (normalized.length > maxLength) {
    return {
      isValid: false,
      error: `Phone number cannot exceed ${maxLength} digits`,
    };
  }

  // Check toll-free restriction
  if (!allowTollFree && isTollFreeNumber(phoneNumber)) {
    return {
      isValid: false,
      error: 'Toll-free numbers are not allowed',
    };
  }

  // Validate format
  return isValidUSPhoneNumber(phoneNumber);
};

/**
 * Formats phone number for display with masking
 */
export const maskPhoneNumber = (
  phoneNumber: string,
  maskChar: string = '*'
): string => {
  if (!phoneNumber) return '';

  const parts = parsePhoneNumber(phoneNumber);
  if (!parts) return phoneNumber;

  return `(${parts.areaCode}) ${parts.prefix.slice(0, 1)}${maskChar}${maskChar}-${maskChar}${maskChar}${maskChar}${parts.lineNumber.slice(-2)}`;
};

/**
 * Converts phone number to clickable tel: link
 */
export const formatPhoneForLink = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  const normalized = normalizePhoneInput(phoneNumber);
  if (normalized.length !== PHONE_CONSTANTS.US_TOTAL_LENGTH) {
    return phoneNumber;
  }

  return `tel:+1${normalized}`;
};

/**
 * Extracts extension from phone number
 */
export const getExtension = (phoneNumber: string): string => {
  const extensionMatch = phoneNumber.match(/ext\.?\s*(\d+)$/i);
  return extensionMatch ? extensionMatch[1] : '';
};

/**
 * Validates extension format
 */
export const isValidExtension = (extension: string): boolean => {
  if (!extension) return true; // Extensions are optional

  const extensionDigits = extension.replace(/\D/g, '');
  return extensionDigits.length > 0 && extensionDigits.length <= PHONE_CONSTANTS.MAX_EXTENSION_LENGTH;
};

/**
 * Formats phone number with extension
 */
export const formatPhoneWithExtension = (
  phoneNumber: string,
  extension?: string
): string => {
  const formatted = formatPhoneNumber(phoneNumber);

  if (!extension) return formatted;

  if (!isValidExtension(extension)) {
    return formatted;
  }

  return `${formatted} ext. ${extension}`;
};

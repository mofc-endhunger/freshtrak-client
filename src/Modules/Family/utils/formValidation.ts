// Form Validation Utility Functions with TypeScript Types

import localization from '../../Localization/LocalizationComponent';

// Types for form validation
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  field?: string;
}

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string;
  custom?: (value: any, formData?: any) => ValidationResult;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

// Form validation constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 50,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_ZIP_LENGTH: 5,
  MAX_ZIP_LENGTH: 10,
  MIN_AGE: 0,
  MAX_AGE: 123,
  DEFAULT_MODE: 'onSubmit',
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME: /^[a-zA-Z\s'-]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NUMERIC: /^\d+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
} as const;

// Error messages - using function to access localization dynamically
export const getErrorMessage = () => ({
  REQUIRED: localization.error_field_required,
  INVALID_EMAIL: localization.error_please_enter_valid_email,
  INVALID_PHONE:
    localization.error_phone_number_required ||
    localization.error_please_enter_valid_email.replace('email', 'phone number'),
  INVALID_ZIP:
    localization.error_zip_code_required ||
    localization.error_please_enter_valid_email.replace('email', 'ZIP code'),
  INVALID_PASSWORD:
    localization.error_password_required ||
    'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  PASSWORDS_MISMATCH: 'Passwords do not match',
  MIN_LENGTH: (field: string, min: number) => {
    if (field.toLowerCase() === 'zip code' || field.toLowerCase() === 'zip') {
      return (
        localization.error_zip_code_min_length || `${field} must be at least ${min} characters`
      );
    }
    return `${field} must be at least ${min} characters`;
  },
  MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
  INVALID_AGE: localization.error_please_enter_valid_date || 'Please enter a valid age',
  INVALID_NAME: localization.error_field_required || 'Please enter a valid name',
  INVALID_FORMAT: (field: string) =>
    localization.error_please_enter_valid_email.replace('email address', field) ||
    `Please enter a valid ${field}`,
});

// Legacy ERROR_MESSAGES for backward compatibility - now uses function
export const ERROR_MESSAGES = getErrorMessage();

/**
 * Validates if a field is required and not empty
 */
export const validateRequired = (value: any, fieldName = 'Field'): ValidationResult => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED,
      field: fieldName,
    };
  }
  return { isValid: true };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true }; // Email is optional in some forms
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL,
      field: 'email',
    };
  }

  return { isValid: true };
};

/**
 * Validates phone number format
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Phone is optional in some forms
  }

  if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_PHONE,
      field: 'phone',
    };
  }

  return { isValid: true };
};

/**
 * Validates ZIP code format
 */
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode) {
    return { isValid: true }; // ZIP code is optional in some forms
  }

  if (!VALIDATION_PATTERNS.ZIP_CODE.test(zipCode)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_ZIP,
      field: 'zipCode',
    };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED,
      field: 'password',
    };
  }

  if (password.length < VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MIN_LENGTH('Password', VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH),
      field: 'password',
    };
  }

  if (password.length > VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MAX_LENGTH('Password', VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH),
      field: 'password',
    };
  }

  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_PASSWORD,
      field: 'password',
    };
  }

  return { isValid: true };
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirm = (
  passwordConfirm: string,
  password: string,
): ValidationResult => {
  if (!passwordConfirm) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED,
      field: 'passwordConfirm',
    };
  }

  if (passwordConfirm !== password) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.PASSWORDS_MISMATCH,
      field: 'passwordConfirm',
    };
  }

  return { isValid: true };
};

/**
 * Validates name format
 */
export const validateName = (name: string, fieldName = 'Name'): ValidationResult => {
  if (!name) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED,
      field: fieldName.toLowerCase(),
    };
  }

  if (name.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MIN_LENGTH(fieldName, VALIDATION_CONSTANTS.MIN_NAME_LENGTH),
      field: fieldName.toLowerCase(),
    };
  }

  if (name.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MAX_LENGTH(fieldName, VALIDATION_CONSTANTS.MAX_NAME_LENGTH),
      field: fieldName.toLowerCase(),
    };
  }

  if (!VALIDATION_PATTERNS.NAME.test(name)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_NAME,
      field: fieldName.toLowerCase(),
    };
  }

  return { isValid: true };
};

/**
 * Validates age
 */
export const validateAge = (age: number | string): ValidationResult => {
  const numAge = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(numAge)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_AGE,
      field: 'age',
    };
  }

  if (numAge < VALIDATION_CONSTANTS.MIN_AGE || numAge > VALIDATION_CONSTANTS.MAX_AGE) {
    const errorMsg = `Age must be between ${VALIDATION_CONSTANTS.MIN_AGE} and ${VALIDATION_CONSTANTS.MAX_AGE}`;
    return {
      isValid: false,
      error: errorMsg,
      field: 'age',
    };
  }

  return { isValid: true };
};

/**
 * Validates field length
 */
export const validateLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string,
): ValidationResult => {
  if (!value) {
    return { isValid: true }; // Optional field
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MIN_LENGTH(fieldName, minLength),
      field: fieldName.toLowerCase(),
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.MAX_LENGTH(fieldName, maxLength),
      field: fieldName.toLowerCase(),
    };
  }

  return { isValid: true };
};

/**
 * Validates field pattern
 */
export const validatePattern = (
  value: string,
  pattern: RegExp,
  errorMessage: string,
  fieldName: string,
): ValidationResult => {
  if (!value) {
    return { isValid: true }; // Optional field
  }

  if (!pattern.test(value)) {
    return {
      isValid: false,
      error: errorMessage,
      field: fieldName.toLowerCase(),
    };
  }

  return { isValid: true };
};

/**
 * Validates form data against configuration
 */
export const validateFormData = (
  formData: Record<string, any>,
  config: FormValidationConfig,
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  for (const [fieldName, rules] of Object.entries(config)) {
    const value = formData[fieldName];

    // Check required
    if (rules.required && (typeof rules.required === 'boolean' ? rules.required : true)) {
      const requiredResult = validateRequired(value, fieldName);
      if (!requiredResult.isValid) {
        results[fieldName] = requiredResult;
        continue;
      }
    }

    // Skip validation if field is empty and not required
    if (!value && !rules.required) {
      results[fieldName] = { isValid: true };
      continue;
    }

    // Check min length
    if (rules.minLength && typeof value === 'string') {
      const lengthResult = validateLength(value, rules.minLength.value, 999, fieldName);
      if (!lengthResult.isValid) {
        results[fieldName] = lengthResult;
        continue;
      }
    }

    // Check max length
    if (rules.maxLength && typeof value === 'string') {
      const lengthResult = validateLength(value, 0, rules.maxLength.value, fieldName);
      if (!lengthResult.isValid) {
        results[fieldName] = lengthResult;
        continue;
      }
    }

    // Check pattern
    if (rules.pattern) {
      const patternResult = validatePattern(
        value,
        rules.pattern.value,
        rules.pattern.message,
        fieldName,
      );
      if (!patternResult.isValid) {
        results[fieldName] = patternResult;
        continue;
      }
    }

    // Check custom validation
    if (rules.validate) {
      const customResult = rules.validate(value);
      if (typeof customResult === 'string') {
        results[fieldName] = {
          isValid: false,
          error: customResult,
          field: fieldName,
        };
        continue;
      } else if (!customResult) {
        results[fieldName] = {
          isValid: false,
          error: ERROR_MESSAGES.INVALID_FORMAT(fieldName),
          field: fieldName,
        };
        continue;
      }
    }

    // Check custom validation function
    if (rules.custom) {
      const customResult = rules.custom(value, formData);
      if (!customResult.isValid) {
        results[fieldName] = customResult;
        continue;
      }
    }

    results[fieldName] = { isValid: true };
  }

  return results;
};

/**
 * Creates React Hook Form validation rules
 */
export const createValidationRules = (config: FormValidationConfig): Record<string, any> => {
  const rules: Record<string, any> = {};

  for (const [fieldName, validationRule] of Object.entries(config)) {
    const rule: any = {};

    if (validationRule.required) {
      rule.required =
        typeof validationRule.required === 'string'
          ? validationRule.required
          : ERROR_MESSAGES.REQUIRED;
    }

    if (validationRule.minLength) {
      rule.minLength = validationRule.minLength;
    }

    if (validationRule.maxLength) {
      rule.maxLength = validationRule.maxLength;
    }

    if (validationRule.pattern) {
      rule.pattern = validationRule.pattern;
    }

    if (validationRule.validate) {
      rule.validate = validationRule.validate;
    }

    rules[fieldName] = rule;
  }

  return rules;
};

/**
 * Validates complete form submission
 */
export const validateFormSubmission = (
  formData: Record<string, any>,
  config: FormValidationConfig,
): { isValid: boolean; errors: Record<string, ValidationResult> } => {
  const errors = validateFormData(formData, config);
  const hasErrors = Object.values(errors).some((result) => !result.isValid);

  return {
    isValid: !hasErrors,
    errors,
  };
};

/**
 * Gets field error message
 */
export const getFieldError = (
  errors: Record<string, ValidationResult>,
  fieldName: string,
): string | undefined => {
  const error = errors[fieldName];
  return error?.isValid ? undefined : error?.error;
};

/**
 * Checks if form has any errors
 */
export const hasFormErrors = (errors: Record<string, ValidationResult>): boolean => {
  return Object.values(errors).some((error) => !error.isValid);
};

/**
 * Gets all error messages from form
 */
export const getAllErrorMessages = (errors: Record<string, ValidationResult>): string[] => {
  return Object.values(errors)
    .filter((error) => !error.isValid)
    .map((error) => error.error)
    .filter(Boolean) as string[];
};

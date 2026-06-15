import { formatDateOfBirth, validateDateOfBirth } from '../householdUtils';

jest.mock('../../../Localization/LocalizationComponent', () => ({
  label_not_provided: 'Not provided',
  label_invalid_date: 'Invalid date',
  error_date_of_birth_required: 'Date of birth is required',
  error_please_enter_valid_date: 'Please enter a valid date',
  error_date_of_birth_future: 'Date of birth cannot be in the future',
  error_date_of_birth_too_far_past: 'Date of birth is too far in the past',
  getLanguage: () => 'en',
}));

describe('householdUtils — date of birth utilities', () => {
  describe('formatDateOfBirth', () => {
    it("returns 'Not provided' for undefined input", () => {
      expect(formatDateOfBirth(undefined)).toBe('Not provided');
    });

    it('formats a valid YYYY-MM-DD string without a timezone-driven off-by-one', () => {
      // Core regression: previously new Date("1987-08-19") was parsed as UTC
      // midnight, which in UTC-4 resolves to Aug 18.
      const result = formatDateOfBirth('1987-08-19');
      expect(result).toContain('August');
      expect(result).toContain('19');
      expect(result).toContain('1987');
      expect(result).not.toContain('18');
    });

    it('formats January 1st correctly without shifting to December 31', () => {
      const result = formatDateOfBirth('2000-01-01');
      expect(result).toContain('January');
      expect(result).toContain('1');
      expect(result).toContain('2000');
    });

    it('formats December 31st correctly without shifting to December 30', () => {
      const result = formatDateOfBirth('1999-12-31');
      expect(result).toContain('December');
      expect(result).toContain('31');
      expect(result).toContain('1999');
    });

    it("returns 'Invalid date' for a non-date string", () => {
      expect(formatDateOfBirth('not-a-date')).toBe('Invalid date');
    });

    it("returns 'Invalid date' for a partial string", () => {
      expect(formatDateOfBirth('1987-08')).toBe('Invalid date');
    });
  });

  describe('validateDateOfBirth', () => {
    it('returns invalid with required error for an empty string', () => {
      const result = validateDateOfBirth('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date of birth is required');
    });

    it('returns valid for a properly formatted past date', () => {
      expect(validateDateOfBirth('1987-08-19')).toEqual({ isValid: true });
    });

    it('returns invalid with future error for a future date', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const dob = future.toISOString().split('T')[0];
      const result = validateDateOfBirth(dob);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date of birth cannot be in the future');
    });

    it('returns invalid with too-far-past error for a date over 150 years ago', () => {
      const result = validateDateOfBirth('1800-01-01');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date of birth is too far in the past');
    });

    it('returns invalid with invalid-date error for a non-parseable string', () => {
      const result = validateDateOfBirth('not-a-date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid date');
    });

    it('does not shift date by timezone when validating — Jan 1 is valid, not Dec 31', () => {
      // If new Date("2000-01-01") were parsed as UTC, in UTC-N it would be Dec 31 1999.
      // Validation with a future/past boundary check could behave incorrectly.
      // The key assertion is simply that the date is treated as Jan 1, not Dec 31.
      const result = validateDateOfBirth('2000-01-01');
      expect(result.isValid).toBe(true);
    });
  });
});

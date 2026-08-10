import { formatDateDayAndDate, formatDateForServer } from '../DateFormat';

describe('DateFormat', () => {
  describe('formatDateDayAndDate', () => {
    it('displays the correct calendar date for a YYYY-MM-DD API string regardless of local timezone', () => {
      // Regression test: new Date("2026-06-22") is UTC midnight, which in negative-offset
      // timezones (e.g. UTC-4) would resolve to June 21 — one day too early.
      // The fix normalises date-only strings to local noon before parsing.
      const result = formatDateDayAndDate('2026-06-22');
      expect(result).toMatch(/6\/22\/2026$/);
    });

    it('includes the correct day of the week', () => {
      const result = formatDateDayAndDate('2026-06-22');
      expect(result).toBe('Monday, 6/22/2026');
    });
  });

  describe('formatDateForServer', () => {
    describe('happy path — spaced format (MM / DD / YYYY)', () => {
      it('returns YYYY-MM-DD for a standard date', () => {
        expect(formatDateForServer('08 / 19 / 1987')).toBe('1987-08-19');
      });

      it('pads single-digit month and day with a leading zero', () => {
        expect(formatDateForServer('01 / 05 / 2000')).toBe('2000-01-05');
      });

      it('returns the exact date entered regardless of the local timezone offset', () => {
        // This is the core regression test for the off-by-one timezone bug.
        // Previously new Date(y, m, d).toISOString() could shift the date.
        const result = formatDateForServer('08 / 19 / 1987');
        expect(result).toBe('1987-08-19');
      });
    });

    describe('happy path — slash format (MM/DD/YYYY)', () => {
      it('returns YYYY-MM-DD for a standard date', () => {
        expect(formatDateForServer('08/19/1987')).toBe('1987-08-19');
      });

      it('pads single-digit parts with a leading zero', () => {
        expect(formatDateForServer('3/7/2005')).toBe('2005-03-07');
      });
    });

    describe('edge cases', () => {
      it('returns empty string for null input', () => {
        expect(formatDateForServer(null)).toBe('');
      });

      it('returns empty string for undefined input', () => {
        expect(formatDateForServer(undefined)).toBe('');
      });

      it('returns empty string for an empty string', () => {
        expect(formatDateForServer('')).toBe('');
      });

      it('returns empty string for a non-string value', () => {
        expect(formatDateForServer(12345)).toBe('');
      });

      it('returns empty string when the string does not split into 3 parts', () => {
        expect(formatDateForServer('08/19')).toBe('');
      });

      it('returns empty string for an invalid month (0)', () => {
        expect(formatDateForServer('00/19/1987')).toBe('');
      });

      it('returns empty string for an invalid month (13)', () => {
        expect(formatDateForServer('13/01/2000')).toBe('');
      });

      it('returns empty string for an invalid day (0)', () => {
        expect(formatDateForServer('08/00/1987')).toBe('');
      });

      it('returns empty string for an invalid day (32)', () => {
        expect(formatDateForServer('08/32/1987')).toBe('');
      });

      it('returns empty string for impossible calendar dates (Feb 31)', () => {
        expect(formatDateForServer('02/31/2000')).toBe('');
      });

      it('returns empty string for impossible calendar dates (Feb 30)', () => {
        expect(formatDateForServer('02/30/2000')).toBe('');
      });

      it('returns empty string for impossible calendar dates (Apr 31)', () => {
        expect(formatDateForServer('04/31/2024')).toBe('');
      });

      it('accepts the last day of a month (Feb 29 on a leap year)', () => {
        expect(formatDateForServer('02/29/2000')).toBe('2000-02-29');
      });

      it('rejects Feb 29 on a non-leap year', () => {
        expect(formatDateForServer('02/29/2001')).toBe('');
      });
    });
  });
});

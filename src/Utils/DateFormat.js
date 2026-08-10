import moment from 'moment';

const toMoment = (value) => {
  if (value instanceof Date) {
    return moment(value);
  }

  if (typeof value === 'string') {
    // Date-only strings ("YYYY-MM-DD") are parsed as UTC midnight by the JS spec,
    // which shifts the displayed date back by one day in negative-offset timezones.
    // Appending T12:00:00 treats them as local noon, keeping the correct calendar
    // date for any timezone within ±12 hours of UTC.
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
    const normalizedDate = new Date(normalized);
    if (!Number.isNaN(normalizedDate.getTime())) {
      return moment(normalizedDate);
    }
  }

  return moment(value);
};

export const formatDateDayAndDate = (x) => toMoment(x).format('dddd, M/D/YYYY');

export const formatMMDDYYYY = (x) => toMoment(x).format('L');

export const formatDateForServer = (value) => {
  if (!value || typeof value !== 'string') {
    console.warn('formatDateForServer: Invalid input:', value);
    return '';
  }

  const reWhiteSpace = new RegExp('\\s+');
  const formatted = reWhiteSpace.test(value) ? value.split(' / ') : value.split('/');

  if (formatted.length !== 3) {
    console.warn('formatDateForServer: Invalid date format:', value);
    return '';
  }

  const year = parseInt(formatted[2]);
  const month = parseInt(formatted[0]) - 1; // Month is 0-indexed
  const day = parseInt(formatted[1]);

  // Validate the date components
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.warn('formatDateForServer: Invalid date components:', {
      year,
      month,
      day,
    });
    return '';
  }

  if (month < 0 || month > 11) {
    console.warn('formatDateForServer: Invalid month:', month);
    return '';
  }

  if (day < 1 || day > 31) {
    console.warn('formatDateForServer: Invalid day:', day);
    return '';
  }

  try {
    // Build the YYYY-MM-DD string directly to avoid any timezone conversion.
    // new Date(y, m, d).toISOString() can shift the date by one day for
    // users in positive UTC-offset timezones (UTC+N), where local midnight
    // converts to the previous calendar day in UTC.

    // Verify the calendar date actually exists by constructing a local Date and
    // confirming the parts round-trip.  JS normalises overflowing dates
    // (e.g. Feb 31 → Mar 3) instead of throwing, so this is the reliable way
    // to catch impossible inputs like 2000-02-31 before they reach the API.
    const check = new Date(year, month, day);
    if (check.getFullYear() !== year || check.getMonth() !== month || check.getDate() !== day) {
      console.warn('formatDateForServer: Date does not exist in calendar:', value);
      return '';
    }

    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const yyyy = String(year);
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('formatDateForServer: Error creating date:', error);
    return '';
  }
};

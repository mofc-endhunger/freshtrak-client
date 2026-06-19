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
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('formatDateForServer: Error creating date:', error);
    return '';
  }
};

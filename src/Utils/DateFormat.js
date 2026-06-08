import moment from 'moment';

export const formatDateDayAndDate = (x) => moment(x).format('dddd, M/D/YYYY');

export const formatMMDDYYYY = (x) => moment(x).format('L');

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
    // month is already 0-indexed from the parsing above, so add 1 for the output.
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const yyyy = String(year);
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('formatDateForServer: Error creating date:', error);
    return '';
  }
};

import moment from 'moment';

export const formatDateDayAndDate = (x: string | Date): string => moment(x).format('dddd, M/D/YYYY');

export const formatMMDDYYYY = (x: string | Date): string => moment(x).format('L');

export const formatDateForServer = (value: string): string => {
  const reWhiteSpace = new RegExp("\\s+");
  const formatted = reWhiteSpace.test(value) ? value.split(' / ') : value.split('/');
  return new Date(parseInt(formatted[2]), parseInt(formatted[0]) - 1, parseInt(formatted[1])).toISOString().split('T')[0];
}; 
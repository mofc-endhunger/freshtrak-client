/**
 * Constants defined
 */
export const STATUS_ACTIVE = 1;
export const STATUS_INACTIVE = 0;

export const MESSAGES = {
  SOMETHING_WENT_WRONG: 'Something went wrong'
} as const;

export const STATUS_CODES = {
  HTTP_400: 400,
  HTTP_401: 401,
  HTTP_403: 403,
  HTTP_404: 404,
  HTTP_409: 409,
  HTTP_422: 422,
  HTTP_500: 500,
  HTTP_501: 501,
} as const;

// Set Default Distance to 10 Miles.
export const DEFAULT_DISTANCE = 10;

export const CONFIRMATION_EMAIL = {
  FROM: 'confirmation@freshtrak.com',
  SUBJECT: 'FreshTrak: Event Reservation Confirmed.',
} as const; 
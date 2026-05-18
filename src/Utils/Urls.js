/**
 * API and Render url defined
 */
import config from '../config';

export const BASE_URL = config.PANTRY_FINDER_API;
const REGISTRATION_URL = config.REGISTRATION_API;

const joinApiUrl = (base, path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) {
    return normalizedPath;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${normalizedPath}`;
};

export const API_URL = {
  EVENTS_LIST: joinApiUrl(BASE_URL, 'api/agencies'),
  FOODBANK_LIST: joinApiUrl(BASE_URL, 'api/foodbanks'),
  EVENT_URL: joinApiUrl(BASE_URL, 'api/events'),
  EVENT_DATES_URL: joinApiUrl(BASE_URL, 'api/event_dates'),
  EVENT_DATE_DETAILS: (eventDateId) =>
    joinApiUrl(BASE_URL, `api/event_dates/${eventDateId}/event_details`),
  AGENCY_EVENTS: joinApiUrl(BASE_URL, 'api/agencies'),
  //GUEST_AUTH: `${REGISTRATION_URL}api/auth/guest`,
  GUEST_USER: joinApiUrl(REGISTRATION_URL, 'api/guest-authentications'),
  CREATE_RESERVATION: joinApiUrl(REGISTRATION_URL, 'api/registrations'),
  TWILIO_SMS: joinApiUrl(REGISTRATION_URL, 'twilio/sms'),
  SEND_EMAIL: joinApiUrl(REGISTRATION_URL, 'twilio/email'),
  // Household endpoints
  HOUSEHOLDS: joinApiUrl(REGISTRATION_URL, 'households'),
  HOUSEHOLD_MEMBERS: (householdId) =>
    joinApiUrl(REGISTRATION_URL, `households/${householdId}/members`),
  // Favorites endpoints
  FAVORITES: joinApiUrl(REGISTRATION_URL, 'api/favorites'),
  FAVORITE_BY_EVENT: (eventId) => joinApiUrl(REGISTRATION_URL, `api/favorites/${eventId}`),
};

export const RENDER_URL = {
  ROOT_URL: '/',
  EVENT_LIST_URL: '/events/list/:zipCode/:distance?/:serviceCat?',
  REGISTRATION_EVENT_DETAILS_URL: '/register/event',
  ADD_FAMILY_URL: '/family/create',
  SIGN_IN: '/family/sign-in',
  EDIT_FAMILY_URL: '/family/edit',
  FRESHTRAK_ABOUT: '/freshtrak-about',
  REGISTRATION_FORM_URL: '/register/form',
  REGISTRATION_CONFIRM_URL: '/register/confirm',
  REGISTRATION_ALREADY_REGISTERED_URL: '/register/already-registered',
  AGENCY_EVENT_LIST: '/agency/events',
  HOME_URL: '/home',
  QRCODE_URL: '/qrcode',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ACCOUNT_URL: '/account',
  HOUSEHOLDS_URL: '/households',
  HOUSEHOLD_SETUP_URL: '/households/setup',
  LOGIN_URL: '/login',
  USER_HOME_URL: '/user-home',
  CASE_MANAGER_LOGIN_URL: '/case-manager/login',
  CASE_MANAGER_REGISTRATIONS_URL: '/case-manager/registrations',
};

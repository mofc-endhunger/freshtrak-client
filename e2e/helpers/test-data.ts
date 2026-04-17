export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || '',
  password: process.env.E2E_TEST_PASSWORD || '',
};

export const ZIP_CODES = {
  withEvents: '43123',
  noEvents: '99501',
  partial: '4321',
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  caseManagerLogin: '/case-manager/login',
  account: '/account',
  userHome: '/user-home',
  householdSetup: '/households/setup',
  eventsList: (zip: string, distance?: string) => {
    let url = `/events/list/${zip}/`;
    if (distance) url += `${distance}/`;
    return url;
  },
} as const;

export const AUTH_STATE_PATH = 'e2e/.auth/user.json';

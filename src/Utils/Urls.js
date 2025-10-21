/**
 * API and Render url defined
 */

export const BASE_URL = process.env.REACT_APP_PANTRY_FINDER_API;
const REGISTRATION_URL = process.env.REACT_APP_REGISTRATION_API;
//const REGISTRATION_URL_LOCAL = "http://localhost:3000/";
export const API_URL = {
	EVENTS_LIST: BASE_URL + "api/agencies",
	FOODBANK_LIST: BASE_URL + "api/foodbanks",
	EVENT_URL: BASE_URL + "api/events",
	EVENT_DATES_URL: BASE_URL + "api/event_dates",
	AGENCY_EVENTS: `${BASE_URL}api/agencies`,
	//GUEST_AUTH: `${REGISTRATION_URL_LOCAL}api/auth/guest`,
	GUEST_AUTH: `${REGISTRATION_URL}auth/guest`,
	// NOTE: GUEST_USER does not accept tokens from new GUEST_AUTH API yet
	// This compatibility issue will be resolved by backend in the future
	GUEST_USER: `${REGISTRATION_URL}api/user`,
	CREATE_RESERVATION: `${REGISTRATION_URL}api/reservations`,
	TWILIO_SMS: `${REGISTRATION_URL}twilio/sms`,
	SEND_EMAIL: `${REGISTRATION_URL}twilio/email`,
	// Household endpoints
	HOUSEHOLDS: `${REGISTRATION_URL}households`,
	HOUSEHOLD_MEMBERS: householdId =>
		`${REGISTRATION_URL}households/${householdId}/members`,
};

export const RENDER_URL = {
	ROOT_URL: "/",
	EVENT_LIST_URL: "/events/list/:zipCode/:distance?/:serviceCat?",
	REGISTRATION_EVENT_DETAILS_URL: "/register/event",
	ADD_FAMILY_URL: "/family/create",
	SIGN_IN: "/family/sign-in",
	EDIT_FAMILY_URL: "/family/edit",
	FRESHTRAK_ABOUT: "/freshtrak-about",
	REGISTRATION_FORM_URL: "/register/form",
	REGISTRATION_CONFIRM_URL: "/register/confirm",
	AGENCY_EVENT_LIST: "/agency/events",
	HOME_URL: "/home",
	QRCODE_URL: "/qrcode",
	PRIVACY: "/privacy",
	TERMS: "/terms",
	ACCOUNT_URL: "/account",
	HOUSEHOLD_SETUP_URL: "/households/setup",
	LOGIN_URL: "/login",
};

import React, {
	Fragment,
	useEffect,
	useState,
	useRef,
	useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import config from "../../config";
import TagManager from "react-gtm-module";
import { setCurrentEvent, selectEvent } from "../../Store/Events/eventSlice";
import { selectUser } from "../../Store/userSlice";
import SpinnerComponent from "../General/SpinnerComponent";
import ErrorComponent from "../General/ErrorComponent";
import { API_URL, BASE_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import RegistrationComponent from "./RegistrationComponent";
import { EventFormat } from "../../Utils/EventHandler";
import { NotifyToast, showToast } from "../Notifications/NotifyToastComponent";
import { sendRegistrationConfirmationEmail } from "../../Services/ApiService";
import AuthenticationModalComponent from "../Authentication/AuthenticationModal";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import {
	UsersMeResponse,
	UpdateHouseholdApiRequest,
} from "../Households/types/api.types";
import { handleAuthError, getCognitoToken } from "../../Utils/AuthErrorHandler";
import {
	getGenderId,
	getGenderFromId,
} from "../Households/utils/householdUtils";
import { StorageService } from "../../Utils/StorageService";

// Type imports from registration.types.ts
import {
	RegistrationContainerProps,
	RegistrationFormData,
	RegistrationFormDataPatch,
	Event,
	ApiResponse,
} from "./types/registration.types";
import { REGISTRATION_SUSPENDED } from "../../constants/featureFlags";
import { RegistrationSuspendedMessage } from "../../components/shared";

// Utility to sanitize user object
function sanitizeUser(user: any): RegistrationFormData {
	if (!user || typeof user !== "object") return { ...defaultUser };
	return {
		first_name: user.first_name || "",
		middle_name: user.middle_name || "",
		last_name: user.last_name || "",
		suffix: user.suffix || "",
		date_of_birth: user.date_of_birth || "",
		gender: user.gender || "",
		address_line_1: user.address_line_1 || "",
		address_line_2: user.address_line_2 || "",
		city: user.city || "",
		state: user.state || "",
		zip_code: user.zip_code || "",
		phone: user.phone || "",
		permission_to_text: user.permission_to_text || false,
		email: user.email || "",
		permission_to_email: user.permission_to_email || false,
		seniors_in_household: user.seniors_in_household || 0,
		adults_in_household: user.adults_in_household || 0,
		children_in_household: user.children_in_household || 0,
		license_plate: user.license_plate || "",
		identification_code: user.identification_code || "",
		id: user.id,
		user_type: user.user_type,
		created_at: user.created_at,
		updated_at: user.updated_at,
		credential_id: user.credential_id,
		user_detail_id: user.user_detail_id,
	};
}

const defaultUser: RegistrationFormData = {
	first_name: "",
	middle_name: "",
	last_name: "",
	suffix: "",
	date_of_birth: "",
	gender: "",
	address_line_1: "",
	address_line_2: "",
	city: "",
	state: "",
	zip_code: "",
	phone: "",
	permission_to_text: false,
	email: "",
	permission_to_email: false,
	seniors_in_household: 0,
	adults_in_household: 0,
	children_in_household: 0,

	identification_code: "",
};

/**
 * RegistrationContainer - Main container component for user registration flow
 * Handles authentication, event fetching, user registration, and navigation
 */
const RegistrationContainer: React.FC<RegistrationContainerProps> = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { eventDateId, eventSlotId } = useParams();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [userToken, setUserToken] = useState<string | undefined>(undefined);
	const [isError, setIsError] = useState<boolean>(false);
	const [pageError, setPageError] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [disabled, setDisabled] = useState<boolean>(false);
	const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
	const [householdMembers, setHouseholdMembers] = useState<any[]>([]);
	const redirectTimeout = useRef<NodeJS.Timeout | null>(null);
	const householdDataProcessedRef = useRef<boolean>(false);

	const event = useSelector(selectEvent);
	// Don't initialize from Redux cache - always start fresh to avoid stale data from previous sessions
	const [selectedEvent, setSelectedEvent] = useState<Event>({} as Event);

	const currentUser = useSelector(selectUser);
	const [user, setUser] = useState<RegistrationFormData | null>(currentUser);
	const CLIENT_URL = config.CLIENT_URL;

	const getEvent = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			const resp = await axios.get<{ event: Event; errors?: string[] }>(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`
			);
			const { data } = resp;
			if (data && data.event) {
				const eventData = EventFormat(data.event, eventDateId);
				dispatch(setCurrentEvent(eventData));
				setSelectedEvent(eventData);
				setLoading(false);
			} else {
				setPageError(true);
				setErrors(data.errors || []);
				setLoading(false);
			}
		} catch (e: any) {
			console.error(e);
			setIsError(true);
			setLoading(false);
			if (e.response) {
				setPageError(true);
				setErrors(e.response.data);
			}
		}
	}, [eventDateId, dispatch]);

	// Fetch event data when eventDateId changes - this fixes the caching bug
	// where stale event data from localStorage (redux-persist) was shown instead of
	// fetching fresh data for the URL's event ID
	useEffect(() => {
		// Reset state when eventDateId changes
		setIsError(false);
		setPageError(false);
		setErrors([]);
		
		// Always fetch fresh event data based on URL parameter
		if (eventDateId) {
			getEvent();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventDateId]);

	useEffect(() => {
		const token = StorageService.getUserToken();
		const userProfile = StorageService.getGuestUser();
		setUserToken(token || (userProfile as any)?.token || undefined);

		// Only proceed if we're not in an error state
		if (!isError && !pageError) {
			// Event fetching is now handled by the eventDateId useEffect above

			// Handle user authentication and profile
			// Check for both guest authentication (userToken) and Cognito authentication
			const cognitoUser = StorageService.getCognitoUser();
			const isCognitoSignedIn = StorageService.isLoggedInUser();

			// Check if user has guest authentication with valid token
			const isGuestAuthenticated = StorageService.isGuestUser();

			const isUserAuthenticated =
				token || isGuestAuthenticated || isCognitoSignedIn;

			if (!isUserAuthenticated) {
				setShowAuthModal(true);
			} else if (!user) {
				// Handle user data for both guest and Cognito users
				if (userProfile) {
					// Guest user - use existing userProfile
					try {
						setUser(sanitizeUser(userProfile as any));
					} catch (error) {
						console.error("Error parsing userProfile:", error);
					}
				} else if (cognitoUser && isCognitoSignedIn) {
					// Cognito user - create user object from cognitoUser data
					try {
						const cognitoUserObj = {
							first_name: cognitoUser.name?.split(" ")[0] || "",
							last_name:
								cognitoUser.name
									?.split(" ")
									.slice(1)
									.join(" ") || "",
							email: cognitoUser.email || "",
							phone_number: "",
							address: "",
							city: "",
							state: "",
							zip_code: "",
							adult_count: 1,
							senior_count: 0,
							child_count: 0,
							permission_to_text: false,
							permission_to_email: true,
						};
						setUser(sanitizeUser(cognitoUserObj));
					} catch (error) {
						console.error("Error parsing cognitoUser:", error);
					}
				}
			} else if (
				user &&
				location.state?.householdData &&
				!householdDataProcessedRef.current
			) {
				// Prefill form with household data if available (only once)
				try {
					const householdData = location.state
						.householdData as UsersMeResponse;

					// Get primary member data for DOB and gender
					const primaryMember =
						householdData.members &&
						householdData.members.length > 0
							? householdData.members[0]
							: null;

					// Convert date from yyyy-mm-dd to MM / DD / YYYY format for form
					const convertDateFormat = (dateString: string): string => {
						if (!dateString || dateString === "1900-01-01") {
							return "";
						}
						try {
							const [year, month, day] = dateString
								.split("-")
								.map(Number);
							if (
								isNaN(year) ||
								isNaN(month) ||
								isNaN(day) ||
								year < 1900 ||
								year > 2100 ||
								month < 1 ||
								month > 12 ||
								day < 1 ||
								day > 31
							) {
								return "";
							}
							const monthStr = String(month).padStart(2, "0");
							const dayStr = String(day).padStart(2, "0");
							const yearStr = String(year);
							// Return in MM / DD / YYYY format (with spaces around slashes) for form
							return `${monthStr} / ${dayStr} / ${yearStr}`;
						} catch (error) {
							return "";
						}
					};

					// Convert gender_id to form value (lowercase format expected by form)
					const getGenderForForm = (
						genderId: number | null
					): string => {
						if (!genderId) return "";
						const gender = getGenderFromId(genderId);
						// Form expects: "male", "female", "other", "not_specify"
						// Map from household format to form format
						const genderMap: Record<string, string> = {
							male: "male",
							female: "female",
							other: "other",
							prefer_not_to_say: "not_specify",
						};
						return genderMap[gender] || "";
					};

					const prefilledUser = {
						...user,
						// Prefill address information
						address_line_1:
							householdData.address_line_1 || user.address_line_1,
						address_line_2:
							householdData.address_line_2 || user.address_line_2,
						city: householdData.city || user.city,
						state: householdData.state || user.state,
						zip_code: householdData.zip_code || user.zip_code,
						phone: householdData.phone || user.phone,
						email: householdData.email || user.email,
						// Prefill contact preferences
						permission_to_text:
							householdData.permission_to_text ??
							user.permission_to_text,
						permission_to_email:
							householdData.permission_to_email ??
							user.permission_to_email,
						// Prefill date_of_birth and gender from primary member
						date_of_birth: primaryMember
							? convertDateFormat(
									primaryMember.date_of_birth || ""
							  )
							: user.date_of_birth || "",
						gender: primaryMember
							? getGenderForForm(primaryMember.gender_id || null)
							: user.gender || "",
					// Prefill household member counts
					// Subtract 1 from adults because head of household is counted as an adult
					adults_in_household:
						Math.max(0, (householdData.counts?.adults || 0) - 1) ||
						user.adults_in_household,
					children_in_household:
						householdData.counts?.children ||
						user.children_in_household,
					// Only trust API seniors count if head of household has valid DOB
					// Backend defaults DOB to "1900-01-01" which would incorrectly count as 125+ years old (senior)
					seniors_in_household:
						primaryMember?.date_of_birth &&
						primaryMember.date_of_birth !== "1900-01-01"
							? householdData.counts?.seniors || 0
							: user.seniors_in_household || 0,
						// Prefill household name if available
						identification_code:
							householdData.identification_code ||
							user.identification_code,
					};
					setUser(prefilledUser);
					// Store household members for count validation
					if (householdData.members && householdData.members.length > 0) {
						setHouseholdMembers(householdData.members);
					}
					householdDataProcessedRef.current = true; // Mark as processed
				} catch (error) {
					console.error(
						"Error prefilling with household data:",
						error
					);
				}
			}
		}

		// Only redirect if user is still not set after 2 seconds (increased from 1)
		if (!showAuthModal && !user && !isLoading) {
			if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
			redirectTimeout.current = setTimeout(() => {
				if (!user) {
					setErrors([
						"Unable to load user profile. Please try again or contact support.",
					]);
					setPageError(true);
				}
			}, 2000);
		} else {
			if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
		}
	}, [
		isError,
		pageError,
		selectedEvent,
		user,
		userToken,
		showAuthModal,
		isLoading,
		eventDateId,
		navigate,
		getEvent,
		location.state,
	]);

	// Reset household data processing flag when location changes
	useEffect(() => {
		householdDataProcessedRef.current = false;
	}, [location.state]);

	const handleAuthLogin = (): void => {
		const token = StorageService.getUserToken();
		const userProfile = StorageService.getGuestUser();
		if (token && userProfile) {
			setUserToken(token || undefined);
			try {
				setUser(sanitizeUser(userProfile as any));
			} catch (error) {
				console.error("Error parsing userProfile:", error);
			}
			setShowAuthModal(false);
		}
	};

	const getReservationText = (): string => {
		return location.state
			? `at ${event.agencyName} on ${location.state.event_date} from ${location.state.event_slot.start_time} - ${location.state.event_slot.end_time}. For more information, including a reservation QR code,`
			: "";
	};

	const getCodeURL = (identification_code: string): string => {
		return `Your QRCode for the Reservation ${CLIENT_URL}qrcode/${identification_code}/${eventDateId}${
			eventSlotId ? "/" + eventSlotId : ""
		}`;
	};

	// Check if error message indicates "already registered"
	const isAlreadyRegisteredError = (errorData: any): boolean => {
		if (!errorData || typeof errorData !== "object") {
			return false;
		}

		const errorText = JSON.stringify(errorData).toLowerCase();
		const alreadyRegisteredKeywords = [
			"already registered",
			"already exist",
			"user already",
			"duplicate registration",
		];

		return alreadyRegisteredKeywords.some((keyword) =>
			errorText.includes(keyword)
		);
	};

	const formatErrorMessage = (message: string): string => {
		// Make error messages more user-friendly
		const errorMappings: Record<string, string> = {
			"is at capacity":
				"This time slot is at capacity. Please select a different time.",
			"is required": "This field is required.",
			"is invalid": "This field contains invalid data.",
			"not found": "The requested resource was not found.",
			"already exists": "This record already exists.",
			"permission denied":
				"You do not have permission to perform this action.",
			unauthorized: "Please log in to continue.",
			forbidden: "Access denied.",
			"not available": "This option is not available.",
			expired: "This session has expired. Please log in again.",
			"invalid token": "Your session has expired. Please log in again.",
			"network error":
				"Network error. Please check your connection and try again.",
			timeout: "Request timed out. Please try again.",
			"server error": "Server error. Please try again later.",
		};

		// Check for exact matches first
		if (errorMappings[message.toLowerCase()]) {
			return errorMappings[message.toLowerCase()];
		}

		// Check for partial matches
		for (const [key, value] of Object.entries(errorMappings)) {
			if (message.toLowerCase().includes(key)) {
				return value;
			}
		}

		// Return the original message if no mapping found
		return message;
	};

	const notify = (msg: any, error: string): void => {
		let formatted_msg = "Something Went Wrong";

		// Extract error messages from different possible fields
		if (msg && typeof msg === "object") {
			// Check for specific error fields
			const errorFields = [
				"user_id",
				"event_date_id",
				"event_slot_id",
				"reservation",
			];
			for (const field of errorFields) {
				if (
					msg[field] &&
					Array.isArray(msg[field]) &&
					msg[field].length > 0
				) {
					formatted_msg = formatErrorMessage(msg[field][0]);
					break;
				}
			}

			// If no specific field found, try to get the first error message from any field
			if (formatted_msg === "Something Went Wrong") {
				const firstError = Object.values(msg).find(
					(value): value is string[] =>
						Array.isArray(value) && value.length > 0
				);
				if (firstError && firstError.length > 0) {
					formatted_msg = formatErrorMessage(firstError[0]);
				}
			}
		}

		showToast(formatted_msg, error);
	};
	const send_sms = async (user: RegistrationFormData): Promise<void> => {
		const { TWILIO_SMS } = API_URL;
		let to_phone_number = user["phone"];
		let identification_code = user["identification_code"];
		if (identification_code) {
			let message = `You have successfully registered for an event, ${getReservationText()} Your confirmation code is ${identification_code.toUpperCase()}.
    ${getCodeURL(identification_code)}`;
			let search_zip = StorageService.getItem<string>("search_zip");
			if (search_zip) {
				setLoading(true);
				let foodBankUri = API_URL.FOODBANK_LIST;
				try {
					const resp = await axios.get(foodBankUri, {
						params: { zip_code: search_zip },
					});
					const { data } = resp;
					let from_phone_number =
						data.foodbanks[0].twilio_phone_number;
					try {
						await axios.post(TWILIO_SMS, {
							from_phone_number,
							to_phone_number,
							message,
						});
					} catch (e) {
						console.warn(e);
					}
					setLoading(false);
				} catch (err) {
					setLoading(false);
				}
			}
		}
	};

	// Helper function to determine user type
	const determineUserType = (): "guest" | "cognito" => {
		if (StorageService.isLoggedInUser()) {
			return "cognito";
		}
		return "guest";
	};

	// Helper function to convert registration gender format to household format
	const normalizeGenderToHouseholdFormat = (
		gender: string
	): "male" | "female" | "other" | "prefer_not_to_say" => {
		const normalized = gender.toLowerCase().trim();
		if (normalized === "male") return "male";
		if (normalized === "female") return "female";
		if (normalized === "other") return "other";
		if (
			normalized === "prefer not to say" ||
			normalized === "prefer_not_to_say"
		)
			return "prefer_not_to_say";
		return "prefer_not_to_say";
	};

	// Helper function to map registration data to household structure
	const mapRegistrationToHousehold = (
		registrationData: RegistrationFormData,
		currentHousehold: UsersMeResponse
	): UpdateHouseholdApiRequest => {
		// Exclude updated_at from the request (like HouseholdContainer does)
		const { updated_at, ...currentHouseholdWithoutTimestamp } =
			currentHousehold;

		// Convert registration gender to gender_id if provided
		let genderId: number | null = null;
		if (registrationData.gender) {
			const normalizedGender = normalizeGenderToHouseholdFormat(
				registrationData.gender
			);
			genderId = getGenderId(normalizedGender);
		}

		// Update the primary member (members[0]) with all registration data
		const updatedMembers = currentHousehold.members.map((member, index) => {
			// For the primary member (index 0), update with registration data
			if (index === 0) {
				return {
					...member,
					first_name:
						registrationData.first_name || member.first_name,
					last_name: registrationData.last_name || member.last_name,
					middle_name:
						registrationData.middle_name ||
						member.middle_name ||
						null,
					date_of_birth:
						registrationData.date_of_birth || member.date_of_birth,
					// Update gender_id from registration data if provided, otherwise keep existing
					gender_id:
						genderId !== null
							? genderId
							: member.gender_id
							? Number(member.gender_id)
							: null,
					suffix_id: member.suffix_id
						? Number(member.suffix_id)
						: null,
				};
			}
			// For other members, preserve existing data with proper typing
			return {
				...member,
				gender_id: member.gender_id ? Number(member.gender_id) : null,
				suffix_id: member.suffix_id ? Number(member.suffix_id) : null,
			};
		});

		const payload = {
			// Preserve existing household structure (excluding updated_at)
			...currentHouseholdWithoutTimestamp,

			// Update fields from registration
			address_line_1: registrationData.address_line_1 || null,
			address_line_2: registrationData.address_line_2 || null,
			city: registrationData.city || null,
			state: registrationData.state || null,
			zip_code: registrationData.zip_code || null,
			phone: registrationData.phone || null,
			email: registrationData.email || null,

			// Update contact preferences
			permission_to_text: registrationData.permission_to_text ?? null,
			permission_to_email: registrationData.permission_to_email ?? null,

			// Update counts from registration
			counts: {
				seniors: registrationData.seniors_in_household || 0,
				adults: registrationData.adults_in_household || 0,
				children: registrationData.children_in_household || 0,
				total:
					(registrationData.seniors_in_household || 0) +
					(registrationData.adults_in_household || 0) +
					(registrationData.children_in_household || 0),
			},

			// Update members array with all updates
			members: updatedMembers,
		};

		return payload;
	};

	// Helper function to handle Cognito user update
	const updateCognitoUser = async (
		user: RegistrationFormData
	): Promise<void> => {
		const cognitoToken = getCognitoToken();
		if (!cognitoToken) {
			throw new Error("No Cognito token found. Please sign in again.");
		}

		try {
			// Create HouseholdsApiService instance with Cognito token
			const householdsApiService = new HouseholdsApiService();

			// Get current household data from /me endpoint
			const householdData = await householdsApiService.getUsersMe();

			// Ensure we have members data
			if (!householdData.members || householdData.members.length === 0) {
				throw new Error(
					"No household members found. Please contact support."
				);
			}

			// Map registration data to household structure
			const updateData = mapRegistrationToHousehold(user, householdData);

			// Update household using primary member ID
			await householdsApiService.updateHousehold(
				parseInt(householdData.members[0].user_id || "0", 10),
				updateData
			);
		} catch (error: any) {
			// Handle authentication errors specifically
			if (
				handleAuthError(error, {
					userType: "cognito",
					redirectPath: "/login",
					showToast,
				})
			) {
				// Auth error was handled, re-throw to stop registration flow
				throw error;
			}
			// Re-throw other errors to be handled by the main error handler
			throw error;
		}
	};

	// Helper function to handle errors gracefully
	const handleRegistrationError = (
		error: any,
		userType: "guest" | "cognito"
	) => {
		console.error(`${userType} registration error:`, error);

		// Reset loading state to enable the Register button
		setDisabled(false);

		let errorMessage = "Registration failed. Please try again.";
		let shouldRedirect = false;
		let redirectPath = "";

		if (userType === "cognito") {
			if (error.message?.includes("token")) {
				errorMessage =
					"Your session has expired. Please sign in again.";
				shouldRedirect = true;
				redirectPath = "/login";
			} else if (error.response?.status === 404) {
				errorMessage = "Household not found. Please contact support.";
				shouldRedirect = true;
				redirectPath = "/";
			} else if (error.response?.status >= 500) {
				errorMessage = "Server error. Please try again later.";
			}
		} else {
			if (error.response?.status === 401) {
				errorMessage = "Guest session expired. Please start over.";
				shouldRedirect = true;
				redirectPath = "/";
			}
		}

		showToast(errorMessage, "error");

		if (shouldRedirect) {
			setTimeout(() => {
				navigate(redirectPath);
			}, 2000);
		}
	};

	const register = async (
		user: RegistrationFormData,
		event: Event
	): Promise<void> => {
		setDisabled(!disabled);
		const event_date_id = parseInt(eventDateId || "0", 10);
		const event_slot_id = parseInt(eventSlotId || "0", 10);
		const { GUEST_USER, CREATE_RESERVATION } = API_URL;
		let updatedUser = user;

		// Determine user type (guest vs cognito)
		const userType = determineUserType();

		try {
			if (userType === "guest") {
				// Existing guest flow
				// Get identification_code from stored user profile
				const userProfile = StorageService.getGuestUser();
				if (userProfile) {
					try {
						const userProfileData = userProfile as any;
						if (
							userProfileData.user &&
							userProfileData.user.identification_code
						) {
							updatedUser = {
								...user,
								identification_code:
									userProfileData.user.identification_code,
							};
						}
					} catch (e) {
						console.error("Error parsing user profile:", e);
					}
				}

				const userResp = await axios.patch<
					ApiResponse<RegistrationFormDataPatch>
				>(
					GUEST_USER,
					updatedUser, // Send user data directly, not wrapped in { user: ... }
					{
						headers: { "X-Guest-Token": `${userToken}` },
					}
				);
				// Use the response data, which should include identification_code
				// Merge response data with existing user data to maintain all required fields
				updatedUser = { ...updatedUser, ...(userResp.data.data || {}) };
			} else {
				// New cognito flow
				await updateCognitoUser(user);
			}
		} catch (e: any) {
			// Handle authentication errors specifically
			if (
				handleAuthError(e, {
					userType,
					redirectPath: userType === "cognito" ? "/login" : "/",
					showToast,
				})
			) {
				// Auth error was handled, exit early
				return;
			}
			// Handle other errors with existing error handler
			handleRegistrationError(e, userType);
			return; // Exit early on error
		}
		try {
			// Prepare headers based on user type
			const headers: any =
				userType === "guest"
					? { "X-Guest-Token": `${userToken}` }
					: { Authorization: `Bearer ${getCognitoToken()}` };

		// Build registration payload with counts based on user type
		const basePayload = eventSlotId
			? {
					event_id: selectedEvent.eventId,
					event_date_id,
					event_slot_id,
			  }
			: { event_id: selectedEvent.eventId, event_date_id };

		// Add counts in appropriate format based on user type
		// Guest users: flat fields (seniors, adults, children)
		// Registered users: nested counts object
		const countsPayload =
			userType === "guest"
				? {
						seniors: updatedUser.seniors_in_household || 0,
						adults: updatedUser.adults_in_household || 0,
						children: updatedUser.children_in_household || 0,
				  }
				: {
						counts: {
							seniors: updatedUser.seniors_in_household || 0,
							adults: updatedUser.adults_in_household || 0,
							children: updatedUser.children_in_household || 0,
						},
				  };

		await axios.post<ApiResponse<any>>(
			CREATE_RESERVATION,
			{ ...basePayload, ...countsPayload },
			{ headers }
		);
			TagManager.dataLayer({
				dataLayer: {
					event: "reservation",
				},
			});
			if (updatedUser["permission_to_text"]) {
				send_sms(updatedUser);
			}
			if (updatedUser["permission_to_email"]) {
				sendRegistrationConfirmationEmail(
					updatedUser,
					selectedEvent,
					location
				);
			}
			if (eventDateId) {
				StorageService.setRegisteredEventDateID(eventDateId);
			}
			navigate(RENDER_URL.REGISTRATION_CONFIRM_URL, {
				state: {
					user: updatedUser,
					eventDateId: eventDateId,
					eventTimeStamp: {
						start_time: location.state?.event_slot?.start_time,
						end_time: location.state?.event_slot?.end_time,
						event_slot_id: event_slot_id,
					},
				},
			});
		} catch (e: any) {
			console.error("Registration error:", e);

			// Handle authentication errors specifically
			if (
				handleAuthError(e, {
					userType,
					redirectPath: userType === "cognito" ? "/login" : "/",
					showToast,
				})
			) {
				// Auth error was handled, exit early
				return;
			}

			// Check for "already registered" error
			if (
				e.response &&
				e.response.data &&
				isAlreadyRegisteredError(e.response.data)
			) {
				// Redirect to already registered page instead of showing inline
				navigate(RENDER_URL.REGISTRATION_ALREADY_REGISTERED_URL, {
					state: {
						eventName: selectedEvent?.agencyName,
					},
				});
				setDisabled(false);
				return;
			}

			// Handle different types of errors
			if (e.response && e.response.data) {
				// API error with response data
				notify(e.response.data, "error");
			} else if (e.request) {
				// Network error (no response received)
				notify(
					{
						network_error: [
							"Network error. Please check your connection and try again.",
						],
					},
					"error"
				);
			} else {
				// Other errors (like axios configuration errors)
				notify(
					{
						general_error: [
							"Something went wrong. Please try again.",
						],
					},
					"error"
				);
			}

			setTimeout(() => window.scrollTo(0, 0));
			setDisabled(disabled);
			setErrors(e);
			throw e; // Re-throw the error so it can be caught by the calling component
		}
	};

	// Check if registrations are suspended
	if (REGISTRATION_SUSPENDED) {
		return <RegistrationSuspendedMessage />;
	}

	if (pageError) {
		// Format errors to match ErrorComponent interface
		const formattedErrors = {
			message: Array.isArray(errors)
				? errors.join(", ")
				: "An error occurred while loading the page.",
			status: "error",
		};
		return <ErrorComponent error={formattedErrors} />;
	}

	if (showAuthModal) {
		return (
			<AuthenticationModalComponent
				show={showAuthModal}
				setshow={setShowAuthModal}
				onLogin={handleAuthLogin}
			/>
		);
	}

	// Show spinner while loading or if user/event data is not ready
	if (
		isLoading ||
		!user ||
		typeof user !== "object" ||
		!selectedEvent ||
		Object.keys(selectedEvent).length === 0
	) {
		return <SpinnerComponent />;
	}

	return (
		<Fragment>
			{isLoading && <SpinnerComponent />}
			<Fragment>
				<NotifyToast />
				<RegistrationComponent
					user={user && typeof user === "object" ? user : defaultUser}
					onRegister={(data: RegistrationFormData) =>
						register(data, selectedEvent)
					}
					event={selectedEvent}
					disabled={disabled}
					householdMembers={householdMembers}
				/>
			</Fragment>
		</Fragment>
	);
};

export default RegistrationContainer;

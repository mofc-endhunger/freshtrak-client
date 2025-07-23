import React, {
	Fragment,
	useEffect,
	useState,
	useRef,
	useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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

// Utility to sanitize user object
function sanitizeUser(user) {
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

const defaultUser = {
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
	license_plate: "",
	identification_code: "",
};

const RegistrationContainer = props => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { eventDateId, eventSlotId } = useParams();
	const [isLoading, setLoading] = useState(false);
	const [userToken, setUserToken] = useState(undefined);
	const [isError, setIsError] = useState(false);
	const [pageError, setPageError] = useState(false);
	const [errors, setErrors] = useState([]);
	const [disabled, setDisabled] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const redirectTimeout = useRef();

	const event = useSelector(selectEvent);
	const [selectedEvent, setSelectedEvent] = useState(event);

	const currentUser = useSelector(selectUser);
	const [user, setUser] = useState(currentUser);
	const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

	const getEvent = useCallback(async () => {
		try {
			const resp = await axios.get(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`
			);
			const { data } = resp;
			if (data && data.event !== undefined) {
				const eventData = EventFormat(data.event, eventDateId);
				dispatch(setCurrentEvent(eventData));
				setSelectedEvent(eventData);
			} else {
				setPageError(true);
				setErrors(data.errors || []);
			}
		} catch (e) {
			console.error(e);
			setIsError(true);
			if (e.response) {
				setPageError(true);
				setErrors(e.response.data);
			}
		}
	}, [eventDateId, dispatch]);

	useEffect(() => {
		const token = localStorage.getItem("userToken");
		const userProfile = localStorage.getItem("userProfile");
		setUserToken(token);
		if (!isError && !pageError) {
			if (Object.keys(selectedEvent).length === 0) {
				getEvent();
			}
			if (!token) {
				setShowAuthModal(true);
			} else if (!user && userProfile) {
				try {
					setUser(sanitizeUser(JSON.parse(userProfile)));
				} catch (error) {
					console.error("Error parsing userProfile:", error);
				}
			}
		}
		// Only redirect if user is still not set after 1 second
		if (!showAuthModal && !user && !isLoading) {
			if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
			redirectTimeout.current = setTimeout(() => {
				if (!user) {
					setErrors([
						"Unable to load user profile. Please try again or contact support.",
					]);
					setPageError(true);
				}
			}, 1000);
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
	]);

	const handleAuthLogin = () => {
		const token = localStorage.getItem("userToken");
		const userProfile = localStorage.getItem("userProfile");
		if (token && userProfile) {
			setUserToken(token);
			try {
				setUser(sanitizeUser(JSON.parse(userProfile)));
			} catch (error) {
				console.error("Error parsing userProfile:", error);
			}
			setShowAuthModal(false);
		}
	};

	const getReservationText = () => {
		return location.state
			? `at ${event.agencyName} on ${location.state.event_date} from ${location.state.event_slot.start_time} - ${location.state.event_slot.end_time}. For more information, including a reservation QR code,`
			: "";
	};

	const getCodeURL = identification_code => {
		return `Your QRCode for the Reservation ${CLIENT_URL}qrcode/${identification_code}/${eventDateId}${
			eventSlotId ? "/" + eventSlotId : ""
		}`;
	};

	const formatErrorMessage = message => {
		// Make error messages more user-friendly
		const errorMappings = {
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

	const notify = (msg, error) => {
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
					value => Array.isArray(value) && value.length > 0
				);
				if (firstError && firstError.length > 0) {
					formatted_msg = formatErrorMessage(firstError[0]);
				}
			}
		}

		showToast(formatted_msg, error);
	};
	const send_sms = async user => {
		const { TWILIO_SMS } = API_URL;
		let to_phone_number = user["phone"];
		let identification_code = user["identification_code"];
		let message = `You have successfully registered for an event, ${getReservationText()} Your confirmation code is ${identification_code.toUpperCase()}.
    ${getCodeURL(identification_code)}`;
		let search_zip = localStorage.getItem("search_zip");
		if (search_zip) {
			setLoading(true);
			let foodBankUri = API_URL.FOODBANK_LIST;
			try {
				const resp = await axios.get(foodBankUri, {
					params: { zip_code: search_zip },
				});
				const { data } = resp;
				let from_phone_number = data.foodbanks[0].twilio_phone_number;
				try {
					await axios.post(TWILIO_SMS, {
						from_phone_number,
						to_phone_number,
						message,
					});
				} catch (e) {
					console.log(e);
				}
				setLoading(false);
			} catch (err) {
				setLoading(false);
			}
		}
	};

	const register = async (user, event) => {
		setDisabled(!disabled);
		const event_date_id = parseInt(eventDateId, 10);
		const event_slot_id = parseInt(eventSlotId, 10);
		const { GUEST_USER, CREATE_RESERVATION } = API_URL;
		let updatedUser = user;
		try {
			const userResp = await axios.post(
				GUEST_USER,
				{ user },
				{
					headers: { Authorization: `Bearer ${userToken}` },
				}
			);
			// Use the response data, which should include identification_code
			updatedUser = userResp.data;
		} catch (e) {
			console.error("User creation error:", e);
			// If user creation fails, we should still try to create the reservation
			// but log the error for debugging
		}
		try {
			await axios.post(
				CREATE_RESERVATION,
				{
					reservation: eventSlotId
						? { event_date_id, event_slot_id }
						: { event_date_id },
				},
				{ headers: { Authorization: `Bearer ${userToken}` } }
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
			sessionStorage.setItem("registeredEventDateID", eventDateId);
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
		} catch (e) {
			console.error("Registration error:", e);

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

	if (pageError) {
		return <ErrorComponent error={errors} />;
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

	if (!user || typeof user !== "object") {
		return <SpinnerComponent />;
	}

	return (
		<Fragment>
			{isLoading && <SpinnerComponent />}
			<Fragment>
				<NotifyToast />
				<RegistrationComponent
					user={user && typeof user === "object" ? user : defaultUser}
					onRegister={register}
					event={selectedEvent}
					disabled={disabled}
				/>
			</Fragment>
		</Fragment>
	);
};

export default RegistrationContainer;

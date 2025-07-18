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

	const notify = (msg, error) => {
		let formatted_msg =
			(msg.user_id && msg.user_id[0]) ||
			(msg.event_date_id && msg.event_date_id[0]) ||
			"Something Went Wrong";
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
			console.log(e);
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
			if (!e.response) {
				e.response = { data: { user_id: ["Something Went Wrong"] } };
			}
			notify(e.response.data, "error");
			setTimeout(() => window.scrollTo(0, 0));
			setDisabled(disabled);
			console.error(e);
			setErrors(e);
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

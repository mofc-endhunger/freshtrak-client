import React, { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TagManager from "react-gtm-module";
import { setCurrentEvent, selectEvent } from "../../Store/Events/eventSlice";
import { setCurrentUser, selectUser } from "../../Store/userSlice";
import SpinnerComponent from "../General/SpinnerComponent";
import ErrorComponent from "../General/ErrorComponent";
import { API_URL, BASE_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import RegistrationComponent from "./RegistrationComponent";
import { EventFormat } from "../../Utils/EventHandler";
import { formatMMDDYYYY } from "../../Utils/DateFormat";
import { NotifyToast, showToast } from "../Notifications/NotifyToastComponent";
import { sendRegistrationConfirmationEmail } from "../../Services/ApiService";

interface User {
	identification_code: string;
	first_name?: string;
	middle_name?: string;
	last_name?: string;
	suffix?: string;
	date_of_birth?: string;
	gender?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	phone?: string;
	permission_to_text?: boolean;
	email?: string;
	permission_to_email?: boolean;
	seniors_in_household?: number;
	adults_in_household?: number;
	children_in_household?: number;
	license_plate?: string;
}

interface Event {
	id: string;
	agencyName: string;
	date: string;
	startTime: string;
	endTime: string;
	// Add other event properties as needed
}

interface EventSlot {
	start_time: string;
	end_time: string;
}

interface LocationState {
	event_date?: string;
	event_slot?: EventSlot;
}

interface RegistrationContainerProps {
	// Add props if needed
}

const RegistrationContainer: React.FC<RegistrationContainerProps> = props => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { eventDateId, eventSlotId } = useParams<{
		eventDateId: string;
		eventSlotId?: string;
	}>();
	const [isLoading, setLoading] = useState<boolean>(false);
	const event_slot_id = location.state?.eventTimeStamp?.event_slot_id;
	const [userToken, setUserToken] = useState<string | undefined>(undefined);
	const [isError, setIsError] = useState<boolean>(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(
		event as any
	);
	const [pageError, setPageError] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [disabled, setDisabled] = useState<boolean>(false);
	const currentUser = useSelector(selectUser);
	const [user, setUser] = useState<User | null>(currentUser as any);
	const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

	useEffect(fetchBusinesses);

	function fetchBusinesses(): void {
		setUserToken(localStorage.getItem("userToken") || undefined);
		if (!isError && !pageError) {
			if (Object.keys(selectedEvent || {}).length === 0) {
				getEvent();
			}
			if (user === null) {
				getUser(localStorage.getItem("userToken") || "");
			}
		}
	}

	const getEvent = async (): Promise<void> => {
		try {
			const resp = await axios.get(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`
			);
			const { data } = resp;
			if (data && data.event !== undefined) {
				const eventData = EventFormat(data.event, eventDateId || "");
				dispatch(setCurrentEvent(eventData));
				setSelectedEvent(eventData as any);
			} else {
				setPageError(true);
			}
		} catch (e) {
			console.error(e);
			setIsError(true);
			if ((e as any).response) {
				setPageError(true);
			}
		}
	};

	const getUser = async (token: string): Promise<void> => {
		setLoading(true);
		const { GUEST_USER } = API_URL;
		try {
			const resp = await axios.get(GUEST_USER, {
				params: {},
				headers: { Authorization: `Bearer ${token}` },
			});
			const { data } = resp;
			if (data["date_of_birth"] !== null) {
				data["date_of_birth"] = formatMMDDYYYY(data["date_of_birth"]);
			}
			if (data["phone"] !== null) {
				const phoneRegex =
					/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
				data["phone"] = data["phone"].replace(phoneRegex, "($1) $2-$3");
			}
			dispatch(setCurrentUser(data));
			setUser(data);
			setLoading(false);
		} catch (e) {
			console.error(e);
		}
	};

	const getReservationText = (): string => {
		return location.state
			? `at ${(event as any)?.agencyName} on ${
					location.state.event_date
			  } from ${location.state.event_slot?.start_time} - ${
					location.state.event_slot?.end_time
			  }. For more information, including a reservation QR code,`
			: "";
	};

	const getCodeURL = (identification_code: string): string => {
		return `Your QRCode for the Reservation ${CLIENT_URL}qrcode/${identification_code}/${eventDateId}${
			eventSlotId ? "/" + eventSlotId : ""
		}`;
	};

	const notify = (msg: any, error: boolean): void => {
		const formatted_msg = isError
			? `There was an error processing your registration. Please try again.`
			: `You have successfully registered for an event at ${
					(event as any)?.agencyName
			  } on ${location.state.event_date} from ${
					location.state.event_slot?.start_time
			  } - ${
					location.state.event_slot?.end_time
			  }. For more information, including a reservation QR code,` +
			  `please visit ${CLIENT_URL}/registration/confirm`;

		showToast(formatted_msg, error as any);
	};

	const send_sms = async (user: User): Promise<void> => {
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

	const event_date_id = parseInt(eventDateId || "0", 10);

	const register = async (user: User, event: Event): Promise<void> => {
		try {
			setLoading(true);
			const resp = await axios.post(
				API_URL.CREATE_RESERVATION,
				{
					user: user as any,
					event_date_id,
					event_slot_id,
				},
				{
					headers: { Authorization: `Bearer ${userToken}` },
				}
			);
			setLoading(false);
			sessionStorage.setItem("registeredEventDateID", eventDateId || "");
			notify(resp.data, false);
			navigate(RENDER_URL.REGISTRATION_CONFIRM_URL);
		} catch (e) {
			setLoading(false);
			notify((e as any).response?.data, true);
		}
	};

	if (isLoading) {
		return <SpinnerComponent />;
	}

	if (pageError) {
		return (
			<ErrorComponent
				error={{ status: "404", message: "Something went wrong" }}
			/>
		);
	}

	return (
		<Fragment>
			<NotifyToast />
			<div className="mt-4">
				<section className="container pt-100 pb-100 register-confirmation">
					<RegistrationComponent
						user={user as any}
						onRegister={register as any}
						event={selectedEvent as any}
					/>
				</section>
			</div>
		</Fragment>
	);
};

export default RegistrationContainer;

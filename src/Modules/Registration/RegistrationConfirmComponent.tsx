import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { API_URL, RENDER_URL, BASE_URL } from "../../Utils/Urls";
import axios from "axios";
import { setCurrentEvent, selectEvent } from "../../Store/Events/eventSlice";
import { setCurrentUser, selectUser } from "../../Store/userSlice";
import { useLocation } from "react-router-dom";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import { Link } from "react-router-dom";
import identificationCodeImg1 from "../../Assets/img/id_code1.png";
import identificationCodeImg2 from "../../Assets/img/id_code2.png";
import idImg from "../../Assets/img/id_img.png";
import { EventFormat } from "../../Utils/EventHandler";
import { formatMMDDYYYY } from "../../Utils/DateFormat";
import EventCardComponent from "../Events/EventCardComponent";
import QRCode from "qrcode.react";

interface UserData {
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	address_line_1: string;
	address_line_2?: string;
	city: string;
	zip_code: string;
	state: string;
	phone?: string;
	identification_code: string;
	license_plate?: string;
}

interface EventTimeStamp {
	event_slot_id: string;
	start_time: string;
	end_time: string;
}

interface LocationState {
	user: UserData;
	eventTimeStamp?: EventTimeStamp;
}

interface RegistrationConfirmComponentProps {
	// location prop is not needed since we use useLocation hook
}

interface Event {
	id: string;
	agencyName: string;
	date: string;
	startTime: string;
	endTime: string;
	// Add other event properties as needed
}

const RegistrationConfirmComponent: React.FC<
	RegistrationConfirmComponentProps
> = () => {
	const location = useLocation();
	const user_data: UserData = location.state?.user;

	const dispatch = useDispatch();
	const event = useSelector(selectEvent);
	let HOME_OR_ROOT_URL = RENDER_URL.HOME_URL;
	const event_slot_id = location.state?.eventTimeStamp?.event_slot_id;
	const [userToken, setUserToken] = useState<string | undefined>(undefined);
	const [isError, setIsError] = useState<boolean>(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(
		event as any
	);
	const [pageError, setPageError] = useState<boolean>(false);
	const currentUser = useSelector(selectUser);
	const [user, setUser] = useState(currentUser);
	const eventDateId = sessionStorage.getItem("registeredEventDateID");

	if (!JSON.parse(localStorage.getItem("isLoggedIn") || "false")) {
		HOME_OR_ROOT_URL = RENDER_URL.ROOT_URL as any;
		localStorage.removeItem("userToken");
		localStorage.removeItem("tokenExpiresAt");
		localStorage.removeItem("search_zip");
	}

	const formatPhoneNumber = (input: string): string => {
		const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
		if (input) {
			return input.replace(regExp, "($1) $2-$3");
		} else {
			return "";
		}
	};

	const getUser = async (token: string): Promise<void> => {
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
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(fetchBusinesses);

	function fetchBusinesses(): void {
		setUserToken(localStorage.getItem("userToken") || undefined);
		if (!isError && !pageError) {
			if (Object.keys(selectedEvent || {}).length === 0) {
				getEvent();
			}
			if (user === null) {
				getUser(userToken || "");
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

	const {
		first_name,
		middle_name,
		last_name,
		suffix,
		address_line_1,
		address_line_2,
		city,
		zip_code,
		state,
		phone,
		identification_code,
		license_plate,
	} = user_data;

	return (
		<Fragment>
			{event && (
				<div className="mt-4 content-wrapper">
					<section className="container pb-100 register-confirmation">
						<h1 className="big-title med-title mt-5 mb-5 mobile-mb">
							You're Registered
						</h1>
						<h4>
							<b> {(event as any).agencyName} </b>
						</h4>
						<div className="address-wrap mb-5">
							<div className="date-wrapper">
								{formatDateDayAndDate((event as any).date)}
							</div>
							{location.state?.eventTimeStamp?.start_time ? (
								<div className="timing-wrapper">
									{location.state?.eventTimeStamp.start_time}{" "}
									- {location.state?.eventTimeStamp.end_time}
								</div>
							) : (
								<div className="timing-wrapper">
									{(event as any).startTime} -
									{(event as any).endTime}
								</div>
							)}
						</div>
						<div className="mt-5">
							<h2>
								Your Confirmation Number:{" "}
								<b> {identification_code.toUpperCase()} </b>
							</h2>
							<br />
						</div>
						<div>
							<h2>Your QR Code:</h2>
							<QRCode
								className="qr-code"
								value={`https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${identification_code.toUpperCase()}&event_date_id=${eventDateId}${
									event_slot_id
										? "&event_slot_id=" + event_slot_id
										: ""
								}`}
							/>
							<br />
						</div>
						{event && (
							<div className="col-6 reg-confirm-card">
								<div className="day-view">
									<EventCardComponent
										key={(event as any).id}
										event={event as any}
										registrationView={true}
									/>
								</div>
							</div>
						)}
						<h5 className="mb-4">
							<b> Your Information </b>
						</h5>
						<div className="mb-2">
							<h6 className="mb-4">HEAD OF HOUSEHOLD</h6>
							{first_name} {middle_name} {last_name} {suffix}{" "}
							<br />
							{address_line_1} <br />
							{address_line_2} <br />
							{city} {state} <br />
							{zip_code} <br />
							{formatPhoneNumber(phone || "")} <br />
						</div>
						<div className="mt-5">
							As a part of our contactless service process, please
							display the above confirmation number <br />
							<div className="mb-2">
								Notes: This code is unique to you, please write
								it on a piece of paper and display in your
								driver-side front window.
								<div className=" ">
									<div className="identification-code-wrapper">
										<div className="identification-code">
											<div className="identification-code-img">
												<img
													src={identificationCodeImg1}
													alt="identification code 1"
												/>
											</div>
											<div className="identification-code-img">
												<img
													src={identificationCodeImg2}
													alt="identification code 2"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-5">
							<Link to={HOME_OR_ROOT_URL}>
								<button className="btn custom-button">
									Return to Home
								</button>
							</Link>
						</div>
					</section>
				</div>
			)}
		</Fragment>
	);
};

export default RegistrationConfirmComponent;

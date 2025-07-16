import React, { Fragment, useEffect, useState, useCallback } from "react";
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
import QRCode from "react-qr-code";

const RegistrationConfirmComponent = props => {
	const location = useLocation();
	const currentUser = useSelector(selectUser);
	const user_data = location.state?.user || currentUser || {};

	const dispatch = useDispatch();
	const event = useSelector(selectEvent);
	let HOME_OR_ROOT_URL = RENDER_URL.HOME_URL;
	const event_slot_id = location.state?.eventTimeStamp?.event_slot_id;
	const [userToken, setUserToken] = useState(undefined);
	const [isError, setIsError] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(event);
	const [pageError, setPageError] = useState(false);
	const [user, setUser] = useState(currentUser);
	const eventDateId = sessionStorage.getItem("registeredEventDateID");

	const isLoggedIn = localStorage.getItem("isLoggedIn");
	if (!isLoggedIn || !JSON.parse(isLoggedIn)) {
		HOME_OR_ROOT_URL = RENDER_URL.ROOT_URL;
		localStorage.removeItem("userToken");
		localStorage.removeItem("tokenExpiresAt");
		localStorage.removeItem("search_zip");
	}

	const formatPhoneNumber = input => {
		const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
		if (input) {
			return String(input).replace(regExp, "($1) $2-$3");
		} else {
			return "";
		}
	};

	const getUser = useCallback(
		async token => {
			const { GUEST_USER } = API_URL;
			try {
				const resp = await axios.get(GUEST_USER, {
					params: {},
					headers: { Authorization: `Bearer ${token}` },
				});
				const { data } = resp;
				if (data["date_of_birth"] !== null) {
					data["date_of_birth"] = formatMMDDYYYY(
						data["date_of_birth"]
					);
				}
				if (data["phone"] !== null) {
					const phoneRegex =
						/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
					data["phone"] = String(data["phone"]).replace(
						phoneRegex,
						"($1) $2-$3"
					);
				}
				dispatch(setCurrentUser(data));
				setUser(data);
			} catch (e) {
				console.error(e);
			}
		},
		[dispatch]
	);

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
			}
		} catch (e) {
			console.error(e);
			setIsError(true);
			if (e.response) {
				setPageError(true);
			}
		}
	}, [eventDateId, dispatch]);

	useEffect(fetchBusinesses, [
		getEvent,
		getUser,
		isError,
		pageError,
		selectedEvent,
		user,
		userToken,
	]);

	function fetchBusinesses() {
		setUserToken(localStorage.getItem("userToken"));
		if (!isError && !pageError) {
			if (Object.keys(selectedEvent).length === 0) {
				getEvent();
			}
			// Only fetch user if token is present
			if (user === null && userToken) {
				getUser(userToken);
			}
		}
	}

	const {
		first_name = "",
		middle_name = "",
		last_name = "",
		suffix = "",
		address_line_1 = "",
		address_line_2 = "",
		city = "",
		zip_code = "",
		state = "",
		phone = "",
		identification_code = "",
		license_plate = "",
	} = user_data || {};

	return (
		<Fragment>
			{event && (
				<div className="mt-4 content-wrapper">
					<section className="container pb-100 register-confirmation">
						<h1 className="big-title med-title mt-5 mb-5 mobile-mb">
							You're Registered
						</h1>
						<h4>
							<b> {event.agencyName} </b>
						</h4>
						<div className="address-wrap mb-5">
							<div className="date-wrapper">
								{formatDateDayAndDate(event.date)}
							</div>
							{location.state?.eventTimeStamp?.start_time ? (
								<div className="timing-wrapper">
									{location.state?.eventTimeStamp.start_time}{" "}
									- {location.state?.eventTimeStamp.end_time}
								</div>
							) : (
								<div className="timing-wrapper">
									{event.startTime} -{event.endTime}
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
							<div className="qr-code">
								<QRCode
									value={`https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${identification_code.toUpperCase()}&event_date_id=${eventDateId}${
										event_slot_id
											? "&event_slot_id=" + event_slot_id
											: ""
									}`}
								/>
							</div>
							<br />
						</div>
						{event && (
							<div className="col-6 reg-confirm-card">
								<div className="day-view">
									<EventCardComponent
										key={event.id}
										event={event}
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
							{formatPhoneNumber(phone)} <br />
						</div>
						<div className="mt-5">
							As a part of our contactless service process, please
							display the above confirmation number <br />
							<div className="mb-2">
								Notes: This code is unique to you, please write
								it on a piece of paper and display in your
								driver-side front window.
								<div className=" ">
									<img
										src={identificationCodeImg1}
										alt="identificationCodeImg1"
										height="300"
										width="auto"
									/>
									<img
										className="ml-2"
										src={identificationCodeImg2}
										alt="identificationCodeImg2"
										height="300"
										width="auto"
									/>
								</div>
								For expedite service at many locations, please
								also include an ID, and a document with your
								current address
								<div className=" ">
									<img
										src={idImg}
										alt="idImg"
										height="300"
										width="auto"
									/>
								</div>
							</div>
						</div>
						{license_plate && license_plate.length > 0 && (
							<div className="mt-4 mb-4">
								<span>
									Special Instructions: You included a license
									plate in your registration:{" "}
									<b> {license_plate} </b>
								</span>
								<br />
								For the possibility of expedited service, please
								try to arrive in this vehicle.
							</div>
						)}
						{event.eventDetails &&
							event.eventDetails.length > 0 && (
								<h5>
									<b> Additional Location Information </b>
								</h5>
							)}
						<p className="mb-5">{event.eventDetails}</p>
						<Link to={HOME_OR_ROOT_URL}>
							<div className="button-wrap mt-4">
								<button
									type="submit"
									className="btn custom-button"
									data-testid="continue button"
								>
									Back To Home
								</button>
							</div>
						</Link>
					</section>
				</div>
			)}
		</Fragment>
	);
};

export default RegistrationConfirmComponent;

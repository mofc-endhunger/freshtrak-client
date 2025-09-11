import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { API_URL, RENDER_URL, BASE_URL } from "../../Utils/Urls";
import axios from "axios";
import { setCurrentEvent, selectEvent } from "../../Store/Events/eventSlice";
import { setCurrentUser, selectUser } from "../../Store/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import { Link } from "react-router-dom";
import { EventFormat } from "../../Utils/EventHandler";
import { formatMMDDYYYY } from "../../Utils/DateFormat";
import EventCardComponent from "../Events/EventCardComponent";
import QRCode from "react-qr-code";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import localization from "../Localization/LocalizationComponent";

// Type imports from registration.types.ts
import {
	RegistrationConfirmProps,
	RegistrationFormData,
	Event,
	UserApiResponse,
	EventApiResponse,
} from "./types/registration.types";

const RegistrationConfirmComponent: React.FC<
	RegistrationConfirmProps
> = props => {
	const location = useLocation();
	const navigate = useNavigate();
	const currentUser = useSelector(selectUser) as RegistrationFormData | null;
	const user_data = location.state?.user || currentUser || {};

	const dispatch = useDispatch();
	const event = useSelector(selectEvent) as Event;
	const event_slot_id = location.state?.eventTimeStamp?.event_slot_id;
	const [userToken, setUserToken] = useState<string | undefined>(undefined);
	const [isError, setIsError] = useState<boolean>(false);
	const [selectedEvent, setSelectedEvent] = useState<Event>(event);
	const [pageError, setPageError] = useState<boolean>(false);
	const [user, setUser] = useState<RegistrationFormData | null>(currentUser);
	const [showGuestSigninModal, setShowGuestSigninModal] =
		useState<boolean>(false);
	const eventDateId = sessionStorage.getItem("registeredEventDateID");

	const isLoggedIn = localStorage.getItem("isLoggedIn");
	const cognitoUser = localStorage.getItem("cognitoUser");
	if (!isLoggedIn || !JSON.parse(isLoggedIn)) {
		localStorage.removeItem("userToken");
		localStorage.removeItem("guestId");
		localStorage.removeItem("guestType");
		localStorage.removeItem("search_zip");
	}

	const formatPhoneNumber = (input: string | null): string => {
		const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
		if (input) {
			return String(input).replace(regExp, "($1) $2-$3");
		} else {
			return "";
		}
	};

	const getUser = useCallback(
		async (token: string): Promise<void> => {
			const { GUEST_USER } = API_URL;
			try {
				const resp = await axios.get<UserApiResponse>(GUEST_USER, {
					params: {},
					headers: { Authorization: `Bearer ${token}` },
				});
				const { data } = resp;
				if (
					data?.date_of_birth !== null &&
					data?.date_of_birth !== undefined
				) {
					data.date_of_birth = formatMMDDYYYY(data.date_of_birth);
				}
				if (data?.phone !== null && data?.phone !== undefined) {
					const phoneRegex =
						/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
					data.phone = String(data.phone).replace(
						phoneRegex,
						"($1) $2-$3"
					);
				}
				dispatch(setCurrentUser(data as RegistrationFormData));
				setUser(data as RegistrationFormData);
			} catch (e) {
				console.error(e);
			}
		},
		[dispatch]
	);

	const getEvent = useCallback(async (): Promise<void> => {
		try {
			const resp = await axios.get<EventApiResponse>(
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
		} catch (e: unknown) {
			console.error(e);
			setIsError(true);
			if (e && typeof e === "object" && "response" in e) {
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

	// Show guest signin modal for guest users
	useEffect(() => {
		if (!cognitoUser) {
			setTimeout(() => {
				setShowGuestSigninModal(true);
			}, 3000);
		}
	}, [cognitoUser]);

	function fetchBusinesses(): void {
		const token = localStorage.getItem("userToken");
		setUserToken(token || undefined);
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
	} = user_data || {};

	return (
		<Fragment>
			{event && (
				<div className="mt-4 max-w-6xl mx-auto px-4">
					<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 register-confirmation">
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
							<div className="flex justify-center p-4 bg-white">
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
							<Card className="w-full md:w-1/2 border-none shadow-none">
								<CardContent className="py-6 px-0">
									<div className="day-view">
										<EventCardComponent
											key={event.id}
											event={event as any}
											registrationView={true}
										/>
									</div>
								</CardContent>
							</Card>
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

						{event.eventDetails &&
							event.eventDetails.length > 0 && (
								<h5>
									<b> Additional Location Information </b>
								</h5>
							)}
						<p className="mb-5">{event.eventDetails}</p>

						<Link to={RENDER_URL.ROOT_URL}>
							<div className="flex justify-center mt-4">
								<Button
									type="submit"
									variant="highlight"
									data-testid="continue button"
								>
									Back To Home
								</Button>
							</div>
						</Link>
					</section>
				</div>
			)}

			{/* Guest Sign-in Modal */}
			<Dialog
				open={showGuestSigninModal}
				onOpenChange={setShowGuestSigninModal}
			>
				<DialogContent className="sm:max-w-md bg-white border border-gray-200 text-gray-900">
					<DialogHeader>
						<DialogTitle className="text-center text-gray-900">
							Create Account
						</DialogTitle>
						<DialogDescription className="text-center text-gray-600">
							{localization.guest_signin_prompt}
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col space-y-3 mt-4">
						<Button
							onClick={() => {
								setShowGuestSigninModal(false);
								navigate("/login");
							}}
							variant="default"
							className="w-full"
						>
							{localization.guest_signin_button}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Fragment>
	);
};

export default RegistrationConfirmComponent;

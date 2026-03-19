import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RENDER_URL, BASE_URL } from "../../Utils/Urls";
import axios from "axios";
import { setCurrentEvent, selectEvent } from "../../Store/Events/eventSlice";
import { selectUser } from "../../Store/userSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import { EventFormat } from "../../Utils/EventHandler";
import EventCardComponent from "../Events/EventCardComponent";
import QRCode from "react-qr-code";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogHeader,
} from "../../components/ui/dialog";
import localization from "../Localization/LocalizationComponent";
import { sanitizeHtml } from "../../Utils/sanitizeHtml";
import { Printer, Download } from "lucide-react";
import PrintableConfirmationCard, {
	generateConfirmationCardPNG,
} from "./components/PrintableConfirmationCard";
import { StorageService } from "../../Utils/StorageService";

// Type imports from registration.types.ts
import {
	RegistrationConfirmProps,
	RegistrationFormData,
	Event,
	EventApiResponse,
} from "./types/registration.types";

const RegistrationConfirmComponent: React.FC<RegistrationConfirmProps> = (
	props,
) => {
	const location = useLocation();
	const navigate = useNavigate();
	const currentUser = useSelector(selectUser) as RegistrationFormData | null;
	const user_data = location.state?.user || currentUser || {};
	const isCaseManager: boolean = location.state?.isCaseManager === true;

	const dispatch = useDispatch();
	const event = useSelector(selectEvent) as Event;
	const event_slot_id = location.state?.eventTimeStamp?.event_slot_id;
	const [userToken, setUserToken] = useState<string | undefined>(undefined);
	const [isError, setIsError] = useState<boolean>(false);
	const [selectedEvent, setSelectedEvent] = useState<Event>(event);
	const [pageError, setPageError] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [user, setUser] = useState<RegistrationFormData | null>(currentUser);
	const [showGuestSigninModal, setShowGuestSigninModal] =
		useState<boolean>(false);
	const eventDateId = StorageService.getRegisteredEventDateID();

	const isLoggedIn = StorageService.getItem<string>("isLoggedIn");
	if (!isLoggedIn || isLoggedIn !== "true") {
		StorageService.clearUserToken();
		StorageService.removeItem("guestId");
		StorageService.removeItem("guestType");
		StorageService.removeItem("search_zip");
	}

	const formatPhoneNumber = (input: string | null): string => {
		const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
		if (input) {
			return String(input).replace(regExp, "($1) $2-$3");
		} else {
			return "";
		}
	};

	const getEvent = useCallback(async (): Promise<void> => {
		try {
			const resp = await axios.get<EventApiResponse>(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`,
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
		isError,
		pageError,
		selectedEvent,
		user,
		userToken,
	]);

	// Clear event date ID after registration is complete and event data is loaded
	// This prevents the warning dialog from showing if user signs up again later
	useEffect(() => {
		// Clear the event date ID after event data has been successfully loaded
		// Registration is complete at this point, so we don't need it anymore
		// Only clear if we have event data (registration was successful)
		if (selectedEvent && Object.keys(selectedEvent).length > 0) {
			StorageService.removeItem(
				"freshtrak_session_registered_event_date_id",
				"session",
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedEvent]);

	// Show guest signin modal for guest users only (not for case managers)
	useEffect(() => {
		if (isCaseManager) return;

		const isGuest = StorageService.isGuestUser();
		const isCognito = StorageService.isLoggedInUser();

		if (isGuest && !isCognito) {
			setTimeout(() => {
				setShowGuestSigninModal(true);
			}, 3000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function fetchBusinesses(): void {
		const token = localStorage.getItem("userToken");
		setUserToken(token || undefined);
		if (!isError && !pageError) {
			if (Object.keys(selectedEvent).length === 0) {
				getEvent();
			}
			// User data is passed via navigation state, no need to fetch
		}
	}

	const {
		first_name = "",
		middle_name = "",
		last_name = "",
		suffix = "",
		address_line_1 = "",
		city = "",
		zip_code = "",
		state = "",
		phone = "",
		identification_code = "",
	} = user_data || {};

	// Get event address details
	const eventAddress = (event as any)?.eventAddress || "";
	const eventCity = (event as any)?.eventCity || "";
	const eventState = (event as any)?.eventState || "";
	const eventZip = (event as any)?.eventZip || "";

	// Format event date and time
	const eventDateFormatted = formatDateDayAndDate(event.date);
	const eventTime =
		location.state?.eventTimeStamp?.start_time &&
		location.state?.eventTimeStamp?.end_time
			? `${location.state.eventTimeStamp.start_time} - ${location.state.eventTimeStamp.end_time}`
			: `${event.startTime} - ${event.endTime}`;

	// Format agency address
	const agencyAddress = [eventAddress, eventCity, eventState, eventZip]
		.filter(Boolean)
		.join(", ");

	// Handle print functionality
	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	// Handle save functionality (PNG)
	const handleSave = useCallback(async () => {
		if (!event) return;

		try {
			await generateConfirmationCardPNG(
				event,
				agencyAddress,
				eventDateFormatted,
				eventTime,
				identification_code,
				eventDateId,
				event_slot_id,
			);
		} catch (error) {
			console.error("Error generating confirmation card:", error);
		}
	}, [
		event,
		identification_code,
		eventDateId,
		event_slot_id,
		agencyAddress,
		eventDateFormatted,
		eventTime,
	]);

	return (
		<Fragment>
			{/* Print-only section */}
			{event && (
				<PrintableConfirmationCard
					event={event}
					agencyAddress={agencyAddress}
					eventDateFormatted={eventDateFormatted}
					eventTime={eventTime}
					identificationCode={identification_code}
					eventDateId={eventDateId}
					eventSlotId={event_slot_id}
				/>
			)}
			{event && (
				<div className="mt-20 max-w-6xl mx-auto px-4">
					<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 register-confirmation">
						<h1 className="big-title med-title mt-5 mb-5 mobile-mb">
							{localization.title_youre_registered}
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
								{localization.header_your_confirmation_number}{" "}
								<b> {identification_code.toUpperCase()} </b>
							</h2>
							<br />
						</div>
						<div className="relative">
							<h2>{localization.header_your_qr_code}</h2>
							<div className="relative flex justify-center p-4 bg-white">
								<div className="flex justify-center p-4 bg-white">
									<QRCode
										value={`https://secure.pantrytrak.com/mobile/qr_code_processing.php?code=${identification_code.toUpperCase()}&event_date_id=${eventDateId}${
											event_slot_id
												? "&event_slot_id=" +
													event_slot_id
												: ""
										}`}
									/>
								</div>
								{/* Action buttons in top right corner */}
								<div className="absolute top-0 right-0 flex gap-2 p-2">
									<Button
										onClick={handlePrint}
										variant="outline"
										size="icon"
										className="bg-white hover:bg-gray-50"
										title={localization.button_print}
										aria-label={
											localization.aria_print_confirmation
										}
									>
										<Printer className="h-4 w-4" />
									</Button>
									<Button
										onClick={handleSave}
										variant="outline"
										size="icon"
										className="bg-white hover:bg-gray-50"
										title={localization.button_save}
										aria-label={
											localization.aria_save_confirmation
										}
									>
										<Download className="h-4 w-4" />
									</Button>
								</div>
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
							<b> {localization.header_your_information} </b>
						</h5>
						<div className="mb-2">
							<h6 className="mb-4">
								{localization.header_head_of_household}
							</h6>
							{first_name} {middle_name} {last_name} {suffix}{" "}
							<br />
							{address_line_1} <br />
							{city} {state} <br />
							{zip_code} <br />
							{formatPhoneNumber(phone)} <br />
						</div>

						{event.eventDetails &&
							event.eventDetails.length > 0 && (
								<>
									<h5>
										<b>
											{" "}
											{
												localization.header_additional_location_information
											}{" "}
										</b>
									</h5>
									<p
										className="mb-5"
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(
												event.eventDetails,
											),
										}}
									/>
								</>
							)}

						<div className="flex flex-col gap-4 w-full items-center justify-center">
							{isCaseManager && location.state?.eventDateId && (
								<Button
									type="button"
									className="px-2 uppercase text-white py-6 w-1/2 min-w-1/2 text-wrap"
									onClick={() =>
										navigate(
											`${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${location.state.eventDateId}`,
										)
									}
								>
									{localization.cm_register_another}
								</Button>
							)}
							<Button
								type="submit"
								variant="highlight"
								className="px-2 uppercase text-white py-6 w-1/2 min-w-1/2 text-wrap"
								data-testid="continue button"
								onClick={() => navigate(RENDER_URL.ROOT_URL)}
							>
								{localization.button_back_to_home}
							</Button>
						</div>
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
							{localization.dialog_create_account_title}
						</DialogTitle>
						<DialogDescription className="text-center text-gray-600">
							{localization.dialog_create_account_description}
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col space-y-3 mt-4">
						<Button
							onClick={() => {
								setShowGuestSigninModal(false);
								navigate(RENDER_URL.LOGIN_URL);
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

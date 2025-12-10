/**
 * Event Card Component
 */
import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch } from "react-redux";
import { MoreVertical } from "lucide-react";
import { setCurrentEvent } from "../../Store/Events/eventSlice";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import { RENDER_URL } from "../../Utils/Urls";
import MiniMapComponent from "../General/MiniMapComponent";
import FullMapModalComponent from "../General/FullMapModalComponent";
import localization from "../Localization/LocalizationComponent";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import "../../Assets/scss/main.scss";

interface Event {
	id: string;
	startTime: string;
	endTime: string;
	date: string;
	eventAddress: string;
	eventCity: string;
	eventState: string;
	eventZip: string;
	phoneNumber: string;
	agencyName: string;
	eventName: string;
	eventService: string;
	acceptReservations: boolean;
	acceptInterest: boolean;
	acceptWalkin: boolean;
	eventDetails: string;
	exceptionNote?: string;
	latitude?: number;
	longitude?: number;
}

interface Coordinates {
	lat: number;
	lng: number;
}

export type CardVariant = "tile" | "list";

interface EventCardComponentProps {
	event: Event;
	registrationView?: boolean;
	alreadyRegistered?: boolean;
	agencyLatitude?: number;
	agencyLongitude?: number;
	targetUrl?: string;
	variant?: CardVariant;
}

const EventCardComponent: React.FC<EventCardComponentProps> = (props) => {
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [showMapModal, setShowMapModal] = useState<boolean>(false);
	const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(
		null
	);
	const dispatch = useDispatch();
	const {
		event: {
			id,
			startTime,
			endTime,
			date,
			eventAddress,
			eventCity,
			eventState,
			eventZip,
			phoneNumber,
			agencyName,
			eventName,
			eventService,
			acceptReservations,
			acceptInterest,
			acceptWalkin,
			eventDetails,
			exceptionNote,
			latitude: eventLatitude,
			longitude: eventLongitude,
		},
		registrationView,
		alreadyRegistered,
		agencyLatitude,
		agencyLongitude,
		variant = "tile",
	} = props;

	// Fallback: use agency coordinates if event coordinates are missing
	const latitude = eventLatitude || agencyLatitude;
	const longitude = eventLongitude || agencyLongitude;

	const showRsvp = acceptInterest && !acceptReservations;
	const showRsvpOptional =
		acceptInterest && !acceptReservations && acceptWalkin;
	const showRsvpRequired =
		acceptInterest && !acceptReservations && !acceptWalkin;

	const handleMapClick = (coordinates: Coordinates, addressData?: any) => {
		setMapCoordinates(coordinates);
		setShowMapModal(true);
	};

	const handleCloseMapModal = () => {
		setShowMapModal(false);
		setMapCoordinates(null);
	};

	const handleGetDirections = () => {
		const address = `${eventAddress}, ${eventCity}, ${eventState} ${eventZip}`;
		const encodedAddress = encodeURIComponent(address);
		const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
		window.open(directionsUrl, "_blank");
	};

	const getButton = (buttonName: string, targetUrl: string) => {
		const buttonClass =
			variant === "list"
				? "btn bg-[#392947] text-white py-2.5 rounded-lg text-xs font-bold uppercase min-h-[42px] w-full"
				: "btn bg-[#392947] text-white px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px] w-full";
		return (
			<LinkContainer to={targetUrl}>
				<button
					type="button"
					className={buttonClass}
					onClick={() => {
						// Store the current search results URL before navigating to event details
						const currentPath = window.location.pathname;
						if (currentPath.startsWith("/events/list")) {
							const currentSearch = window.location.search;
							const searchResultsUrl =
								currentPath + currentSearch;
							sessionStorage.setItem(
								"searchResultsUrl",
								searchResultsUrl
							);
						}
						dispatch(setCurrentEvent(props.event));
					}}
				>
					{buttonName}
				</button>
			</LinkContainer>
		);
	};

	const ButtonView = () => {
		let targetUrl =
			props.targetUrl !== undefined
				? `${props.targetUrl}/${id}`
				: `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
		if (registrationView || alreadyRegistered) {
			return null;
		}
		if (acceptReservations) {
			return getButton(localization.button_reserve_time, targetUrl);
		} else if (showRsvp) {
			return getButton(localization.button_rsvp, targetUrl);
		} else {
			return null;
		}
	};

	// List view layout - horizontal card
	if (variant === "list") {
		return (
			<section tabIndex={0} className="w-full">
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<div className="flex flex-row">
						{/* Date/Time Section */}
						<div className="bg-text-primary text-white p-3 md:p-6 w-[100px] md:w-[160px] flex flex-col justify-center items-center md:items-start shrink-0">
							<div className="text-xs md:text-sm font-varela opacity-80 text-center md:text-left">
								{formatDateDayAndDate(date)}
							</div>
							<div className="text-sm md:text-lg font-bold mt-1 text-center md:text-left">
								{startTime} - {endTime}
							</div>
						</div>

						{/* Main Content Section */}
						<div className="flex-1 p-3 md:p-6 flex flex-row gap-2 md:gap-4 overflow-hidden">
							{/* Event Info */}
							<div className="flex-1 min-w-0">
								<div className="font-bold text-gray-900 truncate text-sm md:text-base">
									{agencyName}
								</div>
								<div className="font-bold text-gray-700 truncate mt-0.5 md:mt-1 text-sm md:text-base">
									{eventName}
								</div>
								<div className="text-xs md:text-sm text-gray-500 font-varela mt-0.5 md:mt-1 hidden sm:block">
									{eventService}
								</div>

								{/* Address - hidden on very small screens */}
								<div className="text-xs md:text-sm font-varela text-gray-600 mt-1 md:mt-3 hidden sm:block">
									{eventAddress}, {eventCity} {eventState}{" "}
									{eventZip}
									{phoneNumber && (
										<span className="ml-2 hidden md:inline">
											• {phoneNumber}
										</span>
									)}
									{latitude && longitude && (
										<button
											type="button"
											className="ml-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
											onClick={() =>
												handleMapClick({
													lat: latitude,
													lng: longitude,
												})
											}
										>
											View Map
										</button>
									)}
								</div>

								{/* Exception Note */}
								{exceptionNote && exceptionNote !== "" && (
									<div className="text-xs md:text-sm font-varela mt-2 hidden sm:block">
										<span className="text-gray-600">
											{
												localization.label_service_area_limitations
											}
										</span>{" "}
										<span
											className="text-red-600"
											data-testid="exception-note"
										>
											{exceptionNote}
										</span>
									</div>
								)}

								{/* RSVP Status Messages */}
								{!!showRsvpOptional && (
									<span className="text-red-600 text-xs md:text-sm block mt-1 md:mt-2">
										{
											localization.text_rsvp_optional_for_event
										}
									</span>
								)}
								{!!showRsvpRequired && (
									<span className="text-red-600 text-xs md:text-sm block mt-1 md:mt-2">
										{
											localization.text_rsvp_required_for_event
										}
									</span>
								)}
								{alreadyRegistered && (
									<span className="text-red-600 text-xs md:text-sm block mt-1 md:mt-2">
										{localization.text_already_registered}
									</span>
								)}

								{/* Expandable Details */}
								{showDetails && eventDetails && (
									<div className="mt-2 md:mt-3 p-2 md:p-3 bg-gray-50 rounded-lg">
										<p className="text-xs md:text-sm">
											<b>
												{localization.text_information}
											</b>
											<br />
											{eventDetails}
										</p>
									</div>
								)}
							</div>

							{/* Mobile Actions - Ellipsis Menu (visible below md) */}
							<div className="flex md:hidden items-start shrink-0">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type="button"
											className="p-2 hover:bg-gray-100 rounded-full"
											aria-label="More actions"
										>
											<MoreVertical className="w-5 h-5 text-gray-600" />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="bg-white"
									>
										{eventDetails &&
											eventDetails.length > 0 && (
												<DropdownMenuItem
													onClick={() =>
														setShowDetails(
															!showDetails
														)
													}
												>
													{!showDetails
														? localization.button_view_details
														: localization.button_hide_details}
												</DropdownMenuItem>
											)}
										<DropdownMenuItem
											onClick={handleGetDirections}
										>
											{localization.button_get_directions}
										</DropdownMenuItem>
										{latitude && longitude && (
											<DropdownMenuItem
												onClick={() =>
													handleMapClick({
														lat: latitude,
														lng: longitude,
													})
												}
											>
												View Map
											</DropdownMenuItem>
										)}
										{!!acceptReservations &&
											!registrationView &&
											!alreadyRegistered && (
												<DropdownMenuItem
													onClick={() => {
														dispatch(
															setCurrentEvent(
																props.event
															)
														);
														window.location.href =
															props.targetUrl !==
															undefined
																? `${props.targetUrl}/${id}`
																: `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
													}}
												>
													{
														localization.button_reserve_time
													}
												</DropdownMenuItem>
											)}
										{!!showRsvp &&
											!registrationView &&
											!alreadyRegistered && (
												<DropdownMenuItem
													onClick={() => {
														dispatch(
															setCurrentEvent(
																props.event
															)
														);
														window.location.href =
															props.targetUrl !==
															undefined
																? `${props.targetUrl}/${id}`
																: `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
													}}
												>
													{localization.button_rsvp}
												</DropdownMenuItem>
											)}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Desktop Actions Section (visible md and up) */}
							<div className="hidden md:flex flex-col gap-2 w-[180px] max-w-[180px] shrink-0">
								{eventDetails && eventDetails.length > 0 && (
									<button
										className="btn bg-gray-200 text-[#392947] py-2.5 rounded-lg text-xs font-bold uppercase min-h-[42px]"
										onClick={() => {
											setShowDetails(!showDetails);
										}}
									>
										{!showDetails
											? localization.button_view_details
											: localization.button_hide_details}
									</button>
								)}
								<button
									className="btn bg-gray-200 text-[#392947] py-2.5 rounded-lg text-xs font-bold uppercase min-h-[42px]"
									onClick={handleGetDirections}
								>
									{localization.button_get_directions}
								</button>
								{ButtonView() && <div>{ButtonView()}</div>}
							</div>
						</div>
					</div>
				</div>
				<FullMapModalComponent
					isOpen={showMapModal}
					onClose={handleCloseMapModal}
					coordinates={mapCoordinates}
					address={eventAddress}
					city={eventCity}
					state={eventState}
					zip={eventZip}
					agencyName={agencyName}
					latitude={latitude}
					longitude={longitude}
				/>
			</section>
		);
	}

	// Tile view layout - original vertical card
	return (
		<section
			className={registrationView ? "" : "lg:col-span-1 xl:col-span-1"}
			tabIndex={0}
		>
			<div className="bg-white rounded-lg shadow-md">
				<div className="bg-text-primary text-white p-4 rounded-t-lg">
					<div className="text-lg font-bold pb-2 truncate">
						{agencyName}
					</div>
					<div className="text-lg font-bold pb-2 truncate">
						{eventName}
					</div>
					<div className="flex justify-between text-xs">
						<div className="flex-grow truncate font-varela">
							{eventService}
						</div>
					</div>
				</div>
				<div className="p-4 min-h-[280px] flex flex-col justify-between">
					<div className="text-sm font-varela flex justify-between mb-2">
						<div className="date-wrapper">
							{formatDateDayAndDate(date)}
						</div>
						<div className="timing-wrapper">
							{startTime} - {endTime}
						</div>
					</div>
					<div className="text-xs font-varela max-w-[150px] my-2">
						{eventAddress}
						<br />
						{eventCity} {eventState} {eventZip}
						<br />
						{phoneNumber}
						<br />
					</div>
					<MiniMapComponent
						address={eventAddress}
						city={eventCity}
						state={eventState}
						zip={eventZip}
						onClick={handleMapClick}
						latitude={latitude}
						longitude={longitude}
					/>
					{exceptionNote && exceptionNote !== "" && (
						<div className="text-sm font-varela my-2">
							{localization.label_service_area_limitations}
							<br />
							<span
								className="text-red-600"
								data-testid="exception-note"
							>
								{exceptionNote}
							</span>
							<br />
						</div>
					)}
					{showDetails && (
						<div className="">
							<p>
								<b> {localization.text_information} </b>
								<br />
								{eventDetails}
							</p>
						</div>
					)}
					{!!showRsvpOptional && (
						<span className="text-red-600 text-sm">
							{localization.text_rsvp_optional_for_event}
						</span>
					)}
					{!!showRsvpRequired && (
						<span className="text-red-600 text-sm">
							{localization.text_rsvp_required_for_event}
						</span>
					)}
					{alreadyRegistered && (
						<span className="text-red-600 text-sm">
							{localization.text_already_registered}
						</span>
					)}
					<div className="space-y-3 mt-3">
						{/* Details and Directions buttons row */}
						<div className="flex flex-col gap-2">
							{eventDetails && eventDetails.length > 0 && (
								<button
									className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
									onClick={() => {
										setShowDetails(!showDetails);
									}}
								>
									{!showDetails
										? localization.button_view_details
										: localization.button_hide_details}
								</button>
							)}
							<button
								className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
								onClick={handleGetDirections}
							>
								{localization.button_get_directions}
							</button>
						</div>

						{/* Reserve button on separate row */}
						{ButtonView() && (
							<div className="w-full">{ButtonView()}</div>
						)}
					</div>
				</div>
			</div>
			<FullMapModalComponent
				isOpen={showMapModal}
				onClose={handleCloseMapModal}
				coordinates={mapCoordinates}
				address={eventAddress}
				city={eventCity}
				state={eventState}
				zip={eventZip}
				agencyName={agencyName}
				latitude={latitude}
				longitude={longitude}
			/>
		</section>
	);
};

export default EventCardComponent;

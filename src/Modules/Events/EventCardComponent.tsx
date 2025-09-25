/**
 * Event Card Component
 */
import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch } from "react-redux";
import { setCurrentEvent } from "../../Store/Events/eventSlice";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import { RENDER_URL } from "../../Utils/Urls";
import MiniMapComponent from "../General/MiniMapComponent";
import FullMapModalComponent from "../General/FullMapModalComponent";
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

interface EventCardComponentProps {
	event: Event;
	registrationView?: boolean;
	alreadyRegistered?: boolean;
	agencyLatitude?: number;
	agencyLongitude?: number;
	targetUrl?: string;
}

const EventCardComponent: React.FC<EventCardComponentProps> = props => {
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
		return (
			<LinkContainer to={targetUrl}>
				<button
					type="button"
					className="btn bg-[#392947] text-white px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px] ml-1 w-full"
					onClick={() => dispatch(setCurrentEvent(props.event))}
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
			return getButton("Reserve Time", targetUrl);
		} else if (showRsvp) {
			return getButton("RSVP", targetUrl);
		} else {
			return null;
		}
	};

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
							Service Area Limitations:
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
								<b> Information </b>
								<br />
								{eventDetails}
							</p>
						</div>
					)}
					{!!showRsvpOptional && (
						<span className="text-red-600 text-sm">
							RSVP is optional for this event
						</span>
					)}
					{!!showRsvpRequired && (
						<span className="text-red-600 text-sm">
							RSVP is required for this event
						</span>
					)}
					{alreadyRegistered && (
						<span className="text-red-600 text-sm">
							Already Registered
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
										? "View Details"
										: "Hide details"}
								</button>
							)}
							<button
								className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
								onClick={handleGetDirections}
							>
								Get Directions
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

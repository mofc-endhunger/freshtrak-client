/**
 * ReservationCard Component
 *
 * Displays a single reservation with event details, date/time,
 * event type badge, and QR code or check-in code.
 */

import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Reservation, EventType } from "../types/reservation.types";
import localization from "../../Localization/LocalizationComponent";

interface ReservationCardProps {
	reservation: Reservation;
	onClick?: (reservation: Reservation) => void;
}

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
};

/**
 * Get localized event type label
 */
const getEventTypeLabel = (eventType: EventType): string => {
	switch (eventType) {
		case "in-person":
			return localization.event_type_in_person || "In-Person";
		case "drive-through":
			return localization.event_type_drive_through || "Drive-Through";
		case "delivery":
			return localization.event_type_delivery || "Delivery";
		case "virtual":
			return localization.event_type_virtual || "Virtual";
		default:
			return eventType;
	}
};

/**
 * Get badge color based on event type
 */
const getEventTypeBadgeClass = (eventType: EventType): string => {
	switch (eventType) {
		case "in-person":
			return "bg-primary text-white";
		case "drive-through":
			return "bg-blue-500 text-white";
		case "delivery":
			return "bg-orange-500 text-white";
		case "virtual":
			return "bg-purple-500 text-white";
		default:
			return "bg-gray-500 text-white";
	}
};

const ReservationCard: React.FC<ReservationCardProps> = ({
	reservation,
	onClick,
}) => {
	const { event, date, timeslot, event_type, qr_code_url, check_in_code } =
		reservation;

	const handleClick = () => {
		if (onClick) {
			onClick(reservation);
		}
	};

	return (
		<Card
			className={`border border-gray-200 hover:shadow-md transition-shadow ${
				onClick ? "cursor-pointer" : ""
			}`}
			onClick={handleClick}
		>
			<CardContent className="p-4">
				<div className="flex justify-between items-start gap-4">
					{/* Left side - Event details */}
					<div className="flex-1 min-w-0">
						{/* Event icon and name */}
						<div className="flex items-start gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<h3 className="font-noto-sans font-semibold text-base text-gray-900 truncate">
									{event.name}
								</h3>
							</div>
						</div>

						{/* Location */}
						<div className="flex items-start gap-2 mb-2">
							<p className="font-noto-sans text-sm text-gray-600">
								{event.location.address_line_1}
								{event.location.address_line_2 &&
									`, ${event.location.address_line_2}`}
							</p>
						</div>

						{/* Date and Time */}
						<p className="font-noto-sans text-sm text-gray-600 mb-3">
							{formatDate(date)} · {timeslot.start_time} -{" "}
							{timeslot.end_time}
						</p>

						{/* Event type badge */}
						<Badge
							className={`${getEventTypeBadgeClass(
								event_type
							)} text-xs`}
						>
							{getEventTypeLabel(event_type)}
						</Badge>
					</div>

					{/* Right side - QR code or Check-in code */}
					<div className="flex-shrink-0">
						{qr_code_url ? (
							<div className="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden">
								<img
									src={qr_code_url}
									alt={localization.alt_qr_code || "QR Code"}
									className="w-full h-full object-contain"
								/>
							</div>
						) : (
							<div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center p-2">
								<span className="font-noto-sans text-[10px] text-gray-500 mb-1">
									{localization.label_check_in_code ||
										"Check-in Code"}
								</span>
								<span className="font-noto-sans font-bold text-xs text-gray-900 text-center break-all">
									{check_in_code}
								</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ReservationCard;

/**
 * ReservationCard Component
 *
 * Displays a single reservation with event details, date/time,
 * event type badge, and QR code or check-in code.
 *
 * ============================================================================
 * USAGE NOTES:
 * ============================================================================
 *
 * For UPCOMING reservations (can be cancelled):
 *   <ReservationCard
 *     reservation={reservation}
 *     variant="upcoming"
 *     onCancel={handleCancel}
 *   />
 *
 * For PAST reservations (history, no actions):
 *   <ReservationCard
 *     reservation={reservation}
 *     variant="past"
 *   />
 *
 * ============================================================================
 */

import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
	Reservation,
	EventType,
	ReservationStatus,
} from "../types/reservation.types";
import localization from "../../Localization/LocalizationComponent";

/**
 * Card variant determines the display mode
 * - "upcoming": Shows cancel button, full styling
 * - "past": Shows status badge, muted styling, no actions
 */
type CardVariant = "upcoming" | "past";

/**
 * Props for ReservationCard
 */
interface ReservationCardProps {
	/** The reservation to display */
	reservation: Reservation;
	/** Card variant - determines styling and available actions */
	variant?: CardVariant;
	/** Callback when card is clicked (optional) */
	onClick?: (reservation: Reservation) => void;
	/** Callback when cancel button is clicked (only for upcoming variant) */
	onCancel?: (reservation: Reservation) => void;
	/** Whether cancel action is in progress */
	isCancelling?: boolean;
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

/**
 * Get localized status label
 *
 * API NOTE: These status values should match what the backend returns.
 * See ReservationStatus type in reservation.types.ts
 */
const getStatusLabel = (status: ReservationStatus): string => {
	switch (status) {
		case "completed":
			return localization.status_completed || "Completed";
		case "cancelled":
			return localization.status_cancelled || "Cancelled";
		case "confirmed":
			return localization.status_confirmed || "Confirmed";
		case "pending":
			return localization.status_pending || "Pending";
		default:
			return status;
	}
};

/**
 * Get status badge styling based on status
 *
 * Color coding:
 * - Completed: Green (success)
 * - Cancelled: Gray/Red (neutral/warning)
 * - Confirmed: Blue (active)
 * - Pending: Yellow (waiting)
 */
const getStatusBadgeClass = (status: ReservationStatus): string => {
	switch (status) {
		case "completed":
			return "bg-green-100 text-green-800 border-green-200";
		case "cancelled":
			return "bg-gray-100 text-gray-600 border-gray-200";
		case "confirmed":
			return "bg-blue-100 text-blue-800 border-blue-200";
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		default:
			return "bg-gray-100 text-gray-600 border-gray-200";
	}
};

/**
 * ReservationCard Component
 *
 * Displays reservation details with different styling based on variant.
 * - Upcoming cards: Full color, cancel button, QR code
 * - Past cards: Muted styling, status badge, no actions
 */
const ReservationCard: React.FC<ReservationCardProps> = ({
	reservation,
	variant = "upcoming",
	onClick,
	onCancel,
	isCancelling = false,
}) => {
	const {
		event,
		date,
		timeslot,
		event_type,
		qr_code_url,
		check_in_code,
		status,
	} = reservation;

	const isPast = variant === "past";

	/**
	 * Handle card click
	 */
	const handleClick = () => {
		if (onClick) {
			onClick(reservation);
		}
	};

	/**
	 * Handle cancel button click
	 *
	 * API NOTE: This triggers the cancel flow.
	 * The parent component should show the CancelReservationModal
	 * and call the API if user confirms.
	 */
	const handleCancelClick = (e: React.MouseEvent) => {
		// Prevent card click event
		e.stopPropagation();

		if (onCancel && !isCancelling) {
			onCancel(reservation);
		}
	};

	return (
		<Card
			className={`border transition-shadow py-0 rounded-sm ${
				isPast
					? "border-gray-200 bg-gray-50/50" // Muted styling for past
					: "border-gray-200 hover:shadow-md" // Active styling for upcoming
			} ${onClick ? "cursor-pointer" : ""}`}
			onClick={handleClick}
		>
			<CardContent className="p-2">
				{/* Main content row */}
				<div className="flex justify-between items-start gap-2">
					{/* Left side - Event details */}
					<div className="flex-1 min-w-0">
						{/* Event name */}
						<h3
							className={`font-noto-sans font-semibold text-base truncate mb-3 ${
								isPast ? "text-gray-600" : "text-gray-900"
							}`}
						>
							{event.name}
						</h3>

						{/* Location */}
						<div className="flex items-start gap-2 mb-2">
							<p
								className={`font-noto-sans text-sm ${
									isPast ? "text-gray-500" : "text-gray-600"
								}`}
							>
								{event.location.address_line_1}
								{event.location.address_line_2 &&
									`, ${event.location.address_line_2}`}
							</p>
						</div>

						{/* Date and Time */}
						<p
							className={`font-noto-sans text-sm mb-3 ${
								isPast ? "text-gray-500" : "text-gray-600"
							}`}
						>
							{formatDate(date)} · {timeslot.start_time} -{" "}
							{timeslot.end_time}
						</p>

						{/* Badges row */}
						<div className="flex items-center gap-2 flex-wrap">
							{/* Event type badge */}
							<Badge
								className={`${
									isPast
										? "bg-gray-200 text-gray-600" // Muted for past
										: getEventTypeBadgeClass(event_type)
								} text-xs`}
							>
								{getEventTypeLabel(event_type)}
							</Badge>

							{/* Status badge - only for past events */}
							{isPast && (
								<Badge
									variant="outline"
									className={`${getStatusBadgeClass(
										status
									)} text-xs border`}
								>
									{getStatusLabel(status)}
								</Badge>
							)}
						</div>
					</div>

					{/* Right side - QR code or Check-in code (only for upcoming) */}
					{!isPast && (
						<div className="flex-shrink-0">
							{qr_code_url ? (
								<div className="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden">
									<img
										src={qr_code_url}
										alt={
											localization.alt_qr_code ||
											"QR Code"
										}
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
					)}
				</div>

				{/* Cancel button row - bottom right (only for upcoming reservations) */}
				{!isPast && onCancel && (
					<div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
						<Button
							variant="custom"
							size="sm"
							onClick={handleCancelClick}
							disabled={isCancelling}
							className="font-noto-sans"
						>
							{localization.button_cancel_reservation}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ReservationCard;

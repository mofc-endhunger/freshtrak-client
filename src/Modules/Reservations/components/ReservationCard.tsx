/**
 * ReservationCard Component
 *
 * Displays a single reservation with event name and date/time.
 * Simplified to match backend API response fields.
 *
 * ============================================================================
 * USAGE NOTES:
 * ============================================================================
 *
 * For UPCOMING reservations:
 *   <ReservationCard
 *     reservation={reservation}
 *     variant="upcoming"
 *   />
 *
 * For PAST reservations (history):
 *   <ReservationCard
 *     reservation={reservation}
 *     variant="past"
 *   />
 *
 * ============================================================================
 */

import React, { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Reservation, ReservationStatus } from "../types/reservation.types";
import localization from "../../Localization/LocalizationComponent";
import FeedbackContainer from "../../Feedback/FeedbackContainer";

/**
 * Card variant determines the display mode
 * - "upcoming": Full styling
 * - "past": Shows status badge, muted styling
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
	/** Called after feedback is successfully submitted (final) */
	onFeedbackSubmitted?: () => void;
}

/**
 * Format date string to readable format
 * Returns "N/A" for null/invalid dates
 *
 * Note: Date-only strings (YYYY-MM-DD) are parsed as UTC by JavaScript.
 * We append T12:00:00 to treat them as local time and avoid timezone shifts.
 */
const formatDate = (dateString: string): string => {
	// Handle N/A or empty dates
	if (!dateString || dateString === "N/A") {
		return "N/A";
	}
	try {
		// If date is in YYYY-MM-DD format, append time to parse as local time
		// This prevents timezone issues where UTC midnight shifts to previous day
		const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
			? `${dateString}T12:00:00`
			: dateString;
		const date = new Date(normalizedDate);
		// Check for invalid date
		if (isNaN(date.getTime())) {
			return "N/A";
		}
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return "N/A";
	}
};

/**
 * Get localized status label
 * Only "completed" status is used
 */
const getStatusLabel = (status: ReservationStatus): string => {
	return localization.status_completed || "Completed";
};

/**
 * Get status badge styling
 * Only "completed" status - green for success
 */
const getStatusBadgeClass = (): string => {
	return "bg-green-100 text-green-800 border-green-200";
};

/**
 * ReservationCard Component
 *
 * Displays reservation details with different styling based on variant.
 * - Upcoming cards: Full color
 * - Past cards: Muted styling, status badge
 */
const ReservationCard: React.FC<ReservationCardProps> = ({
	reservation,
	variant = "upcoming",
	onClick,
	onFeedbackSubmitted,
}) => {
	const { event, date, timeslot, status, survey } = reservation;
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

	const isPast = variant === "past";

	const showFeedbackButton =
		isPast &&
		survey != null &&
		(survey.status === "in_progress" || survey.status === "scheduled");

	/**
	 * Handle card click
	 */
	const handleClick = () => {
		if (onClick) {
			onClick(reservation);
		}
	};

	/**
	 * Handle feedback button click
	 */
	const handleFeedbackClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent card click
		setIsFeedbackOpen(true);
	};

	/**
	 * Handle feedback modal close
	 */
	const handleFeedbackClose = () => {
		setIsFeedbackOpen(false);
	};

	return (
		<>
			<Card
				className={`border transition-shadow py-0 rounded-sm ${
					isPast
						? "border-gray-200 bg-gray-50/50" // Muted styling for past
						: "border-gray-200 hover:shadow-md" // Active styling for upcoming
				} ${onClick ? "cursor-pointer" : ""}`}
				onClick={handleClick}
			>
				<CardContent className="p-3">
					{/* Event name */}
					<h3
						className={`font-noto-sans font-semibold text-base truncate mb-2 ${
							isPast ? "text-gray-600" : "text-gray-900"
						}`}
					>
						{event.name}
					</h3>

					{/* Date and Time */}
					<p
						className={`font-noto-sans text-sm mb-2 ${
							isPast ? "text-gray-500" : "text-gray-600"
						}`}
					>
						{formatDate(date)} · {timeslot.start_time} -{" "}
						{timeslot.end_time}
					</p>

					{/* Status badge and feedback button - only for past events with available survey */}
					{isPast && status && (
						<div className="flex items-center justify-between gap-2">
							<Badge
								variant="outline"
								className={`${getStatusBadgeClass()} text-xs border`}
							>
								{getStatusLabel(status)}
							</Badge>
							{showFeedbackButton && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleFeedbackClick}
									className="text-xs h-7 px-2 text-text-primary border-text-primary hover:bg-text-primary hover:text-white"
								>
									{localization.feedback_give_feedback ||
										"Give Feedback"}
								</Button>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Feedback Modal */}
			{isPast && (
			<FeedbackContainer
				isOpen={isFeedbackOpen}
				onClose={handleFeedbackClose}
				registrationId={reservation.id || 0}
				locationName={event.name}
				visitDate={formatDate(date)}
				onSubmitComplete={onFeedbackSubmitted}
			/>
			)}
		</>
	);
};

export default ReservationCard;

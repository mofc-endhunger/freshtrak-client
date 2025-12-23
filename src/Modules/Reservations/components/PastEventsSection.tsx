/**
 * PastEventsSection Component
 *
 * Displays the user's past events/reservations history.
 * Shows completed and cancelled reservations from the last 2 weeks.
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * This component fetches past reservations via:
 *   GET /api/reservations?type=past
 *   OR
 *   GET /api/reservations/history
 *
 * Expected data includes:
 * - Reservations with status = "completed" (user attended)
 * - Reservations with status = "cancelled" (user cancelled)
 * - Any reservation where date < today
 *
 * The backend should:
 * 1. Return history for at least the last 2 weeks
 * 2. Sort by date descending (most recent first)
 * 3. Consider pagination if history grows large
 *
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { History } from "lucide-react";
import ReservationCard from "./ReservationCard";
import { Reservation, ReservationsResponse } from "../types/reservation.types";
import { ReservationsApiService } from "../../../Services/ReservationsApiService";
import { LoadingCard } from "../../Households/components/LoadingSpinner";
import localization from "../../Localization/LocalizationComponent";

/**
 * Props for PastEventsSection
 */
interface PastEventsSectionProps {
	/** Callback when a past event card is clicked (optional) */
	onEventClick?: (reservation: Reservation) => void;
}

/**
 * PastEventsSection Component
 *
 * Fetches and displays past reservations in a list.
 * Shows empty state when no history is found.
 */
const PastEventsSection: React.FC<PastEventsSectionProps> = ({
	onEventClick,
}) => {
	const [pastReservations, setPastReservations] = useState<Reservation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize API service
	const reservationsApiService = useMemo(
		() => new ReservationsApiService(),
		[]
	);

	/**
	 * Fetch past reservations on mount
	 *
	 * API NOTE: This calls GET /api/reservations?type=past
	 * Backend should return reservations where:
	 * - status = "completed" OR "cancelled"
	 * - OR date < today
	 */
	useEffect(() => {
		const fetchPastReservations = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Fetch past reservations from API
				const data: ReservationsResponse =
					await reservationsApiService.getPastReservations();

				// Sort by date descending (most recent first)
				const sortedReservations = [...data.reservations].sort(
					(a, b) =>
						new Date(b.date).getTime() - new Date(a.date).getTime()
				);

				setPastReservations(sortedReservations);
			} catch (err: any) {
				console.error("Error fetching past reservations:", err);
				setError(
					localization.error_loading_reservations ||
						"Failed to load past events"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPastReservations();
	}, [reservationsApiService]);

	/**
	 * Handle event card click
	 */
	const handleEventClick = (reservation: Reservation) => {
		if (onEventClick) {
			onEventClick(reservation);
		}
	};

	return (
		<div className="w-full mt-8">
			{/* Section Header */}
			<div className="mb-4">
				<h2 className="font-noto-sans font-semibold text-lg text-gray-900">
					{localization.title_past_events || "Past Events"}
				</h2>
				<p className="font-noto-sans text-sm text-gray-500 mt-1">
					{localization.text_past_events_description ||
						"Your event history from the last 2 weeks."}
				</p>
			</div>

			{/* Loading State */}
			<LoadingCard
				isLoading={isLoading}
				operation={
					localization.loading_reservations ||
					"Loading past events..."
				}
				className="w-full"
			>
				{/* Error State */}
				{error && (
					<div className="text-center py-8">
						<p className="font-noto-sans text-sm text-red-500">
							{error}
						</p>
					</div>
				)}

				{/* Empty State */}
				{!error && pastReservations.length === 0 && (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
						<p className="font-noto-sans text-base text-gray-500">
							{localization.text_no_past_events ||
								"No past events found."}
						</p>
					</div>
				)}

				{/* Past Events List */}
				{!error && pastReservations.length > 0 && (
					<div className="space-y-4 w-full md:w-1/2">
						{pastReservations.map((reservation) => (
							<ReservationCard
								key={reservation.id}
								reservation={reservation}
								variant="past"
								onClick={
									onEventClick ? handleEventClick : undefined
								}
							/>
						))}
					</div>
				)}
			</LoadingCard>
		</div>
	);
};

export default PastEventsSection;

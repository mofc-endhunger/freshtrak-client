/**
 * PastEventsSection Component
 *
 * Displays the user's past events/reservations history.
 * Shows completed reservations (events where date < today).
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * This component fetches past reservations via:
 *   GET /reservations
 *
 * Status is derived on frontend:
 * - date < today → "completed"
 * - date >= today → "confirmed"
 *
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { History, AlertCircle } from "lucide-react";
import ReservationCard from "./ReservationCard";
import { Reservation, ReservationsResponse } from "../types/reservation.types";
import { ReservationsApiService } from "../../../Services/ReservationsApiService";
import { LoadingCard } from "../../Households/components/LoadingSpinner";
import { Alert, AlertDescription } from "../../../components/ui/alert";
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
	const isMountedRef = useRef(true);

	const safeSetState = (setter: () => void) => {
		if (isMountedRef.current) {
			setter();
		}
	};

	// Initialize API service
	const reservationsApiService = useMemo(
		() => new ReservationsApiService(),
		[]
	);

	const fetchPastReservations = useCallback(async () => {
		safeSetState(() => {
			setIsLoading(true);
			setError(null);
		});

		try {
			const data: ReservationsResponse =
				await reservationsApiService.getPastReservations();

			const sortedReservations = [...data.reservations].sort(
				(a, b) => {
					const dateA = a.date && a.date !== "N/A" ? new Date(a.date).getTime() : 0;
					const dateB = b.date && b.date !== "N/A" ? new Date(b.date).getTime() : 0;
					const validA = !isNaN(dateA) ? dateA : 0;
					const validB = !isNaN(dateB) ? dateB : 0;
					return validB - validA;
				}
			);

			safeSetState(() => setPastReservations(sortedReservations));
		} catch (err: any) {
			console.error("Error fetching past reservations:", err);
			safeSetState(() =>
				setError(
					localization.error_loading_reservations ||
						"Failed to load past events",
				),
			);
		} finally {
			safeSetState(() => setIsLoading(false));
		}
	}, [reservationsApiService]);

	useEffect(() => {
		isMountedRef.current = true;
		fetchPastReservations();
		return () => {
			isMountedRef.current = false;
		};
	}, [fetchPastReservations]);

	/**
	 * Invalidate cache before re-fetching so the backend's updated
	 * survey status (e.g. completed) is reflected immediately.
	 */
	const refreshAfterFeedback = useCallback(async () => {
		reservationsApiService.invalidateCache();
		await fetchPastReservations();
	}, [reservationsApiService, fetchPastReservations]);

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
						"Your event history from the last 30 days."}
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
					<Alert variant="destructive" className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
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
							onFeedbackSubmitted={refreshAfterFeedback}
						/>
					))}
					</div>
				)}
			</LoadingCard>
		</div>
	);
};

export default PastEventsSection;

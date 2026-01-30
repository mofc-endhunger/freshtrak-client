/**
 * YourReservations Component
 *
 * Displays the user's upcoming reservations in a grid layout.
 * Shows empty state when no reservations are found.
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * This component fetches upcoming reservations via:
 *   GET /api/reservations?type=upcoming
 *
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import ReservationCard from "./ReservationCard";
import { Reservation, ReservationsResponse } from "../types/reservation.types";
import { ReservationsApiService } from "../../../Services/ReservationsApiService";
import { LoadingCard } from "../../Households/components/LoadingSpinner";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import localization from "../../Localization/LocalizationComponent";

/**
 * Props for YourReservations
 */
interface YourReservationsProps {
	/** Callback when a reservation card is clicked */
	onReservationClick?: (reservation: Reservation) => void;
}

/**
 * YourReservations Component
 *
 * Fetches and displays upcoming reservations.
 */
const YourReservations: React.FC<YourReservationsProps> = ({
	onReservationClick,
}) => {
	// State
	const [reservationsData, setReservationsData] =
		useState<ReservationsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize API service
	const reservationsApiService = useMemo(
		() => new ReservationsApiService(),
		[]
	);

	/**
	 * Fetch reservations on mount
	 *
	 * API NOTE: Fetches only upcoming reservations.
	 * Backend filters by status = "confirmed" | "pending" AND date >= today
	 */
	const fetchReservations = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Fetch upcoming reservations only
			const data = await reservationsApiService.getUpcomingReservations();
			setReservationsData(data);
		} catch (err: any) {
			console.error("Error fetching reservations:", err);
			setError(
				localization.error_loading_reservations ||
					"Failed to load reservations"
			);
		} finally {
			setIsLoading(false);
		}
	}, [reservationsApiService]);

	useEffect(() => {
		fetchReservations();
	}, [fetchReservations]);

	/**
	 * Get reservations from API response
	 * Trust backend's filter - no additional client-side filtering needed
	 */
	const upcomingReservations = useMemo(() => {
		return reservationsData?.reservations ?? [];
	}, [reservationsData]);

	/**
	 * Handle reservation click
	 */
	const handleReservationClick = (reservation: Reservation) => {
		if (onReservationClick) {
			onReservationClick(reservation);
		}
	};

	return (
		<div className="w-full">
			{/* Section Header */}
			<div className="mb-4">
				<h2 className="font-noto-sans font-semibold text-lg text-gray-900">
					{localization.title_your_reservations ||
						"Your Reservations"}
				</h2>
				{upcomingReservations.length > 0 && (
					<p className="font-noto-sans text-sm text-gray-500 mt-1">
						{localization.text_you_have_event_coming_up ||
							"You have an event coming up."}
					</p>
				)}
			</div>

			{/* Loading State */}
			<LoadingCard
				isLoading={isLoading}
				operation={
					localization.loading_reservations ||
					"Loading reservations..."
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
				{!error && upcomingReservations.length === 0 && (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
						<p className="font-noto-sans text-base text-gray-500">
							{localization.text_no_upcoming_events ||
								"No upcoming events found."}
						</p>
						<p className="font-noto-sans text-sm text-gray-400 mt-2">
							{localization.text_browse_events_to_register ||
								"Browse events to make a reservation."}
						</p>
					</div>
				)}

				{/* Reservations Grid */}
				{!error && upcomingReservations.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{upcomingReservations.map((reservation) => (
							<ReservationCard
								key={reservation.id}
								reservation={reservation}
								variant="upcoming"
								onClick={
									onReservationClick
										? handleReservationClick
										: undefined
								}
							/>
						))}
					</div>
				)}
			</LoadingCard>
		</div>
	);
};

export default YourReservations;

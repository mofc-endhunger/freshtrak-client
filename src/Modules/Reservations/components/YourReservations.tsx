/**
 * YourReservations Component
 *
 * Displays the user's upcoming reservations in a grid layout.
 * Shows empty state when no reservations are found.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import ReservationCard from "./ReservationCard";
import { Reservation, ReservationsResponse } from "../types/reservation.types";
import { ReservationsApiService } from "../../../Services/ReservationsApiService";
import { LoadingCard } from "../../Households/components/LoadingSpinner";
import localization from "../../Localization/LocalizationComponent";

interface YourReservationsProps {
	onReservationClick?: (reservation: Reservation) => void;
}

const YourReservations: React.FC<YourReservationsProps> = ({
	onReservationClick,
}) => {
	const [reservationsData, setReservationsData] =
		useState<ReservationsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize API service
	const reservationsApiService = useMemo(
		() => new ReservationsApiService(),
		[]
	);

	// Fetch reservations on mount
	useEffect(() => {
		const fetchReservations = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await reservationsApiService.getReservations();
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
		};

		fetchReservations();
	}, [reservationsApiService]);

	// Filter to show only upcoming/confirmed reservations
	const upcomingReservations = useMemo(() => {
		if (!reservationsData?.reservations) return [];
		return reservationsData.reservations.filter(
			(r) => r.status === "confirmed" || r.status === "pending"
		);
	}, [reservationsData]);

	// Handle reservation click
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
					<div className="text-center py-8">
						<p className="font-noto-sans text-sm text-red-500">
							{error}
						</p>
					</div>
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
								onClick={handleReservationClick}
							/>
						))}
					</div>
				)}
			</LoadingCard>
		</div>
	);
};

export default YourReservations;

/**
 * YourReservations Component
 *
 * Displays the user's upcoming reservations in a grid layout.
 * Includes cancel functionality with confirmation modal.
 * Shows empty state when no reservations are found.
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * This component fetches upcoming reservations via:
 *   GET /api/reservations?type=upcoming
 *
 * Cancel flow:
 * 1. User clicks cancel button on ReservationCard
 * 2. CancelReservationModal opens for confirmation
 * 3. If confirmed, calls POST /api/reservations/{id}/cancel
 * 4. On success, removes reservation from list and shows toast
 * 5. Cancelled reservation moves to past events (history)
 *
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "lucide-react";
import ReservationCard from "./ReservationCard";
import CancelReservationModal from "./CancelReservationModal";
import { Reservation, ReservationsResponse } from "../types/reservation.types";
import { ReservationsApiService } from "../../../Services/ReservationsApiService";
import { LoadingCard } from "../../Households/components/LoadingSpinner";
import { showToast } from "../../Notifications/NotifyToastComponent";
import localization from "../../Localization/LocalizationComponent";

/**
 * Props for YourReservations
 */
interface YourReservationsProps {
	/** Callback when a reservation card is clicked */
	onReservationClick?: (reservation: Reservation) => void;
	/** Callback after a reservation is successfully cancelled */
	onReservationCancelled?: (reservation: Reservation) => void;
}

/**
 * YourReservations Component
 *
 * Fetches and displays upcoming reservations with cancel functionality.
 */
const YourReservations: React.FC<YourReservationsProps> = ({
	onReservationClick,
	onReservationCancelled,
}) => {
	// State
	const [reservationsData, setReservationsData] =
		useState<ReservationsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Cancel modal state
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [reservationToCancel, setReservationToCancel] =
		useState<Reservation | null>(null);
	const [isCancelling, setIsCancelling] = useState(false);

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
	 * Filter to show only upcoming/confirmed reservations
	 * (Additional client-side filtering as safety measure)
	 */
	const upcomingReservations = useMemo(() => {
		if (!reservationsData?.reservations) return [];
		return reservationsData.reservations.filter(
			(r) => r.status === "confirmed" || r.status === "pending"
		);
	}, [reservationsData]);

	/**
	 * Handle reservation click
	 */
	const handleReservationClick = (reservation: Reservation) => {
		if (onReservationClick) {
			onReservationClick(reservation);
		}
	};

	/**
	 * Handle cancel button click - opens confirmation modal
	 */
	const handleCancelClick = (reservation: Reservation) => {
		setReservationToCancel(reservation);
		setCancelModalOpen(true);
	};

	/**
	 * Close cancel modal
	 */
	const handleCancelModalClose = () => {
		setCancelModalOpen(false);
		setReservationToCancel(null);
	};

	/**
	 * Confirm cancellation - calls API and updates state
	 *
	 * API NOTE: Calls POST /api/reservations/{id}/cancel
	 * On success:
	 * - Backend updates reservation status to "cancelled"
	 * - Backend frees up the event slot
	 * - Frontend removes from upcoming list
	 * - Cancelled reservation will appear in past events (history)
	 */
	const handleConfirmCancel = async () => {
		if (!reservationToCancel) return;

		setIsCancelling(true);

		try {
			const response = await reservationsApiService.cancelReservation(
				reservationToCancel.id
			);

			if (response.success) {
				// Show success toast
				showToast(
					localization.message_cancel_success ||
						"Your reservation has been cancelled successfully.",
					"success"
				);

				// Remove cancelled reservation from local state
				setReservationsData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						reservations: prev.reservations.filter(
							(r) => r.id !== reservationToCancel.id
						),
						upcoming_count: prev.upcoming_count - 1,
						past_count: prev.past_count + 1, // Moves to past
					};
				});

				// Notify parent component
				if (onReservationCancelled) {
					onReservationCancelled(reservationToCancel);
				}

				// Close modal
				handleCancelModalClose();
			} else {
				// Show error toast
				showToast(
					response.message ||
						localization.message_cancel_error ||
						"Unable to cancel reservation.",
					"error"
				);
			}
		} catch (err: any) {
			console.error("Error cancelling reservation:", err);
			showToast(
				localization.message_cancel_error ||
					"Unable to cancel reservation. Please try again.",
				"error"
			);
		} finally {
			setIsCancelling(false);
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
								variant="upcoming"
								onClick={
									onReservationClick
										? handleReservationClick
										: undefined
								}
								onCancel={handleCancelClick}
								isCancelling={
									isCancelling &&
									reservationToCancel?.id === reservation.id
								}
							/>
						))}
					</div>
				)}
			</LoadingCard>

			{/* Cancel Confirmation Modal */}
			{reservationToCancel && (
				<CancelReservationModal
					isOpen={cancelModalOpen}
					onClose={handleCancelModalClose}
					onConfirm={handleConfirmCancel}
					reservation={reservationToCancel}
					isLoading={isCancelling}
				/>
			)}
		</div>
	);
};

export default YourReservations;

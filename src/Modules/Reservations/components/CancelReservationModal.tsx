/**
 * CancelReservationModal Component
 *
 * A confirmation modal for cancelling reservations.
 * Shows warning message and requires user confirmation before cancelling.
 *
 * ============================================================================
 * API INTEGRATION NOTES:
 * ============================================================================
 *
 * This component calls the ReservationsApiService.cancelReservation() method.
 * When the real API is implemented:
 *
 * 1. The cancel endpoint should: POST /api/reservations/{id}/cancel
 * 2. Request body can include optional cancellation reason
 * 3. Response should include the updated reservation with status = "cancelled"
 * 4. The slot should be freed up for other users
 *
 * Error scenarios to handle:
 * - 404: Reservation not found
 * - 400: Already cancelled or past event
 * - 403: Not authorized to cancel this reservation
 * - 500: Server error
 *
 * ============================================================================
 */

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Reservation } from "../types/reservation.types";
import localization from "../../Localization/LocalizationComponent";

/**
 * Props for CancelReservationModal
 */
interface CancelReservationModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback when modal is closed (cancel action or backdrop click) */
	onClose: () => void;
	/** Callback when cancellation is confirmed */
	onConfirm: () => Promise<void>;
	/** The reservation being cancelled (for display purposes) */
	reservation: Reservation;
	/** Whether cancellation is in progress */
	isLoading?: boolean;
}

/**
 * Format date for display in modal
 */
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
};

/**
 * CancelReservationModal Component
 *
 * Displays a confirmation dialog before cancelling a reservation.
 * Includes event details, warning message, and confirm/cancel buttons.
 */
const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	reservation,
	isLoading = false,
}) => {
	const [internalLoading, setInternalLoading] = useState(false);

	// Use either external or internal loading state
	const loading = isLoading || internalLoading;

	/**
	 * Handle confirm button click
	 *
	 * API NOTE: This triggers the cancel API call.
	 * The parent component should handle the actual API call
	 * and update the reservations list after success.
	 */
	const handleConfirm = async () => {
		setInternalLoading(true);
		try {
			await onConfirm();
			// Modal will be closed by parent after successful cancellation
		} catch (error) {
			// Error handling is done by parent
			console.error("Error cancelling reservation:", error);
		} finally {
			setInternalLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md bg-white border border-gray-200 text-gray-900">
				<DialogHeader>
					{/* Warning Icon */}
					<div className="flex justify-center mb-4">
						<div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
							<AlertTriangle className="w-6 h-6 text-orange-600" />
						</div>
					</div>

					{/* Title */}
					<DialogTitle className="text-center font-noto-sans text-xl">
						{localization.title_cancel_reservation}
					</DialogTitle>

					{/* Event Details */}
					<div className="text-center mt-2">
						<p className="font-noto-sans font-semibold text-gray-900">
							{reservation.event.name}
						</p>
						<p className="font-noto-sans text-sm text-gray-500">
							{formatDate(reservation.date)}
						</p>
						<p className="font-noto-sans text-sm text-gray-500">
							{reservation.timeslot.start_time} -{" "}
							{reservation.timeslot.end_time}
						</p>
					</div>

					{/* Confirmation Message */}
					<DialogDescription className="text-center mt-4 font-noto-sans">
						{localization.message_cancel_confirmation}
					</DialogDescription>

					{/* Warning Message */}
					<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
						<p className="font-noto-sans text-sm text-orange-800 text-center">
							{localization.message_cancel_warning}
						</p>
					</div>
				</DialogHeader>

				{/* Action Buttons */}
				<DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
					{/* Keep Reservation Button (Primary) */}
					<Button
						variant="highlightOutline"
						onClick={onClose}
						disabled={loading}
						className="flex-1 font-noto-sans"
					>
						{localization.button_keep_reservation}
					</Button>

					{/* Confirm Cancel Button (Destructive) */}
					<Button
						variant="highlight"
						onClick={handleConfirm}
						disabled={loading}
						className="flex-1 font-noto-sans"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{localization.button_confirm_cancel}
							</>
						) : (
							localization.button_confirm_cancel
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CancelReservationModal;

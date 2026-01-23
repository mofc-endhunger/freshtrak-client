/**
 * FeedbackContainer Component
 *
 * Container component that manages state and orchestrates the feedback flow.
 * Handles the transition between form and confirmation states.
 */

import React, { useState, useCallback } from "react";
import FeedbackModal from "./components/FeedbackModal";
import FeedbackConfirmation from "./components/FeedbackConfirmation";
import { FeedbackFormData, FeedbackModalState } from "./types";
import { feedbackApiService } from "../../Services/FeedbackApiService";

interface FeedbackContainerProps {
	/** Whether the feedback flow is open */
	isOpen: boolean;
	/** Callback to close the feedback flow */
	onClose: () => void;
	/** Reservation ID for the feedback */
	reservationId: string;
	/** Event/location name */
	locationName: string;
	/** Visit date (formatted string) */
	visitDate: string;
}

const FeedbackContainer: React.FC<FeedbackContainerProps> = ({
	isOpen,
	onClose,
	reservationId,
	locationName,
	visitDate,
}) => {
	const [modalState, setModalState] = useState<FeedbackModalState>("form");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Handle feedback form submission
	 */
	const handleSubmit = useCallback(async (formData: FeedbackFormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await feedbackApiService.submitFeedback(formData);

			if (response.success) {
				// Switch to confirmation state
				setModalState("confirmation");
			} else {
				setError(response.message || "Failed to submit feedback");
			}
		} catch (err: any) {
			console.error("Feedback submission error:", err);
			setError(err.message || "An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	/**
	 * Handle closing the feedback flow
	 */
	const handleClose = useCallback(() => {
		// Reset state when closing
		setModalState("form");
		setError(null);
		setIsSubmitting(false);
		onClose();
	}, [onClose]);

	/**
	 * Handle closing the confirmation
	 */
	const handleConfirmationClose = useCallback(() => {
		handleClose();
	}, [handleClose]);

	// Render based on current state
	if (!isOpen) {
		return null;
	}

	return (
		<>
			{/* Feedback Form Modal */}
			<FeedbackModal
				isOpen={isOpen && modalState === "form"}
				onClose={handleClose}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				reservationId={reservationId}
				locationName={locationName}
				visitDate={visitDate}
			/>

			{/* Confirmation Modal */}
			<FeedbackConfirmation
				isOpen={isOpen && modalState === "confirmation"}
				onClose={handleConfirmationClose}
			/>

			{/* Error Toast (simple inline error for now) */}
			{error && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
					{error}
				</div>
			)}
		</>
	);
};

export default FeedbackContainer;

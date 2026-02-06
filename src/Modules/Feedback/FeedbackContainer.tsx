/**
 * FeedbackContainer Component
 *
 * Container component that manages the feedback flow.
 * Handles the transition between form and confirmation states.
 * Aligned with backend PRD: docs/backend/feedback-prd.md
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 *   <FeedbackContainer
 *     isOpen={isFeedbackOpen}
 *     onClose={() => setIsFeedbackOpen(false)}
 *     registrationId={reservation.id}
 *     locationName={event.name}
 *     visitDate={formattedDate}
 *   />
 *
 * ============================================================================
 */

import React, { useState, useCallback, useEffect } from "react";
import FeedbackModal from "./components/FeedbackModal";
import FeedbackConfirmation from "./components/FeedbackConfirmation";
import { FeedbackProvider, useFeedback } from "./context";
import { FeedbackContainerProps } from "./types";

/**
 * Internal component that uses the context
 */
const FeedbackContainerInternal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	locationName?: string;
	visitDate?: string;
}> = ({ isOpen, onClose, locationName, visitDate }) => {
	const { modalState } = useFeedback();
	const [showConfirmation, setShowConfirmation] = useState(false);

	// Track when we transition to confirmation state
	useEffect(() => {
		if (modalState === "confirmation") {
			setShowConfirmation(true);
		}
	}, [modalState]);

	/**
	 * Handle closing the feedback flow
	 */
	const handleClose = useCallback(() => {
		setShowConfirmation(false);
		onClose();
	}, [onClose]);

	/**
	 * Handle closing the confirmation
	 */
	const handleConfirmationClose = useCallback(() => {
		handleClose();
	}, [handleClose]);

	// Don't render anything if not open
	if (!isOpen && !showConfirmation) {
		return null;
	}

	return (
		<>
			{/* Feedback Form Modal */}
			<FeedbackModal
				isOpen={isOpen && !showConfirmation}
				onClose={handleClose}
				locationName={locationName}
				visitDate={visitDate}
			/>

			{/* Confirmation Modal */}
			<FeedbackConfirmation
				isOpen={showConfirmation}
				onClose={handleConfirmationClose}
			/>
		</>
	);
};

/**
 * FeedbackContainer Component
 *
 * Wraps the internal component with the FeedbackProvider.
 */
const FeedbackContainer: React.FC<FeedbackContainerProps> = ({
	isOpen,
	onClose,
	registrationId,
	locationName,
	visitDate,
}) => {
	const handleSubmitSuccess = useCallback(() => {
		// Confirmation modal will be shown automatically via modalState
	}, []);

	const handleSubmitError = useCallback((error: string) => {
		console.error("Feedback submission error:", error);
	}, []);

	// Don't render provider if not open (to avoid unnecessary API calls)
	if (!isOpen) {
		return null;
	}

	return (
		<FeedbackProvider
			registrationId={registrationId}
			onSubmitSuccess={handleSubmitSuccess}
			onSubmitError={handleSubmitError}
		>
			<FeedbackContainerInternal
				isOpen={isOpen}
				onClose={onClose}
				locationName={locationName}
				visitDate={visitDate}
			/>
		</FeedbackProvider>
	);
};

export default FeedbackContainer;

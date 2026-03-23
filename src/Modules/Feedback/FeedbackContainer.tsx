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
	onSubmitComplete?: () => void;
	locationName?: string;
	visitDate?: string;
}> = ({ isOpen, onClose, onSubmitComplete, locationName, visitDate }) => {
	const { modalState, saveProgress } = useFeedback();
	const [showConfirmation, setShowConfirmation] = useState(false);

	useEffect(() => {
		if (modalState === "confirmation") {
			setShowConfirmation(true);
		}
	}, [modalState]);

	const handleClose = useCallback(() => {
		if (modalState === "form") {
			saveProgress();
		}
		setShowConfirmation(false);
		onClose();
	}, [onClose, modalState, saveProgress]);

	const handleConfirmationClose = useCallback(() => {
		setShowConfirmation(false);
		onClose();
		onSubmitComplete?.();
	}, [onClose, onSubmitComplete]);

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
	onSubmitComplete,
}) => {
	const handleSubmitError = useCallback((error: string) => {
		console.error("Feedback submission error:", error);
	}, []);

	if (!isOpen) {
		return null;
	}

	return (
		<FeedbackProvider
			registrationId={registrationId}
			onSubmitError={handleSubmitError}
		>
			<FeedbackContainerInternal
				isOpen={isOpen}
				onClose={onClose}
				onSubmitComplete={onSubmitComplete}
				locationName={locationName}
				visitDate={visitDate}
			/>
		</FeedbackProvider>
	);
};

export default FeedbackContainer;

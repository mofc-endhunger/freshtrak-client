/**
 * FeedbackContainer Component
 *
 * Container component that manages state and orchestrates the feedback flow.
 * Handles the transition between form and confirmation states.
 *
 * ============================================================================
 * USAGE MODES:
 * ============================================================================
 *
 * LEGACY MODE (backward compatible):
 *   Uses the old FeedbackModal with hardcoded form layout.
 *   Triggered when useDynamicForm={false} (default) or not provided.
 *
 * DYNAMIC MODE:
 *   Uses the new DynamicFeedbackModal with API-driven form config.
 *   Triggered when useDynamicForm={true}.
 *   Requires eventId (and optionally eventDateId, eventSlotId) for form lookup.
 *
 * ============================================================================
 */

import React, { useState, useCallback, useEffect } from "react";
import FeedbackModal from "./components/FeedbackModal";
import DynamicFeedbackModal from "./components/DynamicFeedbackModal";
import FeedbackConfirmation from "./components/FeedbackConfirmation";
import { FeedbackSessionProvider } from "./context";
import {
	FeedbackFormData,
	FeedbackModalState,
	FeedbackForm,
	DynamicFeedbackContainerProps,
} from "./types";
import { feedbackApiService } from "../../Services/FeedbackApiService";

/**
 * Legacy props (backward compatible)
 */
interface LegacyFeedbackContainerProps {
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
	/** Use dynamic form mode (default: false for backward compatibility) */
	useDynamicForm?: false;
}

/**
 * Dynamic form props
 */
interface DynamicFeedbackContainerPropsInternal {
	/** Whether the feedback flow is open */
	isOpen: boolean;
	/** Callback to close the feedback flow */
	onClose: () => void;
	/** Use dynamic form mode */
	useDynamicForm: true;
	/** Event ID for form assignment lookup */
	eventId?: number;
	/** Event date ID for form assignment lookup */
	eventDateId?: number;
	/** Event slot ID for form assignment lookup */
	eventSlotId?: number;
	/** Location name (for display in questions) */
	locationName?: string;
	/** Visit date (for display in questions) */
	visitDate?: string;
	/** Reservation ID (optional, for tracking) */
	reservationId?: string;
}

type FeedbackContainerProps = LegacyFeedbackContainerProps | DynamicFeedbackContainerPropsInternal;

/**
 * Type guard to check if props are for dynamic mode
 */
const isDynamicMode = (
	props: FeedbackContainerProps
): props is DynamicFeedbackContainerPropsInternal => {
	return props.useDynamicForm === true;
};

/**
 * Legacy FeedbackContainer (backward compatible)
 */
const LegacyFeedbackContainer: React.FC<LegacyFeedbackContainerProps> = ({
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

/**
 * Dynamic FeedbackContainer (new mode with API-driven forms)
 */
const DynamicFeedbackContainer: React.FC<DynamicFeedbackContainerPropsInternal> = ({
	isOpen,
	onClose,
	eventId,
	eventDateId,
	eventSlotId,
	locationName,
	visitDate,
}) => {
	const [modalState, setModalState] = useState<FeedbackModalState>("form");
	const [form, setForm] = useState<FeedbackForm | null>(null);
	const [isLoadingForm, setIsLoadingForm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Fetch form configuration when modal opens
	 */
	useEffect(() => {
		const fetchForm = async () => {
			if (!isOpen || form) return;

			setIsLoadingForm(true);
			setError(null);

			try {
				const response = await feedbackApiService.getFormByAssignment({
					eventId,
					eventDateId,
					eventSlotId,
				});

				if (response.success && response.form) {
					setForm(response.form);
				} else {
					setError(response.message || "Failed to load feedback form");
				}
			} catch (err: any) {
				console.error("Failed to fetch form:", err);
				setError(err.message || "Failed to load feedback form");
			} finally {
				setIsLoadingForm(false);
			}
		};

		fetchForm();
	}, [isOpen, form, eventId, eventDateId, eventSlotId]);

	/**
	 * Handle successful submission
	 */
	const handleSubmitSuccess = useCallback(() => {
		setModalState("confirmation");
	}, []);

	/**
	 * Handle submission error
	 */
	const handleSubmitError = useCallback((errorMsg: string) => {
		setError(errorMsg);
	}, []);

	/**
	 * Handle closing the feedback flow
	 */
	const handleClose = useCallback(() => {
		// Reset state when closing
		setModalState("form");
		setForm(null);
		setError(null);
		onClose();
	}, [onClose]);

	/**
	 * Handle closing the confirmation
	 */
	const handleConfirmationClose = useCallback(() => {
		handleClose();
	}, [handleClose]);

	// Don't render anything if not open
	if (!isOpen) {
		return null;
	}

	return (
		<>
			{/* Dynamic Feedback Form Modal */}
			{modalState === "form" && (
				<FeedbackSessionProvider
					form={form}
					eventId={eventId}
					eventDateId={eventDateId}
					eventSlotId={eventSlotId}
					onSubmitSuccess={handleSubmitSuccess}
					onSubmitError={handleSubmitError}
				>
					<DynamicFeedbackModal
						isOpen={isOpen && modalState === "form"}
						onClose={handleClose}
						locationName={locationName}
						visitDate={visitDate}
					/>
				</FeedbackSessionProvider>
			)}

			{/* Confirmation Modal */}
			<FeedbackConfirmation
				isOpen={isOpen && modalState === "confirmation"}
				onClose={handleConfirmationClose}
			/>

			{/* Error Toast */}
			{error && modalState === "form" && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
					{error}
				</div>
			)}
		</>
	);
};

/**
 * FeedbackContainer Component
 *
 * Unified container that supports both legacy and dynamic modes.
 */
const FeedbackContainer: React.FC<FeedbackContainerProps> = (props) => {
	if (isDynamicMode(props)) {
		return <DynamicFeedbackContainer {...props} />;
	}
	return <LegacyFeedbackContainer {...props} />;
};

export default FeedbackContainer;

/**
 * AssessmentContainer Component
 *
 * Container component that manages the assessment flow.
 * Handles the transition between form and confirmation states.
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 *   <AssessmentContainer
 *     isOpen={isAssessmentOpen}
 *     onClose={() => setIsAssessmentOpen(false)}
 *     onSubmitComplete={() => { ... }}
 *   />
 *
 * ============================================================================
 */

import React, { useState, useCallback, useEffect } from "react";
import AssessmentModal from "./components/AssessmentModal";
import AssessmentConfirmation from "./components/AssessmentConfirmation";
import { AssessmentProvider, useAssessment } from "./context";
import type { AssessmentContainerProps } from "./types";

const AssessmentContainerInternal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	onSubmitComplete?: () => void;
}> = ({ isOpen, onClose, onSubmitComplete }) => {
	const { modalState, saveProgress } = useAssessment();
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

	if (!isOpen && !showConfirmation) {
		return null;
	}

	return (
		<>
			<AssessmentModal
				isOpen={isOpen && !showConfirmation}
				onClose={handleClose}
			/>
			<AssessmentConfirmation
				isOpen={showConfirmation}
				onClose={handleConfirmationClose}
			/>
		</>
	);
};

const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
	isOpen,
	onClose,
	onSubmitComplete,
}) => {
	const handleSubmitError = useCallback((error: string) => {
		console.error("Assessment submission error:", error);
	}, []);

	if (!isOpen) {
		return null;
	}

	return (
		<AssessmentProvider onSubmitError={handleSubmitError}>
			<AssessmentContainerInternal
				isOpen={isOpen}
				onClose={onClose}
				onSubmitComplete={onSubmitComplete}
			/>
		</AssessmentProvider>
	);
};

export default AssessmentContainer;

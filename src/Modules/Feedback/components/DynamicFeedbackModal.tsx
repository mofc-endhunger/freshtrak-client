/**
 * DynamicFeedbackModal Component
 *
 * Modal dialog for collecting user feedback using dynamic form configuration.
 * Renders questions from API-driven form configuration instead of hardcoded layout.
 *
 * This component works with the FeedbackSessionContext for state management.
 */

import React, { useCallback, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { useFeedbackSession } from "../context";
import { cn } from "../../../lib/utils";
import localization from "../../Localization/LocalizationComponent";
import {
	FeedbackForm,
	FeedbackQuestionResponseDraft,
	DynamicFeedbackModalProps,
} from "../types";

/**
 * Inner modal content that uses the session context
 */
const DynamicFeedbackModalContent: React.FC<{
	onClose: () => void;
	locationName?: string;
	visitDate?: string;
}> = ({ onClose, locationName, visitDate }) => {
	const {
		form,
		responses,
		isLoading,
		isSubmitting,
		error,
		canSubmit,
		updateResponse,
		submitFeedback,
		resetResponses,
	} = useFeedbackSession();

	/**
	 * Handle form submission
	 */
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const success = await submitFeedback();
			if (success) {
				// Close will be handled by parent after showing confirmation
			}
		},
		[submitFeedback]
	);

	/**
	 * Handle modal close
	 */
	const handleClose = useCallback(() => {
		resetResponses();
		onClose();
	}, [resetResponses, onClose]);

	/**
	 * Handle response change
	 */
	const handleResponseChange = useCallback(
		(questionId: number, response: FeedbackQuestionResponseDraft) => {
			updateResponse(questionId, response);
		},
		[updateResponse]
	);

	/**
	 * Replace placeholders in star question text
	 */
	const processedForm = useMemo(() => {
		if (!form) return null;

		return {
			...form,
			questions: form.questions.map((q) => ({
				...q,
				starQuestion: q.starQuestion
					?.replace("{date}", visitDate || "")
					?.replace("{location}", locationName || ""),
			})),
		};
	}, [form, visitDate, locationName]);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="w-8 h-8 animate-spin text-text-primary" />
			</div>
		);
	}

	// No form state
	if (!processedForm) {
		return (
			<div className="p-5 text-center text-gray-500">
				Unable to load feedback form.
			</div>
		);
	}

	const headerTitle = processedForm.headerTitle || localization.feedback_title || "Give Feedback";
	const headerSubtitle = processedForm.headerSubtitle || 
		localization.feedback_description ||
		"Your feedback goes to your local food bank to assure you have a pleasant experience when getting resources.";

	return (
		<>
			{/* Green Header */}
			<DialogHeader className="bg-text-primary px-4 py-3 text-white relative rounded-t-lg">
				<DialogTitle className="text-base font-semibold text-white pr-8">
					{headerTitle}
					<div className="py-4">
						<h2 className="text-xl font-bold text-white mb-2">
							{headerTitle}
						</h2>
						<p className="text-sm text-white leading-relaxed">
							{headerSubtitle}
						</p>
					</div>
				</DialogTitle>
			</DialogHeader>

			{/* Form Content */}
			<form onSubmit={handleSubmit} className="p-5 space-y-5 bg-white">
				{/* Dynamic Form Renderer */}
				<DynamicFormRenderer
					form={processedForm}
					responses={responses}
					onResponseChange={handleResponseChange}
				/>

				{/* Error Message */}
				{error && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{error}
					</div>
				)}

				{/* Submit Button */}
				<Button
					type="submit"
					disabled={!canSubmit || isSubmitting}
					className={cn(
						"w-full min-h-12 text-base font-semibold rounded-md",
						canSubmit
							? "bg-text-primary hover:bg-text-primary text-white"
							: "bg-gray-300 text-gray-500 cursor-not-allowed"
					)}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Submitting...
						</>
					) : (
						localization.feedback_submit || "Submit Feedback"
					)}
				</Button>
			</form>
		</>
	);
};

/**
 * DynamicFeedbackModal Component
 *
 * Note: This component expects to be wrapped with FeedbackSessionProvider
 * by the parent container.
 */
const DynamicFeedbackModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	locationName?: string;
	visitDate?: string;
}> = ({ isOpen, onClose, locationName, visitDate }) => {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[320px] sm:max-w-[320px] overflow-hidden bg-white border-0 shadow-xl"
				showCloseButton={true}
			>
				<DynamicFeedbackModalContent
					onClose={onClose}
					locationName={locationName}
					visitDate={visitDate}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default DynamicFeedbackModal;

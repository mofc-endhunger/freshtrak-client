/**
 * FeedbackModal Component
 *
 * Modal dialog for collecting user feedback on their visit experience.
 * Aligned with backend PRD: docs/backend/feedback-prd.md
 *
 * Structure:
 * 1. Header (questionnaire title)
 * 2. Overall Rating section (required 1-5 stars)
 * 3. Questionnaire Questions (each with prompt + 1-5 rating)
 * 4. Comments textarea (optional)
 * 5. Submit button
 */

import React, { useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { StarRating } from "../../../components/ui/star-rating";
import { Loader2 } from "lucide-react";
import QuestionnaireRenderer from "./QuestionnaireRenderer";
import { useFeedback } from "../context";
import { cn } from "../../../lib/utils";
import localization from "../../Localization/LocalizationComponent";

interface FeedbackModalInternalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the modal */
	onClose: () => void;
	/** Location name (for display) */
	locationName?: string;
	/** Visit date (for display) */
	visitDate?: string;
}

/**
 * Loading state content
 */
const LoadingContent: React.FC = () => (
	<div className="flex items-center justify-center p-8">
		<Loader2 className="w-8 h-8 animate-spin text-text-primary" />
	</div>
);

/**
 * Error state content
 */
const ErrorContent: React.FC<{ error: string; onRetry: () => void }> = ({
	error,
	onRetry,
}) => (
	<div className="p-5 text-center space-y-4">
		<p className="text-red-600">{error}</p>
		<Button onClick={onRetry} variant="outline">
			Try Again
		</Button>
	</div>
);

/**
 * Already submitted state content
 */
const AlreadySubmittedContent: React.FC<{
	rating: number;
	comments: string | null;
	onClose: () => void;
}> = ({ rating, comments, onClose }) => (
	<div className="p-5 space-y-4">
		<div className="text-center">
			<p className="text-gray-700 mb-4">
				You have already submitted feedback for this visit.
			</p>
			<div className="mb-4">
				<p className="text-sm text-gray-500 mb-2">Your rating:</p>
				<StarRating value={rating} readOnly size="lg" className="justify-center" />
			</div>
			{comments && (
				<div className="text-left bg-gray-50 p-3 rounded-md">
					<p className="text-sm text-gray-500 mb-1">Your comments:</p>
					<p className="text-sm text-gray-700">{comments}</p>
				</div>
			)}
		</div>
		<Button onClick={onClose} className="w-full bg-text-primary hover:bg-text-primary/90">
			Close
		</Button>
	</div>
);

/**
 * Main feedback form content
 */
const FeedbackFormContent: React.FC<{
	locationName?: string;
	visitDate?: string;
}> = ({ locationName, visitDate }) => {
	const {
		questionnaire,
		formState,
		modalState,
		canSubmit,
		error,
		setRating,
		setComments,
		setQuestionResponse,
		submitFeedback,
	} = useFeedback();

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			await submitFeedback();
		},
		[submitFeedback]
	);

	const isSubmitting = modalState === "submitting";

	// Format the overall rating question
	const overallRatingQuestion = (
		localization.feedback_visit_question ||
		"How was your visit{date}{location}?"
	)
		.replace("{date}", visitDate ? ` on ${visitDate}` : "")
		.replace("{location}", locationName ? ` to ${locationName}` : "");

	return (
		<form onSubmit={handleSubmit} className="p-5 space-y-5 bg-white">
			{/* Overall Rating Section (Required) */}
			<div>
				<p className="text-sm font-semibold text-gray-800 mb-3">
					{overallRatingQuestion}
					<span className="text-red-500 ml-1" aria-label="required">
						*
					</span>
				</p>
				<StarRating
					value={formState.rating}
					onChange={setRating}
					size="lg"
					className="justify-start"
					data-testid="overall-rating"
				/>
			</div>

			{/* Questionnaire Questions */}
			{questionnaire && questionnaire.questions.length > 0 && (
				<div className="border-t pt-4">
					<QuestionnaireRenderer
						questions={questionnaire.questions}
						responses={formState.responses}
						onResponseChange={setQuestionResponse}
					/>
				</div>
			)}

			{/* Comments Section (Optional) */}
			<div>
			<label className="text-sm font-semibold text-gray-800 mb-2 block">
				Additional Comments
				<span className="text-gray-400 font-normal ml-1">
					(optional)
				</span>
			</label>
				<Textarea
					placeholder={
						localization.feedback_placeholder || "Share your feedback..."
					}
					value={formState.comments}
					onChange={(e) => setComments(e.target.value)}
					className="min-h-[100px] resize-none border-gray-300 focus:border-text-primary focus:ring-text-primary bg-white"
					maxLength={1000}
					data-testid="feedback-comments"
				/>
				<p className="text-xs text-gray-400 mt-1 text-right">
					{formState.comments.length}/1000
				</p>
			</div>

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
						? "bg-text-primary hover:bg-text-primary/90 text-white"
						: "bg-gray-300 text-gray-500 cursor-not-allowed"
				)}
				data-testid="submit-feedback"
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
	);
};

/**
 * FeedbackModal Component
 *
 * Must be wrapped with FeedbackProvider
 */
const FeedbackModal: React.FC<FeedbackModalInternalProps> = ({
	isOpen,
	onClose,
	locationName,
	visitDate,
}) => {
	const { questionnaire, modalState, existingFeedback, error, reload } = useFeedback();

	const handleClose = () => {
		onClose();
	};

	const renderContent = () => {
		switch (modalState) {
			case "loading":
				return <LoadingContent />;

			case "error":
				return <ErrorContent error={error || "An error occurred"} onRetry={reload} />;

			case "no_survey_found":
				return (
					<div className="p-5 text-center space-y-4">
						<p className="text-gray-700">
							No survey found for this reservation.
						</p>
						<Button onClick={handleClose} className="w-full bg-text-primary hover:bg-text-primary/90">
							Close
						</Button>
					</div>
				);

			case "already_submitted":
				return (
					<AlreadySubmittedContent
						rating={existingFeedback?.rating || 0}
						comments={existingFeedback?.comments || null}
						onClose={handleClose}
					/>
				);

			case "form":
			case "submitting":
				return (
					<FeedbackFormContent
						locationName={locationName}
						visitDate={visitDate}
					/>
				);

			case "confirmation":
				// Confirmation is handled by FeedbackConfirmation component
				return null;

			default:
				return null;
		}
	};

	// Get title from questionnaire or use default
	const title =
		questionnaire?.title ||
		localization.feedback_title ||
		"Give Feedback";

	const description =
		localization.feedback_description ||
		"Your feedback helps us improve our services.";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[360px] sm:max-w-[360px] overflow-hidden bg-white border-0 shadow-xl"
				showCloseButton={true}
			>
				{/* Green Header */}
				<DialogHeader className="bg-text-primary px-4 py-3 text-white relative rounded-t-lg">
					<DialogTitle className="text-base font-semibold text-white pr-8">
						{title}
						<div className="py-3">
							<h2 className="text-lg font-bold text-white mb-1">{title}</h2>
							<p className="text-sm text-white/90 leading-relaxed font-normal">
								{description}
							</p>
						</div>
					</DialogTitle>
				</DialogHeader>

				{/* Content */}
				{renderContent()}
			</DialogContent>
		</Dialog>
	);
};

export default FeedbackModal;

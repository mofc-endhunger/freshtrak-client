/**
 * FeedbackModal Component
 *
 * Modal dialog for collecting user feedback on their visit experience.
 * Includes star rating, experience tags, and text feedback.
 */

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { StarRating } from "../../../components/ui/star-rating";
import ExperienceTags from "./ExperienceTags";
import { ExperienceTag, FeedbackFormData } from "../types";
import { cn } from "../../../lib/utils";
import localization from "../../Localization/LocalizationComponent";

interface FeedbackModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the modal */
	onClose: () => void;
	/** Callback when feedback is submitted */
	onSubmit: (data: FeedbackFormData) => void;
	/** Whether submission is in progress */
	isSubmitting?: boolean;
	/** Reservation ID for the feedback */
	reservationId: string;
	/** Event/location name */
	locationName: string;
	/** Visit date (formatted string) */
	visitDate: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	isSubmitting = false,
	reservationId,
	locationName,
	visitDate,
}) => {
	const [rating, setRating] = useState<number>(0);
	const [selectedTags, setSelectedTags] = useState<ExperienceTag[]>([]);
	const [feedbackText, setFeedbackText] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (rating === 0) return;

		const formData: FeedbackFormData = {
			rating,
			experienceTags: selectedTags,
			feedbackText,
			reservationId,
			locationName,
			visitDate,
		};

		onSubmit(formData);
	};

	const handleClose = () => {
		// Reset form state when closing
		setRating(0);
		setSelectedTags([]);
		setFeedbackText("");
		onClose();
	};

	const isSubmitDisabled = rating === 0 || isSubmitting;

	// Format the visit question with date and location
	const visitQuestion = (
		localization.feedback_visit_question ||
		"How was your visit on {date} to {location}?"
	)
		.replace("{date}", visitDate)
		.replace("{location}", locationName);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[320px] sm:max-w-[320px] overflow-hidden bg-white border-0 shadow-xl"
				showCloseButton={true}
			>
				{/* Green Header */}
				<DialogHeader className="bg-text-primary px-4 py-3 text-white relative rounded-t-lg">
					<DialogTitle className="text-base font-semibold text-white pr-8">
						{localization.feedback_title || "Give Feedback"}
						{/* Title */}
					<div className="py-4">
						<h2 className="text-xl font-bold text-white mb-2">
							{localization.feedback_title || "Give Feedback"}
						</h2>
						<p className="text-sm text-white leading-relaxed">
							{localization.feedback_description ||
								"Your feedback goes to your local food bank to assure you have a pleasant experience when getting resources."}
						</p>
					</div>
					</DialogTitle>
				</DialogHeader>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-5 space-y-5 bg-white">
					

					{/* Star Rating Section */}
					<div>
						<p className="text-sm font-semibold text-gray-800 mb-3">
							{visitQuestion}
						</p>
						<StarRating
							value={rating}
							onChange={setRating}
							size="lg"
							className="justify-start"
						/>
					</div>

					{/* Experience Tags Section */}
					<div>
						<p className="text-sm font-semibold text-gray-800 mb-3">
							{localization.feedback_experience_label ||
								"Tell us about your experience."}
						</p>
						<ExperienceTags
							selectedTags={selectedTags}
							onChange={setSelectedTags}
						/>
					</div>

					{/* Text Feedback Section */}
					<div>
						<Textarea
							placeholder={
								localization.feedback_placeholder || "Share your feedback..."
							}
							value={feedbackText}
							onChange={(e) => setFeedbackText(e.target.value)}
							className="min-h-[100px] resize-none border-gray-300 focus:border-text-primary focus:ring-text-primary bg-white"
							maxLength={1000}
						/>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={isSubmitDisabled}
						className={cn(
							"w-full min-h-12 text-base font-semibold rounded-md",
							rating > 0
								? "bg-text-primary hover:bg-text-primary text-white"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						)}
					>
						{isSubmitting
							? "Submitting..."
							: localization.feedback_submit || "Submit Feedback"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default FeedbackModal;

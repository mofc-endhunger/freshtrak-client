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
import { X } from "lucide-react";
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
				className="p-0 gap-0 max-w-[320px] sm:max-w-[320px] overflow-hidden"
				showCloseButton={false}
			>
				{/* Green Header */}
				<DialogHeader className="bg-text-primary px-4 py-3 text-white relative">
					<DialogTitle className="text-base font-semibold text-white pr-8">
						{localization.feedback_title || "Give Feedback"}
					</DialogTitle>
					<button
						type="button"
						onClick={handleClose}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</DialogHeader>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-4 space-y-5">
					{/* Title */}
					<div>
						<h2 className="text-xl font-bold text-text-primary mb-2">
							{localization.feedback_title || "Give Feedback"}
						</h2>
						<p className="text-sm text-content-text">
							{localization.feedback_description ||
								"Your feedback goes to your local food bank to assure you have a pleasant experience when getting resources."}
						</p>
					</div>

					{/* Star Rating Section */}
					<div>
						<p className="text-sm font-semibold text-gray-900 mb-2">
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
						<p className="text-sm font-semibold text-gray-900 mb-2">
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
							className="min-h-[100px] resize-none"
							maxLength={1000}
						/>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={isSubmitDisabled}
						className={cn(
							"w-full min-h-12 text-base font-semibold uppercase",
							rating > 0
								? "bg-text-primary hover:bg-text-primary/90 text-white"
								: "bg-gray-200 text-gray-500 cursor-not-allowed"
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

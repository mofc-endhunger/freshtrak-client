/**
 * Feedback Module Types
 *
 * TypeScript interfaces for the Feedback feature.
 * Used for collecting user feedback on their visit experiences.
 */

/**
 * Experience tag identifiers
 */
export type ExperienceTag =
	| "kind_volunteers"
	| "good_service"
	| "clean_space"
	| "quality_food"
	| "efficient_shoppers";

/**
 * All available experience tags
 */
export const EXPERIENCE_TAGS: ExperienceTag[] = [
	"kind_volunteers",
	"good_service",
	"clean_space",
	"quality_food",
	"efficient_shoppers",
];

/**
 * Feedback form data structure
 */
export interface FeedbackFormData {
	/** Star rating from 1-5 */
	rating: number;
	/** Selected experience tags */
	experienceTags: ExperienceTag[];
	/** Optional written feedback */
	feedbackText: string;
	/** Reservation ID this feedback is for */
	reservationId: string;
	/** Event/location name */
	locationName: string;
	/** Visit date */
	visitDate: string;
}

/**
 * Feedback submission request payload
 */
export interface FeedbackSubmissionRequest {
	/** Reservation ID */
	reservation_id: string;
	/** Star rating (1-5) */
	rating: number;
	/** Selected experience tags */
	tags: ExperienceTag[];
	/** Written feedback text */
	feedback_text: string;
}

/**
 * Feedback submission response
 */
export interface FeedbackSubmissionResponse {
	/** Whether submission was successful */
	success: boolean;
	/** Response message */
	message: string;
	/** Generated feedback ID */
	feedback_id?: string;
	/** Submission timestamp */
	timestamp?: string;
}

/**
 * Feedback modal state
 */
export type FeedbackModalState = "form" | "confirmation" | "closed";

/**
 * Props for FeedbackModal component
 */
export interface FeedbackModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the modal */
	onClose: () => void;
	/** Reservation ID for the feedback */
	reservationId: string;
	/** Event/location name */
	locationName: string;
	/** Visit date */
	visitDate: string;
}

/**
 * Props for StarRating component
 */
export interface StarRatingProps {
	/** Current rating value (0-5) */
	value: number;
	/** Callback when rating changes */
	onChange: (rating: number) => void;
	/** Whether the rating is read-only */
	readOnly?: boolean;
	/** Size of stars */
	size?: "sm" | "md" | "lg";
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for ExperienceTags component
 */
export interface ExperienceTagsProps {
	/** Currently selected tags */
	selectedTags: ExperienceTag[];
	/** Callback when tags change */
	onChange: (tags: ExperienceTag[]) => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for FeedbackConfirmation component
 */
export interface FeedbackConfirmationProps {
	/** Callback to close the confirmation */
	onClose: () => void;
}

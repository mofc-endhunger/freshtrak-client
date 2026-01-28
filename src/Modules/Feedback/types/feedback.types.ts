/**
 * Feedback Module Types
 *
 * TypeScript interfaces for the Feedback feature.
 * Used for collecting user feedback on their visit experiences.
 *
 * ============================================================================
 * SCHEMA MIGRATION:
 * ============================================================================
 * This file contains both legacy types (ExperienceTag, etc.) and new dynamic
 * form types (FeedbackForm, FeedbackFormQuestion, etc.) to support the
 * migration to a database-driven feedback system.
 *
 * Legacy types are marked @deprecated and will be removed once migration
 * is complete.
 * ============================================================================
 */

// ============================================================================
// NEW DYNAMIC FORM TYPES (feedback.txt schema)
// ============================================================================

/**
 * Dynamic feedback form configuration from API
 * Maps to: feedback_forms table
 */
export interface FeedbackForm {
	/** Unique form identifier */
	id: number;
	/** Internal form name */
	name: string;
	/** Header title displayed in modal (default: "Give Feedback") */
	headerTitle: string;
	/** Optional subtitle for the header */
	headerSubtitle?: string;
	/** Whether form is standalone (not tied to event/date/slot) */
	isStandalone: boolean;
	/** Whether user can submit multiple responses to this form */
	allowMultipleResponses: boolean;
	/** Whether the form is active */
	isActive: boolean;
	/** Ordered list of questions */
	questions: FeedbackFormQuestion[];
}

/**
 * Individual question within a feedback form
 * Maps to: feedback_forms_questions table
 *
 * Each section (star rating, tags, comment) is optional based on field presence
 */
export interface FeedbackFormQuestion {
	/** Unique question identifier */
	id: number;
	/** Form this question belongs to */
	feedbackFormId: number;
	/** Order of this question in the form (1-indexed) */
	displayOrder: number;
	/** If present, show star rating section with this prompt */
	starQuestion?: string;
	/** If present, show tags section with this prompt */
	tagPrompt?: string;
	/** Whether multiple tags can be selected (default: true) */
	isTagMultiSelect: boolean;
	/** If present, show comment section with this placeholder */
	commentPlaceholder?: string;
	/** Whether the question is active */
	isActive: boolean;
	/** Available tags for this question (if tagPrompt exists) */
	tags: FeedbackFormQuestionTag[];
}

/**
 * Tag option for a question
 * Maps to: feedback_forms_questions_tags table
 */
export interface FeedbackFormQuestionTag {
	/** Unique tag identifier */
	id: number;
	/** Question this tag belongs to */
	feedbackFormQuestionId: number;
	/** Display text for the tag */
	tagText: string;
	/** Order of this tag in the list */
	displayOrder: number;
	/** Whether the tag is active */
	isActive: boolean;
}

/**
 * Form assignment to event/date/slot
 * Maps to: feedback_forms_assignments table
 */
export interface FeedbackFormAssignment {
	/** Unique assignment identifier */
	id: number;
	/** Form being assigned */
	feedbackFormId: number;
	/** Event ID (nullable for standalone) */
	eventId?: number;
	/** Event date ID (nullable) */
	eventDateId?: number;
	/** Event slot ID (nullable) */
	eventSlotId?: number;
	/** Whether the assignment is active */
	isActive: boolean;
}

/**
 * User session for a feedback form
 * Maps to: feedback_sessions table
 *
 * Tracks user progress and allows resuming incomplete feedback
 */
export interface FeedbackSession {
	/** Unique session identifier */
	id: number;
	/** Form this session is for */
	feedbackFormId: number;
	/** User ID (nullable for guests) */
	userId?: number;
	/** Event ID (nullable for standalone) */
	eventId?: number;
	/** Event date ID (nullable) */
	eventDateId?: number;
	/** Event slot ID (nullable) */
	eventSlotId?: number;
	/** When the session was completed (null = in progress) */
	completedAt?: string;
	/** Session creation timestamp */
	createdAt: string;
	/** Last update timestamp */
	updatedAt: string;
	/** Existing responses for this session (for resume) */
	responses?: FeedbackResponse[];
}

/**
 * Response to a single question
 * Maps to: feedback_responses table
 */
export interface FeedbackResponse {
	/** Unique response identifier */
	id: number;
	/** Session this response belongs to */
	feedbackSessionId: number;
	/** Question being answered */
	feedbackFormQuestionId: number;
	/** Star rating value (1-5, nullable) */
	starRating?: number;
	/** Comment text (nullable) */
	commentText?: string;
	/** Response creation timestamp */
	createdAt: string;
	/** Selected tags for this response */
	selectedTags?: FeedbackResponseTag[];
}

/**
 * Selected tag for a response
 * Maps to: feedback_responses_tags table
 */
export interface FeedbackResponseTag {
	/** Unique identifier */
	id: number;
	/** Response this tag selection belongs to */
	feedbackResponseId: number;
	/** Tag that was selected */
	feedbackFormQuestionTagId: number;
	/** Selection timestamp */
	createdAt: string;
}

/**
 * In-memory response state for a question (before submission)
 */
export interface FeedbackQuestionResponseDraft {
	/** Question being answered */
	questionId: number;
	/** Star rating value (1-5, optional) */
	starRating?: number;
	/** Comment text (optional) */
	commentText?: string;
	/** Selected tag IDs */
	selectedTagIds: number[];
}

/**
 * Request to create a new feedback session
 */
export interface CreateSessionRequest {
	/** Form ID */
	feedbackFormId: number;
	/** Event ID (optional) */
	eventId?: number;
	/** Event date ID (optional) */
	eventDateId?: number;
	/** Event slot ID (optional) */
	eventSlotId?: number;
}

/**
 * Request to submit responses for a session
 */
export interface SubmitResponsesRequest {
	/** Session ID */
	sessionId: number;
	/** Responses to submit */
	responses: FeedbackQuestionResponseDraft[];
}

/**
 * API response for session operations
 */
export interface SessionResponse {
	/** Whether operation was successful */
	success: boolean;
	/** Response message */
	message: string;
	/** Session data (on success) */
	session?: FeedbackSession;
}

/**
 * API response for form fetch operations
 */
export interface FormResponse {
	/** Whether operation was successful */
	success: boolean;
	/** Response message */
	message: string;
	/** Form data (on success) */
	form?: FeedbackForm;
}

/**
 * Parameters for looking up a form by assignment
 */
export interface FormAssignmentLookup {
	/** Event ID */
	eventId?: number;
	/** Event date ID */
	eventDateId?: number;
	/** Event slot ID */
	eventSlotId?: number;
}

// ============================================================================
// LEGACY TYPES (deprecated - for backward compatibility)
// ============================================================================

/**
 * Experience tag identifiers
 * @deprecated Use FeedbackFormQuestionTag with dynamic tags from API instead
 */
export type ExperienceTag =
	| "kind_volunteers"
	| "good_service"
	| "clean_space"
	| "quality_food"
	| "efficient_shoppers";

/**
 * All available experience tags
 * @deprecated Use dynamic tags from FeedbackFormQuestion.tags instead
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
 * @deprecated Use FeedbackQuestionResponseDraft[] with dynamic forms instead
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
 * Props for ExperienceTags component (legacy mode)
 * @deprecated Use DynamicTagsProps for new dynamic tags component
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

// ============================================================================
// NEW COMPONENT PROPS
// ============================================================================

/**
 * Props for DynamicTags component
 */
export interface DynamicTagsProps {
	/** Available tags from the question config */
	tags: FeedbackFormQuestionTag[];
	/** Currently selected tag IDs */
	selectedTagIds: number[];
	/** Callback when tag selection changes */
	onChange: (tagIds: number[]) => void;
	/** Whether multiple tags can be selected */
	multiSelect?: boolean;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for QuestionRenderer component
 */
export interface QuestionRendererProps {
	/** Question configuration */
	question: FeedbackFormQuestion;
	/** Current response draft for this question */
	response: FeedbackQuestionResponseDraft;
	/** Callback when response changes */
	onResponseChange: (response: FeedbackQuestionResponseDraft) => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for DynamicFormRenderer component
 */
export interface DynamicFormRendererProps {
	/** Form configuration */
	form: FeedbackForm;
	/** Current response drafts (keyed by questionId) */
	responses: Map<number, FeedbackQuestionResponseDraft>;
	/** Callback when any response changes */
	onResponseChange: (questionId: number, response: FeedbackQuestionResponseDraft) => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for FeedbackModal (updated for dynamic forms)
 */
export interface DynamicFeedbackModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the modal */
	onClose: () => void;
	/** Callback when feedback is submitted */
	onSubmit: (responses: FeedbackQuestionResponseDraft[]) => void;
	/** Form configuration (if null, shows loading state) */
	form: FeedbackForm | null;
	/** Whether submission is in progress */
	isSubmitting?: boolean;
	/** Whether form is loading */
	isLoading?: boolean;
	/** Error message to display */
	error?: string | null;
}

/**
 * Props for FeedbackContainer (updated for dynamic forms)
 */
export interface DynamicFeedbackContainerProps {
	/** Whether the feedback flow is open */
	isOpen: boolean;
	/** Callback to close the feedback flow */
	onClose: () => void;
	/** Event ID for form assignment lookup */
	eventId?: number;
	/** Event date ID for form assignment lookup */
	eventDateId?: number;
	/** Event slot ID for form assignment lookup */
	eventSlotId?: number;
	/** Reservation ID (for backward compatibility) */
	reservationId?: string;
	/** Location name (for backward compatibility) */
	locationName?: string;
	/** Visit date (for backward compatibility) */
	visitDate?: string;
}

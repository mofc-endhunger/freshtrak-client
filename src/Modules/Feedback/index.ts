/**
 * Feedback Module Exports
 *
 * ============================================================================
 * COMPONENTS:
 * ============================================================================
 *
 * Main Components:
 * - FeedbackContainer - Main container component (manages feedback flow)
 * - FeedbackModal - Feedback form modal with rating, questions, and comments
 * - FeedbackConfirmation - Thank you confirmation modal
 *
 * Rendering Components:
 * - QuestionnaireRenderer - Renders all questionnaire questions
 * - QuestionRenderer - Renders a single question (scale_1_5 type)
 *
 * Context:
 * - FeedbackProvider - Context provider for state management
 * - useFeedback - Hook to access feedback context
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 *   import { FeedbackContainer } from "@/Modules/Feedback";
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

// Main container
export { default as FeedbackContainer } from "./FeedbackContainer";

// Modal components
export { default as FeedbackModal } from "./components/FeedbackModal";
export { default as FeedbackConfirmation } from "./components/FeedbackConfirmation";

// Rendering components
export { default as QuestionnaireRenderer } from "./components/QuestionnaireRenderer";
export { default as QuestionRenderer } from "./components/QuestionRenderer";

// Context and hooks
export { FeedbackProvider, useFeedback } from "./context";

// Types
export * from "./types";

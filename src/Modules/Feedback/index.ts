/**
 * Feedback Module Exports
 *
 * ============================================================================
 * COMPONENTS:
 * ============================================================================
 *
 * LEGACY (backward compatible):
 * - FeedbackContainer - Main container (supports both legacy and dynamic modes)
 * - FeedbackModal - Hardcoded feedback form modal
 * - ExperienceTags - Hardcoded experience tags
 *
 * NEW DYNAMIC FORM COMPONENTS:
 * - DynamicFeedbackModal - API-driven feedback form modal
 * - DynamicFormRenderer - Renders dynamic questions from config
 * - QuestionRenderer - Renders a single question with star/tags/comment sections
 * - DynamicTags - Dynamic tag selection component
 *
 * CONTEXT:
 * - FeedbackSessionProvider - Context provider for session management
 * - useFeedbackSession - Hook to access session context
 *
 * ============================================================================
 */

// Main container (supports both legacy and dynamic modes)
export { default as FeedbackContainer } from "./FeedbackContainer";

// Legacy components (backward compatible)
export { default as FeedbackModal } from "./components/FeedbackModal";
export { default as FeedbackConfirmation } from "./components/FeedbackConfirmation";
export { default as ExperienceTags } from "./components/ExperienceTags";

// New dynamic form components
export { default as DynamicFeedbackModal } from "./components/DynamicFeedbackModal";
export { default as DynamicFormRenderer } from "./components/DynamicFormRenderer";
export { default as QuestionRenderer } from "./components/QuestionRenderer";
export { default as DynamicTags } from "./components/DynamicTags";

// Context and hooks
export { FeedbackSessionProvider, useFeedbackSession } from "./context";

// Types
export * from "./types";

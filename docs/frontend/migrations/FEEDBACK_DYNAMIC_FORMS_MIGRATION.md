# Feedback Module - Dynamic Forms Migration

**Date:** January 26, 2026  
**Version:** 1.0.0  
**Status:** Complete  

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Changes](#architecture-changes)
3. [File Changes Summary](#file-changes-summary)
4. [Phase 1: TypeScript Interfaces](#phase-1-typescript-interfaces)
5. [Phase 2: API Service Updates](#phase-2-api-service-updates)
6. [Phase 3: Session Management Context](#phase-3-session-management-context)
7. [Phase 4: Component Refactoring](#phase-4-component-refactoring)
8. [Phase 5: Integration Points](#phase-5-integration-points)
9. [Phase 6: Backend Documentation](#phase-6-backend-documentation)
10. [Usage Guide](#usage-guide)
11. [Migration Path](#migration-path)
12. [Testing Considerations](#testing-considerations)

---

## Overview

This migration transforms the Feedback module from a hardcoded, single-form implementation to a scalable, API-driven dynamic form system. The new architecture supports:

- **Multiple questions per form** with configurable display order
- **Dynamic tags** defined per question (not hardcoded)
- **Flexible form assignments** to events, dates, or slots
- **Session management** for tracking user progress
- **Per-question responses** with optional star rating, tags, and comments
- **Full backward compatibility** with the existing implementation

### Goals

1. Support the proposed database schema from `docs/frontend/features/feedback.txt`
2. Maintain backward compatibility with existing code
3. Prepare for backend API integration (currently using mock data)
4. Keep tags functionality (requesting backend team support)

### Non-Goals

- Breaking changes to existing components
- Removal of legacy code (deprecated but preserved)
- Backend implementation (frontend-only migration)

---

## Architecture Changes

### Before (Legacy)

```
FeedbackContainer
└── FeedbackModal (hardcoded layout)
    ├── StarRating (single)
    ├── ExperienceTags (hardcoded EXPERIENCE_TAGS array)
    └── Textarea (single)
```

### After (Dynamic)

```
FeedbackContainer
├── [Legacy Mode] FeedbackModal (unchanged)
└── [Dynamic Mode] FeedbackSessionProvider
    └── DynamicFeedbackModal
        └── DynamicFormRenderer
            └── QuestionRenderer (for each question)
                ├── StarRating (if starQuestion exists)
                ├── DynamicTags (if tagPrompt exists)
                └── Textarea (if commentPlaceholder exists)
```

### Data Flow

```
1. FeedbackContainer opens
2. API call: getFormByAssignment({ eventId, eventDateId, eventSlotId })
3. Form config received with questions and tags
4. FeedbackSessionProvider creates session via API
5. User fills out form (responses stored in context)
6. Submit: API call with all question responses
7. Success: Show confirmation modal
```

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Modified | `src/Modules/Feedback/types/feedback.types.ts` | Added 15+ new interfaces |
| Modified | `src/Services/FeedbackApiService.ts` | Added 5 new API methods with mocks |
| Created | `src/Modules/Feedback/context/FeedbackSessionContext.tsx` | Session management context |
| Created | `src/Modules/Feedback/context/index.ts` | Context exports |
| Created | `src/Modules/Feedback/components/DynamicTags.tsx` | Dynamic tags component |
| Created | `src/Modules/Feedback/components/QuestionRenderer.tsx` | Single question renderer |
| Created | `src/Modules/Feedback/components/DynamicFormRenderer.tsx` | Multi-question form renderer |
| Created | `src/Modules/Feedback/components/DynamicFeedbackModal.tsx` | New modal component |
| Modified | `src/Modules/Feedback/FeedbackContainer.tsx` | Dual-mode support |
| Modified | `src/Modules/Feedback/index.ts` | Export new components |
| Modified | `src/Modules/Reservations/types/reservation.types.ts` | Added slot/date IDs |
| Modified | `src/Modules/Reservations/components/ReservationCard.tsx` | Dynamic feedback prop |
| Created | `docs/backend/FEEDBACK_TAGS_REQUEST.md` | Backend API request |

---

## Phase 1: TypeScript Interfaces

**File:** `src/Modules/Feedback/types/feedback.types.ts`

### New Interfaces Added

#### Form Configuration Types

| Interface | Purpose | Key Fields |
|-----------|---------|------------|
| `FeedbackForm` | Form configuration from API | `id`, `headerTitle`, `headerSubtitle`, `questions[]` |
| `FeedbackFormQuestion` | Single question config | `starQuestion?`, `tagPrompt?`, `commentPlaceholder?`, `tags[]` |
| `FeedbackFormQuestionTag` | Tag option for a question | `id`, `tagText`, `displayOrder` |
| `FeedbackFormAssignment` | Form-to-event mapping | `eventId?`, `eventDateId?`, `eventSlotId?` |

#### Session & Response Types

| Interface | Purpose | Key Fields |
|-----------|---------|------------|
| `FeedbackSession` | User session tracking | `id`, `feedbackFormId`, `completedAt?`, `responses?` |
| `FeedbackResponse` | Stored response (from API) | `starRating?`, `commentText?`, `selectedTags?` |
| `FeedbackResponseTag` | Tag selection record | `feedbackFormQuestionTagId` |
| `FeedbackQuestionResponseDraft` | In-memory response state | `starRating?`, `commentText?`, `selectedTagIds[]` |

#### API Request/Response Types

| Interface | Purpose |
|-----------|---------|
| `CreateSessionRequest` | Create new session payload |
| `SubmitResponsesRequest` | Submit responses payload |
| `SessionResponse` | API response for session operations |
| `FormResponse` | API response for form fetch |
| `FormAssignmentLookup` | Query params for form lookup |

#### Component Props Types

| Interface | Component |
|-----------|-----------|
| `DynamicTagsProps` | `DynamicTags` |
| `QuestionRendererProps` | `QuestionRenderer` |
| `DynamicFormRendererProps` | `DynamicFormRenderer` |
| `DynamicFeedbackModalProps` | `DynamicFeedbackModal` |
| `DynamicFeedbackContainerProps` | `FeedbackContainer` (dynamic mode) |

### Deprecated Types

The following types are marked `@deprecated` but preserved for backward compatibility:

- `ExperienceTag` - Use `FeedbackFormQuestionTag` instead
- `EXPERIENCE_TAGS` - Use dynamic tags from API
- `FeedbackFormData` - Use `FeedbackQuestionResponseDraft[]`
- `ExperienceTagsProps` - Use `DynamicTagsProps`

---

## Phase 2: API Service Updates

**File:** `src/Services/FeedbackApiService.ts`

### New API Methods

#### `getForm(formId: number): Promise<FormResponse>`

Fetches form configuration by ID.

```typescript
const response = await feedbackApiService.getForm(1);
if (response.success) {
  console.log(response.form); // FeedbackForm
}
```

#### `getFormByAssignment(params: FormAssignmentLookup): Promise<FormResponse>`

Fetches form configuration by event/date/slot assignment.

```typescript
const response = await feedbackApiService.getFormByAssignment({
  eventId: 123,
  eventDateId: 456,
  eventSlotId: 789,
});
```

**Lookup Priority:**
1. Exact slot match (`eventSlotId`)
2. Date match (`eventDateId`)
3. Event match (`eventId`)
4. Default form (no assignment)

#### `createSession(request: CreateSessionRequest): Promise<SessionResponse>`

Creates a new feedback session.

```typescript
const response = await feedbackApiService.createSession({
  feedbackFormId: 1,
  eventId: 123,
});
if (response.success) {
  console.log(response.session.id); // Session ID
}
```

#### `getSession(sessionId: number): Promise<SessionResponse>`

Retrieves session with existing responses (for resume functionality).

```typescript
const response = await feedbackApiService.getSession(12345);
if (response.success) {
  console.log(response.session.responses); // Existing responses
}
```

#### `submitSessionResponses(request: SubmitResponsesRequest): Promise<SessionResponse>`

Submits all responses for a session.

```typescript
const response = await feedbackApiService.submitSessionResponses({
  sessionId: 12345,
  responses: [
    { questionId: 1, starRating: 5, selectedTagIds: [1, 2] },
    { questionId: 2, commentText: "Great!" },
  ],
});
```

### Mock Data

Two mock forms are provided for testing:

1. **MOCK_DEFAULT_FORM (ID: 1)** - Matches current hardcoded layout
   - Single question with star rating, tags, and comment

2. **MOCK_MULTI_QUESTION_FORM (ID: 2)** - Multi-question example
   - Q1: Star rating only
   - Q2: Tags for "what you liked"
   - Q3: Tags for "what to improve"
   - Q4: Comment only

### Storage Keys

```typescript
const SESSIONS_STORAGE_KEY = "freshtrak_feedback_sessions";
const RESPONSES_STORAGE_KEY = "freshtrak_feedback_responses";
```

---

## Phase 3: Session Management Context

**File:** `src/Modules/Feedback/context/FeedbackSessionContext.tsx`

### Purpose

Manages feedback session state, tracks in-progress responses, and handles submission.

### Context Value

```typescript
interface FeedbackSessionContextValue {
  // State
  form: FeedbackForm | null;
  session: FeedbackSession | null;
  responses: Map<number, FeedbackQuestionResponseDraft>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  canSubmit: boolean;

  // Methods
  updateResponse: (questionId: number, response: FeedbackQuestionResponseDraft) => void;
  getResponse: (questionId: number) => FeedbackQuestionResponseDraft;
  submitFeedback: () => Promise<boolean>;
  resetResponses: () => void;
  clearError: () => void;
}
```

### Provider Props

```typescript
interface FeedbackSessionProviderProps {
  form: FeedbackForm | null;
  eventId?: number;
  eventDateId?: number;
  eventSlotId?: number;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  children: React.ReactNode;
}
```

### Key Behaviors

1. **Auto-initialization:** When `form` prop changes, initializes empty responses for all questions
2. **Session creation:** Automatically creates session via API when form is available
3. **Validation:** `canSubmit` returns `true` only if at least one star rating is provided
4. **Submission:** Filters out empty responses before submitting

### Usage

```tsx
<FeedbackSessionProvider
  form={formConfig}
  eventId={123}
  onSubmitSuccess={() => setModalState("confirmation")}
>
  <DynamicFeedbackModal isOpen={true} onClose={handleClose} />
</FeedbackSessionProvider>
```

---

## Phase 4: Component Refactoring

### DynamicTags

**File:** `src/Modules/Feedback/components/DynamicTags.tsx`

Renders tag selection from dynamic tag list (replaces hardcoded `ExperienceTags`).

#### Props

```typescript
interface DynamicTagsProps {
  tags: FeedbackFormQuestionTag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  multiSelect?: boolean;  // default: true
  className?: string;
}
```

#### Features

- Sorts tags by `displayOrder`
- Supports single-select and multi-select modes
- Same styling as legacy `ExperienceTags`
- Accessible: `role="checkbox"` (multi) or `role="radio"` (single)

---

### QuestionRenderer

**File:** `src/Modules/Feedback/components/QuestionRenderer.tsx`

Renders a single question with conditional sections.

#### Props

```typescript
interface QuestionRendererProps {
  question: FeedbackFormQuestion;
  response: FeedbackQuestionResponseDraft;
  onResponseChange: (response: FeedbackQuestionResponseDraft) => void;
  className?: string;
}
```

#### Conditional Rendering Logic

```typescript
const hasStarSection = !!question.starQuestion;
const hasTagsSection = !!question.tagPrompt && question.tags.length > 0;
const hasCommentSection = !!question.commentPlaceholder;
```

| Field | Section Rendered |
|-------|-----------------|
| `starQuestion` | StarRating component with prompt |
| `tagPrompt` + `tags[]` | DynamicTags component with prompt |
| `commentPlaceholder` | Textarea with placeholder |

---

### DynamicFormRenderer

**File:** `src/Modules/Feedback/components/DynamicFormRenderer.tsx`

Renders all questions from form configuration.

#### Props

```typescript
interface DynamicFormRendererProps {
  form: FeedbackForm;
  responses: Map<number, FeedbackQuestionResponseDraft>;
  onResponseChange: (questionId: number, response: FeedbackQuestionResponseDraft) => void;
  className?: string;
}
```

#### Features

- Filters inactive questions (`isActive: true`)
- Sorts by `displayOrder`
- Handles empty form state with message

---

### DynamicFeedbackModal

**File:** `src/Modules/Feedback/components/DynamicFeedbackModal.tsx`

Modal dialog using dynamic form configuration.

#### Props

```typescript
interface DynamicFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
  visitDate?: string;
}
```

#### Features

- **Must be wrapped with `FeedbackSessionProvider`**
- Uses `useFeedbackSession()` hook for state
- Dynamic header from `form.headerTitle` and `form.headerSubtitle`
- Placeholder replacement: `{date}` and `{location}` in `starQuestion`
- Loading state with spinner
- Error display
- Submit button disabled until `canSubmit` is true

---

### FeedbackContainer (Updated)

**File:** `src/Modules/Feedback/FeedbackContainer.tsx`

Updated to support both legacy and dynamic modes.

#### Mode Selection

```typescript
// Legacy mode (default)
<FeedbackContainer
  isOpen={true}
  onClose={handleClose}
  reservationId="123"
  locationName="Food Bank"
  visitDate="Jan 15, 2026"
/>

// Dynamic mode
<FeedbackContainer
  isOpen={true}
  onClose={handleClose}
  useDynamicForm={true}
  eventId={123}
  eventDateId={456}
  eventSlotId={789}
  locationName="Food Bank"
  visitDate="Jan 15, 2026"
/>
```

#### Internal Components

- `LegacyFeedbackContainer` - Original implementation (unchanged behavior)
- `DynamicFeedbackContainer` - New implementation with:
  - Form fetch on open
  - `FeedbackSessionProvider` wrapper
  - Session lifecycle management

---

## Phase 5: Integration Points

### ReservationCard Updates

**File:** `src/Modules/Reservations/components/ReservationCard.tsx`

#### New Prop

```typescript
interface ReservationCardProps {
  reservation: Reservation;
  variant?: "upcoming" | "past";
  onClick?: (reservation: Reservation) => void;
  useDynamicFeedback?: boolean;  // NEW - default: false
}
```

#### Usage

```tsx
// Legacy feedback (current behavior)
<ReservationCard reservation={reservation} variant="past" />

// Dynamic feedback (new feature)
<ReservationCard
  reservation={reservation}
  variant="past"
  useDynamicFeedback={true}
/>
```

### Reservation Type Updates

**File:** `src/Modules/Reservations/types/reservation.types.ts`

Added fields for form lookup:

```typescript
interface Reservation {
  // ... existing fields
  public_event_slot_id?: number;  // NEW
  public_event_date_id?: number;  // NEW
}
```

---

## Phase 6: Backend Documentation

**File:** `docs/backend/FEEDBACK_TAGS_REQUEST.md`

Created comprehensive request document for backend team including:

- Proposed schema additions (`feedback_forms_questions_tags`, `feedback_responses_tags`)
- Modified API contracts with tag support
- Validation rules
- Migration strategy (phased approach)
- Default tag set for seeding
- Questions for backend team

---

## Usage Guide

### Enable Dynamic Feedback for a Component

```tsx
import { FeedbackContainer } from "../../Modules/Feedback";

// In your component
<FeedbackContainer
  isOpen={isFeedbackOpen}
  onClose={() => setIsFeedbackOpen(false)}
  useDynamicForm={true}
  eventId={event.id}
  eventDateId={eventDate?.id}
  eventSlotId={eventSlot?.id}
  locationName={event.name}
  visitDate={formattedDate}
/>
```

### Access Session Context in Custom Components

```tsx
import { useFeedbackSession } from "../../Modules/Feedback";

const MyCustomComponent = () => {
  const {
    form,
    responses,
    updateResponse,
    submitFeedback,
    canSubmit,
    isSubmitting,
  } = useFeedbackSession();

  // Custom logic here
};
```

### Add New Mock Form for Testing

In `src/Services/FeedbackApiService.ts`:

```typescript
const MY_CUSTOM_FORM: FeedbackForm = {
  id: 100,
  name: "custom_form",
  headerTitle: "Custom Feedback",
  // ... other fields
};

// Add to MOCK_FORMS map
MOCK_FORMS.set(100, MY_CUSTOM_FORM);
```

---

## Migration Path

### For Existing Code

**No changes required.** The legacy mode is default and backward compatible.

### For New Features

1. Set `useDynamicFeedback={true}` on `ReservationCard`
2. Or use `useDynamicForm={true}` on `FeedbackContainer`
3. Ensure reservation data includes `public_event_slot_id` and `public_event_date_id`

### When Backend API is Ready

1. Set `USE_MOCK_DATA = false` in `FeedbackApiService.ts`
2. Verify API response format matches interfaces
3. Test full flow: fetch form → create session → submit responses

---

## Testing Considerations

### Unit Tests Needed

1. **Types:** Type guards for new interfaces
2. **API Service:** Mock implementations return correct data
3. **Context:** State management and submission logic
4. **Components:** Conditional rendering based on question config

### Integration Tests

1. Full flow with mock API
2. Legacy mode unchanged behavior
3. Dynamic mode with various form configurations
4. Error handling (network failures, validation errors)

### Manual Testing Checklist

- [ ] Legacy feedback flow still works
- [ ] Dynamic mode opens and loads form
- [ ] Questions render conditionally based on config
- [ ] Tag selection works (single and multi-select)
- [ ] Star rating required validation
- [ ] Submission succeeds and shows confirmation
- [ ] Error states display correctly
- [ ] Modal closes and resets state properly

---

## Appendix: Component Hierarchy

```
src/Modules/Feedback/
├── index.ts                              # Module exports
├── FeedbackContainer.tsx                 # Main container (dual-mode)
├── components/
│   ├── FeedbackModal.tsx                 # Legacy modal (unchanged)
│   ├── FeedbackConfirmation.tsx          # Success modal (unchanged)
│   ├── ExperienceTags.tsx                # Legacy tags (deprecated)
│   ├── DynamicFeedbackModal.tsx          # NEW: Dynamic modal
│   ├── DynamicFormRenderer.tsx           # NEW: Multi-question renderer
│   ├── QuestionRenderer.tsx              # NEW: Single question renderer
│   └── DynamicTags.tsx                   # NEW: Dynamic tags component
├── context/
│   ├── index.ts                          # Context exports
│   └── FeedbackSessionContext.tsx        # NEW: Session management
└── types/
    ├── index.ts                          # Type exports
    └── feedback.types.ts                 # All interfaces
```

---

## Changelog

### v1.0.0 (January 26, 2026)

- Initial migration to dynamic form system
- Added new TypeScript interfaces for schema
- Implemented API service with mock data
- Created session management context
- Built dynamic form components
- Updated integration points
- Created backend request documentation

# Feedback Module - Backend API Alignment

**Date:** February 3, 2026  
**Version:** 2.0.0  
**Status:** Complete  

---

## Table of Contents

1. [Overview](#overview)
2. [API Alignment](#api-alignment)
3. [Architecture](#architecture)
4. [File Changes Summary](#file-changes-summary)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [API Service](#api-service)
7. [Context Provider](#context-provider)
8. [Components](#components)
9. [Usage Guide](#usage-guide)
10. [Testing Checklist](#testing-checklist)

---

## Overview

This document describes the migration of the Feedback module to align with the backend PRD (`docs/backend/feedback-prd.md`). The implementation supports:

- **Phase 1 API:** `GET/POST /reservations/:id/feedback`
- **Questionnaire-based questions:** Each with prompt and scale_1_5 rating
- **Overall rating + comments:** Top-level required/optional fields
- **Future-ready:** Stubs for Phase 2 Survey Engine

### What Changed

| Aspect | Before | After |
|--------|--------|-------|
| **GET Endpoint** | `/feedback/forms/by-assignment` | `/reservations/:id/feedback` |
| **POST Endpoint** | `/feedback/sessions/:id/responses` | `/reservations/:id/feedback` |
| **Session Concept** | Full session tracking | Direct submit (no session) |
| **Question Types** | star/tags/comment per question | `scale_1_5` only (Phase 1) |
| **Overall Rating** | Per-question | Top-level required field |
| **Tags/Options** | Fully implemented | Deferred to Survey Engine |
| **Identifier** | Event/slot/date IDs | Registration ID |

### What Was Removed

- `DynamicFeedbackModal.tsx` - Consolidated into `FeedbackModal.tsx`
- `DynamicFormRenderer.tsx` - Replaced by `QuestionnaireRenderer.tsx`
- `DynamicTags.tsx` - Deferred to Survey Engine Phase 2
- `FeedbackSessionContext.tsx` - Replaced by `FeedbackContext.tsx`
- Session-based API methods - Replaced by direct feedback endpoints
- `useDynamicFeedback` prop - No longer needed

---

## API Alignment

### Phase 1: Current Backend

```
GET  /reservations/:id/feedback    → Returns questionnaire + existing feedback
POST /reservations/:id/feedback    → Submit rating + comments + responses
```

### Phase 2: Survey Engine (Future)

```
GET  /surveys/active?registration_id=123  → Get applicable survey
POST /surveys/submit                       → Submit survey responses
```

### Response Shape

```typescript
// GET /reservations/:id/feedback
interface FeedbackApiResponse {
  id: number | null;                    // null if not submitted
  registration_id: number;
  has_submitted: boolean;
  submitted_at: string | null;
  rating: number | null;                // Overall 1-5 rating
  comments: string | null;
  questionnaire: {
    id: number;
    version: number;
    title: string;
    questions: Array<{
      id: number;
      order: number;
      type: 'scale_1_5';
      prompt: string;
      required: boolean;
    }>;
  };
  responses: Array<{
    question_id: number;
    scale_value: number;
  }>;
}

// POST /reservations/:id/feedback
interface FeedbackSubmitRequest {
  rating: number;           // Required 1-5
  comments?: string;        // Optional, max 1000 chars
  responses: Array<{
    question_id: number;
    scale_value: number;
  }>;
}
```

---

## Architecture

### Component Hierarchy

```
FeedbackContainer
└── FeedbackProvider (context)
    ├── FeedbackModal (form/loading/error/already_submitted states)
    │   ├── StarRating (overall rating - required)
    │   ├── QuestionnaireRenderer
    │   │   └── QuestionRenderer (for each question)
    │   │       └── StarRating (scale_1_5)
    │   └── Textarea (comments - optional)
    └── FeedbackConfirmation (thank you modal)
```

### Data Flow

```
1. FeedbackContainer opens with registrationId
2. FeedbackProvider mounts
3. API call: GET /reservations/:id/feedback
4. Check has_submitted:
   - true  → Show "already submitted" state with existing data
   - false → Show empty form
5. User fills rating (required) + questions + comments (optional)
6. Submit: POST /reservations/:id/feedback
7. Success → Show FeedbackConfirmation
```

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Rewrite | `src/Modules/Feedback/types/feedback.types.ts` | Match backend response shapes |
| Rewrite | `src/Services/FeedbackApiService.ts` | Use `/reservations/:id/feedback` endpoints |
| Create | `src/Modules/Feedback/context/FeedbackContext.tsx` | Simplified state management |
| Update | `src/Modules/Feedback/components/QuestionRenderer.tsx` | Handle `scale_1_5` type only |
| Create | `src/Modules/Feedback/components/QuestionnaireRenderer.tsx` | Render backend questionnaire format |
| Rewrite | `src/Modules/Feedback/components/FeedbackModal.tsx` | Single modal with rating + questions + comments |
| Rewrite | `src/Modules/Feedback/FeedbackContainer.tsx` | Unified approach (no dual-mode) |
| Update | `src/Modules/Reservations/components/ReservationCard.tsx` | Remove `useDynamicFeedback` prop |
| Delete | `src/Modules/Feedback/components/DynamicFeedbackModal.tsx` | Consolidated into FeedbackModal |
| Delete | `src/Modules/Feedback/components/DynamicTags.tsx` | Deferred to Survey Engine |
| Delete | `src/Modules/Feedback/components/DynamicFormRenderer.tsx` | Replaced by QuestionnaireRenderer |
| Delete | `src/Modules/Feedback/context/FeedbackSessionContext.tsx` | Replaced by FeedbackContext |

---

## TypeScript Interfaces

**File:** `src/Modules/Feedback/types/feedback.types.ts`

### API Types

| Type | Purpose |
|------|---------|
| `QuestionType` | `'scale_1_5' \| 'radio' \| 'checkbox' \| 'short_text'` |
| `QuestionnaireQuestion` | Question config (id, order, type, prompt, required) |
| `Questionnaire` | Full questionnaire (id, version, title, questions) |
| `QuestionnaireResponse` | Single question answer (question_id, scale_value) |
| `FeedbackApiResponse` | GET response shape |
| `FeedbackSubmitRequest` | POST request shape |
| `FeedbackSubmitResponse` | POST success response |
| `FeedbackApiError` | Error response shape |

### Frontend State Types

| Type | Purpose |
|------|---------|
| `QuestionResponseDraft` | In-memory question answer (questionId, scaleValue) |
| `FeedbackFormState` | Complete form state (rating, comments, responses Map) |
| `FeedbackModalState` | Modal state machine states |

### Component Props

| Type | Component |
|------|-----------|
| `FeedbackContainerProps` | `FeedbackContainer` |
| `FeedbackModalProps` | `FeedbackModal` |
| `QuestionnaireRendererProps` | `QuestionnaireRenderer` |
| `QuestionRendererProps` | `QuestionRenderer` |
| `FeedbackConfirmationProps` | `FeedbackConfirmation` |
| `StarRatingProps` | `StarRating` |

### Utility Functions

```typescript
// Create empty form state
createInitialFormState(): FeedbackFormState

// Check if form is valid for submission
isFormValid(formState, questionnaire): boolean

// Convert form state to API request
formStateToSubmitRequest(formState): FeedbackSubmitRequest
```

---

## API Service

**File:** `src/Services/FeedbackApiService.ts`

### Configuration

```typescript
const USE_MOCK_DATA = true;  // Toggle for development
const MOCK_DELAY = 500;      // Simulated network delay
```

### Methods

#### `getFeedback(registrationId: number): Promise<FeedbackApiResponse>`

Fetches feedback and questionnaire for a registration.

```typescript
const response = await feedbackApiService.getFeedback(12345);

if (response.has_submitted) {
  // Show existing feedback
  console.log(response.rating, response.comments);
} else {
  // Show empty form with questionnaire
  console.log(response.questionnaire.questions);
}
```

#### `submitFeedback(registrationId: number, data: FeedbackSubmitRequest): Promise<FeedbackSubmitResponse>`

Submits feedback for a registration.

```typescript
const result = await feedbackApiService.submitFeedback(12345, {
  rating: 5,
  comments: "Great experience!",
  responses: [
    { question_id: 101, scale_value: 5 },
    { question_id: 102, scale_value: 4 },
  ],
});
```

**Error Handling:**
- `409 Conflict` - Feedback already submitted
- `422 Validation Error` - Invalid data

### Survey Engine Stubs (Future)

```typescript
getActiveSurvey(registrationId): Promise<SurveyActiveResponse>
submitSurvey(data): Promise<{ success: boolean; message: string }>
```

### Mock Questionnaire

```typescript
{
  id: 1,
  version: 1,
  title: "Post-Event Feedback",
  questions: [
    { id: 101, order: 1, type: "scale_1_5", prompt: "How satisfied were you with check-in?", required: true },
    { id: 102, order: 2, type: "scale_1_5", prompt: "How satisfied were you with wait time?", required: true },
    { id: 103, order: 3, type: "scale_1_5", prompt: "How satisfied were you with overall service?", required: true },
  ]
}
```

---

## Context Provider

**File:** `src/Modules/Feedback/context/FeedbackContext.tsx`

### Context Value

```typescript
interface FeedbackContextValue {
  // State
  registrationId: number;
  questionnaire: Questionnaire | null;
  existingFeedback: FeedbackApiResponse | null;
  formState: FeedbackFormState;
  modalState: FeedbackModalState;
  canSubmit: boolean;
  error: string | null;

  // Actions
  setRating: (rating: number) => void;
  setComments: (comments: string) => void;
  setQuestionResponse: (questionId: number, scaleValue: number) => void;
  submitFeedback: () => Promise<boolean>;
  resetForm: () => void;
  clearError: () => void;
  reload: () => Promise<void>;
}
```

### Modal States

| State | Description |
|-------|-------------|
| `loading` | Fetching feedback from API |
| `form` | Showing empty form |
| `submitting` | Submission in progress |
| `confirmation` | Success - show thank you |
| `error` | API error occurred |
| `already_submitted` | Feedback was already submitted |

### Validation

```typescript
const canSubmit = isFormValid(formState, questionnaire);
// Returns true if:
// 1. rating is between 1-5
// 2. All required questions have valid scale values
```

### Usage

```tsx
<FeedbackProvider
  registrationId={12345}
  onSubmitSuccess={() => console.log("Success!")}
  onSubmitError={(error) => console.error(error)}
>
  <MyFeedbackUI />
</FeedbackProvider>

// In child component:
const { formState, setRating, submitFeedback } = useFeedback();
```

---

## Components

### FeedbackContainer

**File:** `src/Modules/Feedback/FeedbackContainer.tsx`

Main entry point for feedback flow.

```tsx
<FeedbackContainer
  isOpen={isFeedbackOpen}
  onClose={() => setIsFeedbackOpen(false)}
  registrationId={reservation.id}
  locationName={event.name}
  visitDate={formattedDate}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Modal visibility |
| `onClose` | function | Yes | Close callback |
| `registrationId` | number | Yes | Registration/reservation ID |
| `locationName` | string | No | Event name for display |
| `visitDate` | string | No | Visit date for display |

### FeedbackModal

**File:** `src/Modules/Feedback/components/FeedbackModal.tsx`

Renders the feedback form with all states.

**Structure:**
1. Header (questionnaire title)
2. Overall Rating (required 1-5 stars)
3. Questionnaire Questions (each with prompt + stars)
4. Comments (optional textarea)
5. Submit button

**States Handled:**
- Loading spinner
- Error with retry button
- Already submitted with existing data
- Form with validation
- Submitting with spinner

### QuestionnaireRenderer

**File:** `src/Modules/Feedback/components/QuestionnaireRenderer.tsx`

Renders all questionnaire questions.

```tsx
<QuestionnaireRenderer
  questions={questionnaire.questions}
  responses={formState.responses}
  onResponseChange={setQuestionResponse}
/>
```

### QuestionRenderer

**File:** `src/Modules/Feedback/components/QuestionRenderer.tsx`

Renders a single question based on type.

```tsx
<QuestionRenderer
  question={question}
  value={response?.scaleValue}
  onChange={(value) => handleChange(question.id, value)}
/>
```

**Supported Types:**
- `scale_1_5` - Star rating (1-5)
- `radio`, `checkbox`, `short_text` - Placeholder for Phase 2

### FeedbackConfirmation

**File:** `src/Modules/Feedback/components/FeedbackConfirmation.tsx`

Thank you modal shown after successful submission.

```tsx
<FeedbackConfirmation
  isOpen={showConfirmation}
  onClose={handleClose}
/>
```

---

## Usage Guide

### Basic Usage

```tsx
import { FeedbackContainer } from "@/Modules/Feedback";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const reservation = useReservation();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Give Feedback</Button>
      
      <FeedbackContainer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        registrationId={reservation.id}
        locationName={reservation.event.name}
        visitDate={formatDate(reservation.date)}
      />
    </>
  );
};
```

### With ReservationCard

```tsx
// ReservationCard automatically handles feedback for past reservations
<ReservationCard
  reservation={reservation}
  variant="past"
/>
```

### Switching to Real API

1. Open `src/Services/FeedbackApiService.ts`
2. Set `USE_MOCK_DATA = false`
3. Verify backend is running at configured base URL

---

## Testing Checklist

### API Tests

- [ ] GET feedback returns questionnaire for new registration
- [ ] GET feedback returns existing data for submitted feedback
- [ ] POST feedback creates new feedback record
- [ ] POST feedback returns 409 for duplicate submission
- [ ] POST feedback returns 422 for validation errors (missing rating)

### Component Tests

- [ ] Modal shows loading state initially
- [ ] Modal shows form when feedback not submitted
- [ ] Modal shows existing data when already submitted
- [ ] Overall rating is required (button disabled without it)
- [ ] Question ratings work independently
- [ ] Comments textarea has character limit (1000)
- [ ] Submit button shows spinner during submission
- [ ] Confirmation modal shows on success
- [ ] Error message displays on failure

### Integration Tests

- [ ] Full flow: Open → Load → Fill → Submit → Confirmation
- [ ] Already submitted flow: Open → Load → Show existing
- [ ] Error flow: Open → Load → Fill → Error → Retry

### Manual Testing

- [ ] Open feedback modal from ReservationCard
- [ ] Complete all ratings and submit
- [ ] Verify confirmation modal appears
- [ ] Close and reopen - should show "already submitted"
- [ ] Clear mock data and test again

---

## Appendix: File Structure

```
src/Modules/Feedback/
├── index.ts                              # Module exports
├── FeedbackContainer.tsx                 # Main container
├── components/
│   ├── FeedbackModal.tsx                 # Form modal
│   ├── FeedbackConfirmation.tsx          # Thank you modal
│   ├── QuestionnaireRenderer.tsx         # Multi-question renderer
│   └── QuestionRenderer.tsx              # Single question renderer
├── context/
│   ├── index.ts                          # Context exports
│   └── FeedbackContext.tsx               # State management
└── types/
    ├── index.ts                          # Type exports
    └── feedback.types.ts                 # All interfaces

src/Services/
└── FeedbackApiService.ts                 # API service with mock data
```

---

## Changelog

### v2.0.0 (February 3, 2026)

- **BREAKING:** Aligned with backend PRD endpoints
- **BREAKING:** Changed from event/slot IDs to registrationId
- Removed session-based API (createSession, getSession, submitSessionResponses)
- Consolidated modals into single FeedbackModal
- Replaced DynamicFormRenderer with QuestionnaireRenderer
- Removed DynamicTags (deferred to Survey Engine Phase 2)
- Simplified context to direct submission model
- Added support for "already submitted" state
- Added Survey Engine stubs for Phase 2

### v1.0.0 (January 26, 2026)

- Initial dynamic form system with session management
- Dual-mode support (legacy + dynamic)
- Full tags implementation

# Frontend Feedback Implementation vs. Universal Survey Engine

**Date:** January 28, 2026  
**Purpose:** Alignment analysis between frontend Feedback module and backend Universal Survey Engine PRD

---

## Executive Summary

The frontend Feedback module implementation is **~80% aligned** with the Universal Survey Engine PRD. The core concepts of dynamic forms, question libraries, answer options, and per-question responses all map well. Key differences involve session management, question type rendering, and API endpoint patterns.

---

## Alignment Matrix

| Feature | Frontend Implementation | Survey Engine | Alignment |
|---------|------------------------|---------------|-----------|
| Dynamic forms | `FeedbackForm` | `forms` | ✅ Aligned |
| Question library | `FeedbackFormQuestion` | `questions` | ✅ Aligned |
| Multiple question types | star/tags/comment | `scale_1_5`, `boolean`, `text`, `radio`, `checkbox` | ✅ Aligned |
| Answer options | `FeedbackFormQuestionTag` | `answer_options` | ✅ Aligned |
| Form assignments | `FeedbackFormAssignment` | `form_assignments` | ✅ Aligned |
| Hierarchy targeting | event/date/slot specific | Polymorphic `hierarchy_type_id` | ⚠️ Backend more flexible |
| Triggers | Not implemented | `survey_triggers` | ❌ Backend only |
| Submissions | `FeedbackSession` | `form_submissions` | ⚠️ Conceptual difference |
| Per-question responses | `FeedbackResponse` | `form_responses` | ✅ Aligned |
| Overall rating | Per-question star | `form_submissions.overall_rating` | ⚠️ Different placement |
| Comments | Per-question | `form_submissions.comments` | ⚠️ Different placement |
| Standardized questions | Not implemented | `questions.is_standardized` | ❌ Backend only |
| Value scoring | Not implemented | `answer_options.value_score` | ❌ Backend only |

---

## Detailed Comparison

### 1. Forms

#### Frontend (`FeedbackForm`)
```typescript
interface FeedbackForm {
  id: number;
  name: string;
  headerTitle: string;
  headerSubtitle?: string;
  isStandalone: boolean;
  allowMultipleResponses: boolean;
  isActive: boolean;
  questions: FeedbackFormQuestion[];
}
```

#### Survey Engine (`forms`)
```sql
CREATE TABLE forms (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    status_id TINYINT UNSIGNED DEFAULT 1  -- 1=Draft, 2=Active, 3=Inactive
);
```

#### Mapping
| Frontend | Survey Engine |
|----------|---------------|
| `headerTitle` | `title` |
| `headerSubtitle` | `description` |
| `isActive` | `status_id = 2` |
| `isStandalone` | No equivalent (determined by assignments) |
| `allowMultipleResponses` | No equivalent (handled by triggers) |

**Status:** ✅ Core alignment, minor field differences

---

### 2. Questions

#### Frontend (`FeedbackFormQuestion`)
```typescript
interface FeedbackFormQuestion {
  id: number;
  feedbackFormId: number;
  displayOrder: number;
  starQuestion?: string;        // If present, show star rating
  tagPrompt?: string;           // If present, show tags/options
  isTagMultiSelect: boolean;    // Single vs multi-select
  commentPlaceholder?: string;  // If present, show text input
  isActive: boolean;
  tags: FeedbackFormQuestionTag[];
}
```

#### Survey Engine (`questions`)
```sql
CREATE TABLE questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prompt VARCHAR(255) NOT NULL,
    question_type ENUM('scale_1_5', 'boolean', 'text', 'radio', 'checkbox'),
    is_standardized TINYINT(1) NOT NULL DEFAULT 0
);
```

#### Type Mapping
| Frontend Approach | Survey Engine `question_type` |
|-------------------|------------------------------|
| `starQuestion` present | `scale_1_5` |
| `tagPrompt` + `isTagMultiSelect=false` | `radio` |
| `tagPrompt` + `isTagMultiSelect=true` | `checkbox` |
| `commentPlaceholder` present | `text` |
| Not implemented | `boolean` |

**Gap:** Frontend uses conditional fields to determine question type; backend uses explicit `question_type` enum. Frontend should add explicit type field.

**Status:** ⚠️ Conceptually aligned, implementation differs

---

### 3. Answer Options

#### Frontend (`FeedbackFormQuestionTag`)
```typescript
interface FeedbackFormQuestionTag {
  id: number;
  feedbackFormQuestionId: number;
  tagText: string;
  displayOrder: number;
  isActive: boolean;
}
```

#### Survey Engine (`answer_options`)
```sql
CREATE TABLE answer_options (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id INT UNSIGNED NOT NULL,
    label VARCHAR(100) NOT NULL,
    value_score TINYINT NULL,  -- For analytics/scoring
    display_order INT NOT NULL DEFAULT 0
);
```

#### Mapping
| Frontend | Survey Engine |
|----------|---------------|
| `feedbackFormQuestionId` | `question_id` |
| `tagText` | `label` |
| `displayOrder` | `display_order` |
| Not implemented | `value_score` |

**Gap:** Frontend missing `value_score` for option scoring/analytics.

**Status:** ✅ Aligned, minor enhancement needed

---

### 4. Form Assignments

#### Frontend (`FeedbackFormAssignment`)
```typescript
interface FeedbackFormAssignment {
  id: number;
  feedbackFormId: number;
  eventId?: number;
  eventDateId?: number;
  eventSlotId?: number;
  isActive: boolean;
}
```

#### Survey Engine (`form_assignments`)
```sql
CREATE TABLE form_assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id INT UNSIGNED NOT NULL,
    hierarchy_type_id TINYINT UNSIGNED NOT NULL,  -- Polymorphic
    hierarchy_value INT UNSIGNED NOT NULL,
    effective_from_date_key INT UNSIGNED,
    effective_to_date_key INT UNSIGNED
);
```

#### Comparison
| Aspect | Frontend | Survey Engine |
|--------|----------|---------------|
| Targeting | Fixed: event/date/slot | Polymorphic: any hierarchy level |
| Date range | Not implemented | `effective_from/to_date_key` |
| Flexibility | Limited | Highly flexible |

**Gap:** Frontend is less flexible. Backend's polymorphic pattern supports State, County, Agency, Event, etc.

**Status:** ⚠️ Conceptually aligned, backend more powerful

---

### 5. Survey Triggers (Backend Only)

#### Survey Engine (`survey_triggers`)
```sql
CREATE TABLE survey_triggers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT UNSIGNED NOT NULL,
    trigger_type ENUM('transaction', 'enrollment', 'interval'),
    interval_metric ENUM('visit_count', 'days_since_start', 'hybrid'),
    interval_value INT UNSIGNED,
    is_recurring TINYINT(1) DEFAULT 0
);
```

**Frontend Status:** ❌ Not implemented

**Reason:** Trigger logic is backend-side. Frontend receives the applicable survey from `GET /surveys/active` - no need to understand triggers.

---

### 6. Submissions

#### Frontend (`FeedbackSession`)
```typescript
interface FeedbackSession {
  id: number;
  feedbackFormId: number;
  userId?: number;
  eventId?: number;
  eventDateId?: number;
  eventSlotId?: number;
  completedAt?: string;  // null = in progress
  createdAt: string;
  updatedAt: string;
  responses?: FeedbackResponse[];
}
```

#### Survey Engine (`form_submissions`)
```sql
CREATE TABLE form_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_id INT UNSIGNED NOT NULL,
    trigger_id INT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NULL,
    family_id INT UNSIGNED NULL,
    user_id INT UNSIGNED NULL,
    overall_rating TINYINT UNSIGNED NULL,
    comments TEXT NULL,
    date_key INT UNSIGNED NOT NULL,  -- YYYYMMDD
    time_key INT UNSIGNED NOT NULL,  -- Minutes from midnight
    ip_address VARBINARY(16) NULL,
    status_id TINYINT UNSIGNED DEFAULT 17
);
```

#### Key Differences
| Aspect | Frontend | Survey Engine |
|--------|----------|---------------|
| Concept | "Session" (can be incomplete) | "Submission" (typically complete) |
| Overall rating | Per-question | At submission level |
| Comments | Per-question | At submission level |
| Trigger tracking | Not tracked | `trigger_id` required |
| FreshTrak time format | ISO timestamps | `date_key` + `time_key` |

**Status:** ⚠️ Conceptual difference - may need to adapt

---

### 7. Responses

#### Frontend (`FeedbackResponse`)
```typescript
interface FeedbackResponse {
  id: number;
  feedbackSessionId: number;
  feedbackFormQuestionId: number;
  starRating?: number;
  commentText?: string;
  createdAt: string;
  selectedTags?: FeedbackResponseTag[];
}
```

#### Survey Engine (`form_responses`)
```sql
CREATE TABLE form_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    answer_value TEXT NOT NULL  -- Flexible storage
);
```

#### Comparison
| Frontend | Survey Engine |
|----------|---------------|
| Multiple typed fields | Single `answer_value` TEXT |
| `starRating` as number | Stored as text |
| `selectedTags` as array | Stored as text (JSON or comma-separated) |

**Gap:** Frontend uses typed fields; backend uses flexible text. Need serialization adapter.

**Status:** ✅ Compatible with adapter

---

## API Alignment

### Endpoint Comparison

| Frontend API | Survey Engine API | Notes |
|--------------|-------------------|-------|
| `GET /feedback/forms/:id` | Part of `/surveys/active` | Backend combines form + eligibility |
| `GET /feedback/forms/by-assignment` | `GET /surveys/active` | ✅ Same concept |
| `POST /feedback/sessions` | Not needed | Backend creates on submit |
| `GET /feedback/sessions/:id` | Not explicit | May not support resume |
| `POST /feedback/sessions/:id/responses` | `POST /surveys/submit` | ✅ Aligned |

### Request/Response Shape

#### Frontend Submit Request
```json
{
  "sessionId": 12345,
  "responses": [
    {
      "questionId": 1,
      "starRating": 5,
      "commentText": "Great!",
      "selectedTagIds": [1, 2, 3]
    }
  ]
}
```

#### Survey Engine Submit Request
```json
{
  "form_id": 1,
  "trigger_id": 42,
  "overall_rating": 5,
  "comments": "Great experience!",
  "responses": {
    "101": "5",
    "102": "1,2,3",
    "103": "Great service"
  }
}
```

**Differences:**
1. Backend requires `trigger_id` (frontend doesn't track)
2. Backend has `overall_rating` and `comments` at top level
3. Backend uses question ID as key, value as text

---

## Recommended Changes

### High Priority

1. **Add explicit question type**
   ```typescript
   interface FeedbackFormQuestion {
     questionType: 'scale_1_5' | 'boolean' | 'text' | 'radio' | 'checkbox';
     // ... other fields
   }
   ```

2. **Track trigger ID** - Receive from `GET /surveys/active`, include in submission

3. **Move overall rating/comments** - From per-question to submission level

### Medium Priority

4. **Add value scoring** - Include `valueScore` in answer options

5. **Adapt response serialization** - Convert typed fields to text for backend

6. **Support all question types** - Add `boolean` renderer

### Low Priority (Backend Concerns)

7. **Standardized questions** - Backend-only for research

8. **FreshTrak time format** - Convert to `date_key`/`time_key` if needed

---

## Migration Path

### Phase 1: Type Alignment
- Add `questionType` to `FeedbackFormQuestion`
- Add `valueScore` to `FeedbackFormQuestionTag`
- Update `QuestionRenderer` to switch on `questionType`

### Phase 2: API Alignment
- Update `getActiveSurvey()` to call `GET /surveys/active`
- Update submission to include `trigger_id`
- Add `overallRating` and `comments` to submission payload

### Phase 3: Response Adapter
- Create serialization layer for `form_responses.answer_value`
- Handle deserialization for resume functionality (if supported)

---

## Conclusion

The frontend Feedback module provides a solid foundation that aligns well with the Universal Survey Engine's core concepts. The main work required is:

1. **Type system updates** - Add explicit question types
2. **API adapter** - Bridge the endpoint/payload differences  
3. **Session → Submission** - Decide if session tracking is needed or remove it

The backend's "Durable Research" philosophy and polymorphic assignment system are more sophisticated than the frontend assumed, but the frontend architecture can accommodate these features with targeted updates.

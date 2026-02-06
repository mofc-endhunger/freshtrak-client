## PRD: Post-Event Feedback (Per Registration)

### Overview

Collect structured post-event feedback from a guest or authenticated user after an event registration. Feedback consists of a required 1–5 star rating, optional free-text comments, and answers to a simple fixed questionnaire (1–5 scale questions). Questionnaire authoring/maintenance is out of scope; only presentation and capture are in scope.

### Goals

- Enable guests/users to submit feedback per reservation/registration.
- Capture a required 1–5 rating; allow optional comments (free text).
- Present a simple, fixed questionnaire (versioned for future changes) using 1–5 scale responses.
- Make results queryable per registration, user, event, and time window.

### Non-Goals / Out of Scope

- Authoring/maintaining questionnaires (UI/admin tools).
- Advanced survey types (text/multi-select/NPS/free-form per-question).
- Public leaderboards or complex analytics dashboards.
- Email/SMS distribution automation (can be added later).

### Personas & Scenarios

- Guest or authenticated user who completed/attended an event and wants to provide feedback.
- Staff reviewing aggregate scores and comments by event or time period.

### Assumptions

- A registration is required to submit feedback; one feedback per registration.
- We can determine event timing (date/time) from existing public schedule integrations to enforce windows (e.g., submit within 14 days after event).
- Questionnaire is deployed as a single “active” version. Future versions may be rolled out but management is external to this scope.

## API

### Authentication/Authorization

- Same as Reservations: JWT or `X-Guest-Token` with ownership checks; the caller must own the `registration` (reservation) to read/submit feedback.

### Endpoints

- GET `/reservations/:id/feedback`
  - Returns current feedback if submitted; otherwise returns the active questionnaire scaffold for this registration.
  - Ownership required.

- POST `/reservations/:id/feedback`
  - Creates feedback once per registration; returns 201 with created resource.
  - If duplicate submit: return 409 Conflict (or optionally 200 with existing feedback if idempotency is preferred; to be decided).
  - Ownership required.

- GET `/questionnaires/current` (optional helper)
  - Returns currently active questionnaire (for clients that want to prefetch).
  - No ownership requirement; standard auth applies.

### Request/Response Shapes

- GET `/reservations/:id/feedback` 200

```json
{
  "id": 98765,
  "registration_id": 12345,
  "has_submitted": true,
  "submitted_at": "2026-01-20T14:05:12.000Z",
  "rating": 4,
  "comments": "Friendly staff, a bit long wait.",
  "questionnaire": {
    "id": 1,
    "version": 1,
    "title": "Post-Event Feedback",
    "questions": [
      {
        "id": 101,
        "order": 1,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with check-in?",
        "required": true
      },
      {
        "id": 102,
        "order": 2,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with wait time?",
        "required": true
      },
      {
        "id": 103,
        "order": 3,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with overall service?",
        "required": true
      }
    ]
  },
  "responses": [
    { "question_id": 101, "scale_value": 4 },
    { "question_id": 102, "scale_value": 3 },
    { "question_id": 103, "scale_value": 5 }
  ]
}
```

- GET `/reservations/:id/feedback` 200 (not yet submitted)

```json
{
  "id": null,
  "registration_id": 12345,
  "has_submitted": false,
  "submitted_at": null,
  "rating": null,
  "comments": null,
  "questionnaire": {
    "id": 1,
    "version": 1,
    "title": "Post-Event Feedback",
    "questions": [
      {
        "id": 101,
        "order": 1,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with check-in?",
        "required": true
      },
      {
        "id": 102,
        "order": 2,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with wait time?",
        "required": true
      },
      {
        "id": 103,
        "order": 3,
        "type": "scale_1_5",
        "prompt": "How satisfied were you with overall service?",
        "required": true
      }
    ]
  },
  "responses": []
}
```

- POST `/reservations/:id/feedback` request

```json
{
  "rating": 5,
  "comments": "Great experience, very organized.",
  "responses": [
    { "question_id": 101, "scale_value": 5 },
    { "question_id": 102, "scale_value": 4 },
    { "question_id": 103, "scale_value": 5 }
  ]
}
```

- POST `/reservations/:id/feedback` 201 response

```json
{
  "id": 98765,
  "registration_id": 12345,
  "submitted_at": "2026-01-20T14:05:12.000Z",
  "rating": 5,
  "comments": "Great experience, very organized."
}
```

### Validation

- `rating`: required, integer 1–5.
- `comments`: optional, <= 1000 chars.
- `responses`: optional; each item must reference a known `question_id` in the active questionnaire, with `scale_value` 1–5. All required questions must be present if `responses` is provided.
- One submission per registration.

### Business Rules

- Submission allowed only after the event date (or after check-in/completion if available). Default: allow from event date at 00:00 local → 14 days after.
- Ownership: only the registration owner can create/view feedback for that registration.
- Questionnaire is versioned; we snapshot `questionnaire_version_id` on feedback creation.

### Error Cases

- 401/403: unauthenticated/unauthorized or not owner.
- 404: registration not found or not eligible.
- 409: duplicate feedback submission (if we choose conflict over idempotent return).
- 422: validation error (rating out of range, missing required responses).

## Data Model (Proposed)

### Tables

- feedback
  - id BIGINT PK AI
  - registration_id BIGINT NOT NULL (FK → registrations.id)
  - user_id BIGINT NULL (FK → users.id) // denormalized for reporting; nullable for guest
  - event_id INT UNSIGNED NOT NULL // denormalized from registration for reporting
  - questionnaire_version_id INT NULL (FK → questionnaire_versions.id)
  - rating TINYINT UNSIGNED NOT NULL // 1–5
  - comments TEXT NULL
  - submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  - created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  - updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  - user_agent VARCHAR(255) NULL
  - ip VARBINARY(16) NULL
  - UNIQUE KEY ux_feedback_registration (registration_id)
  - INDEX ix_feedback_event (event_id, submitted_at)

- feedback_responses
  - id BIGINT PK AI
  - feedback_id BIGINT NOT NULL (FK → feedback.id ON DELETE CASCADE)
  - question_id INT NOT NULL (FK → questionnaire_questions.id)
  - scale_value TINYINT UNSIGNED NULL // 1–5 only
  - UNIQUE KEY ux_feedback_question (feedback_id, question_id)

- questionnaire_versions
  - id INT PK AI
  - version INT NOT NULL
  - title VARCHAR(120) NOT NULL
  - is_active TINYINT(1) NOT NULL DEFAULT 1
  - effective_from DATE NOT NULL
  - effective_to DATE NULL
  - created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

- questionnaire_questions
  - id INT PK AI
  - questionnaire_version_id INT NOT NULL (FK → questionnaire_versions.id ON DELETE CASCADE)
  - display_order INT NOT NULL
  - type ENUM('scale_1_5') NOT NULL
  - prompt VARCHAR(255) NOT NULL
  - required TINYINT(1) NOT NULL DEFAULT 1
  - min_value TINYINT UNSIGNED NOT NULL DEFAULT 1
  - max_value TINYINT UNSIGNED NOT NULL DEFAULT 5
  - INDEX ix_qv_order (questionnaire_version_id, display_order)

### Example DDL (MySQL-ish)

```sql
CREATE TABLE feedback (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  registration_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  event_id INT UNSIGNED NOT NULL,
  questionnaire_version_id INT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comments TEXT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_agent VARCHAR(255) NULL,
  ip VARBINARY(16) NULL,
  UNIQUE KEY ux_feedback_registration (registration_id),
  KEY ix_feedback_event (event_id, submitted_at)
);

CREATE TABLE feedback_responses (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  feedback_id BIGINT NOT NULL,
  question_id INT NOT NULL,
  scale_value TINYINT UNSIGNED NULL,
  UNIQUE KEY ux_feedback_question (feedback_id, question_id)
);

CREATE TABLE questionnaire_versions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  version INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questionnaire_questions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  questionnaire_version_id INT NOT NULL,
  display_order INT NOT NULL,
  type ENUM('scale_1_5') NOT NULL,
  prompt VARCHAR(255) NOT NULL,
  required TINYINT(1) NOT NULL DEFAULT 1,
  min_value TINYINT UNSIGNED NOT NULL DEFAULT 1,
  max_value TINYINT UNSIGNED NOT NULL DEFAULT 5,
  KEY ix_qv_order (questionnaire_version_id, display_order)
);
```

## Questionnaire (v1 content, example)

- Title: Post-Event Feedback
- Questions:
  - Q1 (order 1): “How satisfied were you with check-in?” (scale_1_5, required)
  - Q2 (order 2): “How satisfied were you with wait time?” (scale_1_5, required)
  - Q3 (order 3): “How satisfied were you with overall service?” (scale_1_5, required)
- End: “Any comments?” → stored as `feedback.comments`

## Security & Privacy

- Enforce registration ownership through existing guards (JWT/guest).
- Store minimal metadata (`ip`, `user_agent`) for abuse detection; subject to privacy policy.
- Rate limiting: basic per-IP throttling on POST to prevent abuse (policy TBD).

## Rollout

- Phase 1: API + minimal UI to present questionnaire on reservation history detail.
- Phase 2: Add server-side enforcement of submission window (e.g., 14 days).
- Phase 3: Staff reports/aggregations (avg rating per event, comments export).

## Addendum: Align with Survey Engine (Owner Spec 2026‑01‑28)

To align with the survey engine proposal, we will introduce a generalized schema and endpoints while preserving the current simple feedback flow as a compatibility facade.

### Engine Data Model

- forms (id, title, status_id, created_at)
- questions (id, prompt, type['scale_1_5'|'radio'|'checkbox'|'short_text'], is_standardized)
- answer_options (id, question_id, value, label, display_order)
- form_assignments (id, form_id, hierarchy_type_id, hierarchy_value)
- survey_triggers (id, assignment_id, trigger_type['transactional'|'milestone'|'time_cohort'], interval_value)
- form_submissions (id, survey_id, trigger_id, registration_id, user_id, overall_rating, comments, date_key, time_key, ip_address, date_added, status_id)
- form_responses (id, submission_id, question_id, answer_value)

Constraints:

- Durable immutability: Once submissions exist for a form/version, do not edit/delete questions or associations; deactivate instead.
- Submission window: Default 14 days post service date for transactional triggers.

### Engine Endpoints

- GET /surveys/active?registration_id=123
  - Evaluates eligibility for transactional surveys and returns the applicable form with questions/options if available; otherwise has_active=false.
- POST /surveys/submit
  - Body: { survey_id, trigger_id, registration_id?, overall_rating?, comments?, responses: [{ question_id, answer_value }] }
  - Captures IP and User‑Agent. Enforces duplicate protection and 14‑day window for transactional context.

### Backwards Compatibility

- Existing GET/POST /reservations/:id/feedback remain; they will be backed by the engine in a later phase, mapping rating/comments to form_submissions and per‑question answers to form_responses.

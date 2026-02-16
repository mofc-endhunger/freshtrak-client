### Feedback API – UI Integration Guide

Audience: Frontend implementers building the Reservations Feedback UI.

#### Auth

- Send one of:
  - `Authorization: Bearer <JWT>`
  - `X-Guest-Token: <token>`

#### Feature flag

- When `FEATURE_FEEDBACK=true`, endpoints read/write real data.
- When not set/false:
  - GET returns a small scaffolded questionnaire with `has_submitted=false` (no DB access).
  - POST returns `501` with a “Feedback feature is disabled” message.

#### Endpoints

- GET `/reservations/:id/feedback`
  - Purpose: Check if the user has already submitted feedback and fetch the questionnaire to render.
  - Path params: `id` = reservation id (our `registration.id`).
  - Headers: Auth as above (JWT or `X-Guest-Token`).
  - Response:
    ```json
    {
      "id": 987654321, // submission id if exists, else null
      "registration_id": 123,
      "has_submitted": true, // or false if not submitted yet
      "submitted_at": "2026-02-12T15:04:05.000Z",
      "rating": 4, // 1–5 if derivable from answers; else null
      "comments": null, // reserved; may be null
      "questionnaire": {
        "id": 55,
        "version": 1,
        "title": "Post-Event Feedback",
        "questions": [
          {
            "id": 101, // survey_question_id (use this in POST)
            "order": 1,
            "type": "scale_1_5",
            "prompt": "How satisfied were you with check-in?",
            "required": true,
            "options": [{ "id": 1, "value": "1", "label": "Very dissatisfied", "order": 1 }]
          }
        ]
      },
      "responses": [{ "question_id": 101, "scale_value": 4 }]
    }
    ```
  - Notes:
    - `questionnaire.questions[*].id` is the per-survey question id (aka `survey_question_id`). Use this in `POST.responses[*].question_id`.
    - If `has_submitted` is true, `responses` contains the user’s previous answers (only numeric `scale_value` are echoed).

- POST `/reservations/:id/feedback`
  - Purpose: Persist a single feedback submission per reservation.
  - Path params: `id` = reservation id (our `registration.id`).
  - Headers: Auth as above (JWT or `X-Guest-Token`).
  - Body:
    ```json
    {
      "rating": 4, // overall star rating (1–5)
      "comments": "Very smooth check-in.", // optional
      "responses": [
        { "question_id": 101, "scale_value": 4 },
        { "question_id": 102, "scale_value": 5 },
        { "question_id": 103, "scale_value": 4 }
      ]
    }
    ```
  - Response:
    ```json
    {
      "id": 987654321, // created submission id
      "registration_id": 123,
      "submitted_at": "2026-02-12T15:04:05.000Z",
      "rating": 4,
      "comments": "Very smooth check-in."
    }
    ```

#### UI flow

1. Call GET `/reservations/:id/feedback` with auth headers.
2. If `has_submitted` is false:
   - Render each `questionnaire.questions[*]` as a 1–5 star control (use `options` for labels if present).
   - Include an optional free-text comments input.
3. On submit, POST to `/reservations/:id/feedback` with `rating`, `comments`, and `responses` using `question_id` from the GET and `scale_value` 1–5.
4. Handle response and errors (see below).

#### States and rules

- Ownership: The reservation must belong to the authenticated user’s household.
- Timing: Feedback is available on/after the event date and for 14 days after; otherwise:
  - Before event day: `403` “Feedback not yet available”.
  - After 14 days: `403` “Feedback window has closed”.
- Idempotency: If already submitted, POST returns `409`.

#### Errors

- `401`/`403`: Authentication/authorization/ownership failures.
- `403`: Not yet available or window closed.
- `409`: Already submitted for this reservation.
- `422`: Validation error (e.g., missing required responses).
- `501`: Feature disabled (when `FEATURE_FEEDBACK` is not true).

#### Example (fetch)

```ts
async function loadFeedback(registrationId: number, token: string) {
  const res = await fetch(`/api/reservations/${registrationId}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  return res.json();
}

async function submitFeedback(registrationId: number, token: string, payload: any) {
  const res = await fetch(`/api/reservations/${registrationId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
}
```

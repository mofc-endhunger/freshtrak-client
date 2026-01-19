### PRD: Reservations API (List, Get) and Read Model (Local‑only Scope)

#### Author

-   Owner: Engineering
-   Stakeholders: Product, Frontend, Operations

### 1) Overview

-   Add user-facing reservations capabilities using only data tracked locally:
    -   List a user’s reservations (upcoming, past, all) with locally available event/timeslot details.
    -   Fetch a single reservation by id.
    -   Out of scope (for now): waitlist, cancel, check‑in/completed states, and any PantryTrak/public data enrichment.

### 2) Goals

-   Provide a stable read model for “reservations” suitable for web and mobile UI, based solely on local tables.
-   Support filtering (upcoming/past/all), date‑range constraints, and pagination using only locally known dates/times.
-   Keep the response schema minimal and aligned with local data available today.

### 3) Non‑Goals

-   Staff/admin event management UI/API changes (covered elsewhere).
-   Notification templates/content; this PRD includes hooks only.
-   Historical archiving and purge policies (policy to be decided later).

### 4) Definitions

-   Reservation: A user household’s `Registration` for an event or local timeslot.
-   HOH: Head of Household (registration/household rules already defined elsewhere).
-   Public/External data: Out of scope (no PantryTrak enrichment).

### 5) Endpoints

-   GET `/api/reservations`

    -   Purpose: list the authenticated user’s reservations.
    -   Auth: JWT or `X-Guest-Token` (same scoping as existing registrations flows).
    -   Query params:
        -   `type`: `upcoming | past | all` (default `all`)
        -   `from_date`: ISO date (YYYY‑MM‑DD)
        -   `to_date`: ISO date (YYYY‑MM‑DD)
        -   `limit`: number (default 50, max 200)
        -   `offset`: number (default 0)
    -   Filtering logic:
        -   Determine reservation “date/time” using, in order (local only):
            1. `timeslot.start_at` (if present)
            2. `event.start_at` (if present)
            3. If neither is available, the item is included in `all` but excluded from `upcoming/past` filtered sets.
        -   `upcoming`: `date >= today`
        -   `past`: `date < today`
        -   `all`: no extra filter
        -   Apply `from_date`/`to_date` window when a date can be determined.
    -   Response:
        -   `200 OK`
        -   Body:
            ```json
            {
            	"reservations": [
            		{
            			"id": 1,
            			"event": {
            				"id": 101,
            				"name": "Family Love Pantry"
            			},
            			"date": "2026-01-17",
            			"timeslot": {
            				"start_time": "2026-01-17T09:00:00.000Z",
            				"end_time": "2026-01-17T15:00:00.000Z"
            			},
            			"household_id": 1,
            			"created_at": "2026-01-09T10:30:00.000Z",
            			"updated_at": "2026-01-09T10:30:00.000Z"
            		}
            	],
            	"total": 5,
            	"upcoming_count": 2,
            	"past_count": 3
            }
            ```
        -   Notes:
            -   Response contains only fields available from local tables (`events`, `event_timeslots`, `registrations`). No external/public enrichment.

-   GET `/api/reservations/{id}`

    -   Purpose: fetch a single reservation owned by the authenticated user.
    -   Auth: JWT or `X-Guest-Token`.
    -   Response:

        -   `200 OK` with `{"reservation": { ...same schema as list item... }}`
        -   `404` if not found or not owned.

    -   Out of scope (for now): cancel endpoint; no waitlist promotion or status changes.

### 6) Data Model Changes (Migrations)

-   None required for MVP list/get.
-   Optional (future): `confirmation_code` for display and QR (if desired later).

### 7) Domain/Status Mapping

-   Out of scope: waitlist, cancel, check‑in/completed. The read model does not depend on or expose these states.

### 8) Business Rules

-   History ranges:
    -   Support `from_date`/`to_date` on locally known dates; items without a resolvable date participate only in `all`.

### 9) Read Model Construction

-   Base query: by `household_id` owned by the caller; apply type/date filters; paginate.
-   Joins/enrichment:
    -   If `timeslot_id` present: join `EventTimeslot` for `start_at/end_at` and derive `date`.
    -   Else use `Event.start_at` when present.
    -   No public/external enrichment.
-   Derived fields:
    -   None beyond local relations for MVP. (Optional future: `confirmation_code` and QR.)

### 10) External/Public Data

-   Out of scope. No PantryTrak/public DB reads or writes in this iteration.

### 11) Notifications

-   Out of scope.

### 12) Errors & Security

-   `401` on auth failures, `403` on ownership/role failures, `404` unknown ids, `400` for rule violations.
-   Ownership: resolve `household_id` via JWT or `X-Guest-Token` (same as existing registration flows).

### 13) Performance & Pagination

-   Default `limit=50`, `offset` based pagination; cap max limit to 200.
-   Indexing: ensure indexes on `registrations(household_id, status, created_at)`, and on `timeslot_id`, `event_id` as needed for joins.

### 14) Rollout Plan

-   Step 1: Implement read model service and controller for list/get (local joins only).
-   Step 2: Frontend integration and UX review.
-   Step 3: Optional future steps (confirmation codes, QR, cancel) gated by scope decisions.

### 15) Open Questions

-   Event metadata:
    -   Are `event.start_at` and `event_timeslots.start_at/end_at` reliably populated for filtering?
    -   Any additional local fields needed for display (e.g., short venue name)?
-   History defaults:
    -   Preferred default window for “past” in UI (Frontend suggested 2 weeks minimum)?

### 16) Success Metrics

-   Reduction in support requests around “where is my reservation?”
-   API performance: p95 latency < 200ms for list and get (excluding public enrichment calls if any).

### 17) Risks

-   Limited local date/time data may constrain filtering accuracy for some records.
-   Future scope changes (cancel, waitlist, QR) may require response schema evolution.

### 18) Appendix

-   Existing endpoints impacted:
    -   New aliases under `/api/reservations` for list/get to provide a user‑centric API surface.

# [CASE MANAGER] Backend: GET /api/registrations/created-by-me for case managers

## Summary
Add an endpoint that returns registrations created by the authenticated user (case manager). This supports future case manager dashboard or audit needs and confirms that `created_by` is correctly set when using "register on behalf of."

## Description
When a case manager registers people on behalf of others, each registration is stored with `created_by` set to the case manager's user ID. Exposing a "created by me" list allows the client to show a history of registrations the case manager has made and lays groundwork for a future case manager dashboard (e.g. cancel, view details).

**Repo:** pantry-registration-api-node

## Acceptance Criteria
- [ ] New endpoint: `GET /api/registrations/created-by-me` (or equivalent path). Authenticated via JWT only (no guest token).
- [ ] Returns a list of registrations where `created_by` equals the authenticated user's DB user ID. Include fields needed for a simple list: e.g. registration id, event name, event date, registrant/household info, status, created_at.
- [ ] Optional query params: e.g. `event_id`, `status`, `from_date`, `to_date` for filtering (can be added in a follow-up if not in scope).
- [ ] Access control: only authenticated Cognito users can call; optionally restrict to users in `case_managers` group so regular users do not see the endpoint, or return empty list for non–case managers. Product to decide.
- [ ] Pagination or limit: define a sensible default (e.g. last 50) to avoid large payloads.
- [ ] Swagger/OpenAPI updated. Simple test or manual verification that a case manager sees only their created registrations.

## Technical Notes
- Reuse existing registration entity and service; add a method like `findByCreatedBy(userId, options)` and call it from a new controller method.
- Resolve current user's DB id from JWT (same as in register flow). Ensure `created_by` is populated in the "register on behalf of" flow (see jira-03) so this endpoint returns data.

## Labels / Components
- Component: Backend, Registrations, Case Manager
- Repo: pantry-registration-api-node
- Epic: Case Manager Long-Term Solution

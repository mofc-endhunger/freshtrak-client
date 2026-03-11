# [CASE MANAGER] Client: Registration flow for case managers (registrant payload + JWT)

## Summary
When the logged-in user is a case manager, the registration form should collect the registrant's information (not the case manager's) and submit it to the backend with the optional `registrant` payload, using the case manager's JWT for authentication.

## Description
Case managers use the same event discovery and registration UI as other users, but the form represents the person they are registering. On submit, the client sends the registrant data in the format the backend expects and uses the case manager's Cognito token (no guest token).

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] When `StorageService.getUserRole()` (or equivalent) is `case_manager`, the registration flow uses "case manager mode."
- [ ] In case manager mode, the registration form still collects: name, address, phone, household counts (and any other required fields). Labels/placeholders can stay as-is; the data is treated as the registrant's.
- [ ] On submit, the request to create registration includes:
  - Standard registration fields (event_id, event_date_id, event_slot_id if applicable, counts).
  - A `registrant` object with the form data (first_name, last_name, phone, address, seniors, adults, children, etc.) in the shape expected by the backend.
- [ ] Authentication: use the case manager's Cognito token (Bearer) only; do not send or use guest token in case manager flow.
- [ ] On success: navigate to the confirmation page as today (with registrant/event details).
- [ ] On error (e.g. 403, 400): show appropriate message; do not redirect to "already registered" unless the backend returns that for the registrant.
- [ ] Existing guest and regular Cognito registration flows are unchanged when the user is not a case manager.

## Technical Notes
- Determine case manager via stored role (set on case manager login page). No guest token should be created or used in this path.
- Align `registrant` payload structure with backend DTO (see jira-03). May require a small shared type or copy of field names.
- If the backend returns a different response shape for "register on behalf of," handle it (e.g. same confirmation payload).

## Labels / Components
- Component: Frontend, Registration, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

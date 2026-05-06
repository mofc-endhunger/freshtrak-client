# [CASE MANAGER] Backend: Extract cognito:groups from JWT and populate req.user.roles

## Summary
Update the pantry-registration-api-node JWT strategy and auth guard to extract `cognito:groups` from the Cognito token and attach roles to `req.user` so "register on behalf of" and future case manager endpoints can authorize by role.

## Description
Case managers are identified by membership in the Cognito group `case_managers`. The JWT (ID or access token) includes a `cognito:groups` claim. We need to read this claim in the JWT strategy and ensure it is available on `req.user` for downstream guards and services.

**Repo:** pantry-registration-api-node

## Acceptance Criteria
- [ ] `jwt.strategy.ts` extracts `cognito:groups` from the token payload (array of group names).
- [ ] The object returned from `validate()` includes a `roles` property (array of strings), e.g. `{ id, userId, email, username, cognito: true, roles: ['case_managers'] }`.
- [ ] When `GuestOrJwtAuthGuard` succeeds via JWT, `req.user` includes the same `roles` (already set by strategy).
- [ ] Existing JWT validation (client_id / aud, etc.) is unchanged.
- [ ] Unit or integration test verifies that a token with `cognito:groups: ['case_managers']` results in `req.user.roles` containing `'case_managers'`.

## Technical Notes
- Payload key: `payload['cognito:groups']` (array) or `payload['cognito:groups'] ?? []`.
- Handle both ID token and access token if both are used; ensure groups are present in the token type you validate (Cognito includes groups in both by default when configured).
- No database or DTO changes in this ticket.

## Labels / Components
- Component: Backend, Authentication, Case Manager
- Repo: pantry-registration-api-node
- Epic: Case Manager Long-Term Solution

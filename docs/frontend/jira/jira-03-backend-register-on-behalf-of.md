# [CASE MANAGER] Backend: Implement "register on behalf of" for case managers

## Summary
Allow authenticated case managers to create event registrations on behalf of other people. When the request includes a `registrant` payload and the user is in the `case_managers` group, create a new User (type guest) and Household for the registrant, then create the registration linked to that household with `created_by` set to the case manager.

## Description
Case managers need to register multiple people for events without using the guest-token workaround. The backend must accept an optional `registrant` object in the registration payload. When present and the caller is a case manager, create a new user and household for the registrant and create the registration; otherwise return 403 if a non–case manager sends `registrant`.

**Repo:** pantry-registration-api-node

## Acceptance Criteria
- [ ] `RegisterDto` (or equivalent) includes an optional `registrant` object with fields needed for the registrant: e.g. first_name, last_name, phone, address, household counts (seniors, adults, children).
- [ ] In `registrations.service.registerForEvent()` (or equivalent): if `registrant` is present, check `req.user.roles` for `case_managers`; if not present, return 403 Forbidden.
- [ ] When authorized: create a new `User` with `user_type: 'guest'` and a unique `identification_code`, populate from `registrant`.
- [ ] Create a new `Household` for that user (head of household).
- [ ] Create the registration with the new household; set `created_by` to the case manager's user ID (resolve from JWT/cognito user).
- [ ] Duplicate check logic is unchanged (same event_id + household_id); each registrant gets a unique household so no false "already registered" for different people.
- [ ] When `registrant` is not present, existing behavior is unchanged (guest token or cognito user's own household).
- [ ] API docs (Swagger) updated to describe the optional `registrant` field and case manager requirement.
- [ ] Test coverage: case manager with `registrant` creates new user/household/registration; non–case manager with `registrant` receives 403.

## Technical Notes
- Reuse existing user/household creation patterns (e.g. from guest flow or user provisioning). Ensure `users` table gets a row for the registrant; link household to that user.
- Case manager's `user_id` in the registration API: resolve via existing pattern (e.g. `users.findDbUserIdByCognitoUuid` from JWT `sub`) so `created_by` is the case manager's DB user id.
- Consider idempotency or validation (e.g. required registrant fields) per product rules.

## Labels / Components
- Component: Backend, Registrations, Case Manager
- Repo: pantry-registration-api-node
- Epic: Case Manager Long-Term Solution

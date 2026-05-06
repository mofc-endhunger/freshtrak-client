# [CASE MANAGER] Client: Case Manager login page and route

## Summary
Add a dedicated Case Manager login page at `/case-manager/login` with sign-in only (no sign-up, no guest). After sign-in, verify the user is in the `case_managers` Cognito group; if not, show an error and sign out. If yes, store case manager role and redirect to home.

## Description
Case managers should have a separate entry point so they do not have to log in as a regular user first. This page is sign-in only to avoid non–case managers creating accounts. Post-login, we must validate group membership using the JWT (e.g. decode and check `cognito:groups` or call a backend that returns roles).

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] New route `/case-manager/login` added in the app router.
- [ ] New component `CaseManagerLoginPage` (or equivalent) that renders only a sign-in form (email + password).
- [ ] No sign-up tab, no "Continue as Guest," no password reset link required for MVP (can be added later).
- [ ] On submit, use existing `AuthContext.signIn()` (same Cognito User Pool).
- [ ] After successful sign-in, determine if the user is in the `case_managers` group (decode JWT for `cognito:groups` or use backend endpoint that returns roles).
- [ ] If user is NOT in `case_managers`: show a clear error message (e.g. "This login is for authorized case managers only"), call sign out, and stay on the case manager login page.
- [ ] If user IS in `case_managers`: persist role (e.g. via StorageService), then redirect to home page.
- [ ] Page is accessible without being logged in (no auth guard that blocks it).
- [ ] UI is consistent with existing login page styling and accessibility.

## Technical Notes
- JWT decode: use `jwt-decode` or similar to read `cognito:groups` from the ID or access token stored after sign-in. Ensure token is available in AuthContext or StorageService after `signIn()`.
- Role persistence: e.g. `StorageService.setItem('userRole', 'case_manager')` or a dedicated method; design so it clears on sign out.
- Consider protecting `/case-manager/login` so that if a case manager is already logged in, they are redirected to home (optional).

## Labels / Components
- Component: Frontend, Authentication, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

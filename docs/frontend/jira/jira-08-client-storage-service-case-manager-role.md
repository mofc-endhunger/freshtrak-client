# [CASE MANAGER] Client: StorageService support for case manager role

## Summary
Add methods to StorageService (or equivalent) to store and retrieve the current user's role (e.g. `case_manager`). Role should be set after successful case manager login and cleared on sign out.

## Description
The client needs a single place to know "is the current user a case manager?" for conditional UI and registration flow. This is derived from Cognito group membership at login and must be persisted across refreshes only as long as the Cognito session is valid; it must be cleared on sign out.

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] A method to set the case manager role, e.g. `StorageService.setUserRole('case_manager')` or `StorageService.setItem('userRole', 'case_manager')`.
- [ ] A method to get the current role, e.g. `StorageService.getUserRole()` returning `'case_manager' | null` (or equivalent).
- [ ] A convenience method to check case manager, e.g. `StorageService.isCaseManager()` returning boolean.
- [ ] Role is stored in a key that is cleared when the user signs out (e.g. include in `clearAuthData` or sign-out flow).
- [ ] When clearing Cognito auth (sign out), the case manager role is also cleared so a subsequent login as a regular user does not see case manager UI.
- [ ] Document the storage key and lifecycle in code or wiki so other devs know when role is set/cleared.

## Technical Notes
- Storage key: e.g. `freshtrak_user_role` or `userRole`; keep consistent with existing keys (e.g. `freshtrak_user_guest`, `freshtrak_user_cognito`).
- Sign-out: ensure AuthContext (or wherever sign out is triggered) calls the clear method so role is removed.
- Optional: persist role in the same storage as Cognito user if you want it to survive refresh; then clear it when Cognito session is invalid or on sign out.

## Labels / Components
- Component: Frontend, Authentication, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

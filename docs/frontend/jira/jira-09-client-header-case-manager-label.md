# [CASE MANAGER] Client: Header / account dropdown – Case Manager label and menu

## Summary
When the logged-in user is a case manager, show a "Case Manager" label or badge in the header/account dropdown and simplify the dropdown menu (e.g. Home and Sign Out only; hide or adjust Account Settings if not needed for case managers).

## Description
Case managers should see a clear indication that they are in case manager mode. The account dropdown can be simplified since case managers may not need the same menu items as regular users (e.g. Account Settings can be hidden or shown based on role).

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] When the user is logged in and `StorageService.isCaseManager()` is true, the account dropdown (or header area) shows a "Case Manager" label or badge (e.g. next to the user's name or below it).
- [ ] The dropdown menu for case managers includes at least: Home, Sign Out.
- [ ] Product decision: Account Settings is either hidden for case managers or shown; document the choice. Recommendation: hide for MVP to simplify.
- [ ] When the user is not a case manager, the header and dropdown remain unchanged from current behavior.
- [ ] Localization key for "Case Manager" label is added and used for all supported languages.

## Technical Notes
- Reuse `UserAccountButton` (or equivalent); add a conditional render for the badge/label based on `StorageService.isCaseManager()`.
- Ensure the badge is accessible (e.g. aria-label or visible text).

## Labels / Components
- Component: Frontend, Header, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

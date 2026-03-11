# [CASE MANAGER] Client: Confirmation page "Register Another Person" button for case managers

## Summary
On the registration confirmation page, when the current user is a case manager, show a prominent "Register Another Person" button that navigates back to the event's registration form with a clean form state so they can register the next person without logging out or using the footer workaround.

## Description
After a case manager successfully registers someone, they should be able to immediately register another person for the same (or another) event. A dedicated button on the confirmation page provides a clear next step and avoids reliance on the footer "For Case Managers" workaround.

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] On the registration confirmation page, when the user is a case manager (e.g. `StorageService.getUserRole() === 'case_manager'`), a "Register Another Person" button is visible.
- [ ] The button is prominent (e.g. primary or highlight variant) and placed in a logical position (e.g. below the confirmation details or next to "Back to Home").
- [ ] Clicking "Register Another Person" navigates to the event's registration form (same event that was just used) with an empty form—no pre-filled data from the previous registrant.
- [ ] Alternatively, product may choose to navigate to the event details page or home so the case manager can pick the same or another event; if so, document the chosen behavior.
- [ ] The button is NOT shown for non–case managers (regular Cognito or guest users).
- [ ] Localization key for button text is added and used for all supported languages.

## Technical Notes
- Reuse existing navigation (e.g. `navigate`) and event/eventDateId from confirmation page state or route params.
- Clearing form state may require resetting any local state in the registration form or simply navigating so the form remounts with defaults.
- Do not clear the case manager's session or JWT; only reset registration-form-specific state.

## Labels / Components
- Component: Frontend, Registration, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

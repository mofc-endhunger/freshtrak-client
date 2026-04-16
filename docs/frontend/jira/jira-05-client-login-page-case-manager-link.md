# [CASE MANAGER] Client: Add "Are you a Case Manager?" link on main login page

## Summary
On the main login page (`/login`), add a subtle link such as "Are you a Case Manager?" that navigates to `/case-manager/login` so case managers can discover the dedicated login without requiring the URL.

## Description
Case managers may land on the regular login page first. A single link directs them to the case manager login page without cluttering the main flow for regular users.

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] On the main login page (e.g. below the sign-in form or in a secondary area), a text link or button is visible: "Are you a Case Manager?" (or use localization key).
- [ ] Clicking it navigates to `/case-manager/login`.
- [ ] Styling is secondary/subtle so it does not compete with the primary sign-in action.
- [ ] Link is present when the case manager login route exists (no link if that route is not yet implemented; can be merged with the case manager login ticket if preferred).
- [ ] Localization key added for the link text and included in all supported languages.

## Technical Notes
- Reuse existing `Link` from react-router-dom and existing typography/button styles.
- Localization key suggestion: e.g. `login_case_manager_link` or `login_are_you_case_manager`.

## Labels / Components
- Component: Frontend, Authentication, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

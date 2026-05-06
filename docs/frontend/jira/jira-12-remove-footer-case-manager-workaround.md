# [CASE MANAGER] Remove footer "For Case Managers" workaround

## Summary
Remove the short-term "For Case Managers" footer link (expandable section and "Register Another Person" with confirmation dialog) and related localization keys, now that the long-term case manager login and registration flow is in place.

## Description
The footer workaround allowed case managers to clear their guest token and return home to register another person. With the dedicated case manager login and "Register Another Person" on the confirmation page, the footer link is redundant and can be removed to reduce confusion and maintenance.

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] The "For Case Managers" expandable section is removed from `FooterComponent.tsx` (first column of the footer grid).
- [ ] The confirmation dialog for "Clear Current Session" is removed.
- [ ] All related state (e.g. `caseManagerExpanded`, `showClearSessionDialog`) and handlers (e.g. `handleClearSession`) are removed from the footer component.
- [ ] The footer layout reverts to two columns of links (Our Policies, For Foodbanks & Agencies) or keeps the first column empty as before the workaround; product/design to confirm.
- [ ] Localization keys added for the workaround are removed from all language blocks: `footer_for_case_managers`, `footer_register_another_person`, `footer_clear_session_title`, `footer_clear_session_description`, `footer_clear_session_confirm`, `footer_clear_session_cancel`.
- [ ] No remaining references to these keys or the workaround flow in the codebase.
- [ ] Documentation (e.g. `CASE_MANAGER_MULTI_REGISTRATION.md`) is updated to describe only the long-term flow and to note that the footer workaround has been removed.

## Technical Notes
- Do this ticket after the long-term case manager flow (login, registration with registrant payload, confirmation "Register Another Person") is live and verified.
- If the footer had an empty first column before the workaround, consider leaving it empty or removing the column for a two-column layout.

## Labels / Components
- Component: Frontend, Case Manager, Cleanup
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

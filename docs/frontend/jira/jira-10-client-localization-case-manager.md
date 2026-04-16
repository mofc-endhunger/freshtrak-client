# [CASE MANAGER] Client: Localization for case manager flow

## Summary
Add all new user-facing strings for the case manager login page, login link, confirmation "Register Another Person" button, header label, and any error messages to the localization file and ensure they are translated for all supported languages.

## Description
The case manager feature introduces new copy: case manager login page title/errors, "Are you a Case Manager?" link on the main login page, "Register Another Person" on the confirmation page, "Case Manager" in the header, and any 403 or validation messages. All must be localizable and present in every language the app supports.

**Repo:** freshtrak-client

## Acceptance Criteria
- [ ] New localization keys are added for:
  - Case manager login page: title, any error message (e.g. "This login is for authorized case managers only").
  - Main login page: "Are you a Case Manager?" (or equivalent) link text.
  - Confirmation page: "Register Another Person" button text.
  - Header: "Case Manager" label/badge.
  - Any other new strings (buttons, placeholders, errors) introduced in the case manager flow.
- [ ] Each key is added to all supported language blocks in the localization file (e.g. English, Spanish, Somali, Russian, Turkish, Arabic, Chinese, Hindi, Nepali).
- [ ] Translations are provided (use professional translation or placeholder for follow-up ticket); English copy is final for MVP.
- [ ] No hardcoded user-facing strings in the new case manager components; all use the localization module.

## Technical Notes
- Follow existing pattern in `LocalizationComponent.js` (or equivalent): same key in each language block.
- Key naming: e.g. `case_manager_login_title`, `case_manager_login_unauthorized_message`, `login_case_manager_link`, `case_manager_register_another_person`, `case_manager_badge`.

## Labels / Components
- Component: Frontend, Localization, Case Manager
- Repo: freshtrak-client
- Epic: Case Manager Long-Term Solution

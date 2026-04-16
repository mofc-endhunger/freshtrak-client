# Case Manager – Client-Side Implementation Task List

Ordered list of frontend tasks in logical implementation order. Dependencies are called out so each step can be done in sequence without blocking.

---

## Prerequisites (Backend / Cognito)

- [ ] **Jira 01** – Cognito `case_managers` group exists; at least one test case manager account created.
- [ ] **Jira 02** – Backend returns or JWT contains `cognito:groups` (needed for login page to validate role).
- [ ] **Jira 03** – Backend accepts `registrant` payload and implements "register on behalf of" (needed for registration flow).

---

## Step 1: StorageService – case manager role (Jira 08) ✅ DONE

**Why first:** Every other client feature needs to read or write "is this user a case manager?". No UI depends on this; it's the foundation.

- [x] Add storage key for role (e.g. `freshtrak_user_role` or `userRole`).
- [x] Implement `setUserRole(role: string)`, `getUserRole(): string | null`, `isCaseManager(): boolean`.
- [x] Clear role in sign-out flow (AuthContext or wherever Cognito sign-out runs).
- [x] Document when role is set (case manager login success) and when it's cleared (sign out / clear auth).

**Deliverable:** Role can be set after login and read elsewhere; sign out clears it.

---

## Step 2: Localization – case manager strings (Jira 10) ✅ DONE

**Why second:** Add all new copy once so the rest of the tasks can use localization keys instead of hardcoded text. Can be done in parallel with Step 1 if preferred.

- [x] Add keys for:
  - Case manager login page: title, unauthorized message.
  - Main login: "Are you a Case Manager?" link.
  - Confirmation: "Register Another Person" button.
  - Header: "Case Manager" label.
  - Any errors or buttons added in the flow.
- [x] Add entries for all supported languages (EN, ES, SO, RU, TR, AR, ZH, HI, NE); use placeholders or final translations per process.

**Deliverable:** All new case manager strings exist in the localization file and are used in the following steps.

---

## Step 3: Case Manager login page and route (Jira 04) ✅ DONE

**Depends on:** Step 1 (StorageService), Step 2 (localization). Backend/Jira 01–02 for group and JWT claims.

- [x] Add route `/case-manager/login` in the app router.
- [x] Create `CaseManagerLoginPage` (or equivalent) with sign-in form only (email + password).
- [x] On submit, call existing `AuthContext.signIn()`.
- [x] After success, decode JWT and check for `case_managers` in `cognito:groups`.
- [x] If not in group: show error (localized), sign out, stay on page.
- [x] If in group: call `StorageService.setUserRole('case_manager')`, redirect to home.
- [x] Ensure page is reachable when not logged in (no auth guard blocking it).

**Deliverable:** Case managers can sign in at `/case-manager/login` and are marked as case manager; others are rejected.

---

## Step 4: "Are you a Case Manager?" link on main login (Jira 05) ✅ DONE

**Depends on:** Step 3 (route and page exist).

- [x] On main login page, add link "Are you a Case Manager?" (localized).
- [x] Link navigates to `/case-manager/login`.
- [x] Style as secondary so it doesn't compete with main sign-in.

**Deliverable:** Users who land on the main login page can find the case manager login.

---

## Step 5: Header – Case Manager label and menu (Jira 09) ✅ DONE

**Depends on:** Step 1 (StorageService), Step 3 (so someone can be logged in as case manager).

- [x] In the account dropdown (or header), when `StorageService.isCaseManager()` is true, show "Case Manager" label/badge (localized).
- [x] For case managers, show simplified menu: Home, Sign Out (hide Account Settings for MVP if agreed).
- [x] When not a case manager, keep current header/dropdown behavior.

**Deliverable:** Case managers see they're in case manager mode and have the right menu options.

---

## Step 6: Registration flow – case manager mode (Jira 06) ✅ DONE

**Depends on:** Step 1 (StorageService), Step 2 (localization). Backend Jira 03 (register on behalf of) for E2E.

- [x] In registration flow, when `StorageService.isCaseManager()` is true, treat form as "case manager mode."
- [x] Form still collects registrant info (name, address, phone, household counts).
- [x] On submit: send standard registration fields plus `registrant` object with form data; use case manager's Cognito token only (no guest token).
- [x] On success: navigate to confirmation page as today.
- [x] On error: show appropriate message; don't misuse "already registered" for backend 403/400.
- [x] Leave existing guest and regular Cognito flows unchanged when user is not a case manager.

**Deliverable:** Case managers can complete a registration on behalf of someone else; backend creates the user/household and registration.

---

## Step 7: Confirmation page – "Register Another Person" (Jira 07) ✅ DONE

**Depends on:** Step 1 (StorageService), Step 6 (case manager registration flow exists).

- [x] On confirmation page, when `StorageService.isCaseManager()` is true, show "Register Another Person" button (localized).
- [x] Button is prominent; placement below confirmation details or next to "Back to Home."
- [x] On click: navigate to the same event's registration form with empty form (or to event details/home per product choice).
- [x] Do not show button for non-case managers.
- [x] Do not clear case manager session; only reset registration form state.

**Deliverable:** Case managers can register another person right from the confirmation page without using the footer workaround.

---

## Summary – Order at a glance

| Step | Jira | Task |
|------|------|------|
| 1 | 08 | StorageService – case manager role get/set/clear and clear on sign out |
| 2 | 10 | Localization – all case manager strings in all languages |
| 3 | 04 | Case Manager login page and route; validate group; set role |
| 4 | 05 | "Are you a Case Manager?" link on main login page |
| 5 | 09 | Header – Case Manager label and simplified dropdown |
| 6 | 06 | Registration flow – case manager mode and `registrant` payload |
| 7 | 07 | Confirmation page – "Register Another Person" button |

**Optional parallel:** Step 1 and Step 2 can be done in parallel. Steps 4 and 5 can be done in parallel after Step 3.

**Backend dependency:** Step 6 (and thus Step 7) is fully testable only after backend Jira 03 is deployed; UI and payload shape can be implemented as soon as the API contract is agreed.

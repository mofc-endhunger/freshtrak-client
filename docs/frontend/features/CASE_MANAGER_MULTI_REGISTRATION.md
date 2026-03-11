# Case Manager Multi-Registration Feature

## Overview

This feature allows case managers to register multiple people for the same event in a single authenticated session. Case managers log in through a dedicated `/case-manager/login` route using Cognito credentials that belong to the `case_managers` group. Once authenticated, the registration flow sends registrant data on behalf of the case manager, and the confirmation page offers a "Register Another Person" button to loop back for additional registrations.

> **Note:** The short-term footer-based workaround ("For Case Managers" toggle with session clear dialog) has been removed. All case manager functionality now uses the dedicated login and registration flow described below.

---

## For Case Managers: How to Register Multiple People

### Step-by-Step Instructions

1. Navigate to `/case-manager/login` (or click **"Are you a Case Manager?"** on the main login page).
2. Sign in with your case manager credentials (email and password).
3. You are taken to the **home page**. Find the event and begin registering the first person.
4. Fill in the registrant's information and submit.
5. On the **confirmation page**, save or print the confirmation if needed.
6. Click the **"Register Another Person"** button that appears below the confirmation details.
7. You are taken back to the event details page to register the next person.
8. **Repeat** steps 4–7 for each additional person.

### Important Reminders

- The "Register Another Person" button is **only visible to authenticated case managers**.
- Each registrant gets their own user record in the backend; the case manager's identity is tracked via the `created_by` field.
- Regular users (guest or standard Cognito) do **not** see the "Register Another Person" button and remain subject to duplicate registration checks.

---

## For Developers: Technical Details

### Architecture

| Concern | Implementation |
| --- | --- |
| **Authentication** | Dedicated `CaseManagerLoginPage` at `/case-manager/login`. Uses `useAuth().signIn()` with Cognito, then verifies `cognito:groups` includes `case_managers` in the JWT access token. |
| **Role persistence** | `StorageService.setUserRole('case_manager')` stores the role in `localStorage` (`freshtrak_user_role`). Checked via `StorageService.isCaseManager()`. |
| **Registration flow** | `RegistrationContainer.tsx` detects `isCaseManager` via `StorageService`, skips guest/Cognito profile update logic, and constructs a `registrantPayload` from form data. Uses `Authorization: Bearer` header with the Cognito token. |
| **Confirmation page** | `RegistrationConfirmComponent.tsx` reads `isCaseManager` from navigation state, suppresses the guest sign-in modal, and renders a "Register Another Person" button that navigates back to the event details page. |
| **Header badge** | `UserAccountButton.tsx` shows an amber "Case Manager" badge and hides "Account Settings" when `isCaseManager` is true. |
| **Entry points** | Subtle "Are you a Case Manager?" link on `LoginPage.tsx` and direct URL access to `/case-manager/login`. |

### Key Files

| File | Role |
| --- | --- |
| `src/Modules/Authentication/CaseManagerLoginPage.tsx` | Dedicated case manager login page |
| `src/Utils/StorageService.ts` | `setUserRole`, `getUserRole`, `isCaseManager`, `clearUserRole` |
| `src/Modules/Registration/RegistrationContainer.tsx` | Case manager branch in `determineUserType()` and `register()` |
| `src/Modules/Registration/RegistrationConfirmComponent.tsx` | "Register Another Person" button |
| `src/Modules/Header/components/UserAccountButton.tsx` | Case manager badge and menu adjustments |
| `src/Modules/Authentication/LoginPage.tsx` | "Are you a Case Manager?" link |
| `src/Core/Routes.js` | Route for `/case-manager/login` |
| `src/Utils/Urls.js` | `CASE_MANAGER_LOGIN_URL` constant |
| `src/Modules/Localization/LocalizationComponent.js` | `cm_*` localization keys across 9 languages |

### Localization Keys (cm_* prefix)

| Key | English Value |
| --- | --- |
| `cm_login_title` | Case Manager Sign In |
| `cm_login_subtitle` | Sign in with your case manager credentials |
| `cm_login_email_label` | Email |
| `cm_login_password_label` | Password |
| `cm_login_button` | Sign In |
| `cm_login_unauthorized` | This account is not authorized as a case manager. |
| `cm_login_error_generic` | Login failed. Please check your credentials and try again. |
| `cm_login_link` | Are you a Case Manager? |
| `cm_badge` | Case Manager |
| `cm_register_another` | Register Another Person |

### Removed: Footer Workaround

The following items were part of the short-term workaround and have been removed:

- **FooterComponent.tsx**: The expandable "For Case Managers" section, "Register Another Person" link, confirmation dialog, and all related state (`caseManagerExpanded`, `showClearSessionDialog`) and handlers (`handleClearSession`) have been removed. The footer reverts to its original layout with an empty first column.
- **LocalizationComponent.js**: Six workaround-specific keys removed from all 9 languages: `footer_for_case_managers`, `footer_register_another_person`, `footer_clear_session_title`, `footer_clear_session_description`, `footer_clear_session_confirm`, `footer_clear_session_cancel`.

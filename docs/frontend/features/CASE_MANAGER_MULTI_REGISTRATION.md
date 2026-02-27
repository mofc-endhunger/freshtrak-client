# Case Manager Multi-Registration Feature

## Overview

This feature allows case managers to register multiple people for the same event in a single session using the guest registration flow. Previously, attempting a second guest registration for the same event resulted in a "User already registered" error because the guest token (which identifies the guest session) persisted after the first registration.

A **"For Case Managers"** option has been added to the site footer that enables case managers to clear their current guest session and start a fresh registration for the next person.

> **Note:** This is a short-term solution. A dedicated case manager role with built-in multi-registration support is planned for a future release.

---

## For Case Managers: How to Register Multiple People

### Step-by-Step Instructions

1. **Register the first person** as usual using the guest flow (Continue as Guest).
2. On the **confirmation page**, save or print the confirmation (use the Print or Save button) before proceeding.
3. **Scroll down** to the footer at the bottom of the page.
4. Click **"For Case Managers"** in the footer — this reveals a hidden link.
5. Click **"Register Another Person"**.
6. A confirmation dialog will appear warning that the current session will be cleared. Click **"Continue"**.
7. You will be taken back to the **home page** with a fresh session.
8. **Find the event** again and register the next person as a new guest.
9. **Repeat** steps 2–8 for each additional person.

### Important Reminders

- **Always save/print the confirmation** before clearing the session. Once cleared, you cannot go back to the previous confirmation page.
- The "For Case Managers" link is available on **every page** in the footer — you can use it from the confirmation page, the home page, or anywhere else.
- If you click **"Cancel"** in the confirmation dialog, nothing happens — you stay on the current page with your session intact.

---

## For Developers: Technical Details

### Problem

The guest registration flow ties a guest identity to a `guest_token` stored in `localStorage`. When a guest registers for an event, the backend associates that token with the registration. If the same token is used to register for the same event again, the API returns a duplicate registration error. The client detects this via keyword matching (`already registered`, `already exist`, etc.) and redirects to `/register/already-registered`.

For case managers registering multiple people at a kiosk or shared device, this is a blocker — they need a way to get a fresh guest identity between registrations.

### Solution

A footer-based session reset mechanism:

1. **"For Case Managers"** — a clickable toggle in the footer's first column (previously empty) that expands to reveal a nested link.
2. **"Register Another Person"** — clicking this opens a confirmation dialog.
3. **Confirmation dialog** — warns the user and requires an explicit choice (Cancel / Continue). The dialog cannot be dismissed via X button, overlay click, or Escape key.
4. **On confirm** — clears all guest session data from `localStorage` and navigates to the home page. The next registration will create a fresh guest token.

### Files Changed

| File                                                | Change                                                                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/Modules/Footer/FooterComponent.tsx`            | Added expandable "For Case Managers" section, "Register Another Person" link, and confirmation dialog. Converted from static arrow function to hook-based component. |
| `src/Modules/Localization/LocalizationComponent.js` | Added 6 localization keys across all 9 languages (English, Spanish, Somali, Russian, Turkish, Arabic, Chinese, Hindi, Nepali).                                       |

### Guest Token Lifecycle (Reference)

| Phase       | Location                                                                                            | Detail                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Created** | Backend API                                                                                         | `POST api/guest-authentications` returns a token + profile                             |
| **Stored**  | `localStorage`                                                                                      | Key: `freshtrak_user_guest` (via `StorageService`)                                     |
| **Set**     | `RegistrationEventDetailsContainer.tsx`, `LoginPage.tsx`                                            | After guest auth API call                                                              |
| **Used**    | `RegistrationContainer.tsx`                                                                         | Sent as `X-Guest-Token` header on PATCH (update profile) and POST (create reservation) |
| **Cleared** | `FooterComponent.tsx` (this feature), `AuthContext.tsx`, `UserRecordHelper.ts`, `StorageService.ts` | On session reset, Cognito sign-in, guest upgrade, or token expiration                  |

### What Gets Cleared

The `handleClearSession` function removes four keys from `localStorage`:

```javascript
StorageService.removeItem("freshtrak_user_guest"); // Main guest token + profile
StorageService.clearUserToken(); // User token (freshtrak_user_token)
StorageService.removeItem("guestId"); // Guest ID
StorageService.removeItem("guestType"); // Guest type flag
```

After clearing, `navigate(RENDER_URL.ROOT_URL)` sends the user to the home page. The next time they click "Continue as Guest" on an event, a fresh `POST api/guest-authentications` call creates a new identity.

### Localization Keys

| Key                                | English Value                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `footer_for_case_managers`         | For Case Managers                                                                                                                                             |
| `footer_register_another_person`   | Register Another Person                                                                                                                                       |
| `footer_clear_session_title`       | Clear Current Session                                                                                                                                         |
| `footer_clear_session_description` | This will clear your current registration session so you can register another person. Make sure you have saved or printed any confirmation before proceeding. |
| `footer_clear_session_confirm`     | Continue                                                                                                                                                      |
| `footer_clear_session_cancel`      | Cancel                                                                                                                                                        |

### Dialog Behavior

The confirmation dialog is intentionally restrictive to prevent accidental session clearing:

- **No X close button** (`showCloseButton={false}`)
- **No overlay dismiss** (`onInteractOutside` prevented)
- **No Escape key dismiss** (`onEscapeKeyDown` prevented)
- Only **Cancel** and **Continue** buttons can dismiss the dialog

### Limitations

- **No role-based access control** — any user who discovers the footer link can use it. This is acceptable for the short-term because the link is hidden behind a toggle and requires intentional interaction.
- **No automatic session reset** — the case manager must manually click the footer link between each registration.
- **Session data is lost on clear** — the previous registration's confirmation page cannot be revisited after clearing the session. Case managers must save/print confirmations before proceeding.

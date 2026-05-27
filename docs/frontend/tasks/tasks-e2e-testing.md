# Task List: E2E Test Automation & PantryTrak Sync Verification

> Companion to: [PRD](../../../freshtrak-e2e/PRD.md)  
> Tasks are ordered by dependency — each phase must be complete before the next begins.

---

## Relevant Files

### New Files

- `playwright.config.ts` — add `beta` project and `grep` exclusions to existing config _(modified)_
- `e2e/fixtures/beta.fixture.ts` — extends `auth.fixture.ts` with `PantryTrakVerifier` injection
- `e2e/services/PantryTrakVerifier.ts` — interface, `NoOpVerifier`, and `createVerifier` factory
- `e2e/services/PantryTrakApiClient.ts` — Option A: REST verification endpoint client
- `e2e/services/PantryTrakDbClient.ts` — Option B: direct DB query fallback
- `e2e/pages/BasePage.ts` — shared POM base (navigation helpers, wait utilities)
- `e2e/pages/LoginPage.ts` — sign-up and sign-in POM actions
- `e2e/pages/RegistrationFormPage.ts` — registration steps POM (Steps 1–3 + submit)
- `e2e/pages/HouseholdSetupPage.ts` — household wizard POM
- `e2e/pages/CaseManagerPage.ts` — CM login and registrations dashboard POM
- `e2e/pages/UserHomePage.ts` — user home, past events, and assessment POM
- `e2e/tests/signup.spec.ts` — new account creation E2E
- `e2e/tests/guest-registration.spec.ts` — full guest session flow
- `e2e/tests/guest-upgrade.spec.ts` — guest → registered upgrade
- `e2e/tests/case-manager.spec.ts` — CM login, registrations, multi-register
- `e2e/tests/household-setup.spec.ts` — household wizard completion
- `e2e/tests/household-update.spec.ts` — household update from Account page
- `e2e/tests/user-home.spec.ts` — `/user-home`, past reservations, feedback
- `e2e/tests/edge-cases.spec.ts` — already-registered, duplicate, expired session, invalid zip
- `e2e/tests/pantrytrak/user-sync.spec.ts` — PantryTrak user record sync (`@beta-only`)
- `e2e/tests/pantrytrak/registration-sync.spec.ts` — PantryTrak registration sync (`@beta-only`)

### Modified Files

- `playwright.config.ts` — add `beta` project, grep filters on existing browser projects, env-aware `baseURL`
- `e2e/helpers/test-data.ts` — add CM credentials, no-household user, beta event IDs, PT auth state path
- `e2e/helpers/selectors.ts` — add any missing `data-testid` selectors needed by new specs
- `e2e/tests/registration-flow.spec.ts` — extend with final submit step and confirmation page assertions
- `e2e/tests/search-results.spec.ts` — add list/grid filter parity test and filter reset test
- `.github/workflows/ci.yml` — add `e2e-beta` job (beta-branch-only, depends on `e2e` job)
- `package.json` — add `test:e2e:beta` script
- `README.md` — correct port (5000 not 3000), document all specs and new env vars

### Notes

- All new spec files use the **Page Object Model** pattern (see `e2e/pages/`). Do not add more inline helpers to existing specs.
- The `@beta-only` annotation must appear in the test title string so Playwright's `grep` filter can match it: `test('description @beta-only', ...)`.
- PantryTrak credentials (`PANTRYTRAK_API_URL`, `PANTRYTRAK_API_TOKEN`, `PANTRYTRAK_DB_URL`) go in `.env` locally and GitHub Secrets in CI — never hardcoded.
- Use `expect.poll()` with a `timeout` for PantryTrak sync assertions — never use `waitForTimeout` / `sleep`.
- New test users for CM and "no-household" scenarios must be pre-created in dev and beta Cognito user pools and stored as env vars.
- Run a specific spec locally: `npm run test:e2e -- --grep "signup" --project=chromium`

---

## Tasks

- [ ] **1.0 Infrastructure — Config, Projects, and Environment**
  - [ ] 1.1 Update `playwright.config.ts`:
    - Add `beta` project: `{ name: 'beta', use: { ...devices['Desktop Chrome'], baseURL: process.env.BETA_BASE_URL }, dependencies: ['setup'] }`
    - Add `grep: /^(?!.*@beta-only)/` to existing `chromium`, `firefox`, `webkit` projects so `@beta-only` tests are skipped on dev runs
    - Make `baseURL` env-aware: `process.env.PLAYWRIGHT_BASE_URL || process.env.BETA_BASE_URL || 'http://localhost:5000'`
  - [ ] 1.2 Update `e2e/helpers/test-data.ts`:
    - Add `TEST_CM_USER` with `email: process.env.E2E_CM_EMAIL` and `password: process.env.E2E_CM_PASSWORD`
    - Add `TEST_NO_HOUSEHOLD_USER` with `email: process.env.E2E_NO_HOUSEHOLD_EMAIL` and `password: process.env.E2E_NO_HOUSEHOLD_PASSWORD`
    - Add `TEST_EVENT_DATE_ID: process.env.E2E_EVENT_DATE_ID || ''` (stable pinned event for registration tests)
    - Add `BETA_AUTH_STATE_PATH: 'e2e/.auth/beta-user.json'`
  - [ ] 1.3 Add `test:e2e:beta` script to `package.json`:
    ```json
    "test:e2e:beta": "env-cmd -f .env.beta playwright test --project=beta"
    ```
  - [ ] 1.4 Update `README.md` E2E section:
    - Fix dev server port reference (3000 → 5000)
    - Document all 8 existing spec files and their coverage
    - Document all new env vars: `E2E_CM_EMAIL`, `E2E_CM_PASSWORD`, `E2E_NO_HOUSEHOLD_EMAIL`, `E2E_NO_HOUSEHOLD_PASSWORD`, `E2E_EVENT_DATE_ID`, `VERIFY_PANTRYTRAK`, `PANTRYTRAK_VERIFY_MODE`, `PANTRYTRAK_API_URL`, `PANTRYTRAK_API_TOKEN`, `PANTRYTRAK_DB_URL`, `BETA_BASE_URL`

- [ ] **2.0 PantryTrak Verifier — Abstraction Layer**
  - [ ] 2.1 Create `e2e/services/PantryTrakVerifier.ts`:
    - Define `PantryTrakRecord` type: `{ id: string; email: string; pantrytrakId: string; syncedAt: string }`
    - Define `PantryTrakVerifier` interface with three methods: `userExists(email: string): Promise<boolean>`, `registrationExists(id: string): Promise<boolean>`, `getRegistrationRecord(id: string): Promise<PantryTrakRecord | null>`
    - Implement `NoOpVerifier` (all methods return `true` / `null` — used on dev, no network calls)
    - Export `createVerifier()` factory: returns `NoOpVerifier` when `VERIFY_PANTRYTRAK !== 'true'`, otherwise `PantryTrakApiClient` (Option A) or `PantryTrakDbClient` (Option B) based on `PANTRYTRAK_VERIFY_MODE`
  - [ ] 2.2 Create `e2e/services/PantryTrakApiClient.ts` (Option A — preferred):
    - Constructor accepts `baseUrl: string` and `token: string`
    - `userExists(email)` — `GET {baseUrl}/internal/verify/pantrytrak/user?email={email}` with `Authorization: Bearer {token}`
    - `registrationExists(id)` — `GET {baseUrl}/internal/verify/pantrytrak/registration?id={id}`
    - `getRegistrationRecord(id)` — same endpoint, maps response to `PantryTrakRecord`
    - All methods return `false` / `null` on 404; throw on 5xx
  - [ ] 2.3 Create `e2e/services/PantryTrakDbClient.ts` (Option B — fallback):
    - Constructor accepts `connectionString: string`; instantiates a DB pool (`pg` for PostgreSQL or `mysql2` depending on PantryTrak DB engine — confirm with backend team)
    - Implement same three interface methods using parameterized SQL queries
    - Close pool in a `disconnect()` method called in fixture teardown
    - Add the appropriate DB driver as a dev dependency (`npm install -D pg` or `npm install -D mysql2`)
  - [ ] 2.4 Create `e2e/fixtures/beta.fixture.ts`:
    - Extend `auth.fixture.ts` `test` with a `verifier: PantryTrakVerifier` fixture property
    - In fixture setup: call `createVerifier()` and pass to `use(verifier)`
    - In fixture teardown: call `verifier.disconnect?.()` to close DB pools if applicable

- [ ] **3.0 Page Object Models**
  - [ ] 3.1 Create `e2e/pages/BasePage.ts`:
    - Constructor accepts `page: Page`
    - Helper: `waitForNetworkIdle()` — wraps `page.waitForLoadState('networkidle')`
    - Helper: `goto(path: string)` — wraps `page.goto` with `waitUntil: 'domcontentloaded'`
  - [ ] 3.2 Create `e2e/pages/LoginPage.ts`:
    - Actions: `fillSignIn(email, password)`, `submitSignIn()`, `clickSignUpTab()`, `fillSignUp(email, password, firstName, lastName)`, `submitSignUp()`, `fillVerificationCode(code)`, `clickGuestButton()`, `expectSignedIn()`
    - Use `SEL.*` constants from `selectors.ts`
  - [ ] 3.3 Create `e2e/pages/RegistrationFormPage.ts`:
    - Actions: `fillStep1(data)`, `fillStep2(data)`, `fillStep3(data)`, `submitFinalRegistration()`
    - Assertions: `expectConfirmationPage()`, `getRegistrationId(): Promise<string>` (reads ID from confirmation page for PT verification)
  - [ ] 3.4 Create `e2e/pages/HouseholdSetupPage.ts`:
    - Actions: `fillAddress(data)`, `fillContact(data)`, `addMember(data)`, `fillDemographics(data)`, `submitWizard()`
    - Assertions: `expectSetupComplete()`
  - [ ] 3.5 Create `e2e/pages/CaseManagerPage.ts`:
    - Actions: `signIn(email, password)`, `expectRegistrationsPage()`, `getRegistrationCount(): Promise<number>`
  - [ ] 3.6 Create `e2e/pages/UserHomePage.ts`:
    - Actions: `goto()`, `openPastEventAssessment(index: number)`, `submitAssessment(data)`
    - Assertions: `expectReservationVisible(eventName: string)`, `expectPastEventsVisible()`

- [ ] **4.0 Extend Existing Specs**
  - [ ] 4.1 Extend `e2e/tests/registration-flow.spec.ts` — add final submit and confirmation:
    - After Step 3 (family info), click the final Register / Submit button
    - Assert redirect to `/register/confirm`
    - Assert confirmation page shows event name, date, and registrant name (`data-testid` values — add to `selectors.ts` if missing)
    - Add `data-testid="registration-id"` to the confirmation page component (coordinate with frontend team or use URL param if ID is in the URL)
    - Navigate to `/user-home` and assert the new reservation appears in the upcoming list
  - [ ] 4.2 Extend `e2e/tests/search-results.spec.ts` — add filter parity and reset:
    - Apply availability filter, switch to grid view, assert same event count and IDs as list view
    - Switch back to list view, assert still matches
    - Click clear/reset, assert unfiltered full list is restored
    - Assert filtered empty state renders when no events match (use `noEvents` zip from `test-data.ts`)

- [ ] **5.0 New Spec: Sign Up**  
       _File: `e2e/tests/signup.spec.ts`_
  - [ ] 5.1 Test: new account creation (happy path):
    - Use `LoginPage` POM; generate unique email via `e2e+${Date.now()}@testdomain.com`
    - Complete sign-up form, submit, enter verification code (auto-confirm lambda — coordinate with backend/infra team for dev/beta user pools)
    - Assert redirect to home, header reflects signed-in state
    - Assert household setup wizard prompt appears (first login)
  - [ ] 5.2 Test: sign-up with already-used email shows clear error:
    - Use `TEST_USER.email` (existing account) in sign-up form
    - Assert error message rendered (not a crash or blank screen)
  - [ ] 5.3 Test: sign-up form validation (empty fields, weak password, mismatched passwords):
    - Assert inline validation messages appear without submitting the form

- [ ] **6.0 New Spec: Guest Registration**  
       _File: `e2e/tests/guest-registration.spec.ts`_
  - [ ] 6.1 Test: full guest session flow (happy path):
    - Navigate to event details as anonymous user
    - Click Register Now → auth modal → Continue as Guest
    - Assert guest session active (no Cognito auth), form is blank (no pre-fill)
    - Fill all required fields manually, submit
    - Assert `/register/confirm` renders with submitted data
  - [ ] 6.2 Test: guest form requires all mandatory fields before submit:
    - Leave required fields empty, attempt submit
    - Assert validation messages appear
  - [ ] 6.3 Test: guest → sign-in mid-flow:
    - Start as guest, reach registration form
    - Choose to sign in instead (if UI offers link)
    - Assert authentication modal opens correctly

- [ ] **7.0 New Spec: Guest → Registered Upgrade**  
       _File: `e2e/tests/guest-upgrade.spec.ts`_
  - [ ] 7.1 Test: upgrade after guest registration preserves reservation:
    - Complete guest registration (reuse helper from `guest-registration.spec.ts`)
    - Initiate account creation from post-registration prompt
    - Complete sign-up, confirm email
    - Assert household setup prompt appears
    - Navigate to `/user-home`, assert guest reservation is visible
  - [ ] 7.2 Test: upgrade requires valid Cognito account creation:
    - Attempt sign-up with invalid email during upgrade
    - Assert error message shown, guest session not destroyed

- [ ] **8.0 New Spec: Case Manager**  
       _File: `e2e/tests/case-manager.spec.ts`_
  - [ ] 8.1 Test: CM sign-in at `/case-manager/login`:
    - Fill `TEST_CM_USER` credentials, submit
    - Assert redirect to CM registrations page
    - Assert "Case Manager" label visible in header
  - [ ] 8.2 Test: non-CM user rejected at CM login:
    - Use `TEST_USER` (regular user) credentials
    - Assert error message shown, no redirect to registrations page
  - [ ] 8.3 Test: registration form is blank (not pre-filled with CM data):
    - Sign in as CM, navigate to event → Register Now
    - Assert all form fields are empty
  - [ ] 8.4 Test: CM registers client A, then client B for the same event:
    - Submit first registration (client A data)
    - Assert confirmation page shown with "Register Another Person" button
    - Click "Register Another Person", fill client B data, submit
    - Assert second confirmation shown
    - Return to `/case-manager/registrations`, assert both registrations appear in the list
  - [ ] 8.5 Test: CM dashboard shows existing registrations:
    - Sign in as CM, navigate to `/case-manager/registrations`
    - Assert table/list renders with at least one row (use pre-existing test data)

- [ ] **9.0 New Spec: Household Setup**  
       _File: `e2e/tests/household-setup.spec.ts`_
  - [ ] 9.1 Test: complete household setup wizard (happy path):
    - Sign in as `TEST_NO_HOUSEHOLD_USER` (user with no existing household)
    - Navigate to `/households/setup`
    - Complete each wizard step (address, contact, add one member, demographics) using `HouseholdSetupPage` POM
    - Submit, assert success redirect
    - Navigate to `/account`, assert household section shows submitted data
  - [ ] 9.2 Test: wizard validates required fields before advancing:
    - Leave address fields empty, click Next
    - Assert validation errors shown on current step (no advancement)
  - [ ] 9.3 Test: unauthenticated user is redirected away from `/households/setup`:
    - Navigate to `/households/setup` without auth
    - Assert redirect to login or home (not an error page)

- [ ] **10.0 New Spec: Household Update**  
       _File: `e2e/tests/household-update.spec.ts`_
  - [ ] 10.1 Test: update existing household address and member from Account page:
    - Sign in as `TEST_USER` (user with full household)
    - Navigate to `/account` → Update Household link
    - Change a street address field and add a new household member
    - Save, assert success notification
    - Refresh page, assert updated values persist
  - [ ] 10.2 Test: cancelled update does not persist changes:
    - Navigate to household form, change a field, click Cancel (if present)
    - Assert original values still shown

- [ ] **11.0 New Spec: User Home & Past Events**  
       _File: `e2e/tests/user-home.spec.ts`_
  - [ ] 11.1 Test: `/user-home` renders upcoming and past reservations:
    - Sign in as `TEST_USER` (user with known fixture reservations)
    - Navigate to `/user-home`
    - Assert page loads, upcoming reservations section visible
    - Assert at least one past reservation listed (use fixture user with past event)
  - [ ] 11.2 Test: open and submit a feedback/assessment form for a past event:
    - Click assessment/feedback CTA on a past reservation card
    - Assert assessment form opens
    - Fill and submit the form
    - Assert confirmation shown (form no longer shows as actionable)
  - [ ] 11.3 Test: `/user-home` requires authentication:
    - Navigate to `/user-home` without auth
    - Assert redirect to login or home

- [ ] **12.0 New Spec: Edge Cases**  
       _File: `e2e/tests/edge-cases.spec.ts`_
  - [ ] 12.1 Test (`EDGE-001`): duplicate registration redirects to already-registered page:
    - Sign in, register for the pinned test event
    - Attempt to register for the same event again
    - Assert redirect to `/register/already-registered` with clear message
  - [ ] 12.2 Test (`EDGE-002`): expired guest token shows graceful error:
    - Create guest session via `page.evaluate(() => localStorage.setItem(...))` with a fake/expired guest token
    - Attempt to submit registration
    - Assert error state (not blank screen, not 500 page)
  - [ ] 12.3 Test (`EDGE-003`): full/unavailable event disables registration:
    - Navigate to an event known to be full or closed (add `FULL_EVENT_DATE_ID` to `test-data.ts`)
    - Assert Register Now button is disabled or absent
    - Assert availability messaging shown
  - [ ] 12.4 Test (`EDGE-004`): invalid zip code shows friendly empty/error state:
    - Enter `"00000"` in dashboard zip search, submit
    - Assert user-friendly message shown (not crash, not blank)
  - [ ] 12.5 Test (`EDGE-005`): `/account` requires authentication:
    - Navigate to `/account` without auth
    - Assert redirect to login (not 404 or error screen)
  - [ ] 12.6 Test (`EDGE-006`): QR code page renders for valid code:
    - Navigate to `/qrcode/{validCode}` (add `TEST_QR_CODE` to `test-data.ts`)
    - Assert page renders without error

- [ ] **13.0 New Spec: PantryTrak User Sync (`@beta-only`)**  
       _File: `e2e/tests/pantrytrak/user-sync.spec.ts`_  
       _Requires: Task 2.0 complete, `VERIFY_PANTRYTRAK=true`, `PANTRYTRAK_\*` env vars set\_
  - [ ] 13.1 Test: new Cognito account syncs to PantryTrak:
    - Use `beta.fixture.ts` (imports `verifier`)
    - Create new account via sign-up flow (unique timestamped email)
    - Poll `verifier.userExists(email)` with `expect.poll({ timeout: 15_000 })`
    - Assert returns `true`
  - [ ] 13.2 Test: PantryTrak user record matches FreshTrak account fields:
    - Call `verifier.getRegistrationRecord(...)` or a `getUserRecord(email)` method
    - Assert first name, last name, email fields match sign-up data
  - [ ] 13.3 Teardown: delete or deactivate the created Cognito + PantryTrak test user via API in `afterEach` to prevent data accumulation on beta

- [ ] **14.0 New Spec: PantryTrak Registration Sync (`@beta-only`)**  
       _File: `e2e/tests/pantrytrak/registration-sync.spec.ts`_  
       _Requires: Task 2.0 complete, `VERIFY_PANTRYTRAK=true`, `PANTRYTRAK_\*` env vars set\_
  - [ ] 14.1 Test: registered-user event registration syncs to PantryTrak:
    - Sign in as `TEST_USER`, complete registration for `TEST_EVENT_DATE_ID` using `RegistrationFormPage` POM
    - Capture `registrationId` from confirmation page (`RegistrationFormPage.getRegistrationId()`)
    - Poll `verifier.registrationExists(registrationId)` with `expect.poll({ timeout: 20_000, intervals: [1000, 2000, 3000, 5000] })`
    - Assert returns `true`
  - [ ] 14.2 Test: PantryTrak registration record data integrity:
    - Call `verifier.getRegistrationRecord(registrationId)`
    - Assert event ID, registrant email, and slot/date match what was submitted in the UI
  - [ ] 14.3 Test: guest event registration syncs to PantryTrak:
    - Repeat 14.1 flow as a guest user
    - Assert guest registration also lands in PantryTrak
  - [ ] 14.4 Teardown: cancel test registrations via FreshTrak Registration API in `afterEach`

- [ ] **15.0 CI Pipeline Update**
  - [ ] 15.1 Add `e2e-beta` job to `.github/workflows/ci.yml`:
    - `if: github.ref == 'refs/heads/beta'` (runs only on beta branch)
    - `needs: [e2e]` (runs after core E2E job passes)
    - `runs-on: ubuntu-latest`, `timeout-minutes: 30`
    - Steps: checkout → setup-node → `npm ci` → `npx playwright install --with-deps chromium` → `npx playwright test --project=beta`
    - Env vars: `TEST_ENV=beta`, `VERIFY_PANTRYTRAK=true`, `PANTRYTRAK_VERIFY_MODE=api`, `PANTRYTRAK_API_URL`, `PANTRYTRAK_API_TOKEN`, `BETA_BASE_URL`, `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_CM_EMAIL`, `E2E_CM_PASSWORD`, all `REACT_APP_*` beta values
    - Upload `playwright-report-beta` artifact (retention: 30 days)
  - [ ] 15.2 Add GitHub Secrets and Vars for beta environment:
    - Secrets: `PANTRYTRAK_API_TOKEN`, `PANTRYTRAK_DB_URL` (if Option B), `BETA_BASE_URL`, `E2E_CM_EMAIL`, `E2E_CM_PASSWORD`, `E2E_NO_HOUSEHOLD_EMAIL`, `E2E_NO_HOUSEHOLD_PASSWORD`
    - Vars: `PANTRYTRAK_API_URL`, `E2E_EVENT_DATE_ID`, all beta-environment `REACT_APP_*` values

---

## Summary — Implementation Order

| Phase               | Tasks       | Depends On                           |
| ------------------- | ----------- | ------------------------------------ |
| 1 — Infrastructure  | 1.0         | Nothing                              |
| 2 — PT Abstraction  | 2.0         | 1.0                                  |
| 3 — Page Objects    | 3.0         | 1.0                                  |
| 4 — Extend Existing | 4.0         | 3.0                                  |
| 5 — Core New Specs  | 5.0 – 12.0  | 3.0 (use POMs)                       |
| 6 — PT Sync Specs   | 13.0 – 14.0 | 2.0, 5.0, backend PT verify endpoint |
| 7 — CI              | 15.0        | 13.0 – 14.0 validated locally        |

**Can be done in parallel within Phase 5:** Tasks 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, and 12.0 are independent of each other.

**Backend dependency:** Tasks 13.0 and 14.0 require either the PantryTrak verification REST endpoint (Option A) or confirmed read-only DB credentials (Option B) before they can be wired up and run on beta.

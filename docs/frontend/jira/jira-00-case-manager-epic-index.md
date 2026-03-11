# Case Manager Long-Term Solution – Jira Tickets Index

Copy/paste each ticket from the corresponding file below into Jira. Suggested order and dependencies are listed.

## Phase 1: Cognito & Backend (pantry-registration-api-node)

| # | File | Summary | Depends on |
|---|------|---------|------------|
| 01 | `jira-01-cognito-case-managers-group-setup.md` | Create Cognito `case_managers` group and first account | — |
| 02 | `jira-02-backend-jwt-extract-cognito-groups.md` | Backend: Extract `cognito:groups` from JWT, populate `req.user.roles` | 01 |
| 03 | `jira-03-backend-register-on-behalf-of.md` | Backend: "Register on behalf of" (registrant payload + create User/Household) | 02 |

## Phase 2: Client (freshtrak-client)

| # | File | Summary | Depends on |
|---|------|---------|------------|
| 04 | `jira-04-client-case-manager-login-page.md` | Case Manager login page at `/case-manager/login` | 01, 02 |
| 05 | `jira-05-client-login-page-case-manager-link.md` | "Are you a Case Manager?" link on main login page | 04 (or parallel) |
| 08 | `jira-08-client-storage-service-case-manager-role.md` | StorageService: case manager role get/set/clear | — (needed by 04, 06, 07, 09) |
| 06 | `jira-06-client-registration-flow-case-manager.md` | Registration flow: send `registrant` payload, JWT auth | 03, 08 |
| 07 | `jira-07-client-confirmation-register-another-person.md` | Confirmation page: "Register Another Person" button | 06, 08 |
| 09 | `jira-09-client-header-case-manager-label.md` | Header: Case Manager label and simplified dropdown | 04, 08 |
| 10 | `jira-10-client-localization-case-manager.md` | Localization for all case manager strings | 04, 05, 06, 07, 09 |

## Phase 3: Admin Tooling & Cleanup

| # | File | Summary | Depends on |
|---|------|---------|------------|
| 11 | `jira-11-cli-case-manager-account-management.md` | CLI: create/list/disable/enable case manager accounts | 01 |
| 13 | `jira-13-backend-registrations-created-by-me.md` | Backend: GET /api/registrations/created-by-me | 03 |
| 12 | `jira-12-remove-footer-case-manager-workaround.md` | Remove footer "For Case Managers" workaround | Phase 2 complete |

## Suggested sprint grouping

- **Sprint 1:** 01, 02, 03, 08 (backend + storage)
- **Sprint 2:** 04, 05, 06, 07, 09, 10 (client flow)
- **Sprint 3:** 11, 12, 13 (CLI, cleanup, created-by-me)

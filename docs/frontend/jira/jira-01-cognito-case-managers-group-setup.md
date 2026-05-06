# [CASE MANAGER] Create Cognito case_managers group and first case manager account

## Summary
Create the `case_managers` user group in the existing Cognito User Pool and provision the first case manager account so the backend and client can gate case manager features by group membership.

## Description
As part of the long-term Case Manager Multi-Registration solution, we need a dedicated Cognito group for case managers. Case manager accounts will be admin-created only (no self-service sign-up). The JWT will automatically include `cognito:groups`, which the backend and client will use to identify case managers.

**Scope:** AWS Cognito Console (and/or CLI) only. No code changes in this ticket.

## Acceptance Criteria
- [ ] A new group named `case_managers` exists in the existing Cognito User Pool.
- [ ] At least one test case manager user is created in the User Pool.
- [ ] The test user is added to the `case_managers` group.
- [ ] The test user is created with temporary password and `FORCE_CHANGE_PASSWORD` status (Cognito default for admin-created users).
- [ ] Credentials (or invite link) are shared securely with the case manager; they can sign in and complete the forced password change.
- [ ] Document the steps in the project wiki (or runbook) so future case managers can be provisioned the same way.

## Technical Notes
- Use Cognito Console: User Pool → Groups → Create group → name: `case_managers`.
- Create user: Users → Create user → set email, temporary password, leave "Send an email invitation" optional.
- Add user to group: Select user → Add user to group → choose `case_managers`.
- The `cognito:groups` claim is added to ID and access tokens automatically; no app client changes required.

## Labels / Components
- Component: Authentication, Case Manager
- Repo: N/A (AWS Console)
- Epic: Case Manager Long-Term Solution

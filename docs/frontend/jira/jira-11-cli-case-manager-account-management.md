# [CASE MANAGER] CLI script for case manager account management (Cognito)

## Summary
Create a Node.js CLI script (or small admin tool) that uses the AWS Cognito Admin API to create case manager accounts, list them, and disable/enable users in the `case_managers` group. This supports the admin-created-accounts model without requiring manual Console steps for every new case manager.

## Description
Case managers are provisioned only by admins. To scale beyond the first few users, we need a repeatable way to create accounts and add them to the `case_managers` group, and to disable access when needed. A CLI keeps the implementation simple and can be run from a secure environment (CI, admin machine, or backend job).

**Repo:** Can live in freshtrak-client (e.g. `scripts/`), pantry-registration-api-node (e.g. `scripts/`), or a small standalone repo; decide per team convention.

## Acceptance Criteria
- [ ] Script can create a new case manager: e.g. `node scripts/case-manager-cli.js create --email <email> --name <name>` (or equivalent). It creates the user in Cognito with temporary password and adds them to the `case_managers` group. Optionally send email invitation (Cognito built-in) or output temp password.
- [ ] Script can list case managers: e.g. `node scripts/case-manager-cli.js list` (or equivalent). It lists users in the `case_managers` group (email, username, status).
- [ ] Script can disable a case manager: e.g. `node scripts/case-manager-cli.js disable --email <email>`. It calls Cognito `AdminDisableUser`.
- [ ] Script can re-enable a case manager: e.g. `node scripts/case-manager-cli.js enable --email <email>`. It calls Cognito `AdminEnableUser`.
- [ ] Script uses AWS credentials (env vars, profile, or IAM role) and requires the Cognito User Pool ID and region; document required env vars or flags.
- [ ] README or inline help documents usage and required permissions (e.g. Cognito AdminCreateUser, AdminAddUserToGroup, AdminListUsersInGroup, AdminDisableUser, AdminEnableUser).

## Technical Notes
- Use `@aws-sdk/client-cognito-identity-provider`: `AdminCreateUser`, `AdminAddUserToGroup`, `AdminListUsersInGroup`, `AdminDisableUser`, `AdminEnableUser`.
- For create: set `DesiredDeliveryMediums: ['EMAIL']` if using Cognito's email invite; otherwise set a temporary password and communicate it securely.
- Permissions: the IAM user/role needs `cognito-idp:AdminCreateUser`, `cognito-idp:AdminAddUserToGroup`, `cognito-idp:AdminListUsersInGroup`, `cognito-idp:AdminDisableUser`, `cognito-idp:AdminEnableUser` on the User Pool.

## Labels / Components
- Component: DevOps, Authentication, Case Manager
- Repo: TBD (freshtrak-client scripts/ or separate)
- Epic: Case Manager Long-Term Solution

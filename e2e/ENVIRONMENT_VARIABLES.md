# Environment Variables for E2E Tests

This document describes the environment variables used for Playwright E2E tests.

## Required Variables

### PLAYWRIGHT_TEST_BASE_URL

-   **Description**: Base URL for E2E tests
-   **Default**: `http://localhost:3000`
-   **Examples**:
    -   Local: `http://localhost:3000`
    -   Staging: `https://staging.freshtrak.com`
    -   Production: `https://freshtrak.com`
-   **Usage**: Set in CI/CD or `.env` file

### CI

-   **Description**: Indicates if running in CI/CD environment
-   **Default**: `false`
-   **Values**: `true` or `false`
-   **Usage**: Automatically set by CI/CD systems

## Test User Credentials

### TEST_USER_EMAIL

-   **Description**: Email for test user account
-   **Default**: `test@example.com`
-   **Usage**: Used for authenticated test scenarios
-   **Note**: Should be a valid test account in your test environment

### TEST_USER_PASSWORD

-   **Description**: Password for test user account
-   **Default**: `TestPassword123!`
-   **Usage**: Used for authenticated test scenarios
-   **Note**: Should match the test account password

## API Configuration (Optional)

### REACT_APP_API_BASE_URL

-   **Description**: Base URL for API endpoints
-   **Usage**: If tests need to interact with APIs directly
-   **Example**: `https://api.freshtrak.com`

### REACT_APP_REGISTRATION_API

-   **Description**: Registration API endpoint
-   **Usage**: For registration-related tests
-   **Example**: `https://registration-api.freshtrak.com`

## AWS Configuration (Optional)

### AWS_REGION

-   **Description**: AWS region for services
-   **Default**: `us-east-1`
-   **Usage**: If tests interact with AWS services

## Setting Environment Variables

### Local Development

Create a `.env` file in the project root:

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### CI/CD (AWS CodeBuild)

Set environment variables in CodeBuild project settings:

1. Go to AWS CodeBuild Console
2. Select your project
3. Edit environment variables
4. Add the required variables

Or use buildspec.yml:

```yaml
env:
    variables:
        PLAYWRIGHT_TEST_BASE_URL: "http://localhost:3000"
        CI: "true"
        TEST_USER_EMAIL: "test@example.com"
        TEST_USER_PASSWORD: "TestPassword123!"
```

## Environment-Specific Configurations

### Development

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
CI=false
```

### Staging

```bash
PLAYWRIGHT_TEST_BASE_URL=https://staging.freshtrak.com
CI=true
TEST_USER_EMAIL=staging-test@example.com
TEST_USER_PASSWORD=StagingTestPassword123!
```

### Production

```bash
PLAYWRIGHT_TEST_BASE_URL=https://freshtrak.com
CI=true
TEST_USER_EMAIL=prod-test@example.com
TEST_USER_PASSWORD=ProdTestPassword123!
```

## Security Notes

⚠️ **Important**: Never commit actual credentials to version control.

-   Use AWS Secrets Manager or Parameter Store for sensitive values
-   Use environment variables in CI/CD systems
-   Rotate test credentials regularly
-   Use separate test accounts, not production accounts

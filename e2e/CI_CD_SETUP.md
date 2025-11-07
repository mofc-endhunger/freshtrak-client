# CI/CD Setup for Playwright E2E Tests

This document describes the CI/CD integration setup for Playwright E2E tests in AWS CodeBuild.

## Overview

The E2E tests are integrated into the AWS CodeBuild pipeline and run automatically on each build. Tests are executed against a locally running instance of the application before the Docker image is built.

## Build Process

### Phase 1: Install

-   Installs npm dependencies
-   Installs Playwright browsers with system dependencies

### Phase 2: Pre-Build

-   Runs unit tests (Jest)
-   Builds the application
-   Performs Docker login

### Phase 3: Build

-   Starts the application server locally
-   Waits for server to be ready
-   Runs Playwright E2E tests
-   Stops the application server
-   Builds Docker image

### Phase 4: Post-Build

-   Collects test artifacts (reports, screenshots, videos)
-   Pushes Docker images to ECR
-   Creates image definitions

## Environment Variables

The following environment variables should be configured in AWS CodeBuild:

### Required Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
REPOSITORY=<your-ecr-repository-url>
IMAGE=<your-image-name>
IMAGE_TAG=latest
TARGET=production

# Test Configuration
CI=true
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### Optional Variables

```bash
# Test User Credentials (for authenticated tests)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# API Configuration (if needed)
REACT_APP_API_BASE_URL=https://staging-api.freshtrak.com
REACT_APP_REGISTRATION_API=https://staging-registration-api.freshtrak.com
```

## Test Execution

### Local Testing

To test the CI/CD setup locally:

```bash
# Install dependencies
npm ci
npx playwright install --with-deps

# Run unit tests
npm test -- --watchAll=false

# Build application
npm run build

# Start server and run E2E tests
npm start &
sleep 30
npm run test:e2e
pkill -f "react-scripts start"
```

### CI/CD Execution

Tests run automatically in the CodeBuild pipeline. The process:

1. **Install Phase**: Dependencies and browsers are installed
2. **Pre-Build Phase**: Unit tests run, application is built
3. **Build Phase**:
    - Application server starts in background
    - Server health check waits for readiness
    - E2E tests execute
    - Server is stopped
    - Docker image is built
4. **Post-Build Phase**: Test artifacts are collected and stored

## Test Artifacts

Test artifacts are automatically collected and stored:

-   **HTML Reports**: `playwright-report/` - Interactive test reports
-   **Test Results**: `test-results/` - JSON results, screenshots, videos, traces
-   **JUnit XML**: `test-results/junit.xml` - For CI/CD integration

Artifacts are stored in the CodeBuild artifacts and can be downloaded from the AWS Console.

## Test Failure Handling

### Current Behavior

-   Tests run with retries (2 retries in CI)
-   Test failures are captured but don't fail the build (exit code is captured)
-   Artifacts are always collected regardless of test results

### Recommended Changes

To make tests fail the build, modify the buildspec.yml:

```yaml
- npm run test:e2e || (echo "E2E tests failed" && exit 1)
```

## Troubleshooting

### Server Not Starting

If the server doesn't start in time:

1. Increase the timeout in the health check
2. Check application logs
3. Verify port 3000 is available

### Tests Timing Out

If tests timeout:

1. Increase timeout in `playwright.config.ts`
2. Check network connectivity
3. Verify test environment variables

### Browser Installation Issues

If browsers fail to install:

1. Ensure `--with-deps` flag is used
2. Check CodeBuild has sufficient disk space
3. Verify Node.js version compatibility

## Best Practices

1. **Test Selection**: Use test tags to run specific test suites in CI
2. **Parallel Execution**: Tests run in parallel by default (1 worker in CI)
3. **Artifact Retention**: Configure artifact retention in CodeBuild project settings
4. **Notifications**: Set up SNS notifications for build failures

## Future Enhancements

-   [ ] Separate test stage that doesn't block Docker build
-   [ ] Test result reporting to external services
-   [ ] Visual regression testing integration
-   [ ] Performance testing integration
-   [ ] Test result dashboards

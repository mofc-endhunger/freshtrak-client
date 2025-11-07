# Playwright E2E Tests

This directory contains end-to-end tests for the FreshTrak Client application using Playwright.

## Overview

The E2E tests are organized using the Page Object Model (POM) pattern for maintainability and reusability. Tests cover critical user flows including authentication, registration, event browsing, and family management.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test:e2e

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/tests/auth/login.spec.ts
```

## Directory Structure

```
e2e/
├── fixtures/          # Test fixtures and setup
│   ├── auth.setup.ts      # Authentication fixtures
│   ├── test-data.ts       # Test data factories
│   └── api-helpers.ts     # API mocking helpers
├── pages/             # Page Object classes
│   ├── BasePage.ts        # Base page object class
│   ├── DashboardPage.ts
│   ├── LoginPage.ts
│   ├── EventsPage.ts
│   ├── RegistrationPage.ts
│   ├── FamilyPage.ts
│   └── AccountPage.ts
├── utils/             # Test utilities
│   ├── helpers.ts         # Helper functions
│   ├── selectors.ts       # Shared selectors
│   └── constants.ts       # Test constants
├── tests/             # Test specifications
│   ├── auth/              # Authentication tests
│   ├── dashboard/         # Dashboard tests
│   ├── events/            # Events tests
│   ├── registration/      # Registration tests
│   ├── family/           # Family management tests
│   ├── account/          # Account management tests
│   ├── error-handling/   # Error handling tests
│   └── edge-cases/       # Edge case tests
├── global-setup.ts    # Global test setup
└── README.md          # This file
```

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Generate test code (codegen)
npm run test:e2e:codegen

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run tests on specific browser
npx playwright test --project=chromium
```

## Configuration

Test configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:3000` (default) or set via `PLAYWRIGHT_TEST_BASE_URL` environment variable
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeouts**: Configurable per test and action
- **Reports**: HTML, JSON, and JUnit XML formats

## Environment Variables

Set these environment variables for testing:

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
CI=true  # For CI/CD runs
```

## Writing Tests

### Page Object Model

All tests should use Page Objects for better maintainability:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('user can sign in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.signIn('user@example.com', 'password');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Selector Strategy

1. **Prefer `data-testid` attributes** (most stable)
2. **Use role-based selectors** (accessible)
3. **Use text content** (when appropriate)
4. **Avoid CSS selectors** (fragile)

### Test Data

Use test data factories from `fixtures/test-data.ts`:

```typescript
import { createTestUser } from '../fixtures/test-data';

const user = createTestUser();
```

### Best Practices

1. **Use descriptive test names**: `test('user can complete registration flow', ...)`
2. **Group related tests**: Use `test.describe()` blocks
3. **Clean up test data**: Use `test.afterEach()` or `test.afterAll()`
4. **Use explicit waits**: Avoid fixed timeouts
5. **Keep tests independent**: Each test should be able to run alone
6. **Use fixtures**: For authentication and common setup

## Debugging

### Playwright Inspector

Run tests in debug mode to use the Playwright Inspector:

```bash
npm run test:e2e:debug
```

### Screenshots and Videos

Screenshots and videos are automatically captured on test failure. They are stored in `test-results/`.

### Traces

Traces are captured on first retry. View them with:

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests run automatically in the CI/CD pipeline (AWS CodeBuild). See `buildspec.yml` for configuration.

## Troubleshooting

### Tests are flaky

- Check for race conditions
- Use explicit waits instead of fixed timeouts
- Ensure test data is properly isolated
- Check for timing issues with animations

### Tests fail in CI but pass locally

- Check environment variables
- Verify base URL is correct
- Check for timing issues (CI may be slower)
- Review test logs and screenshots

### Browser-specific failures

- Check if issue is browser-specific
- Review browser compatibility
- Update selectors if needed
- Check for browser-specific features

## Documentation

- **[Test Writing Guidelines](./TEST_WRITING_GUIDELINES.md)** - How to write tests
- **[Page Object Pattern](./PAGE_OBJECT_PATTERN.md)** - Page Object Model guide
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Visual Testing](./VISUAL_TESTING.md)** - Visual regression testing
- **[Browser Compatibility](./BROWSER_COMPATIBILITY.md)** - Cross-browser testing
- **[CI/CD Setup](./CI_CD_SETUP.md)** - CI/CD integration guide
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Test environment configuration

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [CI/CD Integration](https://playwright.dev/docs/ci)


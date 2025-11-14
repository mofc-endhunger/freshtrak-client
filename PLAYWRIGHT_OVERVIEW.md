# Playwright E2E Testing - High-Level Overview

## 🎯 Overview

FreshTrak Client uses **Playwright** for comprehensive end-to-end testing across multiple browsers and devices. The test suite follows the **Page Object Model (POM)** pattern for maintainability and reusability.

---

## 📊 Test Coverage

### Test Categories (23 test files)

1. **Authentication** (4 tests)

    - Login (authenticated user)
    - Guest login
    - Signup/Registration
    - Logout

2. **Registration** (3 tests)

    - Registration flow
    - Guest registration
    - Form validation

3. **Dashboard** (2 tests)

    - Navigation
    - Search functionality

4. **Events** (2 tests)

    - Event browsing
    - Event details

5. **Family Management** (2 tests)

    - Add family member
    - Manage family

6. **Error Handling** (3 tests)

    - Invalid routes
    - Network errors
    - Session expiration

7. **Visual Regression** (5 tests)

    - Account page
    - Dashboard
    - Events
    - Family
    - Login
    - Registration

8. **Edge Cases** (1 test)
    - Various edge case scenarios

---

## 🏗️ Architecture

### Page Object Model (POM)

All tests use Page Objects for better maintainability:

```
e2e/pages/
├── BasePage.ts           # Base class with common functionality
├── LoginPage.ts
├── DashboardPage.ts
├── EventsPage.ts
├── RegistrationPage.ts
├── FamilyPage.ts
└── AccountPage.ts
```

**Benefits:**

-   Reusable page interactions
-   Centralized selector management
-   Easier maintenance when UI changes
-   Cleaner test code

### Test Structure

```
e2e/
├── fixtures/             # Test setup and data
│   ├── auth.setup.ts     # Authentication state management
│   ├── test-data.ts      # Test data factories
│   └── api-helpers.ts    # API mocking helpers
├── pages/                # Page Object classes
├── utils/                # Utilities and helpers
│   ├── selectors.ts      # Shared selectors
│   ├── constants.ts      # Test constants
│   └── helpers.ts        # Helper functions
└── tests/                # Test specifications
    ├── auth/
    ├── dashboard/
    ├── events/
    ├── registration/
    ├── family/
    ├── error-handling/
    ├── visual/
    └── edge-cases/
```

---

## ⚙️ Configuration

### Browser Support

Tests run on **5 different browser/device configurations**:

1. **Chromium** (Desktop Chrome)
2. **Firefox** (Desktop Firefox)
3. **WebKit** (Desktop Safari)
4. **Mobile Chrome** (Pixel 5)
5. **Mobile Safari** (iPhone 12)

### Key Configuration Features

```typescript
// playwright.config.ts highlights:
- Base URL: http://localhost:3000 (configurable via env var)
- Parallel execution: Enabled locally, sequential in CI
- Retries: 2 retries in CI, 0 locally
- Timeouts: 10s action timeout, 30s navigation timeout
- Auto-start dev server: Starts npm start before tests (local only)
```

### Artifacts on Failure

-   **Screenshots**: Captured on test failure
-   **Videos**: Recorded on test failure
-   **Traces**: Captured on first retry (for debugging)

### Reporters

-   **HTML Report**: Interactive test report
-   **JSON Report**: For CI/CD integration
-   **JUnit XML**: For test result aggregation

---

## 🚀 Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:e2e

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# Debug mode (with Playwright Inspector)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

### Browser-Specific Runs

```bash
npm run test:e2e:chromium    # Chrome only
npm run test:e2e:firefox      # Firefox only
npm run test:e2e:webkit       # Safari only
npm run test:e2e:mobile       # Mobile browsers only
```

### Visual Testing

```bash
npm run test:e2e:visual              # Run visual tests
npm run test:e2e:update-snapshots     # Update baseline snapshots
```

### Code Generation

```bash
npm run test:e2e:codegen    # Generate test code from browser interactions
```

---

## 🔐 Authentication Strategy

### State Management

Tests use Playwright's **storage state** feature to manage authentication:

-   **Authenticated User**: Saved state in `playwright/.auth/user.json`
-   **Guest User**: Saved state in `playwright/.auth/guest.json`

This allows tests to:

-   Skip login steps for authenticated tests
-   Run faster by reusing authentication state
-   Test both authenticated and guest flows

### Test Patterns

**Authenticated Test:**

```typescript
test("should access protected page", async ({ page }) => {
	// Uses authenticated state
	const dashboardPage = new DashboardPage(page);
	await dashboardPage.navigate();
});
```

**Guest Test:**

```typescript
test("should continue as guest", async ({ page }) => {
	// Uses guest state
	const loginPage = new LoginPage(page);
	await loginPage.continueAsGuest();
});
```

---

## 🎨 Visual Regression Testing

### Visual Test Coverage

Visual tests capture screenshots across all browsers for:

-   Account page
-   Dashboard (including search form)
-   Events list
-   Family page
-   Login page
-   Registration page

### How It Works

1. **Baseline Snapshots**: Stored in `e2e/tests/visual/*.spec.ts-snapshots/`
2. **Comparison**: Playwright compares new screenshots with baselines
3. **Cross-Browser**: Tests run on all 5 browser configurations
4. **Updates**: Use `--update-snapshots` to update baselines after UI changes

---

## 📝 Best Practices Implemented

### 1. Selector Strategy

-   ✅ **Primary**: `data-testid` attributes (most stable)
-   ✅ **Secondary**: Role-based selectors (accessible)
-   ✅ **Tertiary**: Text content (when appropriate)
-   ❌ **Avoid**: CSS selectors (fragile)

### 2. Test Organization

-   ✅ Grouped by feature area
-   ✅ Descriptive test names
-   ✅ Independent tests (can run alone)
-   ✅ Proper setup/teardown

### 3. Page Object Pattern

-   ✅ All interactions through Page Objects
-   ✅ Base class for common functionality
-   ✅ Reusable methods
-   ✅ Centralized selectors

### 4. Test Data

-   ✅ Factories for test data generation
-   ✅ Default test credentials
-   ✅ Isolated test data

### 5. Error Handling

-   ✅ Explicit waits (no fixed timeouts)
-   ✅ Proper error messages
-   ✅ Artifacts on failure

---

## 🔧 CI/CD Integration

### CI Configuration

-   **Environment**: AWS CodeBuild
-   **Retries**: 2 retries on failure
-   **Workers**: Sequential execution (1 worker) for stability
-   **Artifacts**: Test results, screenshots, videos stored
-   **Reports**: JUnit XML for test result aggregation

### Environment Variables

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
CI=true  # Enables CI-specific settings
```

---

## 📈 Test Statistics

-   **Total Test Files**: 23
-   **Browser Configurations**: 5
-   **Page Objects**: 7
-   **Test Categories**: 8
-   **Visual Test Coverage**: 6 pages

---

## 🛠️ Development Workflow

### Writing New Tests

1. **Create Page Object** (if needed) in `e2e/pages/`
2. **Add selectors** to `e2e/utils/selectors.ts`
3. **Write test** in appropriate `e2e/tests/` directory
4. **Use test data factories** from `e2e/fixtures/test-data.ts`
5. **Run test** with `npm run test:e2e:ui` for interactive debugging

### Debugging Failed Tests

1. **View artifacts**: Check `test-results/` directory
2. **Use Inspector**: Run with `--debug` flag
3. **Check traces**: View trace files with `npx playwright show-trace`
4. **Review screenshots/videos**: Automatically captured on failure

---

## 📚 Documentation

Comprehensive documentation available in `e2e/`:

-   **README.md**: Getting started guide
-   **TEST_WRITING_GUIDELINES.md**: How to write tests
-   **PAGE_OBJECT_PATTERN.md**: POM guide
-   **VISUAL_TESTING.md**: Visual regression guide
-   **TEST_EXAMPLES.md**: Ready-to-use templates
-   **TROUBLESHOOTING.md**: Common issues and solutions
-   **CI_CD_SETUP.md**: CI/CD integration
-   **BROWSER_COMPATIBILITY.md**: Cross-browser testing

---

## 🎯 Key Highlights for Demo

1. **Comprehensive Coverage**: 23 test files covering all major features
2. **Cross-Browser**: Tests run on 5 different browser/device configurations
3. **Visual Regression**: Automated visual testing across all browsers
4. **Maintainable**: Page Object Model pattern for easy maintenance
5. **CI/CD Ready**: Fully integrated with AWS CodeBuild
6. **Developer Friendly**: UI mode, codegen, and debugging tools
7. **Robust**: Retries, artifacts, and proper error handling
8. **Well Documented**: Extensive documentation and examples

---

## 🚦 Quick Start for Demo

```bash
# 1. Install browsers (if not already done)
npx playwright install

# 2. Run tests in UI mode (best for demo)
npm run test:e2e:ui

# 3. Or run specific test category
npm run test:e2e:visual

# 4. View report after run
npm run test:e2e:report
```

---

_Last Updated: Based on current codebase structure_

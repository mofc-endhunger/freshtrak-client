# Playwright E2E Testing Implementation PRD

## Document Information

- **Project**: FreshTrak Client
- **Version**: 1.0
- **Date**: 2024
- **Author**: Senior Development Team
- **Status**: Draft

---

## 1. Executive Summary

This PRD outlines the implementation plan for setting up Playwright end-to-end (E2E) testing for the FreshTrak Client application. Playwright will complement the existing Jest unit tests by providing comprehensive browser-based testing capabilities, ensuring critical user flows work correctly across different browsers and devices.

### Key Objectives

- Set up Playwright testing framework with proper configuration
- Create E2E tests for critical user journeys
- Integrate Playwright tests into CI/CD pipeline (AWS CodeBuild)
- Establish testing best practices and maintainable test structure
- Achieve coverage for core user flows: Authentication, Registration, Event Browsing, Family Management

---

## 2. Current State Analysis

### 2.1 Existing Testing Infrastructure

**Current Testing Stack:**
- **Unit/Integration Tests**: Jest + React Testing Library
- **Test Files**: Located in `src/**/__test__/` directories
- **Test Command**: `npm test` (via react-scripts)
- **Coverage**: Limited to unit tests for utilities and some components

**Gaps Identified:**
- No end-to-end testing framework
- No browser-based testing
- No cross-browser compatibility testing
- No visual regression testing
- Limited coverage of user flows and integration scenarios

### 2.2 Application Architecture

**Tech Stack:**
- React 18.2 with TypeScript (partial migration)
- Redux Toolkit for state management
- React Router v6 for routing
- AWS Amplify/Cognito for authentication
- Axios for API communication
- Tailwind CSS + Bootstrap (legacy) for styling

**Key Modules:**
- **Authentication**: AWS Cognito sign-in/sign-up
- **Dashboard**: Search functionality for food banks
- **Events**: Event listing and details
- **Registration**: Multi-step form for event registration
- **Family**: Family member management
- **Households**: Household management
- **Account**: User account management

### 2.3 CI/CD Current State

**Current Pipeline:**
- **Platform**: AWS CodeBuild
- **Configuration**: `buildspec.yml`
- **Process**: Docker-based build and deployment
- **Testing**: No automated E2E tests in pipeline

---

## 3. Objectives

### 3.1 Primary Objectives

1. **Framework Setup**
   - Install and configure Playwright
   - Set up test project structure
   - Configure test environments (local, staging, production)
   - Establish test data management strategy

2. **Test Coverage**
   - Create E2E tests for critical user journeys
   - Implement cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Add visual regression testing capabilities
   - Test responsive design across devices

3. **CI/CD Integration**
   - Integrate Playwright tests into AWS CodeBuild pipeline
   - Configure test execution in build process
   - Set up test reporting and artifact storage
   - Implement test failure notifications

4. **Maintainability**
   - Establish Page Object Model (POM) pattern
   - Create reusable test utilities and helpers
   - Document test writing guidelines
   - Set up test data factories

### 3.2 Success Criteria

- [ ] Playwright successfully installed and configured
- [ ] At least 10 critical E2E test scenarios implemented
- [ ] Tests run successfully in CI/CD pipeline
- [ ] Test execution time < 10 minutes for full suite
- [ ] Test coverage for 80% of critical user flows
- [ ] Cross-browser compatibility verified
- [ ] Test documentation complete

---

## 4. Playwright Setup & Configuration

### 4.1 Installation Steps

**Step 1: Install Playwright**
```bash
npm install -D @playwright/test
npx playwright install
```

**Step 2: Initialize Playwright Configuration**
```bash
npx playwright init
```

**Step 3: Update package.json Scripts**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "test:e2e:codegen": "playwright codegen http://localhost:3000"
  }
}
```

### 4.2 Configuration Structure

**File: `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 4.3 Test Directory Structure

```
e2e/
├── fixtures/
│   ├── auth.setup.ts          # Authentication fixtures
│   ├── test-data.ts           # Test data factories
│   └── api-helpers.ts         # API mocking helpers
├── pages/
│   ├── DashboardPage.ts       # Page Object for Dashboard
│   ├── LoginPage.ts            # Page Object for Login
│   ├── RegistrationPage.ts    # Page Object for Registration
│   ├── EventsPage.ts           # Page Object for Events
│   ├── FamilyPage.ts           # Page Object for Family
│   └── AccountPage.ts          # Page Object for Account
├── utils/
│   ├── helpers.ts              # Test utilities
│   ├── selectors.ts            # Shared selectors
│   └── constants.ts            # Test constants
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   └── logout.spec.ts
│   ├── registration/
│   │   ├── event-registration.spec.ts
│   │   └── registration-flow.spec.ts
│   ├── events/
│   │   ├── event-browsing.spec.ts
│   │   └── event-details.spec.ts
│   ├── dashboard/
│   │   ├── search.spec.ts
│   │   └── navigation.spec.ts
│   └── family/
│       ├── add-family-member.spec.ts
│       └── manage-family.spec.ts
└── global-setup.ts             # Global test setup
```

---

## 5. Test Strategy

### 5.1 Testing Pyramid

```
                    /\
                   /  \
                  / E2E \        (10-15 tests)
                 /--------\
                /          \
               / Integration \   (20-30 tests)
              /----------------\
             /                  \
            /    Unit Tests      \  (Existing Jest tests)
           /----------------------\
```

### 5.2 Test Types

**1. Smoke Tests (Critical Path)**
- User can access the application
- User can search for events
- User can view event details
- User can complete registration flow

**2. Functional Tests**
- Complete user journeys
- Form validations
- Error handling
- Navigation flows

**3. Cross-Browser Tests**
- Chrome, Firefox, Safari, Edge
- Mobile Chrome, Mobile Safari
- Responsive breakpoints

**4. Visual Regression Tests**
- Screenshot comparisons
- Component visual consistency
- Layout validation

### 5.3 Test Data Management

**Strategy:**
- Use test data factories for consistent test data
- Implement test user accounts in test environment
- Mock API responses where appropriate
- Use fixtures for authentication state
- Clean up test data after test execution

**Test Data Sources:**
- `e2e/fixtures/test-data.ts` - Test data factories
- Environment variables for test credentials
- API mocking for external services

---

## 6. Test Scenarios

### 6.1 Authentication Flow

**Test: User Sign Up**
- Navigate to login page
- Click sign up tab
- Fill in email, password, name
- Submit form
- Verify email confirmation prompt
- Enter confirmation code
- Verify successful sign up and redirect

**Test: User Sign In**
- Navigate to login page
- Enter valid credentials
- Submit form
- Verify successful login
- Verify redirect to dashboard/home

**Test: Guest Login**
- Navigate to login page
- Click "Continue as Guest"
- Verify guest access granted
- Verify limited functionality available

**Test: Logout**
- Sign in as authenticated user
- Navigate to account page
- Click logout
- Verify redirect to login page
- Verify session cleared

### 6.2 Dashboard & Search Flow

**Test: Search for Events**
- Navigate to dashboard
- Enter zip code
- Select distance radius
- Submit search
- Verify events list displayed
- Verify search parameters in URL

**Test: Empty Search Results**
- Navigate to dashboard
- Enter invalid zip code
- Submit search
- Verify "no results" message displayed

**Test: Navigation to Events**
- Navigate to dashboard
- Click "View Events" link
- Verify navigation to events page
- Verify events list loaded

### 6.3 Event Browsing Flow

**Test: View Event List**
- Navigate to events page
- Verify events displayed
- Verify event cards show correct information
- Verify pagination (if applicable)

**Test: View Event Details**
- Navigate to events page
- Click on an event card
- Verify event details page loaded
- Verify all event information displayed
- Verify registration button visible

**Test: Filter Events**
- Navigate to events page
- Apply date filter
- Apply location filter
- Verify filtered results displayed

### 6.4 Registration Flow

**Test: Complete Registration (Authenticated User)**
- Sign in as user
- Navigate to event details
- Click "Register" button
- Complete Step 0: Primary Information
- Complete Step 1: Address Information
- Complete Step 2: Family Member Counts
- Select event slot
- Submit registration
- Verify confirmation page
- Verify QR code displayed

**Test: Registration Form Validation**
- Navigate to registration page
- Attempt to submit empty form
- Verify validation errors displayed
- Fill in invalid data
- Verify field-specific validation errors

**Test: Guest Registration**
- Continue as guest
- Navigate to event details
- Click "Register" button
- Complete registration form
- Verify registration successful
- Verify guest session maintained

### 6.5 Family Management Flow

**Test: Add Family Member**
- Sign in as user
- Navigate to family page
- Click "Add Family Member"
- Fill in family member form
- Submit form
- Verify family member added to list

**Test: Edit Family Member**
- Sign in as user
- Navigate to family page
- Click edit on existing family member
- Update information
- Save changes
- Verify updated information displayed

**Test: Delete Family Member**
- Sign in as user
- Navigate to family page
- Click delete on family member
- Confirm deletion
- Verify family member removed from list

### 6.6 Account Management Flow

**Test: View Account Information**
- Sign in as user
- Navigate to account page
- Verify account information displayed
- Verify edit options available

**Test: Update Account Information**
- Sign in as user
- Navigate to account page
- Click edit
- Update information
- Save changes
- Verify changes reflected

### 6.7 Error Handling & Edge Cases

**Test: Network Error Handling**
- Simulate network failure
- Attempt to load events
- Verify error message displayed
- Verify retry option available

**Test: Session Expiration**
- Sign in as user
- Simulate session expiration
- Attempt to access protected route
- Verify redirect to login
- Verify appropriate message displayed

**Test: Invalid Route**
- Navigate to non-existent route
- Verify 404 page displayed
- Verify navigation options available

---

## 7. CI/CD Integration Plan

### 7.1 AWS CodeBuild Integration

**Updated buildspec.yml Structure:**

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    on-failure: ABORT
    commands:
      - npm ci
      - npx playwright install --with-deps
  
  pre_build:
    on-failure: ABORT
    commands:
      - echo "Running unit tests..."
      - npm test -- --watchAll=false --coverage=false
      - echo "Building application..."
      - npm run build
  
  build:
    on-failure: ABORT
    commands:
      - echo "Starting application server..."
      - npm start &
      - sleep 30
      - echo "Running E2E tests..."
      - npm run test:e2e
      - echo "E2E tests completed"
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPOSITORY
  
  post_build:
    on-failure: ABORT
    commands:
      - echo "Collecting test artifacts..."
      - mkdir -p test-artifacts
      - cp -r playwright-report test-artifacts/ || true
      - cp -r test-results test-artifacts/ || true
      - docker build -t $IMAGE:$CODEBUILD_BUILD_NUMBER --target $TARGET .
      - docker tag $IMAGE:$CODEBUILD_BUILD_NUMBER $REPOSITORY/$IMAGE:$IMAGE_TAG
      - docker tag $IMAGE:$CODEBUILD_BUILD_NUMBER $REPOSITORY/$IMAGE:$CODEBUILD_BUILD_NUMBER

artifacts:
  files:
    - ./imagedefinitions.json
    - ./imageDetail.json
    - ./test-artifacts/**/*
  name: build-artifacts-$(date +%Y-%m-%d)
```

### 7.2 Test Execution Strategy

**In CI/CD:**
- Run smoke tests on every commit
- Run full test suite on pull requests
- Run full test suite + visual regression on main branch
- Parallel execution for faster feedback
- Retry failed tests (2 retries)
- Generate and store test reports

**Test Environment Variables:**
```bash
PLAYWRIGHT_TEST_BASE_URL=https://staging.freshtrak.com
CI=true
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
```

### 7.3 Test Reporting

**Reports Generated:**
- HTML report (playwright-report/)
- JSON results (test-results/results.json)
- JUnit XML (for CI/CD integration)
- Screenshots (on failure)
- Videos (on failure)
- Traces (on first retry)

**Artifact Storage:**
- Upload test reports to S3
- Store test artifacts for 30 days
- Integrate with notification system for failures

---

## 8. Implementation Timeline

### Phase 1: Setup & Foundation (Week 1)

**Tasks:**
- [ ] Install Playwright and dependencies
- [ ] Create Playwright configuration file
- [ ] Set up test directory structure
- [ ] Create base Page Object classes
- [ ] Set up test utilities and helpers
- [ ] Configure test data factories
- [ ] Document setup process

**Deliverables:**
- Playwright installed and configured
- Test structure established
- Base utilities created

### Phase 2: Core Test Implementation (Week 2-3)

**Tasks:**
- [ ] Implement authentication tests (login, signup, logout)
- [ ] Implement dashboard and search tests
- [ ] Implement event browsing tests
- [ ] Create Page Objects for all major pages
- [ ] Set up authentication fixtures
- [ ] Implement test data management

**Deliverables:**
- 5-7 core E2E tests implemented
- Page Objects for main pages
- Authentication fixtures working

### Phase 3: Registration & Family Tests (Week 4)

**Tasks:**
- [ ] Implement registration flow tests
- [ ] Implement family management tests
- [ ] Add form validation tests
- [ ] Implement error handling tests
- [ ] Add edge case scenarios

**Deliverables:**
- Registration tests complete
- Family management tests complete
- Error handling covered

### Phase 4: CI/CD Integration (Week 5)

**Tasks:**
- [ ] Update buildspec.yml
- [ ] Configure test execution in CI
- [ ] Set up test environment variables
- [ ] Configure test artifact storage
- [ ] Set up test failure notifications
- [ ] Test CI/CD pipeline end-to-end

**Deliverables:**
- Tests running in CI/CD
- Test reports generated
- Artifacts stored properly

### Phase 5: Cross-Browser & Visual Testing (Week 6)

**Tasks:**
- [ ] Configure cross-browser testing
- [ ] Run tests on all browsers
- [ ] Fix browser-specific issues
- [ ] Set up visual regression testing
- [ ] Create baseline screenshots
- [ ] Document browser compatibility

**Deliverables:**
- Cross-browser tests passing
- Visual regression setup complete
- Browser compatibility documented

### Phase 6: Documentation & Best Practices (Week 7)

**Tasks:**
- [ ] Write test documentation
- [ ] Create test writing guidelines
- [ ] Document Page Object patterns
- [ ] Create troubleshooting guide
- [ ] Train team on Playwright
- [ ] Review and optimize test suite

**Deliverables:**
- Complete documentation
- Team trained
- Test suite optimized

---

## 9. Best Practices & Guidelines

### 9.1 Page Object Model (POM)

**Structure:**
```typescript
// pages/DashboardPage.ts
export class DashboardPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
  }

  async searchEvents(zipCode: string, distance: string) {
    await this.page.fill('[data-testid="zip-code-input"]', zipCode);
    await this.page.selectOption('[data-testid="distance-select"]', distance);
    await this.page.click('[data-testid="search-button"]');
  }

  async getEventCount(): Promise<number> {
    return await this.page.locator('[data-testid="event-card"]').count();
  }
}
```

### 9.2 Test Data Management

**Use Factories:**
```typescript
// fixtures/test-data.ts
export const createTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
});
```

### 9.3 Selector Strategy

**Priority:**
1. `data-testid` attributes (preferred)
2. Role-based selectors
3. Text content
4. CSS selectors (last resort)

**Example:**
```typescript
// Good
await page.click('[data-testid="submit-button"]');

// Acceptable
await page.click('button:has-text("Submit")');

// Avoid
await page.click('.btn-primary.submit-btn');
```

### 9.4 Test Organization

**Naming Convention:**
- Test files: `*.spec.ts`
- Test descriptions: Clear, descriptive
- Group related tests with `test.describe()`

**Example:**
```typescript
test.describe('Registration Flow', () => {
  test('should complete registration for authenticated user', async ({ page }) => {
    // Test implementation
  });
});
```

### 9.5 Error Handling

**Best Practices:**
- Use explicit waits instead of fixed timeouts
- Implement retry logic for flaky tests
- Capture screenshots on failure
- Use meaningful error messages
- Clean up test data after tests

---

## 10. Risks & Mitigation

### 10.1 Technical Risks

**Risk: Test Flakiness**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: 
  - Use explicit waits
  - Implement retry logic
  - Stabilize test environment
  - Regular test maintenance

**Risk: Slow Test Execution**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Parallel test execution
  - Optimize test data setup
  - Use test sharding
  - Run critical tests first

**Risk: Environment Dependencies**
- **Probability**: Low
- **Impact**: High
- **Mitigation**:
  - Mock external APIs where possible
  - Use test environment
  - Implement health checks
  - Document environment requirements

### 10.2 Process Risks

**Risk: Maintenance Overhead**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Follow Page Object Model
  - Create reusable utilities
  - Regular test reviews
  - Automated test updates where possible

**Risk: Team Adoption**
- **Probability**: Low
- **Impact**: Medium
- **Mitigation**:
  - Comprehensive documentation
  - Team training sessions
  - Code review process
  - Pair programming on tests

---

## 11. Success Metrics

### 11.1 Quantitative Metrics

- **Test Coverage**: 80% of critical user flows
- **Test Execution Time**: < 10 minutes for full suite
- **Test Stability**: < 5% flaky test rate
- **CI/CD Integration**: 100% of tests running in pipeline
- **Cross-Browser Coverage**: 4+ browsers tested

### 11.2 Qualitative Metrics

- **Code Quality**: Tests follow best practices
- **Maintainability**: Easy to add new tests
- **Documentation**: Complete and up-to-date
- **Team Confidence**: Team comfortable writing tests
- **Bug Detection**: Tests catch regressions early

---

## 12. Dependencies & Prerequisites

### 12.1 Technical Dependencies

- Node.js 20+ (already in use)
- npm package manager
- Application running on test environment
- Test user accounts in test environment
- API access for test environment

### 12.2 Environment Setup

- Test environment URL configured
- Test database available
- Test API endpoints accessible
- Environment variables set
- CI/CD pipeline access

### 12.3 Team Dependencies

- Developer time allocation
- QA team collaboration
- DevOps support for CI/CD
- Product team for test scenarios

---

## 13. Future Enhancements

### 13.1 Advanced Testing

- **Visual Regression Testing**: Percy or Chromatic integration
- **Performance Testing**: Lighthouse CI integration
- **Accessibility Testing**: axe-core integration
- **API Testing**: Playwright API testing capabilities
- **Mobile Testing**: Expanded mobile device coverage

### 13.2 Test Infrastructure

- **Test Reporting Dashboard**: Custom dashboard for test metrics
- **Test Analytics**: Track test trends and patterns
- **Automated Test Generation**: AI-assisted test creation
- **Test Maintenance Tools**: Automated test updates

### 13.3 Integration Enhancements

- **Slack Notifications**: Test failure alerts
- **Jira Integration**: Auto-create tickets for failures
- **Test Coverage Reports**: Integration with coverage tools
- **Parallel Execution**: Optimize test execution speed

---

## 14. Appendix

### 14.1 Useful Commands

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode
npm run test:e2e:headed

# Generate test code
npm run test:e2e:codegen

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Update snapshots
npx playwright test --update-snapshots
```

### 14.2 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [CI/CD Integration](https://playwright.dev/docs/ci)

### 14.3 Glossary

- **E2E Testing**: End-to-end testing, testing complete user flows
- **Page Object Model**: Design pattern for organizing test code
- **Fixture**: Reusable test setup and teardown
- **Selector**: Element locator strategy
- **Test Spec**: Individual test file
- **Trace**: Detailed execution log for debugging

---

## 15. Approval & Sign-off

**Prepared by**: Senior Development Team  
**Reviewed by**: [To be filled]  
**Approved by**: [To be filled]  
**Date**: [To be filled]

---

**Document Status**: Ready for Review  
**Next Steps**: 
1. Review and approve PRD
2. Allocate resources
3. Begin Phase 1 implementation
4. Set up project tracking


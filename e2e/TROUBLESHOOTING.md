# Troubleshooting Guide

This guide helps you diagnose and fix common issues when writing and running Playwright E2E tests.

## Table of Contents

- [Common Test Failures](#common-test-failures)
- [Debugging Techniques](#debugging-techniques)
- [Playwright Inspector](#playwright-inspector)
- [Reading Test Traces](#reading-test-traces)
- [Viewing Test Videos](#viewing-test-videos)
- [CI/CD Debugging](#cicd-debugging)
- [FAQ](#faq)

## Common Test Failures

### Element Not Found / Timeout

**Symptoms:**
```
Timeout 30000ms exceeded while waiting for selector '[data-testid="button"]'
```

**Causes:**
- Element doesn't exist on the page
- Element is not visible (hidden, covered, off-screen)
- Page hasn't loaded yet
- Selector is incorrect

**Solutions:**
1. Verify the selector is correct:
   ```typescript
   // Check if element exists
   const element = page.locator('[data-testid="button"]');
   const count = await element.count();
   console.log('Element count:', count);
   ```

2. Wait for element to be visible:
   ```typescript
   await page.waitForSelector('[data-testid="button"]', { 
     state: 'visible',
     timeout: 10000 
   });
   ```

3. Wait for page to load:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

4. Check if element is in viewport:
   ```typescript
   await element.scrollIntoViewIfNeeded();
   ```

### Flaky Tests

**Symptoms:**
- Tests pass sometimes, fail other times
- Intermittent failures
- Timing-related issues

**Causes:**
- Race conditions
- Fixed timeouts instead of explicit waits
- Test data conflicts
- Network timing issues

**Solutions:**
1. Use explicit waits instead of fixed timeouts:
   ```typescript
   // Bad
   await page.waitForTimeout(2000);
   
   // Good
   await page.waitForSelector('[data-testid="element"]', { state: 'visible' });
   ```

2. Wait for network to be idle:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. Use proper assertions:
   ```typescript
   await expect(page.locator('[data-testid="element"]')).toBeVisible();
   ```

4. Isolate test data:
   ```typescript
   const uniqueUser = createTestUser();  // Generates unique email
   ```

### Tests Fail in CI but Pass Locally

**Symptoms:**
- Tests pass on developer machine
- Tests fail in CI/CD pipeline

**Causes:**
- Environment differences
- Timing issues (CI is slower)
- Missing environment variables
- Different browser versions

**Solutions:**
1. Check environment variables:
   ```bash
   # Verify in CI
   echo $PLAYWRIGHT_TEST_BASE_URL
   echo $TEST_USER_EMAIL
   ```

2. Increase timeouts for CI:
   ```typescript
   const timeout = process.env.CI ? 30000 : 10000;
   await page.waitForSelector(selector, { timeout });
   ```

3. Check CI logs for errors:
   - Review build logs
   - Check for network errors
   - Verify application started correctly

4. Use CI-specific configuration:
   ```typescript
   // In playwright.config.ts
   use: {
     actionTimeout: process.env.CI ? 30000 : 10000,
   }
   ```

### Browser-Specific Failures

**Symptoms:**
- Tests pass on Chromium but fail on Firefox/WebKit
- Different behavior across browsers

**Causes:**
- Browser-specific CSS differences
- Different JavaScript implementations
- Browser-specific features

**Solutions:**
1. Test on specific browser first:
   ```bash
   npx playwright test --project=firefox
   ```

2. Check browser console for errors:
   ```typescript
   page.on('console', msg => console.log('Browser console:', msg.text()));
   ```

3. Use browser-agnostic selectors:
   ```typescript
   // Good - works across browsers
   page.getByRole('button', { name: 'Submit' })
   
   // Bad - may differ across browsers
   page.locator('.btn-primary')
   ```

4. Add browser-specific handling if needed:
   ```typescript
   const browserName = page.context().browser()?.browserType().name();
   if (browserName === 'webkit') {
     // Safari-specific handling
   }
   ```

### Authentication Issues

**Symptoms:**
- Tests fail with authentication errors
- Session expires during tests
- Redirected to login page unexpectedly

**Solutions:**
1. Use authentication fixtures:
   ```typescript
   test('should access protected page', async ({ page }) => {
     // Use authenticated context
     const context = await browser.newContext({
       storageState: 'playwright/.auth/user.json'
     });
     const page = await context.newPage();
   });
   ```

2. Verify authentication state:
   ```typescript
   const isAuthenticated = await page.locator('[data-testid="user-menu"]').isVisible();
   if (!isAuthenticated) {
     // Re-authenticate
   }
   ```

3. Handle session expiration:
   ```typescript
   test('should handle session expiration', async ({ page }) => {
     // Wait for potential redirect
     await page.waitForURL(/login|dashboard/, { timeout: 5000 });
     
     if (page.url().includes('/login')) {
       // Re-authenticate
     }
   });
   ```

## Debugging Techniques

### Console Logging

Add console logs to understand test flow:

```typescript
test('should debug test', async ({ page }) => {
  console.log('Navigating to page...');
  await page.goto('/');
  
  console.log('Current URL:', page.url());
  
  const element = page.locator('[data-testid="button"]');
  console.log('Element visible:', await element.isVisible());
  
  await element.click();
  console.log('After click, URL:', page.url());
});
```

### Screenshot on Failure

Screenshots are automatically captured on failure. To capture manually:

```typescript
test('should capture screenshot', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'debug-screenshot.png' });
});
```

### Network Monitoring

Monitor network requests:

```typescript
test('should monitor network', async ({ page }) => {
  page.on('request', request => {
    console.log('Request:', request.url());
  });
  
  page.on('response', response => {
    console.log('Response:', response.url(), response.status());
  });
  
  await page.goto('/');
});
```

### Element State Debugging

Check element state:

```typescript
const element = page.locator('[data-testid="button"]');

console.log('Is visible:', await element.isVisible());
console.log('Is enabled:', await element.isEnabled());
console.log('Text:', await element.textContent());
console.log('Bounding box:', await element.boundingBox());
```

## Playwright Inspector

### Running Inspector

```bash
# Run tests in debug mode
npm run test:e2e:debug

# Or
npx playwright test --debug
```

### Inspector Features

- **Step through tests**: Pause and step through each action
- **Inspect elements**: See selectors and element properties
- **Time travel**: Go back and forward through test execution
- **Console**: Execute commands in browser context
- **Screenshots**: See page state at each step

### Using Inspector

1. Run test in debug mode
2. Inspector opens automatically
3. Use controls to:
   - Step through actions
   - Inspect elements
   - Execute commands
   - View page state

## Reading Test Traces

### Generating Traces

Traces are automatically captured on first retry. To capture always:

```typescript
// In playwright.config.ts
use: {
  trace: 'on',  // Always capture traces
}
```

### Viewing Traces

```bash
# View trace
npx playwright show-trace trace.zip

# Or open in browser
npx playwright show-trace trace.zip --host 0.0.0.0
```

### Trace Information

Traces contain:
- **Timeline**: All actions in chronological order
- **DOM snapshots**: Page state at each action
- **Network logs**: All network requests
- **Console logs**: Browser console output
- **Screenshots**: Visual state at each step

## Viewing Test Videos

### Videos Location

Videos are stored in `test-results/` directory:

```
test-results/
└── [test-name]/
    └── video.webm
```

### Viewing Videos

```bash
# Open test results directory
open test-results/

# Or use Playwright report
npm run test:e2e:report
```

### Video Configuration

Configure video recording in `playwright.config.ts`:

```typescript
use: {
  video: 'on',  // Always record
  // or
  video: 'retain-on-failure',  // Only on failure
}
```

## CI/CD Debugging

### Accessing CI Logs

1. Go to AWS CodeBuild Console
2. Select failed build
3. View build logs
4. Check for errors

### Common CI Issues

**Application not starting:**
- Check server startup logs
- Verify port is available
- Check for port conflicts

**Tests timing out:**
- Increase timeouts in CI
- Check application performance
- Verify network connectivity

**Browser installation fails:**
- Check disk space
- Verify Node.js version
- Check Playwright installation

### Debugging in CI

1. Add debug logging:
   ```typescript
   if (process.env.CI) {
     console.log('CI Environment detected');
     console.log('Base URL:', process.env.PLAYWRIGHT_TEST_BASE_URL);
   }
   ```

2. Capture screenshots:
   ```typescript
   await page.screenshot({ path: 'ci-debug.png' });
   ```

3. Check artifacts:
   - Download test artifacts from CI
   - Review screenshots and videos
   - Check test reports

## FAQ

### Q: Tests are slow. How can I speed them up?

**A:** 
- Run tests in parallel (already configured)
- Use `test.describe.parallel()` for independent tests
- Optimize waits (use specific waits instead of fixed timeouts)
- Reduce test data setup time

### Q: How do I test file uploads?

**A:**
```typescript
const fileInput = page.locator('[data-testid="file-input"]');
await fileInput.setInputFiles('path/to/file.pdf');
```

### Q: How do I test drag and drop?

**A:**
```typescript
const source = page.locator('[data-testid="source"]');
const target = page.locator('[data-testid="target"]');
await source.dragTo(target);
```

### Q: How do I handle iframes?

**A:**
```typescript
const frame = page.frameLocator('iframe[name="frame-name"]');
await frame.locator('button').click();
```

### Q: How do I test keyboard shortcuts?

**A:**
```typescript
await page.keyboard.press('Control+A');
await page.keyboard.press('Enter');
```

### Q: How do I test file downloads?

**A:**
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.locator('[data-testid="download-button"]').click(),
]);
const path = await download.path();
```

### Q: How do I mock API responses?

**A:**
```typescript
await page.route('**/api/events', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ events: [] }),
  });
});
```

### Q: How do I test mobile viewports?

**A:**
```typescript
// Use mobile project
npx playwright test --project="Mobile Chrome"

// Or set viewport in test
await page.setViewportSize({ width: 375, height: 667 });
```

### Q: How do I handle cookies?

**A:**
```typescript
// Get cookies
const cookies = await page.context().cookies();

// Set cookies
await page.context().addCookies([{
  name: 'cookie-name',
  value: 'cookie-value',
  domain: 'example.com',
  path: '/',
}]);
```

### Q: How do I test WebSocket connections?

**A:**
```typescript
page.on('websocket', ws => {
  console.log('WebSocket connected:', ws.url());
  ws.on('framereceived', event => {
    console.log('Frame received:', event.payload);
  });
});
```

## Getting Help

If you're still stuck:

1. Check Playwright documentation: https://playwright.dev/
2. Review test examples in `e2e/tests/`
3. Check existing Page Objects for patterns
4. Ask the team for help
5. Review CI/CD logs and artifacts


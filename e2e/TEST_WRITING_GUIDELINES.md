# Test Writing Guidelines

This document provides guidelines and best practices for writing Playwright E2E tests for the FreshTrak Client application.

## Table of Contents

-   [Naming Conventions](#naming-conventions)
-   [Test Organization](#test-organization)
-   [Selector Strategy](#selector-strategy)
-   [Error Handling](#error-handling)
-   [Test Data Management](#test-data-management)
-   [Async/Await Patterns](#asyncawait-patterns)
-   [Common Scenarios](#common-scenarios)

## Naming Conventions

### Test Files

-   Use descriptive names: `login.spec.ts`, `registration-flow.spec.ts`
-   Group by feature: `auth/login.spec.ts`, `events/event-browsing.spec.ts`
-   Use kebab-case: `event-details.spec.ts` (not `eventDetails.spec.ts`)

### Test Descriptions

-   Use clear, descriptive names that explain what is being tested
-   Start with "should" when describing expected behavior
-   Be specific about the scenario

```typescript
// Good
test('should sign in with valid credentials', async ({ page }) => { ... });
test('should display error message for invalid email', async ({ page }) => { ... });
test('should redirect to dashboard after successful login', async ({ page }) => { ... });

// Bad
test('login test', async ({ page }) => { ... });
test('test 1', async ({ page }) => { ... });
test('should work', async ({ page }) => { ... });
```

### Test Groups

-   Use `test.describe()` to group related tests
-   Use descriptive group names

```typescript
test.describe('User Authentication', () => {
  test.describe('Sign In', () => {
    test('should sign in with valid credentials', ...);
    test('should show error for invalid credentials', ...);
  });

  test.describe('Sign Up', () => {
    test('should create new account', ...);
  });
});
```

## Test Organization

### File Structure

Organize tests by feature/domain:

```
e2e/tests/
├── auth/
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   └── logout.spec.ts
├── dashboard/
│   ├── search.spec.ts
│   └── navigation.spec.ts
└── events/
    ├── event-browsing.spec.ts
    └── event-details.spec.ts
```

### Test Structure

Each test file should follow this structure:

```typescript
import { test, expect } from "@playwright/test";
import { PageObject } from "../../pages/PageObject";
import { TestData } from "../../fixtures/test-data";

test.describe("Feature Name", () => {
	test.beforeEach(async ({ page }) => {
		// Common setup
	});

	test("should do something", async ({ page }) => {
		// Arrange
		const pageObject = new PageObject(page);

		// Act
		await pageObject.performAction();

		// Assert
		await expect(page).toHaveURL(/expected-url/);
	});

	test.afterEach(async ({ page }) => {
		// Cleanup if needed
	});
});
```

## Selector Strategy

### Priority Order

1. **`data-testid` attributes** (Most stable)

    ```typescript
    page.locator('[data-testid="submit-button"]');
    ```

2. **Role-based selectors** (Accessible)

    ```typescript
    page.getByRole("button", { name: "Submit" });
    page.getByRole("textbox", { name: "Email" });
    ```

3. **Text content** (When appropriate)

    ```typescript
    page.getByText("Welcome back");
    page.getByText("Sign in", { exact: true });
    ```

4. **CSS selectors** (Last resort, avoid if possible)
    ```typescript
    page.locator(".submit-button"); // Avoid
    ```

### Best Practices

-   **Never use XPath**: Playwright provides better alternatives
-   **Avoid brittle selectors**: Don't rely on CSS classes that might change
-   **Use semantic selectors**: Prefer `getByRole` and `getByLabel`
-   **Be specific**: Use multiple attributes if needed

```typescript
// Good
page.getByRole("button", { name: "Submit" });
page.locator('[data-testid="user-email"]');

// Bad
page.locator("div > button:nth-child(2)");
page.locator(".btn-primary");
```

## Error Handling

### Handling Expected Errors

```typescript
test("should handle network errors gracefully", async ({ page }) => {
	// Simulate network error
	await page.route("**/api/events", (route) => route.abort());

	const dashboardPage = new DashboardPage(page);
	await dashboardPage.navigate();

	// Verify error message is displayed
	await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### Handling Optional Elements

```typescript
// Check if element exists before interacting
const element = page.locator('[data-testid="optional-element"]');
const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);

if (isVisible) {
	await element.click();
}
```

### Handling Timeouts

```typescript
// Use explicit waits with reasonable timeouts
await page.waitForSelector('[data-testid="loading"]', {
	state: "hidden",
	timeout: 10000,
});

// Use waitForLoadState for navigation
await page.waitForLoadState("networkidle", { timeout: 30000 });
```

## Test Data Management

### Using Test Data Factories

Always use test data factories for consistent test data:

```typescript
import {
	createTestUser,
	createRegistrationFormData,
} from "../../fixtures/test-data";

test("should register new user", async ({ page }) => {
	const formData = createRegistrationFormData();
	// Use formData in test
});
```

### Test Data Isolation

-   Each test should use unique test data
-   Clean up test data after tests if needed
-   Use factories to generate unique data

```typescript
test("should create account", async ({ page }) => {
	const user = createTestUser(); // Generates unique email
	// Test uses unique user data
});
```

### Default Test Credentials

For authenticated tests, use default test credentials:

```typescript
import { DEFAULT_TEST_CREDENTIALS } from "../../fixtures/test-data";

test.beforeEach(async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.navigate();
	await loginPage.signIn(
		DEFAULT_TEST_CREDENTIALS.email,
		DEFAULT_TEST_CREDENTIALS.password
	);
});
```

## Async/Await Patterns

### Always Use Async/Await

```typescript
// Good
test("should do something", async ({ page }) => {
	await page.goto("/");
	await page.click("button");
});

// Bad
test("should do something", ({ page }) => {
	page.goto("/").then(() => {
		page.click("button");
	});
});
```

### Sequential Operations

When operations depend on each other, await them sequentially:

```typescript
// Good
await loginPage.navigate();
await loginPage.signIn(email, password);
await expect(page).toHaveURL(/dashboard/);

// Bad
loginPage.navigate();
loginPage.signIn(email, password);
expect(page).toHaveURL(/dashboard/);
```

### Parallel Operations

When operations are independent, run them in parallel:

```typescript
// Good - parallel
await Promise.all([
	page.waitForSelector('[data-testid="element1"]'),
	page.waitForSelector('[data-testid="element2"]'),
]);

// Sequential (if order matters)
await page.waitForSelector('[data-testid="element1"]');
await page.waitForSelector('[data-testid="element2"]');
```

## Common Scenarios

### Navigation

```typescript
test("should navigate to page", async ({ page }) => {
	const pageObject = new PageObject(page);
	await pageObject.navigate();
	await expect(page).toHaveURL(/expected-path/);
});
```

### Form Filling

```typescript
test("should fill and submit form", async ({ page }) => {
	const formPage = new FormPage(page);
	await formPage.navigate();

	await formPage.fillForm({
		email: "test@example.com",
		name: "Test User",
	});

	await formPage.submit();
	await expect(page).toHaveURL(/success/);
});
```

### Waiting for Elements

```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="element"]', { state: "visible" });

// Wait for element to be hidden
await page.waitForSelector('[data-testid="loading"]', { state: "hidden" });

// Wait for network to be idle
await page.waitForLoadState("networkidle");

// Wait for specific URL
await page.waitForURL(/dashboard/);
```

### Assertions

```typescript
// URL assertions
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveURL("http://localhost:3000/dashboard");

// Text assertions
await expect(page.locator("h1")).toHaveText("Welcome");
await expect(page.locator('[data-testid="message"]')).toContainText("Success");

// Visibility assertions
await expect(page.locator('[data-testid="button"]')).toBeVisible();
await expect(page.locator('[data-testid="modal"]')).toBeHidden();

// Count assertions
await expect(page.locator('[data-testid="item"]')).toHaveCount(5);
```

### Handling Modals/Dialogs

```typescript
test("should handle modal", async ({ page }) => {
	// Wait for modal to appear
	const modal = page.locator('[data-testid="modal"]');
	await modal.waitFor({ state: "visible" });

	// Interact with modal
	await modal.locator('[data-testid="close-button"]').click();

	// Verify modal is closed
	await expect(modal).toBeHidden();
});
```

### Handling Dropdowns/Selects

```typescript
test("should select option from dropdown", async ({ page }) => {
	const select = page.locator('[data-testid="select"]');
	await select.selectOption("option-value");

	// Or by label
	await select.selectOption({ label: "Option Label" });
});
```

### Handling File Uploads

```typescript
test("should upload file", async ({ page }) => {
	const fileInput = page.locator('[data-testid="file-input"]');
	await fileInput.setInputFiles("path/to/file.pdf");

	// Verify upload
	await expect(page.locator('[data-testid="file-name"]')).toHaveText(
		"file.pdf"
	);
});
```

## Best Practices Summary

1. **Use Page Objects**: Always use Page Object Model for maintainability
2. **Descriptive Names**: Use clear, descriptive test and file names
3. **Isolated Tests**: Each test should be independent and runnable alone
4. **Explicit Waits**: Use explicit waits instead of fixed timeouts
5. **Test Data Factories**: Use factories for consistent test data
6. **Clean Up**: Clean up test data and state after tests
7. **Avoid Flakiness**: Don't rely on fixed timeouts or race conditions
8. **Group Related Tests**: Use `test.describe()` to organize tests
9. **Use Fixtures**: Leverage Playwright fixtures for common setup
10. **Document Complex Tests**: Add comments for complex test logic

## Code Review Checklist

When reviewing test code, check for:

-   [ ] Descriptive test names
-   [ ] Proper use of Page Objects
-   [ ] Appropriate selectors (data-testid preferred)
-   [ ] Explicit waits instead of fixed timeouts
-   [ ] Proper error handling
-   [ ] Test data isolation
-   [ ] Clean up after tests
-   [ ] No hardcoded values
-   [ ] Proper async/await usage
-   [ ] Meaningful assertions

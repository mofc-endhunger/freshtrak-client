# Page Object Model (POM) Pattern

This document describes the Page Object Model pattern used in the FreshTrak E2E tests and provides guidelines for creating and maintaining Page Objects.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Creating Page Objects](#creating-page-objects)
- [Method Naming Conventions](#method-naming-conventions)
- [Selector Management](#selector-management)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The Page Object Model is a design pattern that creates an abstraction layer between test code and page implementation. Each page in the application has a corresponding Page Object class that encapsulates:

- Page navigation
- Element selectors
- Page interactions
- Page-specific assertions

### Benefits

- **Maintainability**: Changes to UI only require updates in Page Objects
- **Reusability**: Page Objects can be reused across multiple tests
- **Readability**: Tests are more readable and express intent clearly
- **Reduced Duplication**: Common interactions are centralized

## Structure

### BasePage

All Page Objects extend `BasePage`, which provides common functionality:

```typescript
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(...args: any[]): Promise<void> { ... }
  async waitForLoad(): Promise<void> { ... }
  // Common interaction methods
}
```

### Page Object Structure

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { PageSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

export class ExamplePage extends BasePage {
  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    await this.page.goto(TEST_URLS.EXAMPLE);
    await this.waitForLoad();
  }

  /**
   * Perform page-specific action
   */
  async performAction(): Promise<void> {
    await this.page.locator(PageSelectors.actionButton).click();
  }
}
```

## Creating Page Objects

### Step 1: Create the Page Object File

Create a new file in `e2e/pages/` following the naming convention: `[PageName]Page.ts`

```typescript
// e2e/pages/ExamplePage.ts
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ExampleSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

export class ExamplePage extends BasePage {
  // Page Object implementation
}
```

### Step 2: Implement Navigation

```typescript
async navigate(param?: string): Promise<void> {
  const url = param ? `${TEST_URLS.EXAMPLE}/${param}` : TEST_URLS.EXAMPLE;
  await this.page.goto(url);
  await this.waitForLoad();
}
```

### Step 3: Add Page Methods

Add methods for all interactions on the page:

```typescript
async clickSubmitButton(): Promise<void> {
  await this.page.locator(ExampleSelectors.submitButton).click();
}

async fillForm(data: FormData): Promise<void> {
  await this.page.locator(ExampleSelectors.emailInput).fill(data.email);
  await this.page.locator(ExampleSelectors.nameInput).fill(data.name);
}
```

### Step 4: Add Verification Methods

```typescript
async verifyPageLoaded(): Promise<void> {
  await expect(this.page.locator(ExampleSelectors.pageTitle)).toBeVisible();
}

async verifySuccessMessage(): Promise<void> {
  await expect(this.page.locator(ExampleSelectors.successMessage))
    .toContainText('Success');
}
```

## Method Naming Conventions

### Action Methods

Use verb-noun pattern:

```typescript
// Good
async clickSubmitButton(): Promise<void> { ... }
async fillEmailField(email: string): Promise<void> { ... }
async selectOption(value: string): Promise<void> { ... }
async navigateToSettings(): Promise<void> { ... }

// Bad
async submit(): Promise<void> { ... }  // Too generic
async doSomething(): Promise<void> { ... }  // Unclear
async click(): Promise<void> { ... }  // What are we clicking?
```

### Verification Methods

Use `verify` or `assert` prefix:

```typescript
async verifyPageLoaded(): Promise<void> { ... }
async verifyErrorMessage(message: string): Promise<void> { ... }
async assertFormSubmitted(): Promise<void> { ... }
```

### Getter Methods

Use `get` prefix for methods that return values:

```typescript
async getPageTitle(): Promise<string | null> {
  return await this.page.locator(ExampleSelectors.title).textContent();
}

async getErrorMessage(): Promise<string | null> {
  return await this.page.locator(ExampleSelectors.errorMessage).textContent();
}
```

## Selector Management

### Centralized Selectors

Store selectors in `e2e/utils/selectors.ts`:

```typescript
// e2e/utils/selectors.ts
export const ExampleSelectors = {
  submitButton: '[data-testid="submit-button"]',
  emailInput: '[data-testid="email-input"]',
  nameInput: '[data-testid="name-input"]',
  pageTitle: 'h1',
  errorMessage: '[data-testid="error-message"]',
} as const;
```

### Using Selectors in Page Objects

```typescript
import { ExampleSelectors } from '../utils/selectors';

export class ExamplePage extends BasePage {
  async clickSubmit(): Promise<void> {
    await this.page.locator(ExampleSelectors.submitButton).click();
  }
}
```

### Dynamic Selectors

For selectors that need parameters:

```typescript
// In selectors.ts
export const getItemSelector = (id: string) => `[data-testid="item-${id}"]`;

// In Page Object
async clickItem(id: string): Promise<void> {
  await this.page.locator(getItemSelector(id)).click();
}
```

## Best Practices

### 1. One Page Object Per Page

Each page should have one corresponding Page Object:

```
Login Page → LoginPage.ts
Dashboard Page → DashboardPage.ts
```

### 2. Keep Methods Focused

Each method should do one thing:

```typescript
// Good
async fillEmail(email: string): Promise<void> {
  await this.page.locator(ExampleSelectors.emailInput).fill(email);
}

async fillName(name: string): Promise<void> {
  await this.page.locator(ExampleSelectors.nameInput).fill(name);
}

// Bad
async fillForm(email: string, name: string): Promise<void> {
  await this.page.locator(ExampleSelectors.emailInput).fill(email);
  await this.page.locator(ExampleSelectors.nameInput).fill(name);
}
```

### 3. Return Page Objects for Fluent API

For multi-step flows, return Page Objects:

```typescript
async submitForm(): Promise<ConfirmationPage> {
  await this.page.locator(ExampleSelectors.submitButton).click();
  await this.page.waitForURL(/confirmation/);
  return new ConfirmationPage(this.page);
}
```

### 4. Handle Waits in Page Objects

Page Objects should handle waiting for elements:

```typescript
async clickSubmitButton(): Promise<void> {
  const button = this.page.locator(ExampleSelectors.submitButton);
  await button.waitFor({ state: 'visible' });
  await button.click();
}
```

### 5. Use Protected Methods from BasePage

Leverage BasePage methods:

```typescript
// In Page Object
async fillForm(data: FormData): Promise<void> {
  await this.fill(ExampleSelectors.emailInput, data.email);
  await this.fill(ExampleSelectors.nameInput, data.name);
}
```

### 6. Document Complex Methods

Add JSDoc comments for complex methods:

```typescript
/**
 * Completes the multi-step registration form
 * @param formData - Registration form data
 * @param options - Optional configuration (skipSteps, etc.)
 */
async completeRegistration(
  formData: RegistrationFormData,
  options?: { skipSteps?: number[] }
): Promise<void> {
  // Implementation
}
```

## Examples

### Simple Page Object

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

export class LoginPage extends BasePage {
  async navigate(): Promise<void> {
    await this.page.goto(TEST_URLS.LOGIN);
    await this.waitForLoad();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.page.locator(LoginSelectors.emailInput).fill(email);
    await this.page.locator(LoginSelectors.passwordInput).fill(password);
    await this.page.locator(LoginSelectors.submitButton).click();
    await this.waitForLoad();
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.page.locator(LoginSelectors.errorMessage))
      .toContainText(message);
  }
}
```

### Complex Page Object with Multiple Methods

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationSelectors } from '../utils/selectors';
import { RegistrationFormData } from '../fixtures/test-data';

export class RegistrationPage extends BasePage {
  async navigate(eventDateId: string): Promise<void> {
    await this.page.goto(`/register/event/${eventDateId}`);
    await this.waitForLoad();
  }

  async fillStep0(data: { firstName: string; lastName: string; dateOfBirth: string }): Promise<void> {
    await this.page.locator(RegistrationSelectors.firstNameInput).fill(data.firstName);
    await this.page.locator(RegistrationSelectors.lastNameInput).fill(data.lastName);
    await this.page.locator(RegistrationSelectors.dateOfBirthInput).fill(data.dateOfBirth);
    await this.clickNextButton();
  }

  async clickNextButton(): Promise<void> {
    await this.page.locator(RegistrationSelectors.nextButton).click();
    await this.waitForLoad();
  }

  async completeRegistration(formData: RegistrationFormData): Promise<void> {
    await this.fillStep0({
      firstName: formData.user.firstName || '',
      lastName: formData.user.lastName || '',
      dateOfBirth: formData.user.dateOfBirth || '',
    });
    // Continue with other steps...
  }

  async verifyConfirmationPage(): Promise<void> {
    await expect(this.page.locator(RegistrationSelectors.confirmationMessage))
      .toBeVisible();
  }
}
```

## Page Object Template

Use this template when creating new Page Objects:

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { [PageName]Selectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

/**
 * Page Object for [Page Name]
 */
export class [PageName]Page extends BasePage {
  /**
   * Navigate to the [Page Name] page
   */
  async navigate(param?: string): Promise<void> {
    const url = param ? `${TEST_URLS.[PAGE_NAME]}/${param}` : TEST_URLS.[PAGE_NAME];
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * [Description of action]
   */
  async [actionMethod](): Promise<void> {
    await this.page.locator([PageName]Selectors.[selector]).click();
  }

  /**
   * Verify [what is being verified]
   */
  async verify[What](): Promise<void> {
    await expect(this.page.locator([PageName]Selectors.[selector]))
      .toBeVisible();
  }
}
```

## Maintenance

### When to Update Page Objects

- UI changes (new elements, changed selectors)
- New functionality added to the page
- Selector changes (update in `selectors.ts`)
- New test requirements

### Refactoring Page Objects

- Extract common patterns into BasePage
- Split large Page Objects into smaller, focused ones
- Update selectors when UI changes
- Keep methods focused and single-purpose


# Test Examples and Templates

This document provides ready-to-use test examples and templates for common testing scenarios.

## Table of Contents

- [Test Templates](#test-templates)
- [Common Test Scenarios](#common-test-scenarios)
- [Page Object Examples](#page-object-examples)

## Test Templates

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';
import { PageObject } from '../../pages/PageObject';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    const pageObject = new PageObject(page);
    await pageObject.navigate();
    
    // Act
    await pageObject.performAction();
    
    // Assert
    await expect(page).toHaveURL(/expected-url/);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### Authenticated Test Template

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProtectedPage } from '../../pages/ProtectedPage';
import { DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';

test.describe('Protected Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.signIn(
      DEFAULT_TEST_CREDENTIALS.email,
      DEFAULT_TEST_CREDENTIALS.password
    );
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
  });

  test('should access protected page', async ({ page }) => {
    const protectedPage = new ProtectedPage(page);
    await protectedPage.navigate();
    await expect(page).toHaveURL(/protected/);
  });
});
```

### Guest User Test Template

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PublicPage } from '../../pages/PublicPage';

test.describe('Public Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Continue as guest
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.continueAsGuest();
    await page.waitForURL(/^\/(?!login)/, { timeout: 10000 });
  });

  test('should access public page', async ({ page }) => {
    const publicPage = new PublicPage(page);
    await publicPage.navigate();
    await expect(page).toHaveURL(/public/);
  });
});
```

## Common Test Scenarios

### Form Submission Test

```typescript
import { test, expect } from '@playwright/test';
import { FormPage } from '../../pages/FormPage';
import { createFormData } from '../../fixtures/test-data';

test('should submit form successfully', async ({ page }) => {
  const formPage = new FormPage(page);
  const formData = createFormData();
  
  await formPage.navigate();
  await formPage.fillForm(formData);
  await formPage.submit();
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page).toHaveURL(/success/);
});
```

### Search Functionality Test

```typescript
import { test, expect } from '@playwright/test';
import { SearchPage } from '../../pages/SearchPage';

test('should search and display results', async ({ page }) => {
  const searchPage = new SearchPage(page);
  
  await searchPage.navigate();
  await searchPage.search('test query');
  
  // Wait for results
  await page.waitForLoadState('networkidle');
  
  // Verify results
  const results = page.locator('[data-testid="search-result"]');
  const count = await results.count();
  expect(count).toBeGreaterThan(0);
});
```

### Navigation Test

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { AboutPage } from '../../pages/AboutPage';

test('should navigate between pages', async ({ page }) => {
  const homePage = new HomePage(page);
  const aboutPage = new AboutPage(page);
  
  await homePage.navigate();
  await homePage.clickAboutLink();
  
  await expect(page).toHaveURL(/about/);
  await aboutPage.verifyPageLoaded();
});
```

### Multi-Step Form Test

```typescript
import { test, expect } from '@playwright/test';
import { MultiStepFormPage } from '../../pages/MultiStepFormPage';
import { createFormData } from '../../fixtures/test-data';

test('should complete multi-step form', async ({ page }) => {
  const formPage = new MultiStepFormPage(page);
  const formData = createFormData();
  
  await formPage.navigate();
  
  // Step 1
  await formPage.fillStep1(formData.step1);
  await formPage.clickNext();
  
  // Step 2
  await formPage.fillStep2(formData.step2);
  await formPage.clickNext();
  
  // Step 3
  await formPage.fillStep3(formData.step3);
  await formPage.submit();
  
  // Verify completion
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});
```

### Error Handling Test

```typescript
import { test, expect } from '@playwright/test';
import { FormPage } from '../../pages/FormPage';

test('should display error for invalid input', async ({ page }) => {
  const formPage = new FormPage(page);
  
  await formPage.navigate();
  await formPage.fillEmail('invalid-email');
  await formPage.submit();
  
  // Verify error message
  await expect(page.locator('[data-testid="error-message"]'))
    .toContainText('Invalid email');
});
```

### List/Table Interaction Test

```typescript
import { test, expect } from '@playwright/test';
import { ListPage } from '../../pages/ListPage';

test('should interact with list items', async ({ page }) => {
  const listPage = new ListPage(page);
  
  await listPage.navigate();
  
  // Get first item
  const firstItem = page.locator('[data-testid="list-item"]').first();
  const itemText = await firstItem.textContent();
  
  // Click item
  await firstItem.click();
  
  // Verify details page
  await expect(page).toHaveURL(/details/);
  await expect(page.locator('[data-testid="item-title"]'))
    .toContainText(itemText || '');
});
```

### Modal/Dialog Test

```typescript
import { test, expect } from '@playwright/test';
import { PageWithModal } from '../../pages/PageWithModal';

test('should open and close modal', async ({ page }) => {
  const pageWithModal = new PageWithModal(page);
  
  await pageWithModal.navigate();
  
  // Open modal
  await pageWithModal.openModal();
  await expect(page.locator('[data-testid="modal"]')).toBeVisible();
  
  // Close modal
  await pageWithModal.closeModal();
  await expect(page.locator('[data-testid="modal"]')).toBeHidden();
});
```

### File Upload Test

```typescript
import { test, expect } from '@playwright/test';
import { UploadPage } from '../../pages/UploadPage';

test('should upload file', async ({ page }) => {
  const uploadPage = new UploadPage(page);
  
  await uploadPage.navigate();
  await uploadPage.uploadFile('path/to/test-file.pdf');
  
  // Verify upload
  await expect(page.locator('[data-testid="file-name"]'))
    .toContainText('test-file.pdf');
});
```

### Dropdown/Select Test

```typescript
import { test, expect } from '@playwright/test';
import { FormPage } from '../../pages/FormPage';

test('should select option from dropdown', async ({ page }) => {
  const formPage = new FormPage(page);
  
  await formPage.navigate();
  await formPage.selectOption('option-value');
  
  // Verify selection
  await expect(page.locator('[data-testid="select"]'))
    .toHaveValue('option-value');
});
```

### Checkbox/Radio Test

```typescript
import { test, expect } from '@playwright/test';
import { FormPage } from '../../pages/FormPage';

test('should select checkbox', async ({ page }) => {
  const formPage = new FormPage(page);
  
  await formPage.navigate();
  await formPage.checkOption('[data-testid="checkbox"]');
  
  // Verify checked
  await expect(page.locator('[data-testid="checkbox"]')).toBeChecked();
});
```

## Page Object Examples

### Simple Page Object

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ExampleSelectors } from '../utils/selectors';
import { TEST_URLS } from '../utils/constants';

export class ExamplePage extends BasePage {
  async navigate(): Promise<void> {
    await this.page.goto(TEST_URLS.EXAMPLE);
    await this.waitForLoad();
  }

  async clickButton(): Promise<void> {
    await this.page.locator(ExampleSelectors.button).click();
  }

  async verifyTitle(text: string): Promise<void> {
    await expect(this.page.locator(ExampleSelectors.title))
      .toContainText(text);
  }
}
```

### Form Page Object

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { FormSelectors } from '../utils/selectors';

export interface FormData {
  email: string;
  name: string;
  message: string;
}

export class FormPage extends BasePage {
  async fillForm(data: FormData): Promise<void> {
    await this.page.locator(FormSelectors.emailInput).fill(data.email);
    await this.page.locator(FormSelectors.nameInput).fill(data.name);
    await this.page.locator(FormSelectors.messageInput).fill(data.message);
  }

  async submit(): Promise<void> {
    await this.page.locator(FormSelectors.submitButton).click();
    await this.waitForLoad();
  }

  async verifySuccess(): Promise<void> {
    await expect(this.page.locator(FormSelectors.successMessage))
      .toBeVisible();
  }
}
```

### List Page Object

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ListSelectors } from '../utils/selectors';

export class ListPage extends BasePage {
  async getItemCount(): Promise<number> {
    return await this.page.locator(ListSelectors.item).count();
  }

  async clickItem(index: number): Promise<void> {
    const items = this.page.locator(ListSelectors.item);
    await items.nth(index).click();
  }

  async getItemText(index: number): Promise<string | null> {
    const items = this.page.locator(ListSelectors.item);
    return await items.nth(index).textContent();
  }

  async verifyItemVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}
```

## Best Practices in Examples

All examples follow these best practices:

1. **Use Page Objects**: All interactions go through Page Objects
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Arrange-Act-Assert**: Tests follow AAA pattern
4. **Explicit Waits**: Use explicit waits instead of fixed timeouts
5. **Test Data Factories**: Use factories for test data
6. **Isolated Tests**: Each test is independent
7. **Clear Assertions**: Assertions are clear and specific

## Copy and Customize

Feel free to copy these examples and customize them for your specific needs. Remember to:

- Update selectors to match your application
- Adjust test data to match your domain
- Add appropriate waits and assertions
- Follow your project's naming conventions


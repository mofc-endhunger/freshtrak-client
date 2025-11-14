# Guide: Adding data-testid Attributes to Components

This guide explains how to add `data-testid` attributes to your React components to make E2E tests more stable and maintainable.

## Why data-testid?

`data-testid` attributes are the **most stable** selectors for E2E tests because:

1. **Purpose-built**: Designed specifically for testing
2. **Stable**: Don't change when CSS classes or structure changes
3. **Semantic**: Clearly indicate the element's purpose in tests
4. **Accessible**: Don't interfere with accessibility attributes

## Best Practices

### 1. Naming Convention

Use kebab-case with descriptive names:

```tsx
// Good
<Button data-testid="sign-in-button">Sign In</Button>
<Input data-testid="email-input" />
<div data-testid="event-card">

// Bad
<Button data-testid="btn1">Sign In</Button>
<Input data-testid="input" />
<div data-testid="card">
```

### 2. Placement

Add `data-testid` to interactive elements and key containers:

```tsx
// Interactive elements
<Button data-testid="submit-button">Submit</Button>
<Input data-testid="email-input" />
<Select data-testid="state-select">

// Key containers
<div data-testid="event-list">
  {events.map(event => (
    <div key={event.id} data-testid="event-card">
      {/* event content */}
    </div>
  ))}
</div>

// Error/success messages
<div data-testid="error-message">Error text</div>
<div data-testid="success-message">Success text</div>
```

### 3. When to Add data-testid

**Add data-testid for:**
- Form inputs and buttons
- Navigation links/buttons
- Interactive elements (modals, dropdowns, etc.)
- Key containers (lists, cards, sections)
- Error/success messages
- Loading states

**Don't add data-testid for:**
- Decorative elements
- Every single div
- Elements that can be reliably selected by role/text

## Implementation Examples

### Login Form

```tsx
// Before
<form onSubmit={handleSubmit}>
  <Input id="email" type="email" />
  <Input id="password" type="password" />
  <Button type="submit">Sign In</Button>
</form>

// After
<form onSubmit={handleSubmit} data-testid="login-form">
  <Input 
    id="email" 
    type="email" 
    data-testid="email-input"
  />
  <Input 
    id="password" 
    type="password" 
    data-testid="password-input"
  />
  <Button 
    type="submit" 
    data-testid="sign-in-button"
  >
    Sign In
  </Button>
</form>
```

### Search Component

```tsx
// Before
<div>
  <Input id="zip_code" />
  <Button id="search-resource">Search</Button>
</div>

// After
<div data-testid="search-form">
  <Input 
    id="zip_code" 
    data-testid="zip-code-input"
  />
  <Button 
    id="search-resource"
    data-testid="search-button"
  >
    Search
  </Button>
</div>
```

### Event List

```tsx
// Before
<div>
  {events.map(event => (
    <div key={event.id}>
      <h3>{event.title}</h3>
      <Button>Register</Button>
    </div>
  ))}
</div>

// After
<div data-testid="event-list">
  {events.map(event => (
    <div 
      key={event.id} 
      data-testid="event-card"
    >
      <h3 data-testid="event-title">{event.title}</h3>
      <Button data-testid="register-button">
        Register
      </Button>
    </div>
  ))}
</div>
```

### Registration Form (Multi-step)

```tsx
// Step 0: Primary Information
<div data-testid="registration-step-0">
  <Input 
    name="first_name"
    data-testid="first-name-input"
  />
  <Input 
    name="last_name"
    data-testid="last-name-input"
  />
  <Input 
    name="date_of_birth"
    data-testid="date-of-birth-input"
  />
  <Select 
    name="gender"
    data-testid="gender-select"
  />
  <Button data-testid="next-button">Next</Button>
</div>

// Step 1: Address
<div data-testid="registration-step-1">
  <Input 
    name="address_line_1"
    data-testid="address-input"
  />
  <Input 
    name="city"
    data-testid="city-input"
  />
  <Select 
    name="state"
    data-testid="state-select"
  />
  <Input 
    name="zip_code"
    data-testid="zip-code-input"
  />
  <Button data-testid="previous-button">Previous</Button>
  <Button data-testid="next-button">Next</Button>
</div>
```

## Priority List for Adding data-testid

Based on test failures, prioritize adding `data-testid` to:

### High Priority (Most Tested)

1. **Authentication Components**
   - `LoginPage.tsx`: Add to all form inputs and buttons
   - `SignInFormComponent.tsx`: Add to email, password, submit button
   - `SignUpFormComponent.tsx`: Add to all form fields
   - `ConfirmSignUpFormComponent.tsx`: Add to code input and confirm button
   - Guest login button

2. **Dashboard Components**
   - `SearchComponent.tsx`: Add to zip code input, search button
   - `FilterComponent.tsx`: Add to distance select, filter options

3. **Registration Components**
   - `HouseholdForm.tsx`: Already has some, add more for all steps
   - `PrimaryInfoFormComponent.tsx`: Add to all inputs
   - `AddressComponent.tsx`: Add to all address fields
   - `ContactInformationComponent.tsx`: Add to contact fields
   - `MemberCountFormComponent.tsx`: Add to count inputs

### Medium Priority

4. **Events Components**
   - Event cards
   - Event list container
   - Filter components
   - Registration buttons

5. **Family Components**
   - Family member list
   - Add/edit family member forms
   - Delete buttons

6. **Account Components**
   - Account information display
   - Edit buttons
   - Logout button

## Step-by-Step: Adding to Existing Components

### Example: Updating LoginPage.tsx

```tsx
// 1. Find the component file
// src/Modules/Authentication/LoginPage.tsx

// 2. Add data-testid to buttons
<Button
  variant={currentTab === "signin" ? "default" : "ghost"}
  onClick={() => switchTab("signin")}
  data-testid="sign-in-tab"  // ADD THIS
>
  Sign In
</Button>

<Button
  variant="outline"
  onClick={onGuestLogin}
  data-testid="guest-button"  // ADD THIS
>
  Continue as Guest
</Button>

// 3. Update child components (SignInFormComponent.tsx)
<Input
  id="email"
  type="email"
  data-testid="email-input"  // ADD THIS
  {...register("email")}
/>

<Button
  type="submit"
  data-testid="sign-in-button"  // ADD THIS
>
  Sign In
</Button>
```

## Testing Your Changes

After adding `data-testid` attributes:

1. **Update selectors** in `e2e/utils/selectors.ts`:
   ```typescript
   export const LoginSelectors = {
     emailInput: '[data-testid="email-input"]',  // Updated
     passwordInput: '[data-testid="password-input"]',  // Updated
     signInButton: '[data-testid="sign-in-button"]',  // Updated
   };
   ```

2. **Run tests** to verify:
   ```bash
   npm run test:e2e -- --project=chromium e2e/tests/auth/login.spec.ts
   ```

3. **Check for regressions**:
   ```bash
   npm run test:e2e
   ```

## Quick Reference: Common Patterns

### Form Inputs
```tsx
<Input 
  name="field_name"
  data-testid="field-name-input"
/>
```

### Buttons
```tsx
<Button 
  data-testid="action-button"
  onClick={handleAction}
>
  Action Text
</Button>
```

### Lists/Containers
```tsx
<div data-testid="item-list">
  {items.map(item => (
    <div key={item.id} data-testid="item-card">
      {/* content */}
    </div>
  ))}
</div>
```

### Error Messages
```tsx
{error && (
  <div data-testid="error-message" role="alert">
    {error}
  </div>
)}
```

### Loading States
```tsx
{isLoading && (
  <div data-testid="loading-spinner">
    <Spinner />
  </div>
)}
```

## Migration Strategy

1. **Start with high-traffic pages**: Login, Dashboard, Registration
2. **Add incrementally**: Don't try to add all at once
3. **Test as you go**: Run tests after each component update
4. **Update selectors**: Keep `e2e/utils/selectors.ts` in sync
5. **Document changes**: Note which components have been updated

## Benefits

After adding `data-testid` attributes:

- ✅ Tests are more stable
- ✅ Easier to maintain
- ✅ Clearer test intent
- ✅ Less brittle to UI changes
- ✅ Better developer experience

## Questions?

- See `e2e/TEST_WRITING_GUIDELINES.md` for selector strategy
- See `e2e/PAGE_OBJECT_PATTERN.md` for Page Object usage
- Check existing `data-testid` usage in components for examples


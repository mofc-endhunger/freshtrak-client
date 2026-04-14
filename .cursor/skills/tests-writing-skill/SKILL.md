---
name: jest-unit-tests
description: Generate Jest unit tests for React components, services, utilities, and accessibility. Use when the user asks to write tests, add test coverage, create unit tests, or test a component/service/utility.
---

# Jest Unit Tests

## Instructions

When asked to write tests, follow this workflow:

1. **Read the source file** to understand props, dependencies, hooks, state, and rendering logic.
2. **Identify the test type** (component, service/utility, or accessibility) and apply the matching template from [examples.md](examples.md).
3. **Set up mocks** for all external dependencies using project patterns from [mocks-reference.md](mocks-reference.md).
4. **Write tests** covering: rendering, interactions, async flows, edge cases, and error states.
5. **Run the test** with `npm test -- --testPathPattern="<path>" --watchAll=false` to verify.

## File Placement & Naming

| Type                 | Pattern                                | Location                   |
| -------------------- | -------------------------------------- | -------------------------- |
| Component test       | `ComponentName.test.tsx`               | `__test__/` next to source |
| Service/utility test | `ServiceName.test.ts`                  | `__test__/` next to source |
| Accessibility test   | `ComponentName.accessibility.test.tsx` | `__test__/` next to source |

Use `__test__` (singular) for new directories, matching project convention from `AGENTS.md`.

## Import Order

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// jest.mock() calls (hoisted automatically)

// Component/module under test (import AFTER jest.mock calls)
import ComponentUnderTest from '../ComponentUnderTest';
```

Place `jest.mock()` calls **before** importing the module under test. Jest hoists mocks, but importing after mocks improves readability and avoids subtle ordering issues.

## Test Structure

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Local render helper wrapping required providers
  const renderComponent = (overrides = {}) =>
    render(
      <MemoryRouter>
        <ComponentName {...defaultProps} {...overrides} />
      </MemoryRouter>,
    );

  describe("Rendering", () => { /* initial state tests */ });
  describe("Interactions", () => { /* user action tests */ });
  describe("Async behavior", () => { /* API/async tests */ });
  describe("Edge cases", () => { /* null, empty, error states */ });
});
```

### Key rules

- Use nested `describe` blocks grouped by behavior area.
- `beforeEach` must call `jest.clearAllMocks()`.
- Define a local `renderComponent` / `renderPage` helper that wraps providers (Router, Redux, Auth) as needed.
- Prefer `userEvent` over `fireEvent` for user interactions.
- Use `waitFor` for assertions after async operations.

## RTL Query Priority

Prefer semantic queries in this order:

1. `getByRole` — buttons, headings, textboxes, regions
2. `getByLabelText` — form fields with labels
3. `getByText` — visible text content
4. `getByTestId` — last resort, requires `data-testid` on element

Use `queryBy*` variants when asserting an element does **not** exist.

## What to Test

### Component tests

- Initial rendering (text, elements present)
- User interactions (click, type, select)
- Form validation and submission
- Conditional rendering based on props/state
- Navigation side effects
- Loading/error/empty states
- Callback invocations with correct arguments

### Service/utility tests

- Happy path with expected inputs
- Error handling (network, auth, validation, timeout)
- Edge cases (null, undefined, empty, boundary values)
- Return value shape and types

### Accessibility tests

- ARIA attributes (`aria-labelledby`, `aria-describedby`, `aria-modal`)
- Semantic HTML (`role`, heading levels, `<section>`, `<region>`)
- Screen reader support (sr-only headings, content associations)
- Missing data graceful fallback
- Color contrast class assertions

## Provider Wrappers

Choose the wrapper based on component needs:

| Dependency   | Wrapper                                                             |
| ------------ | ------------------------------------------------------------------- |
| React Router | `<MemoryRouter>` with optional `initialEntries`                     |
| Redux store  | `<Provider store={store}>` with `configureStore` + `preloadedState` |
| Auth context | Mock `useAuth` via `jest.mock("../AuthContext")`                    |
| Multiple     | Compose wrappers in the local render helper                         |

For Redux, prefer RTK `configureStore` with real reducers + `preloadedState` over `redux-mock-store`.

## Running Tests

```bash
# Single test file
npm test -- --testPathPattern="path/to/Component.test.tsx" --watchAll=false

# By test name
npm test -- --testNamePattern="ComponentName" --watchAll=false

# With coverage
npm test -- --testPathPattern="path/to/Component.test.tsx" --coverage --watchAll=false
```

## Additional Resources

- Mock patterns and snippets: [mocks-reference.md](mocks-reference.md)
- Full test templates: [examples.md](examples.md)

# Agent Guidelines for FreshTrak Client

This document provides guidance for AI agents operating in the FreshTrak client repository.

## Project Overview

FreshTrak is a React TypeScript application for household and family management. It uses:
- **React 18** with TypeScript 4.9
- **Tailwind CSS 3** for styling
- **React Hook Form** for forms with Zod validation
- **Redux Toolkit** for state management
- **AWS Amplify** for authentication
- **Jest + React Testing Library** for testing

## Build & Test Commands

### Development
```bash
npm start              # Start development server (requires .env)
npm run build          # Build for production
npm run build:development    # Build with .env file
```

### Testing
```bash
npm test               # Run all tests in watch mode
npm test -- --testNamePattern="ComponentName" --watchAll=false    # Run specific test
npm test -- --coverage     # Run tests with coverage report
npm test -- --testPathPattern="path/to/test.tsx"  # Run test file
```

### Docker
```bash
npm run docker:build   # Build Docker image
npm run docker:up      # Start container
npm run docker:down    # Stop container
npm run docker:rebuild # Full rebuild
```

### Linting & Type Checking
The project uses React Scripts ESLint configuration (`extends: "react-app"`). TypeScript strict mode is enabled.

## Code Organization

```
src/
├── components/         # UI components (shared, ui)
├── Modules/           # Feature modules (Family, Households, Authentication, etc.)
├── Services/          # API services
├── Store/             # Redux state management
├── Utils/             # Utility functions
├── hooks/             # Custom React hooks
├── types/             # Type definitions
├── styles/            # Global styles
└── Core/              # Core functionality
```

## Naming Conventions

- **Files**: PascalCase for React components (e.g., `HouseholdForm.tsx`), camelCase for utilities
- **Directories**: PascalCase for features (e.g., `Modules/Family/`), lowercase for system dirs
- **Components**: React.FC type annotation with destructured props
- **Functions**: camelCase, descriptive names indicating action
- **Types/Interfaces**: PascalCase (e.g., `HouseholdFormProps`, `AuthContextType`)
- **Constants**: UPPER_SNAKE_CASE for module exports

## Import Patterns

1. **React imports** first
2. **Third-party libraries** next
3. **Component imports** (grouped by relative paths)
4. **Utility/service imports**
5. **Type imports** (separate section with `import type`)
6. **Localization imports** last

```typescript
import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";

import PrimaryInfoFormComponent from "../../Modules/Family/PrimaryInfoFormComponent";
import { Button } from "../ui/button";

import { formatDateForServer } from "../../Utils/DateFormat";
import { StorageService } from "../../Utils/StorageService";

import type {
  RegistrationFormData,
  HouseholdFormProps,
} from "./types/household-form.types";

import localization from "../../Modules/Localization/LocalizationComponent";
```

## TypeScript & Type Safety

- **Strict mode**: Always enabled in tsconfig.json
- **Component types**: Use `React.FC<Props>` pattern
- **Props interface**: Named as `ComponentNameProps`
- **No implicit `any`**: All parameters must have explicit types
- **Return types**: Explicitly typed for non-trivial functions
- **Type imports**: Use `import type` for type-only imports
- **Union types**: Use discriminated unions where appropriate

## Formatting & Style Guidelines

- **Indentation**: 2 spaces (configured in projects)
- **Semicolons**: Always included
- **Quotes**: Double quotes for JSX, single for non-JSX strings (configurable)
- **Line length**: ~100-120 characters (soft limit)
- **Tailwind**: Primary styling method. Use `cn()` utility to merge class conflicts
- **Component composition**: Prefer composition over deeply nested props

### Tailwind Custom Colors
Common custom colors defined in `tailwind.config.js`:
- `primary`: "#28CE85" (main green)
- `secondary`: "#392947" (purple)
- `highlight`: "#392947"
- `text-color`, `content-text-color`, `content-text`

## Error Handling

1. **Try-catch blocks**: Use for async operations
2. **Error messages**: Throw descriptive Error objects
3. **Logging**: Use `console.error()` for exceptions with context
4. **User feedback**: Show user-friendly error messages via toast/alert
5. **Validation errors**: Use form-level validation with React Hook Form

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error("Context of error:", error);
  throw new Error(error.message || "Fallback message");
}
```

## Testing Standards

- **File location**: Tests in `__test__` directory alongside source
- **Test structure**: Use `describe()` blocks grouped by feature
- **Mocking**: Jest mocks for external dependencies (Localization, APIs)
- **Assertions**: Use React Testing Library queries (prefer semantic queries)
- **Coverage**: Aim for meaningful coverage, not just % numbers

```typescript
describe("ComponentName", () => {
  describe("Feature", () => {
    it("should render correctly", () => {
      // Test implementation
    });
  });
});
```

## React Patterns

- **Hooks**: Use modern hooks (useState, useEffect, useCallback, useMemo)
- **Context**: AuthContext for authentication state
- **Redux**: Use Redux Toolkit for global state
- **Forms**: React Hook Form with Zod validation for type-safe forms
- **Accessibility**: Include `data-testid`, ARIA labels, semantic HTML
- **Responsive**: Use Tailwind breakpoints (sm, md, lg, xl)

## Common Dependencies

- **UI Library**: Radix UI components in `src/components/ui/`
- **State**: Redux + Redux Persist for persistence
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library + jest-axe (a11y)
- **Styling**: Tailwind CSS + PostCSS + custom utilities in `src/lib/`

## Key Files & Patterns

- **`StorageService`** (src/Utils/StorageService.ts): Local storage & Cognito user management
- **`AuthContext`** (src/Modules/Authentication/AuthContext.tsx): Authentication state
- **`cn()` utility** (src/lib/utils.ts): Merge Tailwind classes safely
- **Localization**: Via `localization` object from Localization module
- **Type definitions**: In `src/types/` and module-specific `types/` subdirs

## Before Committing

1. Run `npm test -- --watchAll=false` to ensure tests pass
2. Verify TypeScript compilation (no `any` types without justification)
3. Check Tailwind classes are valid
4. Ensure imports follow project patterns
5. Add/update tests for new features
6. Update types if APIs or data structures change


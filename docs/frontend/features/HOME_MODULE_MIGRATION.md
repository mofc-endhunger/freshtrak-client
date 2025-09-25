# Product Requirements Document: Home Module Migration

## Introduction/Overview

This PRD outlines the migration of the Home module components from JavaScript to TypeScript and from Bootstrap/CSS to Tailwind CSS. The Home module is a critical user-facing component that displays local food bank information, user reservations, and nearby events. This migration will improve code maintainability, type safety, and ensure consistency with the project's modern UI framework.

**Problem Statement:** The Home module currently uses JavaScript and Bootstrap, which creates inconsistencies with the project's TypeScript and Tailwind CSS standards, potentially leading to maintenance issues and UI inconsistencies.

**Goal:** Migrate all Home module components to TypeScript and Tailwind CSS while maintaining the exact same functionality and visual appearance.

## Goals

1. **TypeScript Migration:** Convert all 5 JavaScript components to TypeScript with proper type definitions
2. **Bootstrap Removal:** Eliminate all Bootstrap dependencies and classes from Home module components
3. **Tailwind CSS Implementation:** Replace all custom CSS classes and Bootstrap classes with equivalent Tailwind CSS utilities
4. **Code Quality:** Improve code maintainability and type safety without changing functionality
5. **UI Consistency:** Ensure the migrated components maintain the exact same visual appearance and behavior

## User Stories

1. **As a developer**, I want the Home module components to use TypeScript so that I can catch type errors at compile time and have better IDE support.

2. **As a developer**, I want the Home module to use Tailwind CSS so that I can maintain consistency with the rest of the application and have a unified design system.

3. **As a user**, I want the Home module to look and function exactly the same after the migration so that my experience remains unchanged.

4. **As a developer**, I want to remove Bootstrap dependencies from the Home module to reduce bundle size and eliminate potential conflicts.

## Functional Requirements

### 1. TypeScript Migration Requirements

1.1. **HomeContainer.js → HomeContainer.tsx**

-   Convert to TypeScript with proper type definitions
-   Define interfaces for component props, state variables, and API responses
-   Type all function parameters and return values
-   Maintain all existing functionality including form handling, API calls, and event filtering

1.2. **LocalFoodBankComponent.js → LocalFoodBankComponent.tsx**

-   Convert to TypeScript with proper type definitions
-   Define interfaces for food bank data structure and component props
-   Type API response data and error handling
-   Maintain food bank display functionality

1.3. **EventNearByComponent.js → EventNearByComponent.tsx**

-   Convert to TypeScript with proper type definitions
-   Define interfaces for accordion functionality and event filtering
-   Replace react-bootstrap Accordion with custom Tailwind implementation
-   Maintain accordion behavior and event filtering

1.4. **UsersRegistrations.js → UsersRegistrations.tsx**

-   Convert to TypeScript with proper type definitions
-   Define interfaces for reserved events data and component props
-   Maintain event card display functionality

1.5. **YourPantriesComponent.js → YourPantriesComponent.tsx**

-   Convert to TypeScript with proper type definitions
-   Define component props interface (if any)
-   Maintain static content display

### 2. Bootstrap to Tailwind CSS Migration Requirements

2.1. **Remove Bootstrap Dependencies**

-   Remove `react-bootstrap` imports from EventNearByComponent
-   Remove Bootstrap CSS classes from all components
-   Ensure no Bootstrap JavaScript functionality is lost

2.2. **Replace Bootstrap Classes with Tailwind Equivalents**

-   Convert `container`, `row`, `col-lg-4`, `col-sm-6` to Tailwind grid system
-   Replace `pt-150`, `pb-150`, `mt-60` with Tailwind spacing utilities
-   Convert `font-weight-bold` to Tailwind font weight classes
-   Replace `text-left`, `mobile-text-left` with Tailwind text alignment
-   Convert `align-items-center`, `d-flex` to Tailwind flexbox utilities

2.3. **Custom CSS Class Migration**

-   Replace `.gray-bg` with Tailwind background color utilities
-   Convert `.search-area`, `.foodbank-and-events` to Tailwind layout classes
-   Replace `.local-foodbank-list`, `.search-results-list` with Tailwind styling
-   Convert `.search-list-logo`, `.link-wrap` to Tailwind component classes

2.4. **Accordion Component Recreation**

-   Replace react-bootstrap Accordion with custom Tailwind implementation
-   Maintain expand/collapse functionality
-   Preserve visual styling and animations
-   Ensure accessibility features are maintained

### 3. Component-Specific Requirements

3.1. **HomeContainer Component**

-   Maintain search functionality with zip code input
-   Preserve loading states and error handling
-   Keep event filtering (today, week, 30 days) functionality
-   Maintain responsive layout and spacing

3.2. **LocalFoodBankComponent**

-   Preserve food bank information display layout
-   Maintain logo, name, address, phone, and URL display
-   Keep responsive grid system behavior
-   Preserve loading and "no food banks found" states

3.3. **EventNearByComponent**

-   Recreate accordion functionality without Bootstrap
-   Maintain three accordion sections (Today, Next 7 days, Next 30 days)
-   Preserve expand/collapse behavior and visual indicators
-   Keep event list integration

3.4. **UsersRegistrations**

-   Maintain event card grid layout
-   Preserve "Your UpComing Reservations" header styling
-   Keep responsive design behavior

3.5. **YourPantriesComponent**

-   Maintain static content display
-   Preserve typography and spacing

## Non-Goals (Out of Scope)

1. **Functionality Changes:** No new features or modifications to existing business logic
2. **API Changes:** No modifications to data fetching or API integration
3. **Performance Optimization:** No performance improvements beyond what the migration naturally provides
4. **Testing:** No new test creation (existing tests should continue to pass)
5. **Documentation:** No additional documentation beyond code comments
6. **Other Modules:** No changes to components outside the Home module

## Design Considerations

### UI/UX Requirements

-   **Visual Consistency:** Migrated components must look identical to current components
-   **Responsive Design:** Maintain all responsive breakpoints and mobile-first approach
-   **Accessibility:** Preserve all accessibility features including ARIA labels and keyboard navigation
-   **Component Library:** Use existing shadcn components where applicable

### Tailwind CSS Guidelines

-   **Custom Colors:** Utilize existing custom color palette from `tailwind.config.js`
-   **Spacing System:** Use custom spacing values (pt-150, pb-150, mt-60) as defined in config
-   **Typography:** Maintain existing font families and weights
-   **Component Classes:** Leverage custom component classes defined in Tailwind config

## Technical Considerations

### Dependencies

-   **TypeScript:** Already configured in project (`tsconfig.json` exists)
-   **Tailwind CSS:** Already configured (`tailwind.config.js` exists with custom theme)
-   **React:** Maintain React 18 compatibility
-   **State Management:** Preserve Redux integration and state management patterns

### Migration Strategy

1. **Phase 1:** Convert JavaScript files to TypeScript (`.js` → `.tsx`)
2. **Phase 2:** Add type definitions and interfaces
3. **Phase 3:** Replace Bootstrap classes with Tailwind equivalents
4. **Phase 4:** Remove Bootstrap dependencies
5. **Phase 5:** Test and validate functionality

### File Structure

-   Maintain existing file organization within `src/Modules/Home/`
-   Update import statements to reflect new file extensions
-   Ensure all components export properly typed interfaces

## Success Metrics

1. **Type Safety:** 100% of Home module components successfully converted to TypeScript
2. **Bootstrap Removal:** Zero Bootstrap dependencies remaining in Home module
3. **Functionality Preservation:** All existing features work exactly as before
4. **Visual Consistency:** Migrated components pass visual regression testing
5. **Build Success:** Application builds without errors or warnings
6. **Test Passing:** All existing tests continue to pass

## Open Questions

1. **Accordion Implementation:** What is the preferred approach for recreating the accordion functionality? Should we use a headless UI library or create a custom implementation?

2. **Custom CSS Classes:** Are there any custom CSS classes that should be preserved as Tailwind component classes in the config?

3. **Animation Requirements:** Should we maintain the same animations and transitions for the accordion component?

4. **Testing Strategy:** How should we validate that the migrated components maintain the exact same functionality?

5. **Performance Impact:** Are there any performance considerations we should account for during the migration?

## Implementation Notes

-   **Media Queries:** Account for responsive design requirements in Tailwind implementation
-   **shadcn Components:** Prefer shadcn components over custom implementations where applicable
-   **Code Quality:** Follow existing code style and patterns
-   **Incremental Migration:** Consider migrating one component at a time to minimize risk
-   **Rollback Plan:** Maintain ability to revert changes if issues arise during migration

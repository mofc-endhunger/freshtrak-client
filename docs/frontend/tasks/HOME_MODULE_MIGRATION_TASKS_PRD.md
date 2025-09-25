# Task List: Home Module Migration

## Relevant Files

-   `src/Modules/Home/HomeContainer.js` - Main container component that needs TypeScript conversion and Bootstrap to Tailwind migration
-   `src/Modules/Home/LocalFoodBankComponent.js` - Food bank display component requiring TypeScript and Tailwind migration
-   `src/Modules/Home/EventNearByComponent.js` - Accordion component with Bootstrap dependencies that needs custom Tailwind implementation
-   `src/Modules/Home/UsersRegistrations.js` - User reservations display component for TypeScript and Tailwind migration
-   `src/Modules/Home/YourPantriesComponent.js` - Static content component for TypeScript and Tailwind migration
-   `src/Modules/Home/HomeContainer.tsx` - New TypeScript version of HomeContainer
-   `src/Modules/Home/LocalFoodBankComponent.tsx` - New TypeScript version of LocalFoodBankComponent
-   `src/Modules/Home/EventNearByComponent.tsx` - New TypeScript version of EventNearByComponent
-   `src/Modules/Home/UsersRegistrations.tsx` - New TypeScript version of UsersRegistrations
-   `src/Modules/Home/YourPantriesComponent.tsx` - New TypeScript version of YourPantriesComponent

### Notes

-   Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
-   Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

-   [x] 1.0 TypeScript Migration Phase
    -   [x] 1.1 Create TypeScript interfaces for Home module data structures
    -   [x] 1.2 Convert HomeContainer.js to HomeContainer.tsx with proper typing
    -   [x] 1.3 Convert LocalFoodBankComponent.js to LocalFoodBankComponent.tsx with proper typing
    -   [x] 1.4 Convert EventNearByComponent.js to EventNearByComponent.tsx with proper typing
    -   [x] 1.5 Convert UsersRegistrations.js to UsersRegistrations.tsx with proper typing
    -   [x] 1.6 Convert YourPantriesComponent.js to YourPantriesComponent.tsx with proper typing
    -   [x] 1.7 Update import statements in all components to reflect new file extensions
    -   [x] 1.8 Verify TypeScript compilation without errors
-   [x] 2.0 Bootstrap to Tailwind CSS Migration Phase
    -   [x] 2.1 Replace Bootstrap grid classes (container, row, col-\*) with Tailwind equivalents
    -   [x] 2.2 Convert Bootstrap spacing utilities (pt-150, pb-150, mt-60) to Tailwind spacing
    -   [x] 2.3 Replace Bootstrap typography classes (font-weight-bold) with Tailwind equivalents
    -   [x] 2.4 Convert Bootstrap flexbox utilities (d-flex, align-items-center) to Tailwind
    -   [x] 2.5 Replace Bootstrap text alignment classes (text-left, mobile-text-left) with Tailwind
    -   [x] 2.6 Convert custom CSS classes (.gray-bg, .search-area) to Tailwind utilities
    -   [x] 2.7 Update component-specific styling classes (.local-foodbank-list, .search-results-list)
    -   [x] 2.8 Verify visual consistency with original components
-   [x] 3.0 Accordion Component Recreation
    -   [x] 3.1 Remove react-bootstrap Accordion imports and dependencies
    -   [x] 3.2 Design custom Tailwind accordion component structure
    -   [x] 3.3 Implement expand/collapse functionality with useState hooks
    -   [x] 3.4 Add proper accessibility attributes (ARIA labels, keyboard navigation)
    -   [x] 3.5 Style accordion headers, content areas, and expand/collapse indicators
    -   [x] 3.6 Implement smooth transitions and animations
    -   [x] 3.7 Test accordion functionality matches original Bootstrap behavior
-   [x] 4.0 Testing and Validation
    -   [x] 4.1 Run existing tests to ensure they still pass after migration
    -   [x] 4.2 Test component rendering and functionality in development environment
    -   [x] 4.3 Verify responsive design behavior across different screen sizes
    -   [x] 4.4 Test form submission and API integration functionality
    -   [x] 4.5 Validate accessibility features (ARIA labels, keyboard navigation)
    -   [x] 4.6 Delete old js tests, move any new tests to an appropriate tests folder
-   [x] 5.0 Final Cleanup and Documentation
    -   [x] 5.1 Remove unused Bootstrap CSS imports and dependencies
    -   [x] 5.2 Clean up any unused custom CSS classes
    -   [x] 5.3 Remove all old js components
    -   [x] 5.4 Update component documentation and comments
    -   [x] 5.5 Verify all TypeScript types are properly exported
    -   [x] 5.6 Update any import statements in other modules that reference Home components
    -   [x] 5.7 Create migration summary documentation

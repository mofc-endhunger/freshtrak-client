# Dashboard Module Migration PRD

## Overview

The Dashboard module serves as the main landing page and entry point for the FreshTrak application. It provides users with search functionality to find food access resources and displays information about upcoming features and food bank services.

## Current Architecture

### Module Structure

```
src/Modules/Dashboard/
├── DashBoardContainer.js          # Main container component
├── DashBoardDataComponent.js      # Search and main content area
├── DashboardCreateAccountComponent.js  # Feature showcase section
└── DashBoardFoodBankComponent.js  # Food bank services section
```

### Component Dependencies

-   **General Components**: `BoxComponent`, `SearchComponent`
-   **Assets**: SVG icons (calendar, findfood, predict, serve-food, move-quick)
-   **Utils**: `Constants.js` (DEFAULT_DISTANCE)
-   **Localization**: `LocalizationComponent` for multi-language support
-   **Form Handling**: `react-hook-form` for search functionality

## Component Analysis

### 1. DashBoardContainer.js

**Purpose**: Main container that orchestrates the dashboard layout
**Current Implementation**:

-   Simple React fragment wrapper
-   Renders two main sections with Bootstrap classes
-   Imports SCSS for styling

**Key Features**:

-   Section-based layout structure
-   Gray background styling for food bank section

### 2. DashBoardDataComponent.js

**Purpose**: Handles search functionality and main content display
**Current Implementation**:

-   Uses `react-hook-form` for form management
-   Integrates with `SearchComponent` for zip code and distance input
-   Handles navigation to events list with search parameters
-   Renders account creation component

**Key Features**:

-   Form validation and submission
-   URL construction for search results
-   Integration with routing system

### 3. DashboardCreateAccountComponent.js

**Purpose**: Displays feature information and call-to-action elements
**Current Implementation**:

-   Uses `BoxComponent` for feature cards
-   Displays three main features with icons and descriptions
-   Supports localization for multi-language content
-   Uses Bootstrap grid system (`row`, `col-12 col-lg-4 col-xl-4`)

**Key Features**:

-   Feature showcase with icons
-   Responsive grid layout
-   Localized content support

### 4. DashBoardFoodBankComponent.js

**Purpose**: Displays information for food bank organizations
**Current Implementation**:

-   Uses `BoxComponent` for service descriptions
-   Displays three service categories with icons
-   Supports localization
-   Uses Bootstrap classes for layout and spacing

**Key Features**:

-   Service category display
-   Organization-focused messaging
-   Responsive design

## Current Styling Approach

### Bootstrap Classes Used

-   **Layout**: `container`, `row`, `col-12`, `col-lg-4`, `col-xl-4`
-   **Spacing**: `pt-150`, `pb-150`, `mb-5`, `mt-5`, `mb-2`
-   **Text**: `text-left`, `text-center`, `text-uppercase`
-   **Responsive**: `mobile-text-left`, `mobile-text-center`
-   **Typography**: `font-weight-bold`, `caption-text`
-   **Background**: `gray-bg`

### SCSS Dependencies

-   `main.scss` - Main stylesheet with custom variables and mixins
-   Custom classes: `search-area`, `stay-up-to-date`, `find-food`

## Migration Requirements

### 1. TypeScript Conversion

-   Convert all `.js` files to `.tsx`
-   Define proper interfaces for component props
-   Type form data and event handlers
-   Add type safety for localization objects

### 2. Tailwind CSS Migration

-   Replace Bootstrap classes with Tailwind equivalents
-   Maintain responsive design patterns
-   Preserve visual hierarchy and spacing
-   Implement custom color schemes

### 3. shadcn/ui Integration

-   Replace custom components with shadcn equivalents where applicable
-   Maintain consistent design system
-   Ensure accessibility compliance
-   Preserve component functionality

### 4. Responsive Design

-   Maintain mobile-first approach
-   Ensure proper breakpoint handling
-   Preserve existing responsive behaviors
-   Test across device sizes

## Migration Strategy

### Phase 1: TypeScript Conversion

1. Convert `DashBoardContainer.js` to `DashBoardContainer.tsx`
2. Convert `DashBoardDataComponent.js` to `DashBoardDataComponent.tsx`
3. Convert `DashboardCreateAccountComponent.js` to `DashboardCreateAccountComponent.tsx`
4. Convert `DashBoardFoodBankComponent.js` to `DashBoardFoodBankComponent.tsx`

### Phase 2: Tailwind CSS Migration

1. Replace Bootstrap layout classes
2. Migrate spacing and typography classes
3. Convert responsive utilities
4. Implement custom color schemes

### Phase 3: shadcn/ui Integration

1. Identify components suitable for shadcn replacement
2. Implement shadcn components
3. Ensure design consistency
4. Test accessibility features

### Phase 4: Testing and Validation

1. Run existing tests
2. Validate responsive behavior
3. Check accessibility compliance
4. Verify functionality preservation

## Technical Considerations

### Form Handling

-   Maintain `react-hook-form` integration
-   Ensure proper TypeScript typing for form data
-   Preserve validation logic

### Routing

-   Maintain navigation functionality
-   Preserve URL construction logic
-   Ensure proper type safety

### Localization

-   Preserve multi-language support
-   Ensure proper typing for localization objects
-   Maintain content structure

### Asset Management

-   Preserve SVG icon usage
-   Ensure proper asset imports
-   Maintain icon accessibility

## Success Criteria

### Functional Requirements

-   All search functionality preserved
-   Navigation to events list working
-   Localization support maintained
-   Responsive design preserved

### Technical Requirements

-   TypeScript compilation successful
-   No console errors or warnings
-   Proper type safety implemented
-   Tailwind classes properly applied

### Design Requirements

-   Visual appearance maintained
-   Responsive behavior preserved
-   Accessibility standards met
-   Consistent with design system

## Risk Assessment

### High Risk

-   Form validation logic preservation
-   Responsive design maintenance
-   Localization integration

### Medium Risk

-   Component prop interface definition
-   Tailwind class mapping accuracy
-   shadcn component compatibility

### Low Risk

-   File structure changes
-   Import statement updates
-   Basic styling migration

## Dependencies

### External Libraries

-   `react-hook-form` - Form management
-   `react-router-dom` - Navigation
-   `react-localization` - Multi-language support

### Internal Components

-   `SearchComponent` - Search functionality
-   `BoxComponent` - Feature display
-   `LocalizationComponent` - Language support

### Assets

-   SVG icons for features and services
-   SCSS files for custom styling

## Timeline Estimate

### Phase 1 (TypeScript): 2-3 days

### Phase 2 (Tailwind): 3-4 days

### Phase 3 (shadcn): 2-3 days

### Phase 4 (Testing): 2-3 days

**Total Estimated Time**: 9-13 days

## Next Steps

1. Review and approve migration strategy
2. Begin Phase 1: TypeScript conversion
3. Set up development environment
4. Create component interfaces
5. Implement incremental changes
6. Test each phase thoroughly
7. Document any deviations from plan

---

_This document serves as the primary reference for migrating the Dashboard module from JavaScript/Bootstrap to TypeScript/Tailwind CSS with shadcn components._

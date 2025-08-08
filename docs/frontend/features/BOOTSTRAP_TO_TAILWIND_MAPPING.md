# Bootstrap to Tailwind CSS Mapping Guide

## Registration Module Migration

### Overview

This document provides a comprehensive mapping from Bootstrap classes to Tailwind CSS classes for the Registration module components.

### Layout Classes

| Bootstrap Class          | Tailwind Equivalent                      | Usage                          |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| `container`              | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Main container wrapper         |
| `row`                    | `flex flex-wrap -mx-4`                   | Flexbox row container          |
| `col-12`                 | `w-full px-4`                            | Full width column              |
| `col-6`                  | `w-full md:w-1/2 px-4`                   | Half width column (responsive) |
| `d-flex`                 | `flex`                                   | Display flex                   |
| `justify-content-center` | `justify-center`                         | Center justify content         |

### Spacing Classes

| Bootstrap Class | Tailwind Equivalent | Usage                   |
| --------------- | ------------------- | ----------------------- |
| `mt-4`          | `mt-4`              | Margin top              |
| `mt-5`          | `mt-5`              | Margin top (larger)     |
| `mb-4`          | `mb-4`              | Margin bottom           |
| `mb-5`          | `mb-5`              | Margin bottom (larger)  |
| `mb-2`          | `mb-2`              | Margin bottom (smaller) |
| `pt-100`        | `pt-24`             | Padding top (custom)    |
| `pb-100`        | `pb-24`             | Padding bottom (custom) |

### Button Classes

| Bootstrap Class     | Tailwind Equivalent                                                                                                         | Usage          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `btn`               | `px-4 py-2 rounded font-medium transition-colors duration-200`                                                              | Base button    |
| `btn custom-button` | `px-4 py-2 rounded font-medium bg-default-button text-text-color hover:bg-default-button/90 transition-colors duration-200` | Custom button  |
| `btn-primary`       | `px-4 py-2 rounded font-medium bg-primary text-white hover:bg-primary/90 transition-colors duration-200`                    | Primary button |

### Typography Classes

| Bootstrap Class    | Tailwind Equivalent                      | Usage                |
| ------------------ | ---------------------------------------- | -------------------- |
| `font-weight-bold` | `font-bold`                              | Bold text            |
| `big-title`        | `text-4xl font-bold text-text-color`     | Large title          |
| `med-title`        | `text-2xl font-semibold text-text-color` | Medium title         |
| `mobile-mb`        | `mb-4 sm:mb-0`                           | Mobile margin bottom |

### Form Classes

| Bootstrap Class | Tailwind Equivalent                                                                                                              | Usage              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `form-control`  | `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent` | Form input         |
| `form-group`    | `mb-4`                                                                                                                           | Form group wrapper |
| `form-label`    | `block text-sm font-medium text-gray-700 mb-1`                                                                                   | Form label         |

### Custom Classes Mapping

| Custom Class            | Tailwind Equivalent                 | Usage                               |
| ----------------------- | ----------------------------------- | ----------------------------------- |
| `register-confirmation` | `max-w-md mx-auto my-5`             | Registration confirmation container |
| `registration-form`     | `max-w-4xl mx-auto`                 | Registration form container         |
| `content-wrapper`       | `max-w-6xl mx-auto px-4`            | Content wrapper                     |
| `button-wrap`           | `flex justify-center mt-4`          | Button wrapper                      |
| `day-view`              | `bg-white rounded-lg shadow-md p-4` | Day view container                  |
| `title-wrap`            | `text-center mb-6`                  | Title wrapper                       |
| `page-info-wrap`        | `bg-gray-50 rounded-lg p-4 mb-4`    | Page info wrapper                   |
| `qrcode`                | `text-center`                       | QR code container                   |
| `address-wrap`          | `mb-4`                              | Address wrapper                     |
| `date-wrapper`          | `text-lg font-semibold`             | Date wrapper                        |
| `timing-wrapper`        | `text-lg`                           | Timing wrapper                      |
| `qr-code`               | `flex justify-center my-4`          | QR code display                     |
| `reg-confirm-card`      | `bg-white rounded-lg shadow-md p-6` | Registration confirmation card      |

### Responsive Design

| Bootstrap Responsive | Tailwind Responsive | Usage                           |
| -------------------- | ------------------- | ------------------------------- |
| `col-md-6`           | `w-full md:w-1/2`   | Responsive column               |
| `d-none d-md-block`  | `hidden md:block`   | Hide on mobile, show on desktop |
| `d-block d-md-none`  | `block md:hidden`   | Show on mobile, hide on desktop |

### Color Mapping

| Bootstrap Color  | Tailwind Color   | Usage                |
| ---------------- | ---------------- | -------------------- |
| `text-primary`   | `text-primary`   | Primary text color   |
| `text-secondary` | `text-secondary` | Secondary text color |
| `text-danger`    | `text-red-500`   | Error text color     |
| `text-muted`     | `text-gray-500`  | Muted text color     |
| `bg-primary`     | `bg-primary`     | Primary background   |
| `bg-secondary`   | `bg-secondary`   | Secondary background |

### Component Migration Strategy

#### 1. Layout Components

-   Replace `container` with `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
-   Replace `row` with `flex flex-wrap -mx-4`
-   Replace `col-*` with responsive width classes

#### 2. Button Components

-   Use shadcn/ui Button component with custom variants
-   Replace `btn custom-button` with `Button` component
-   Apply custom styling through Tailwind classes

#### 3. Form Components

-   Use shadcn/ui Input, Label, Select components
-   Replace Bootstrap form classes with Tailwind utilities
-   Maintain accessibility and focus states

#### 4. Typography

-   Replace Bootstrap typography classes with Tailwind equivalents
-   Use custom font families defined in config
-   Maintain responsive text sizing

### Migration Checklist

-   [ ] Audit all Bootstrap classes in each component
-   [ ] Map Bootstrap classes to Tailwind equivalents
-   [ ] Update component JSX with new classes
-   [ ] Test responsive behavior
-   [ ] Verify accessibility features
-   [ ] Test form functionality
-   [ ] Validate visual consistency
-   [ ] Update custom CSS to Tailwind utilities

### Testing Strategy

1. **Visual Testing**: Compare before/after screenshots
2. **Responsive Testing**: Test on all breakpoints
3. **Functionality Testing**: Ensure forms and interactions work
4. **Accessibility Testing**: Verify ARIA attributes and keyboard navigation
5. **Performance Testing**: Check bundle size and loading times

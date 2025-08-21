# Dashboard Module Tailwind CSS Classes Documentation

## Overview

This document outlines the custom Tailwind CSS classes and spacing values created during the migration of the Dashboard module from Bootstrap to Tailwind CSS.

## Custom Spacing Values

### Large Padding Classes

The Dashboard module originally used Bootstrap classes like `pt-150` and `pb-150` for large top and bottom padding. These have been mapped to Tailwind's spacing scale:

-   **Original**: `pt-150` (Bootstrap custom class)
-   **Tailwind Equivalent**: `pt-36` (144px)
-   **Usage**: Main container padding for top and bottom sections

### Responsive Design Classes

#### Text Alignment

-   **Original**: `mobile-text-left text-center`
-   **Tailwind Equivalent**: `text-center md:text-left`
-   **Purpose**: Center text on mobile, left-align on medium screens and up

#### Grid Layouts

-   **Original**: `col-12 col-lg-4 col-xl-4`
-   **Tailwind Equivalent**: `grid-cols-1 lg:grid-cols-2` or `grid-cols-1 lg:grid-cols-3`
-   **Purpose**: Single column on mobile, multiple columns on large screens

## Bootstrap to Tailwind Mapping

### Layout Classes

| Bootstrap Class            | Tailwind Equivalent          | Purpose                                    |
| -------------------------- | ---------------------------- | ------------------------------------------ |
| `container`                | `container mx-auto px-4`     | Centered container with horizontal padding |
| `row`                      | `grid gap-6`                 | Grid layout with consistent spacing        |
| `col-12 col-lg-4 col-xl-4` | `grid-cols-1 lg:grid-cols-2` | Responsive grid columns                    |

### Spacing Classes

| Bootstrap Class | Tailwind Equivalent | Purpose                      |
| --------------- | ------------------- | ---------------------------- |
| `pt-150`        | `pt-36`             | Large top padding (144px)    |
| `pb-150`        | `pb-36`             | Large bottom padding (144px) |
| `mb-5`          | `mb-5`              | Medium bottom margin (20px)  |
| `mt-5`          | `mt-5`              | Medium top margin (20px)     |
| `mb-2`          | `mb-2`              | Small bottom margin (8px)    |

### Text Utilities

| Bootstrap Class    | Tailwind Equivalent | Purpose                       |
| ------------------ | ------------------- | ----------------------------- |
| `text-left`        | `text-left`         | Left-aligned text             |
| `text-center`      | `text-center`       | Center-aligned text           |
| `text-uppercase`   | `uppercase`         | Uppercase text transformation |
| `font-weight-bold` | `font-bold`         | Bold font weight              |

### Background Classes

| Bootstrap Class | Tailwind Equivalent | Purpose               |
| --------------- | ------------------- | --------------------- |
| `gray-bg`       | `bg-gray-100`       | Light gray background |

### Responsive Utilities

| Bootstrap Class      | Tailwind Equivalent | Purpose                                      |
| -------------------- | ------------------- | -------------------------------------------- |
| `mobile-text-left`   | `md:text-left`      | Left-aligned text on medium screens and up   |
| `mobile-text-center` | `md:text-center`    | Center-aligned text on medium screens and up |

## Implementation Notes

### Grid System

The Dashboard module uses CSS Grid instead of Bootstrap's flexbox-based grid system:

-   **Single Column**: `grid-cols-1` for mobile devices
-   **Two Columns**: `lg:grid-cols-2` for large screens (feature cards)
-   **Three Columns**: `lg:grid-cols-3` for large screens (service cards)

### Spacing Scale

All spacing values now use Tailwind's standardized spacing scale:

-   `pt-36` = 144px (equivalent to Bootstrap's pt-150)
-   `pb-36` = 144px (equivalent to Bootstrap's pb-150)
-   Consistent spacing with Tailwind's design system

### Responsive Breakpoints

-   **Mobile**: Default (no prefix)
-   **Medium**: `md:` (768px and up)
-   **Large**: `lg:` (1024px and up)

## Benefits of Migration

1. **Consistency**: All spacing now follows Tailwind's standardized scale
2. **Maintainability**: Easier to maintain and modify spacing values
3. **Responsiveness**: Better responsive design with Tailwind's breakpoint system
4. **Performance**: Smaller CSS bundle size with utility-first approach
5. **Design System**: Integration with the project's design system

## Future Considerations

When adding new components to the Dashboard module:

1. Use Tailwind's spacing scale (`pt-36`, `pb-36`, etc.)
2. Follow the responsive pattern (`text-center md:text-left`)
3. Use CSS Grid for layouts (`grid-cols-1 lg:grid-cols-X`)
4. Maintain consistency with existing spacing patterns

# Header Module Tailwind CSS Classes

## Overview

This document details the Tailwind CSS classes and mapping from custom CSS used in the Header module migration. The Header module has been successfully migrated from JavaScript with custom CSS to TypeScript with Tailwind CSS and shadcn/ui components.

## Custom CSS to Tailwind Migration

### Header Background Styles

| **Custom CSS**   | **Tailwind CSS**                                                                                | **Description**                                        |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `.header`        | `bg-[#28ce85] bg-no-repeat bg-center bg-cover` + `style={{backgroundImage: url(require(...))}}` | Header background with green color and banner image    |
| `.header` height | `h-[300px] sm:h-[400px]`                                                                        | Responsive header height (300px mobile, 400px desktop) |

### Navigation Styles

| **Custom CSS**    | **Tailwind CSS**                      | **Description**                           |
| ----------------- | ------------------------------------- | ----------------------------------------- |
| `#mainNav`        | `fixed top-0 left-0 right-0 z-[9999]` | Fixed navigation positioning              |
| `.navbar-shrink`  | `bg-primary shadow-lg`                | Navigation background when scrolled       |
| `.transition-all` | `transition-all duration-300`         | Smooth transitions for background changes |

### Layout and Spacing

| **Custom CSS**                                              | **Tailwind CSS**                                  | **Description**                        |
| ----------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `.max-w-7xl`                                                | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`          | Container width and responsive padding |
| `.flex items-center justify-between`                        | `flex items-center justify-between h-16 relative` | Navigation layout                      |
| `.md:absolute md:left-1/2 md:transform md:-translate-x-1/2` | Logo centering on desktop                         |

### Typography and Text

| **Custom CSS**                      | **Tailwind CSS**                                                                                                             | **Description**                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `.text-white font-bold`             | `text-white font-bold text-xs md:text-sm`                                                                                    | Button text styling                |
| `.text-center text-white font-bold` | `text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight` | Header title responsive typography |
| `.text-secondary font-varela`       | `text-center text-secondary font-varela text-[0.9rem] sm:text-[1.2rem] mt-4`                                                 | Header subtitle styling            |

### Responsive Design

| **Breakpoint** | **Classes**                                      | **Description**      |
| -------------- | ------------------------------------------------ | -------------------- |
| Mobile         | `h-[300px] text-[1.4rem] text-[0.9rem]`          | Small screen styles  |
| Small          | `sm:h-[400px] sm:text-[2.3rem] sm:text-[1.2rem]` | Small tablet styles  |
| Medium         | `md:text-[2.5rem]`                               | Medium tablet styles |
| Large          | `lg:text-[3.3rem]`                               | Desktop styles       |

### Component-Specific Styles

#### HeaderComponent

-   **Navigation**: `fixed top-0 left-0 right-0 z-[9999] transition-all duration-300`
-   **Background Logic**: `bg-primary shadow-lg` (conditional based on page type and scroll)
-   **Logo**: `h-6 md:h-8 w-auto` (responsive logo sizing)
-   **Mobile Menu**: `md:hidden` (hidden on desktop)

#### HeaderDataComponent

-   **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full`
-   **Content**: `w-full sm:w-[95%] md:w-[80%] lg:w-[85%] xl:w-[80%] max-w-4xl`
-   **Typography**: Responsive text sizing with Tailwind's arbitrary value syntax

#### Mobile Menu (Dialog)

-   **Dialog**: `w-[300px] bg-primary text-white border-none`
-   **Sections**: `text-xs font-semibold uppercase tracking-wider mb-4`
-   **Links**: `text-white text-lg font-semibold hover:text-gray-200 transition-colors`

## Background Color Logic Implementation

### Page Type Detection

```typescript
const getPageType = (): PageType => {
	const { pathname } = location;

	// Main page
	if (pathname === RENDER_URL.ROOT_URL) {
		return "main";
	}

	// Search results page
	if (pathname.startsWith("/events/list")) {
		return "search";
	}

	// All other pages
	return "other";
};
```

### Background Color Logic

```typescript
const shouldShowBackground = (
	pageType: PageType,
	isScrolled: boolean
): boolean => {
	// Main page and search results: transparent initially, background on scroll
	if (pageType === "main" || pageType === "search") {
		return isScrolled;
	}

	// All other pages: always show background
	return true;
};
```

### Tailwind Classes Applied

-   **Transparent**: No background classes (default)
-   **With Background**: `bg-primary shadow-lg` + custom box shadow
-   **Transition**: `transition-all duration-300`

## shadcn/ui Component Integration

### Button Component

-   **Logout Button**: `variant="ghost"` with custom text styling
-   **Mobile Menu Trigger**: `variant="ghost"` with hamburger icon
-   **Custom Styling**: `text-white font-bold text-xs md:text-sm hover:text-white focus:outline-none`

### Dialog Component

-   **Mobile Menu**: Full Dialog component with custom styling
-   **Content**: `w-[300px] bg-primary text-white border-none`
-   **Header**: `DialogHeader` and `DialogTitle` with white text
-   **Responsive**: Hidden on desktop with `md:hidden`

## Performance Optimizations

### Conditional Rendering

-   Background color logic only runs when needed
-   Mobile menu only renders when open
-   Responsive classes prevent unnecessary CSS

### Smooth Transitions

-   `transition-all duration-300` for background changes
-   `hover:text-gray-200 transition-colors` for interactive elements

## Accessibility Features

### ARIA Labels

-   `aria-label="Open mobile menu"` for mobile menu button
-   Proper focus management with Dialog component

### Keyboard Navigation

-   Dialog component provides built-in keyboard navigation
-   Focus trapped within mobile menu when open

### Screen Reader Support

-   Semantic HTML structure maintained
-   Proper heading hierarchy in HeaderDataComponent

## Browser Compatibility

### Supported Features

-   CSS Grid and Flexbox (modern browsers)
-   CSS Custom Properties (CSS variables)
-   CSS Transitions and Transforms

### Fallbacks

-   Progressive enhancement approach
-   Graceful degradation for older browsers

## Migration Benefits

### Before (Custom CSS)

-   Hardcoded pixel values
-   Custom media queries
-   Difficult to maintain responsive design
-   Inconsistent spacing and sizing

### After (Tailwind CSS)

-   Consistent design system
-   Easy responsive design with utility classes
-   Maintainable and scalable
-   Better performance with optimized CSS

## Future Enhancements

### Potential Improvements

-   Add more responsive breakpoints if needed
-   Implement dark mode support
-   Add animation variants for different page types
-   Enhance mobile menu with additional features

### Maintenance Notes

-   All custom CSS has been migrated to Tailwind utilities
-   Background color logic is centralized and maintainable
-   Component structure follows modern React patterns
-   TypeScript provides type safety for all props and state

# FreshTrak Design System Documentation

**Project:** FreshTrak Website  
**Date:** July 29, 2025  
**Version:** 1.0  
**Status:** Draft

---

## 1. Color Palette

### Primary Colors

-   **Primary Green**: `#28CE85` - Main brand color, used for primary actions and highlights
-   **Secondary Purple**: `#392947` - Secondary brand color, used for accents and secondary elements
-   **Text Primary**: `#009F56` - Primary text color for headings and important text

### Content Colors

-   **Content Text**: `#616161` - Main body text color
-   **Highlight**: `#392947` - Used for highlighted content and emphasis

### Gray Scale

-   **Gray Light**: `#F2F0F4` - Light background color
-   **Gray Dark**: `#424242` - Dark text and borders
-   **Gray Inner**: `#e5e5e5` - Inner borders and subtle backgrounds
-   **Color Light**: `#282828` - Light text on dark backgrounds
-   **Color Light Grey**: `#6A6B6B` - Secondary light text

### Interactive Colors

-   **Switch Button**: `#C4C4C4` - Toggle and switch elements
-   **Default Button**: `#E9EAEB` - Default button background
-   **Color Red**: `#dc3545` - Error states and warnings

### Shadow Colors

-   **Shadow Color**: `#e6e6e6` - Light shadows
-   **Shadow Dark**: `#b9b9b9` - Darker shadows

### Tailwind Usage

```css
/* Primary Colors */
.bg-primary          /* #28CE85 */
/* #28CE85 */
/* #28CE85 */
/* #28CE85 */
.bg-secondary        /* #392947 */
.text-text-primary   /* #009F56 */

/* Content Colors */
.text-content-text   /* #616161 */
.text-highlight      /* #392947 */

/* Gray Scale */
.bg-gray-light       /* #F2F0F4 */
.bg-gray-dark        /* #424242 */
.bg-gray-inner       /* #e5e5e5 */
.text-color-light    /* #282828 */
.text-color-light-grey /* #6A6B6B */

/* Interactive Colors */
.bg-switch-button    /* #C4C4C4 */
.bg-default-button   /* #E9EAEB */
.text-color-red; /* #dc3545 */
```

---

## 2. Typography

### Font Families

-   **Noto Sans**: `font-noto-sans` - Primary font for body text and general content
-   **Varela Round**: `font-varela` - Secondary font for captions and special text

### Font Usage Guidelines

-   **Headings**: Use Noto Sans with appropriate weights
-   **Body Text**: Use Noto Sans for readability
-   **Captions**: Use Varela Round for captions and special text
-   **Buttons**: Use Noto Sans for consistency

### Typography Scale

```css
/* Font Families */
.font-noto-sans      /* Noto Sans, sans-serif */
/* Noto Sans, sans-serif */
/* Noto Sans, sans-serif */
/* Noto Sans, sans-serif */
.font-varela         /* Varela Round, sans-serif */

/* Font Sizes (Tailwind Default) */
.text-xs             /* 0.75rem (12px) */
.text-sm             /* 0.875rem (14px) */
.text-base           /* 1rem (16px) */
.text-lg             /* 1.125rem (18px) */
.text-xl             /* 1.25rem (20px) */
.text-2xl            /* 1.5rem (24px) */
.text-3xl            /* 1.875rem (30px) */
.text-4xl            /* 2.25rem (36px) */

/* Font Weights */
.font-light          /* 300 */
.font-normal         /* 400 */
.font-medium         /* 500 */
.font-semibold       /* 600 */
.font-bold; /* 700 */
```

---

## 3. Spacing System

### Custom Spacing Values

-   **50px**: `p-50`, `m-50`, `pt-50`, `pb-50`, etc.
-   **60px**: `p-60`, `m-60`, `pt-60`, `pb-60`, etc.
-   **100px**: `p-100`, `m-100`, `pt-100`, `pb-100`, etc.
-   **150px**: `p-150`, `m-150`, `pt-150`, `pb-150`, etc.
-   **200px**: `p-200`, `m-200`, `pt-200`, `pb-200`, etc.

### Standard Tailwind Spacing

Use standard Tailwind spacing for most cases:

-   `p-1` to `p-16` (4px to 64px)
-   `m-1` to `m-16` (4px to 64px)
-   Custom values for specific design requirements

### Spacing Guidelines

-   **Component Padding**: Use `p-4` to `p-8` for component padding
-   **Section Spacing**: Use custom values (50px, 100px, 150px, 200px) for section spacing
-   **Form Spacing**: Use `space-y-4` for form field spacing
-   **Card Spacing**: Use `p-6` for card content padding

---

## 4. Layout Patterns

### Container Layouts

```css
/* Main Container */
.container mx-auto px-4

/* Full Width Container */
.w-full px-4

/* Responsive Container */
.container mx-auto px-4 md:px-6 lg:px-8
```

### Grid Systems

```css
/* Two Column Grid */
.grid grid-cols-1 md:grid-cols-2 gap-6

/* Three Column Grid */
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Auto-fit Grid */
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
```

### Flexbox Patterns

```css
/* Horizontal Layout */
.flex items-center justify-between

/* Vertical Layout */
.flex flex-col space-y-4

/* Centered Layout */
.flex items-center justify-center;
```

---

## 5. Component Design Tokens

### Buttons

```css
/* Primary Button */
.bg-primary text-white px-4 py-2 rounded font-medium hover:bg-opacity-90

/* Secondary Button */
.bg-secondary text-white px-4 py-2 rounded font-medium hover:bg-opacity-90

/* Outline Button */
.border border-primary text-primary px-4 py-2 rounded font-medium hover:bg-primary hover:text-white

/* Ghost Button */
.text-primary px-4 py-2 rounded font-medium hover:bg-gray-light
```

### Cards

```css
/* Standard Card */
.bg-white rounded-lg shadow-md p-6

/* Interactive Card */
.bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow

/* Card with Border */
.bg-white border border-gray-inner rounded-lg p-6
```

### Forms

```css
/* Input Field */
.w-full px-3 py-2 border border-gray-inner rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent

/* Form Group */
.space-y-2

/* Form Label */
.block text-sm font-medium text-gray-dark mb-1
```

### Navigation

```css
/* Navigation Item */
.px-4 py-2 text-content-text hover:text-primary transition-colors

/* Active Navigation */
.px-4 py-2 text-primary font-medium

/* Mobile Menu Item */
.block px-4 py-2 text-white hover:bg-white hover:text-primary transition-colors
```

---

## 6. Responsive Design

### Breakpoints

-   **Mobile**: `sm:` (640px and up)
-   **Tablet**: `md:` (768px and up)
-   **Desktop**: `lg:` (1024px and up)
-   **Large Desktop**: `xl:` (1280px and up)

### Responsive Patterns

```css
/* Responsive Text */
.text-sm md:text-base lg:text-lg

/* Responsive Grid */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Responsive Spacing */
.p-4 md:p-6 lg:p-8

/* Responsive Navigation */
.hidden md:flex
```

---

## 7. Animation and Transitions

### Transition Classes

```css
/* Smooth Transitions */
.transition-all duration-300 ease-in-out

/* Hover Effects */
.hover:bg-opacity-90 hover:shadow-lg

/* Focus States */
.focus:outline-none focus:ring-2 focus:ring-primary
```

### Animation Guidelines

-   Use `transition-all` for smooth state changes
-   Keep animations under 300ms for responsiveness
-   Use `ease-in-out` for natural feeling transitions
-   Avoid excessive animations that might distract users

---

## 8. Accessibility

### Color Contrast

-   Ensure sufficient contrast ratios (WCAG 2.1 AA compliance)
-   Test text on background combinations
-   Use semantic colors for different states

### Focus Management

```css
/* Focus Styles */
.focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2

/* Skip Links */
.sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0
```

### Screen Reader Support

-   Use semantic HTML elements
-   Provide proper ARIA labels
-   Ensure logical tab order

---

## 9. Migration Guidelines

### Bootstrap to Tailwind Mappings

```css
/* Layout */
.container-fluid → .container mx-auto px-4
.row → .flex flex-wrap
.col-md-6 → .w-full md:w-1/2

/* Buttons */
.btn btn-primary → .bg-primary text-white px-4 py-2 rounded
.btn btn-secondary → .bg-secondary text-white px-4 py-2 rounded

/* Forms */
.form-control → .w-full px-3 py-2 border border-gray-inner rounded
.form-group → .space-y-2

/* Cards */
.card → .bg-white rounded-lg shadow-md p-6
.card-body → .p-6

/* Utilities */
.text-center → .text-center
.mt-3 → .mt-3
.mb-3 → .mb-3
```

### Semantic UI to Tailwind Mappings

```css
/* Buttons */
.ui button → .bg-primary text-white px-4 py-2 rounded
.ui secondary button → .bg-secondary text-white px-4 py-2 rounded

/* Forms */
.ui input → .w-full px-3 py-2 border border-gray-inner rounded
.ui form → .space-y-4

/* Messages */
.ui message → .bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded;
```

---

## 10. Best Practices

### Naming Conventions

-   Use semantic class names when possible
-   Group related utilities together
-   Use consistent spacing patterns
-   Follow Tailwind's utility-first approach

### Performance Considerations

-   Use Tailwind's purge feature to remove unused styles
-   Minimize custom CSS when possible
-   Use responsive utilities efficiently
-   Optimize for mobile-first design

### Maintenance Guidelines

-   Document custom components and patterns
-   Keep design tokens consistent
-   Regular review of color usage
-   Update documentation as patterns evolve

---

**Document Version**: 1.0  
**Last Updated**: July 29, 2025  
**Next Review**: August 5, 2025

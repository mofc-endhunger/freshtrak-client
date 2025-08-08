# Responsive Design Patterns

## Registration Module Migration

### Overview

This document provides responsive design patterns and strategies for migrating the Registration module from Bootstrap to Tailwind CSS.

### Breakpoint Mapping

| SCSS Breakpoint              | Tailwind Breakpoint | Usage                    |
| ---------------------------- | ------------------- | ------------------------ |
| `@media (max-width: 575px)`  | `sm:`               | Small devices (phones)   |
| `@media (min-width: 576px)`  | `md:`               | Medium devices (tablets) |
| `@media (min-width: 768px)`  | `lg:`               | Large devices (desktops) |
| `@media (min-width: 992px)`  | `xl:`               | Extra large devices      |
| `@media (min-width: 1200px)` | `2xl:`              | 2XL devices              |

### Mobile-First Approach

#### 1. Container Patterns

**Pattern: Responsive Container**

```jsx
// Mobile-first approach
<div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
```

**Pattern: Responsive Grid**

```jsx
// Single column on mobile, multi-column on larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### 2. Typography Patterns

**Pattern: Responsive Text Sizing**

```jsx
// Smaller text on mobile, larger on desktop
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

**Pattern: Responsive Spacing**

```jsx
// Less margin on mobile, more on desktop
<div className="mb-4 sm:mb-6 lg:mb-8">
```

#### 3. Form Patterns

**Pattern: Responsive Form Layout**

```jsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">
	<div className="flex-1">
		<input className="w-full" />
	</div>
	<div className="flex-1">
		<input className="w-full" />
	</div>
</div>
```

**Pattern: Responsive Button Sizing**

```jsx
// Full width on mobile, auto width on desktop
<button className="w-full sm:w-auto px-4 py-2">
```

#### 4. Card Patterns

**Pattern: Responsive Card Layout**

```jsx
// Single column on mobile, multi-column on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
	<div className="bg-white rounded-lg shadow-md p-4">
		{/* Card content */}
	</div>
</div>
```

### Specific Registration Module Patterns

#### 1. Registration Form Responsive Layout

**Pattern: Form Container**

```jsx
// Responsive form container
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
	<form className="space-y-6">{/* Form content */}</form>
</div>
```

**Pattern: Form Field Groups**

```jsx
// Responsive field groups
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	<div className="space-y-2">
		<label className="block text-sm font-medium">First Name</label>
		<input className="w-full px-3 py-2 border rounded-md" />
	</div>
	<div className="space-y-2">
		<label className="block text-sm font-medium">Last Name</label>
		<input className="w-full px-3 py-2 border rounded-md" />
	</div>
</div>
```

#### 2. Registration Confirmation Responsive Layout

**Pattern: Confirmation Card**

```jsx
// Responsive confirmation layout
<div className="max-w-md mx-auto my-5">
	<div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
		<h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
			You're Registered
		</h1>
		{/* Confirmation content */}
	</div>
</div>
```

**Pattern: QR Code Responsive Display**

```jsx
// Responsive QR code container
<div className="flex justify-center my-4">
	<div className="w-48 h-48 sm:w-64 sm:h-64">
		<QRCode value={qrValue} size="100%" />
	</div>
</div>
```

#### 3. Event Card Responsive Layout

**Pattern: Event Card Grid**

```jsx
// Responsive event card layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
	<div className="bg-white rounded-lg shadow-md p-4">
		<EventCardComponent event={event} />
	</div>
</div>
```

### Responsive Utility Classes

#### 1. Spacing Utilities

**Pattern: Responsive Margins**

```jsx
// Responsive margin utilities
<div className="mt-4 sm:mt-6 lg:mt-8">
<div className="mb-2 sm:mb-4 lg:mb-6">
<div className="mx-2 sm:mx-4 lg:mx-6">
```

**Pattern: Responsive Padding**

```jsx
// Responsive padding utilities
<div className="p-4 sm:p-6 lg:p-8">
<div className="px-2 sm:px-4 lg:px-6">
<div className="py-2 sm:py-4 lg:py-6">
```

#### 2. Text Utilities

**Pattern: Responsive Text Sizing**

```jsx
// Responsive text sizing
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
<p className="text-sm sm:text-base lg:text-lg">
<span className="text-xs sm:text-sm lg:text-base">
```

**Pattern: Responsive Text Alignment**

```jsx
// Responsive text alignment
<div className="text-left sm:text-center lg:text-left">
<div className="text-center sm:text-left lg:text-center">
```

#### 3. Layout Utilities

**Pattern: Responsive Display**

```jsx
// Responsive display utilities
<div className="block sm:hidden">Mobile only</div>
<div className="hidden sm:block">Desktop only</div>
<div className="flex flex-col sm:flex-row">Stack on mobile, row on desktop</div>
```

**Pattern: Responsive Width**

```jsx
// Responsive width utilities
<div className="w-full sm:w-auto">
<div className="w-full md:w-1/2 lg:w-1/3">
<div className="w-full sm:w-3/4 lg:w-1/2">
```

### Migration Strategy

#### Step 1: Audit Current Responsive Behavior

1. Identify all responsive classes in current components
2. Document breakpoint-specific styling
3. Note mobile-specific behaviors

#### Step 2: Map to Tailwind Responsive Classes

1. Use mobile-first approach
2. Map Bootstrap responsive classes to Tailwind equivalents
3. Maintain visual consistency across breakpoints

#### Step 3: Test Responsive Behavior

1. Test on all breakpoints (sm, md, lg, xl, 2xl)
2. Verify mobile-specific functionality
3. Ensure touch interactions work properly

#### Step 4: Optimize for Performance

1. Use Tailwind's responsive utilities efficiently
2. Avoid unnecessary responsive classes
3. Optimize for mobile performance

### Testing Checklist

-   [ ] Mobile layout (320px - 575px)
-   [ ] Small tablet layout (576px - 767px)
-   [ ] Large tablet layout (768px - 991px)
-   [ ] Desktop layout (992px - 1199px)
-   [ ] Large desktop layout (1200px+)
-   [ ] Touch interactions on mobile
-   [ ] Form usability on all screen sizes
-   [ ] Button accessibility on mobile
-   [ ] Text readability on all devices
-   [ ] Navigation usability on mobile

### Common Responsive Patterns

#### Mobile Navigation Pattern

```jsx
// Responsive navigation
<nav className="flex flex-col sm:flex-row items-center">
	<div className="w-full sm:w-auto">{/* Mobile menu */}</div>
	<div className="hidden sm:flex">{/* Desktop menu */}</div>
</nav>
```

#### Responsive Form Pattern

```jsx
// Responsive form layout
<form className="space-y-4 sm:space-y-6">
	<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
		{/* Form fields */}
	</div>
	<div className="flex flex-col sm:flex-row gap-4">
		<button className="w-full sm:w-auto">Submit</button>
	</div>
</form>
```

#### Responsive Card Pattern

```jsx
// Responsive card layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
	<div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
		{/* Card content */}
	</div>
</div>
```

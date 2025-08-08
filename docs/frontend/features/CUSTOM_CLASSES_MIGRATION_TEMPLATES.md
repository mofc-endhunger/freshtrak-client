# Custom Classes Migration Templates

## Registration Module

### Overview

This document provides migration templates for custom CSS classes used in the Registration module components.

### Migration Templates

#### 1. Layout Classes

**Template: Container Classes**

```css
/* Before: Custom container classes */
.registration-form {
  max-width: 1024px;
  margin: 0 auto;
}

/* After: Tailwind utilities */
<div className="max-w-4xl mx-auto">
```

**Template: Content Wrapper**

```css
/* Before: Custom content wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* After: Tailwind utilities */
<div className="max-w-6xl mx-auto px-4">
```

#### 2. Button Classes

**Template: Custom Button**

```css
/* Before: Custom button styling */
.custom-button {
  min-width: 220px;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  background-color: #E5E5E5;
  color: #392947;
}

/* After: Tailwind utilities */
<button className="min-w-[220px] px-4 py-2 rounded font-medium bg-default-button text-text-color hover:bg-default-button/90 transition-colors duration-200">
```

**Template: Button Wrapper**

```css
/* Before: Button wrapper */
.button-wrap {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

/* After: Tailwind utilities */
<div className="flex justify-center mt-4">
```

#### 3. Card Classes

**Template: Registration Confirmation Card**

```css
/* Before: Registration confirmation card */
.reg-confirm-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* After: Tailwind utilities */
<div className="bg-white rounded-lg shadow-md p-6">
```

**Template: Day View Card**

```css
/* Before: Day view container */
.day-view {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

/* After: Tailwind utilities */
<div className="bg-white rounded-lg shadow-md p-4">
```

#### 4. Typography Classes

**Template: Title Wrapper**

```css
/* Before: Title wrapper */
.title-wrap {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* After: Tailwind utilities */
<div className="text-center mb-6">
```

**Template: Date Wrapper**

```css
/* Before: Date wrapper */
.date-wrapper {
  font-size: 1.125rem;
  font-weight: 600;
}

/* After: Tailwind utilities */
<div className="text-lg font-semibold">
```

**Template: Timing Wrapper**

```css
/* Before: Timing wrapper */
.timing-wrapper {
  font-size: 1.125rem;
}

/* After: Tailwind utilities */
<div className="text-lg">
```

#### 5. Form Classes

**Template: Form Group**

```css
/* Before: Form group */
.form-group {
  margin-bottom: 1rem;
}

/* After: Tailwind utilities */
<div className="mb-4">
```

**Template: Form Input**

```css
/* Before: Form input */
.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

/* After: Tailwind utilities */
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
```

#### 6. Utility Classes

**Template: Address Wrapper**

```css
/* Before: Address wrapper */
.address-wrap {
  margin-bottom: 1rem;
}

/* After: Tailwind utilities */
<div className="mb-4">
```

**Template: QR Code Container**

```css
/* Before: QR code container */
.qrcode {
  text-align: center;
}

/* After: Tailwind utilities */
<div className="text-center">
```

**Template: QR Code Display**

```css
/* Before: QR code display */
.qr-code {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

/* After: Tailwind utilities */
<div className="flex justify-center my-4">
```

#### 7. Page Info Classes

**Template: Page Info Wrapper**

```css
/* Before: Page info wrapper */
.page-info-wrap {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* After: Tailwind utilities */
<div className="bg-gray-50 rounded-lg p-4 mb-4">
```

#### 8. Responsive Classes

**Template: Mobile Margin Bottom**

```css
/* Before: Mobile margin bottom */
.mobile-mb {
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .mobile-mb {
    margin-bottom: 0;
  }
}

/* After: Tailwind utilities */
<div className="mb-4 sm:mb-0">
```

### Migration Process

#### Step 1: Audit Current Classes

1. Identify all custom CSS classes in component files
2. Document current styling and behavior
3. Note responsive behavior and breakpoints

#### Step 2: Map to Tailwind

1. Use the mapping templates above
2. Consider responsive design requirements
3. Maintain accessibility features

#### Step 3: Update Components

1. Replace custom classes with Tailwind utilities
2. Test visual consistency
3. Verify responsive behavior

#### Step 4: Remove Custom CSS

1. Remove custom CSS classes from stylesheets
2. Clean up unused CSS rules
3. Update component imports if needed

### Testing Checklist

-   [ ] Visual consistency with original design
-   [ ] Responsive behavior on all breakpoints
-   [ ] Accessibility features maintained
-   [ ] Form functionality preserved
-   [ ] Button interactions work correctly
-   [ ] Card layouts display properly
-   [ ] Typography scales appropriately
-   [ ] Spacing and alignment correct

### Common Patterns

#### Container Pattern

```jsx
// Before
<div className="registration-form">

// After
<div className="max-w-4xl mx-auto">
```

#### Button Pattern

```jsx
// Before
<button className="btn custom-button">

// After
<button className="min-w-[220px] px-4 py-2 rounded font-medium bg-default-button text-text-color hover:bg-default-button/90 transition-colors duration-200">
```

#### Card Pattern

```jsx
// Before
<div className="reg-confirm-card">

// After
<div className="bg-white rounded-lg shadow-md p-6">
```

#### Form Pattern

```jsx
// Before
<div className="form-group">
  <input className="form-control" />

// After
<div className="mb-4">
  <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
```

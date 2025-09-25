# Global Styles Migration Analysis

**Project:** FreshTrak Website  
**Date:** July 29, 2025  
**File:** `src/Assets/scss/main.scss` (1,104 lines)

---

## 1. Current Global Styles Overview

### 1.1 File Structure

-   **Main File**: `src/Assets/scss/main.scss` (1,104 lines)
-   **Variables**: `src/Assets/scss/_variables.scss` (24 lines)
-   **Mixins**: `src/Assets/scss/_mixins.scss` (96 lines)
-   **Form Elements**: `src/Assets/scss/_form-elements.scss` (imported)

### 1.2 Import Dependencies

```scss
@import "./variables";
@import "./mixins";
@import "./form-elements";
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Varela+Round&display=swap");
```

---

## 2. Global Styles Categories

### 2.1 Typography Styles (Can be migrated to Tailwind)

#### Font Families

-   **Noto Sans**: Primary font for body text
-   **Varela Round**: Secondary font for captions

#### Typography Classes

```scss
.big-title {
	font-size: 4rem;
	letter-spacing: -1px;
	color: $text-color;
	font-weight: 700;
}

.med-title {
	font-size: 2rem;
}

.medium-title {
	font-size: 18px;
}

.small-title {
	font-size: 14px;
}

.caption-text {
	font-family: $font-varela;
	letter-spacing: 0.4px;
}
```

**Tailwind Migration**: Use custom font families and typography utilities

### 2.2 Spacing Utilities (Can be migrated to Tailwind)

#### Custom Spacing Classes

```scss
.pt-200 {
	padding-top: 200px;
}
.pt-150 {
	padding-top: 150px;
}
.pb-150 {
	padding-bottom: 150px;
}
.pt-100 {
	padding-top: 100px;
}
.pb-100 {
	padding-bottom: 100px;
}
.pt-50 {
	padding-top: 50px;
}
.pb-50 {
	padding-bottom: 50px;
}
.mt-60 {
	margin-top: 60px;
}
.mt-100 {
	margin-top: 100px;
}
```

**Tailwind Migration**: Already configured in `tailwind.config.js` with custom spacing values

### 2.3 Color System (Already configured in Tailwind)

#### Primary Colors

-   `$primaryColor: #28CE85` → `primary`
-   `$secondary-color: #392947` → `secondary`
-   `$text-color: #009F56` → `text-primary`

#### Content Colors

-   `$content-text-color: #616161` → `content-text`
-   `$high-light-color: #392947` → `highlight`

#### Gray Scale

-   `$gray-color: #F2F0F4` → `gray-light`
-   `$dark-gray-color: #424242` → `gray-dark`
-   `$inner-gray: #e5e5e5` → `gray-inner`

**Tailwind Migration**: Already configured in `tailwind.config.js`

### 2.4 Layout Components (Need careful migration)

#### Navigation Components

```scss
#mainNav {
	// Complex navigation styling
	&.navbar-shrink {
		border-color: rgba(34, 34, 34, 0.1);
		background-color: $primaryColor;
	}
}

.navbar-green {
	background-color: $primaryColor;
}
```

**Migration Approach**: Replace with Tailwind navigation utilities

#### Header Components

```scss
.header {
	background: $primaryColor url(../img/banner-bg.png) no-repeat center center;
	height: 400px;
}
```

**Migration Approach**: Use Tailwind background and sizing utilities

### 2.5 Form Components (Can be migrated to Tailwind)

#### Search Area

```scss
.search-area {
	width: 80%;
	min-width: 600px;
	min-height: 130px;
	background: $color-white;
	border-radius: 8px;
	box-shadow: 0px 4px 8px $shadow-color;
}
```

**Migration Approach**: Use Tailwind form utilities and `@tailwindcss/forms` plugin

### 2.6 Card Components (Can be migrated to Tailwind)

#### Day View Cards

```scss
.day-view-item {
	border-radius: 8px;
	background: $color-white;
	box-shadow: 0px 4px 8px $shadow-color;
}
```

**Migration Approach**: Use Tailwind card utilities

### 2.7 Mobile Menu (Complex - needs custom CSS)

```scss
.mobile-menu {
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	background: url(../img/mobile-menu-bg.svg) no-repeat $primaryColor;
	background-size: cover;
	width: 100%;
	z-index: 1049;
	animation-duration: 0.5s;
	animation-fill-mode: both;
}
```

**Migration Approach**: Keep custom CSS for complex animations and background images

---

## 3. Migration Priority

### 3.1 High Priority (Easy Migration)

-   ✅ **Typography classes** → Tailwind typography utilities
-   ✅ **Spacing utilities** → Tailwind spacing utilities
-   ✅ **Color classes** → Tailwind color utilities
-   ✅ **Basic layout classes** → Tailwind layout utilities

### 3.2 Medium Priority (Moderate Complexity)

-   ⚠️ **Form components** → Tailwind form utilities
-   ⚠️ **Card components** → Tailwind card utilities
-   ⚠️ **Navigation components** → Tailwind navigation utilities

### 3.3 Low Priority (Complex - Keep Custom CSS)

-   🔴 **Mobile menu animations** → Keep custom CSS
-   🔴 **Complex background images** → Keep custom CSS
-   🔴 **Custom animations** → Keep custom CSS

---

## 4. Migration Plan

### 4.1 Phase 1: Typography and Spacing

1. Replace typography classes with Tailwind utilities
2. Replace spacing utilities with Tailwind utilities
3. Update font imports to use Tailwind font families

### 4.2 Phase 2: Colors and Basic Layout

1. Replace color classes with Tailwind color utilities
2. Replace basic layout classes with Tailwind utilities
3. Update component classes to use Tailwind

### 4.3 Phase 3: Complex Components

1. Migrate form components using `@tailwindcss/forms`
2. Migrate card components with Tailwind utilities
3. Migrate navigation components

### 4.4 Phase 4: Custom CSS Preservation

1. Identify components that need custom CSS
2. Create separate CSS file for complex styles
3. Ensure Tailwind and custom CSS work together

---

## 5. Custom CSS to Preserve

### 5.1 Animations

```scss
@keyframes fadeIn {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
```

### 5.2 Complex Background Images

```scss
.mobile-menu {
	background: url(../img/mobile-menu-bg.svg) no-repeat $primaryColor;
	background-size: cover;
}
```

### 5.3 Custom Responsive Mixins

```scss
@mixin responsive($breakpoint) {
	// Custom responsive mixins
}
```

---

## 6. Implementation Steps

### 6.1 Update index.css

1. Add Tailwind directives
2. Import custom CSS for complex components
3. Ensure proper CSS cascade

### 6.2 Component Migration

1. Start with simple components
2. Test each migration thoroughly
3. Update component documentation

### 6.3 Testing Strategy

1. Visual regression testing
2. Responsive testing
3. Cross-browser testing

---

## 7. Risk Assessment

### 7.1 Low Risk

-   Typography migration
-   Spacing migration
-   Color migration

### 7.2 Medium Risk

-   Form component migration
-   Navigation migration
-   Card component migration

### 7.3 High Risk

-   Mobile menu migration
-   Complex animation migration
-   Background image handling

---

**Document Version**: 1.0  
**Last Updated**: July 29, 2025  
**Next Review**: August 5, 2025

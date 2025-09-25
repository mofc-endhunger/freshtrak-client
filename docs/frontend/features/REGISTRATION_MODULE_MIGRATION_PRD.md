# Registration Module Migration PRD

## Product Requirements Document

### Document Information

-   **Project**: FreshTrak Client
-   **Module**: Registration Module
-   **Migration Type**: JavaScript → TypeScript, Bootstrap → Tailwind CSS
-   **Priority**: High
-   **Timeline**: Phase 1 (TypeScript) + Phase 2 (Tailwind CSS)
-   **Status**: Planning

---

## 1. Executive Summary

### 1.1 Overview

This PRD outlines the migration of the Registration module components from JavaScript to TypeScript and Bootstrap to Tailwind CSS. The migration will improve type safety, developer experience, and maintainability while preserving all existing functionality, logic, and visual appearance.

### 1.2 Objectives

-   **TypeScript Migration**: Convert all 8 Registration components to TypeScript with proper type definitions
-   **Tailwind Migration**: Replace Bootstrap classes with Tailwind CSS equivalents
-   **Zero Logic Changes**: Maintain all existing functionality and business logic
-   **Visual Consistency**: Preserve current layouts, styles, and user experience
-   **Performance**: Maintain or improve current performance metrics

### 1.3 Success Criteria

-   [ ] All 8 components successfully migrated to TypeScript
-   [ ] All Bootstrap classes replaced with Tailwind equivalents
-   [ ] Zero breaking changes to functionality
-   [ ] Visual appearance matches current implementation
-   [ ] All existing tests pass
-   [ ] TypeScript compilation without errors
-   [ ] Responsive design maintained

---

## 2. Current State Analysis

### 2.1 Components Inventory

| Component                            | Size  | Lines | Priority | Status  |
| ------------------------------------ | ----- | ----- | -------- | ------- |
| RegistrationContainer.js             | 12KB  | 430   | High     | Pending |
| RegistrationComponent.js             | 7.6KB | 290   | High     | Pending |
| RegistrationConfirmComponent.js      | 6.5KB | 235   | High     | Pending |
| RegistrationEventDetailsContainer.js | 3.8KB | 132   | Medium   | Pending |
| RegistrationTextInfoComponent.js     | 1.4KB | 52    | Medium   | Pending |
| RegistrationHeaderComponent.js       | 707B  | 27    | Low      | Pending |
| RegistrationTextComponent.js         | 857B  | 33    | Low      | Pending |
| QRCodeComponent.js                   | 440B  | 18    | Low      | Pending |

### 2.2 Current Technology Stack

-   **Language**: JavaScript (ES6+)
-   **CSS Framework**: Bootstrap 4.x with custom SCSS
-   **Form Management**: React Hook Form
-   **State Management**: Redux + Local State
-   **Dependencies**: 6+ external libraries

### 2.3 Current Styling Architecture

```scss
// Bootstrap Classes in Use
.btn, .btn-custom-button
.form-control, .form-group
.container, .row, .col-*
.d-flex, .justify-content-center
.mt-4, .mb-4, .pt-100, .pb-100

// Custom Classes
.registration-form
.register-confirmation
.content-wrapper
.custom-button
.big-title, .med-title
```

---

## 3. Migration Requirements

### 3.1 TypeScript Migration Requirements

#### 3.1.1 Type Definitions

```typescript
// Core Interfaces
interface RegistrationFormData {
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	date_of_birth: string;
	gender: string;
	address_line_1: string;
	address_line_2?: string;
	city: string;
	state: string;
	zip_code: string;
	phone: string;
	permission_to_text: boolean;
	email: string;
	permission_to_email: boolean;
	seniors_in_household: number;
	adults_in_household: number;
	children_in_household: number;
}

interface Event {
	id: string;
	agencyName: string;
	date: string;
	startTime: string;
	endTime: string;
	acceptWalkin: boolean;
	eventDetails?: string;
}

interface RegistrationProps {
	user: RegistrationFormData;
	onRegister: (data: RegistrationFormData) => Promise<void>;
	event: Event;
	disabled: boolean;
}

// Component-specific interfaces
interface RegistrationContainerProps {
	// Add specific props
}

interface RegistrationComponentProps {
	user: RegistrationFormData;
	onRegister: (data: RegistrationFormData) => Promise<void>;
	event: Event;
	disabled: boolean;
}

interface RegistrationConfirmProps {
	// Add specific props
}
```

#### 3.1.2 Migration Checklist

-   [ ] Create type definitions for all interfaces
-   [ ] Convert file extensions from .js to .tsx
-   [ ] Add proper type annotations to all functions
-   [ ] Type all component props
-   [ ] Type all state variables
-   [ ] Type all event handlers
-   [ ] Type all API responses
-   [ ] Update import/export statements
-   [ ] Fix TypeScript compilation errors
-   [ ] Update test files to TypeScript

### 3.2 Tailwind CSS Migration Requirements

#### 3.2.1 Bootstrap to Tailwind Mapping

| Bootstrap Class          | Tailwind Equivalent                                                                                                                           | Usage Context     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `btn custom-button`      | `bg-secondary text-white px-9 py-3 min-h-[50px] rounded-lg uppercase text-sm tracking-wider hover:opacity-90 transition-opacity`              | Primary buttons   |
| `form-control`           | `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[50px]` | Form inputs       |
| `form-group`             | `mb-4`                                                                                                                                        | Form groups       |
| `container`              | `max-w-7xl mx-auto px-4`                                                                                                                      | Container layout  |
| `row`                    | `flex flex-wrap -mx-4`                                                                                                                        | Row layout        |
| `col-*`                  | `px-4 flex-1`                                                                                                                                 | Column layout     |
| `d-flex`                 | `flex`                                                                                                                                        | Flexbox utilities |
| `justify-content-center` | `justify-center`                                                                                                                              | Flexbox alignment |
| `mt-4, mb-4`             | `mt-4, mb-4`                                                                                                                                  | Spacing utilities |
| `pt-100, pb-100`         | `pt-24, pb-24`                                                                                                                                | Padding utilities |
| `text-danger`            | `text-red-500`                                                                                                                                | Error text        |
| `text-muted`             | `text-gray-500`                                                                                                                               | Muted text        |
| `font-weight-bold`       | `font-bold`                                                                                                                                   | Bold text         |
| `big-title`              | `text-4xl font-bold`                                                                                                                          | Large titles      |
| `med-title`              | `text-2xl font-semibold`                                                                                                                      | Medium titles     |

#### 3.2.2 Custom Classes Migration

```scss
// Current Custom Classes → Tailwind Equivalents
.registration-form {
	.content-wrapper {
		margin: 0 auto !important;
	}
}
// → Tailwind: max-w-4xl mx-auto

.register-confirmation {
	.content-wrapper {
		max-width: 400px;
		margin: 1.2rem 0;
	}
}
// → Tailwind: max-w-md mx-auto my-5

.custom-button {
	min-width: 220px;
}
// → Tailwind: min-w-[220px]
```

#### 3.2.3 Migration Checklist

-   [ ] Audit all Bootstrap classes in components
-   [ ] Create Tailwind equivalents for each class
-   [ ] Replace Bootstrap classes with Tailwind utilities
-   [ ] Migrate custom SCSS classes to Tailwind
-   [ ] Test responsive design on all breakpoints
-   [ ] Verify visual consistency
-   [ ] Remove Bootstrap dependencies
-   [ ] Update CSS imports

---

## 4. Implementation Plan

### 4.1 Phase 1: TypeScript Migration

#### 4.1.1 Week 1: Foundation

**Tasks:**

-   [ ] Create comprehensive type definitions
-   [ ] Set up TypeScript configuration
-   [ ] Create migration templates
-   [ ] Update build configuration

**Deliverables:**

-   Type definitions file
-   Updated tsconfig.json
-   Migration guidelines

#### 4.1.2 Week 2: Core Components

**Tasks:**

-   [ ] Migrate RegistrationContainer.js → RegistrationContainer.tsx
-   [ ] Migrate RegistrationComponent.js → RegistrationComponent.tsx
-   [ ] Fix type errors and compilation issues
-   [ ] Update tests

**Deliverables:**

-   2 migrated core components
-   Updated test files
-   Type safety validation

#### 4.1.3 Week 3: Secondary Components

**Tasks:**

-   [ ] Migrate RegistrationConfirmComponent.js → RegistrationConfirmComponent.tsx
-   [ ] Migrate RegistrationEventDetailsContainer.js → RegistrationEventDetailsContainer.tsx
-   [ ] Migrate RegistrationTextInfoComponent.js → RegistrationTextInfoComponent.tsx
-   [ ] Fix type errors

**Deliverables:**

-   3 migrated secondary components
-   Type safety validation
-   Integration testing

#### 4.1.4 Week 4: Utility Components

**Tasks:**

-   [ ] Migrate RegistrationHeaderComponent.js → RegistrationHeaderComponent.tsx
-   [ ] Migrate RegistrationTextComponent.js → RegistrationTextComponent.tsx
-   [ ] Migrate QRCodeComponent.js → QRCodeComponent.tsx
-   [ ] Final type safety validation

**Deliverables:**

-   3 migrated utility components
-   Complete TypeScript migration
-   Full type safety validation

### 4.2 Phase 2: Tailwind CSS Migration

#### 4.2.1 Week 5: Foundation

**Tasks:**

-   [ ] Audit all Bootstrap classes in Registration components
-   [ ] Create comprehensive Bootstrap to Tailwind mapping
-   [ ] Set up Tailwind configuration
-   [ ] Create migration templates

**Deliverables:**

-   Bootstrap to Tailwind mapping document
-   Updated tailwind.config.js
-   Migration guidelines

#### 4.2.2 Week 6: Core Components Styling

**Tasks:**

-   [ ] Migrate RegistrationContainer.tsx styling
-   [ ] Migrate RegistrationComponent.tsx styling
-   [ ] Test responsive design
-   [ ] Verify visual consistency

**Deliverables:**

-   2 core components with Tailwind styling
-   Responsive design validation
-   Visual consistency verification

#### 4.2.3 Week 7: Secondary Components Styling

**Tasks:**

-   [ ] Migrate RegistrationConfirmComponent.tsx styling
-   [ ] Migrate RegistrationEventDetailsContainer.tsx styling
-   [ ] Migrate RegistrationTextInfoComponent.tsx styling
-   [ ] Test responsive design

**Deliverables:**

-   3 secondary components with Tailwind styling
-   Responsive design validation
-   Cross-browser testing

#### 4.2.4 Week 8: Utility Components Styling

**Tasks:**

-   [ ] Migrate RegistrationHeaderComponent.tsx styling
-   [ ] Migrate RegistrationTextComponent.tsx styling
-   [ ] Migrate QRCodeComponent.tsx styling
-   [ ] Remove Bootstrap dependencies

**Deliverables:**

-   3 utility components with Tailwind styling
-   Complete Tailwind migration
-   Bootstrap dependency removal

---

## 5. Technical Specifications

### 5.1 TypeScript Configuration

```json
{
	"compilerOptions": {
		"target": "es5",
		"lib": ["dom", "dom.iterable", "es6"],
		"allowJs": true,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"forceConsistentCasingInFileNames": true,
		"noFallthroughCasesInSwitch": true,
		"module": "esnext",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx"
	},
	"include": ["src"]
}
```

### 5.2 Tailwind Configuration

```javascript
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#392947",
				secondary: "#009F56",
				"color-white": "#ffffff",
				"color-black": "#000000",
				"text-color": "#392947",
				"content-text-color": "#666666",
				"color-light": "#F2F0F4",
				"color-light-grey": "#999999",
				"color-red": "#ff0000",
				"default-button": "#E5E5E5",
				"switch-button": "#F2F0F4",
			},
			fontFamily: {
				varela: ["Varela Round", "sans-serif"],
				noto: ["Noto Sans", "sans-serif"],
			},
			spacing: {
				100: "25rem",
				150: "37.5rem",
			},
		},
	},
	plugins: [],
};
```

### 5.3 File Structure

```
src/Modules/Registration/
├── RegistrationContainer.tsx
├── RegistrationComponent.tsx
├── RegistrationConfirmComponent.tsx
├── RegistrationEventDetailsContainer.tsx
├── RegistrationTextInfoComponent.tsx
├── RegistrationHeaderComponent.tsx
├── RegistrationTextComponent.tsx
├── QRCodeComponent.tsx
├── types/
│   └── registration.types.ts
└── __test__/
    └── registrationConfirmComponent.test.tsx
```

---

## 6. Quality Assurance

### 6.1 Testing Requirements

#### 6.1.1 Unit Testing

-   [ ] All components have unit tests
-   [ ] TypeScript type checking passes
-   [ ] Component rendering tests
-   [ ] Props validation tests
-   [ ] Event handler tests

#### 6.1.2 Integration Testing

-   [ ] Form submission flow testing
-   [ ] Multi-step form progression testing
-   [ ] API integration testing
-   [ ] Error handling testing

#### 6.1.3 Visual Testing

-   [ ] Screenshot comparison testing
-   [ ] Responsive design testing
-   [ ] Cross-browser compatibility testing
-   [ ] Accessibility testing

### 6.2 Code Quality Standards

#### 6.2.1 TypeScript Standards

-   [ ] Strict type checking enabled
-   [ ] No `any` types used
-   [ ] Proper interface definitions
-   [ ] Consistent naming conventions
-   [ ] Proper error handling

#### 6.2.2 Tailwind Standards

-   [ ] Consistent class ordering
-   [ ] Responsive design patterns
-   [ ] Accessibility considerations
-   [ ] Performance optimization
-   [ ] Custom utility classes when needed

### 6.3 Performance Requirements

-   [ ] Bundle size not increased by more than 10%
-   [ ] Component render time maintained
-   [ ] Form validation performance maintained
-   [ ] API call performance maintained

---

## 7. Risk Assessment

### 7.1 Technical Risks

#### 7.1.1 High Risk

-   **Breaking Changes**: Existing functionality may break during migration

    -   **Mitigation**: Comprehensive testing and gradual migration
    -   **Contingency**: Rollback plan and feature flags

-   **Type Definition Complexity**: Complex form data types may be difficult to define
    -   **Mitigation**: Start with simple types and iterate
    -   **Contingency**: Use `any` types temporarily with TODO comments

#### 7.1.2 Medium Risk

-   **Visual Inconsistencies**: Tailwind classes may not perfectly match Bootstrap

    -   **Mitigation**: Detailed mapping and visual testing
    -   **Contingency**: Custom CSS classes for specific cases

-   **Performance Impact**: TypeScript compilation may slow development
    -   **Mitigation**: Incremental migration and proper configuration
    -   **Contingency**: Optimize TypeScript configuration

#### 7.1.3 Low Risk

-   **Learning Curve**: Team may need time to adapt to TypeScript/Tailwind
    -   **Mitigation**: Training sessions and documentation
    -   **Contingency**: Pair programming and code reviews

### 7.2 Business Risks

-   **Timeline Delays**: Migration may take longer than expected

    -   **Mitigation**: Realistic timeline and buffer time
    -   **Contingency**: Parallel development approach

-   **User Experience**: Changes may affect user experience
    -   **Mitigation**: Thorough testing and user feedback
    -   **Contingency**: A/B testing and gradual rollout

---

## 8. Success Metrics

### 8.1 Technical Metrics

-   [ ] 100% TypeScript compilation success
-   [ ] 0 TypeScript errors in production
-   [ ] 100% test coverage maintained
-   [ ] Bundle size within 10% of original
-   [ ] Performance metrics maintained

### 8.2 Quality Metrics

-   [ ] 0 breaking changes to functionality
-   [ ] 100% visual consistency with current design
-   [ ] 100% responsive design compatibility
-   [ ] Accessibility standards maintained
-   [ ] Cross-browser compatibility maintained

### 8.3 Development Metrics

-   [ ] Improved developer experience
-   [ ] Faster development cycles
-   [ ] Better code maintainability
-   [ ] Reduced bug count
-   [ ] Improved code documentation

---

## 9. Timeline and Milestones

### 9.1 Phase 1: TypeScript Migration (4 weeks)

-   **Week 1**: Foundation and setup
-   **Week 2**: Core components migration
-   **Week 3**: Secondary components migration
-   **Week 4**: Utility components migration

### 9.2 Phase 2: Tailwind Migration (4 weeks)

-   **Week 5**: Foundation and setup
-   **Week 6**: Core components styling
-   **Week 7**: Secondary components styling
-   **Week 8**: Utility components styling

### 9.3 Key Milestones

-   [ ] **Week 2**: Core components TypeScript migration complete
-   [ ] **Week 4**: All TypeScript migration complete
-   [ ] **Week 6**: Core components Tailwind migration complete
-   [ ] **Week 8**: All Tailwind migration complete

---

## 10. Conclusion

This PRD provides a comprehensive roadmap for migrating the Registration module from JavaScript/Bootstrap to TypeScript/Tailwind CSS. The migration will be executed in two phases with careful attention to maintaining existing functionality, visual consistency, and performance.

The success of this migration will improve the codebase's maintainability, type safety, and developer experience while preserving all existing business logic and user experience.

**Next Steps:**

1. Review and approve this PRD
2. Set up development environment
3. Begin Phase 1: TypeScript migration
4. Execute migration plan with regular checkpoints
5. Complete Phase 2: Tailwind migration
6. Conduct final testing and validation
7. Deploy to production

---

## Appendix

### A. Component Dependencies Map

```
RegistrationContainer
├── RegistrationComponent
│   ├── PrimaryInfoFormComponent (Family)
│   ├── AddressComponent (Family)
│   ├── ContactInformationComponent (Family)
│   ├── MemberCountFormComponent (Family)
│   └── EventSlotsModalComponent (Family)
├── RegistrationConfirmComponent
├── RegistrationEventDetailsContainer
├── RegistrationTextInfoComponent
│   ├── RegistrationHeaderComponent
│   └── RegistrationTextComponent
└── QRCodeComponent
```

### B. Bootstrap to Tailwind Mapping Reference

[See Section 3.2.1 for complete mapping]

### C. Type Definitions Reference

[See Section 3.1.1 for complete type definitions]

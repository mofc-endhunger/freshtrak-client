# Registration Module Migration Tasks

## Project Information

-   **Project**: FreshTrak Client
-   **Module**: Registration Module
-   **Migration Type**: JavaScript → TypeScript, Bootstrap → Tailwind CSS
-   **Timeline**: 8 weeks (Phase 1: 4 weeks, Phase 2: 4 weeks)
-   **Status**: Planning

---

## Phase 1: TypeScript Migration (Weeks 1-4)

### Week 1: Foundation and Setup

#### 1.1 TypeScript Configuration Setup

-   [x] **1.1.1** Review current tsconfig.json configuration
-   [x] **1.1.2** Update TypeScript configuration for Registration module
-   [x] **1.1.3** Ensure strict type checking is enabled
-   [x] **1.1.4** Configure module resolution for Registration components

#### 1.2 Type Definitions Creation

-   [x] **1.2.1** Create `src/Modules/Registration/types/registration.types.ts`
-   [x] **1.2.2** Define `RegistrationFormData` interface
-   [x] **1.2.3** Define `Event` interface
-   [x] **1.2.4** Define `RegistrationProps` interface
-   [x] **1.2.5** Define component-specific interfaces:
    -   [x] `RegistrationContainerProps`
    -   [x] `RegistrationComponentProps`
    -   [x] `RegistrationConfirmProps`
    -   [x] `RegistrationEventDetailsProps`
    -   [x] `RegistrationTextInfoProps`
    -   [x] `RegistrationHeaderProps`
    -   [x] `RegistrationTextProps`
    -   [x] `QRCodeProps`
-   [x] **1.2.6** Define API response types
-   [x] **1.2.7** Define event handler types
-   [x] **1.2.8** Define form validation types

### Week 2: Core Components Migration

#### 2.1 RegistrationContainer.js → RegistrationContainer.tsx

-   [x] **2.1.1** Rename file to `.tsx` extension
-   [x] **2.1.2** Add type imports from registration.types.ts
-   [x] **2.1.3** Type component props interface
-   [x] **2.1.4** Type all state variables:
    -   [x] `isLoading`, `userToken`, `isError`, `pageError`
    -   [x] `errors`, `disabled`, `showAuthModal`
    -   [x] `selectedEvent`, `user`
-   [x] **2.1.5** Type all function parameters and return types:
    -   [x] `getEvent`, `handleAuthLogin`, `getReservationText`
    -   [x] `getCodeURL`, `formatErrorMessage`, `notify`
    -   [x] `send_sms`, `register`
-   [x] **2.1.6** Type all event handlers
-   [x] **2.1.7** Type API response handling
-   [x] **2.1.8** Fix TypeScript compilation errors
-   [x] **2.1.9** Update import/export statements
-   [x] **2.1.10** Test component functionality

#### 2.2 RegistrationComponent.js → RegistrationComponent.tsx

-   [x] **2.2.1** Rename file to `.tsx` extension
-   [x] **2.2.2** Add type imports from registration.types.ts
-   [x] **2.2.3** Type component props interface
-   [x] **2.2.4** Type all state variables:
    -   [x] `formStep`, `formValues`, `selectedSlotId`, `isSubmitting`
-   [x] **2.2.5** Type all function parameters and return types:
    -   [x] `handleSlotChange`, `configureTimeLine`, `continueHandler`
    -   [x] `previousHandler`, `test`, `onSubmit`, `sanatizeInput`
    -   [x] `santizeString`, `submitHandlerFocus`
-   [x] **2.2.6** Type React Hook Form integration
-   [x] **2.2.7** Type form validation logic
-   [x] **2.2.8** Type event handlers and callbacks
-   [x] **2.2.9** Fix TypeScript compilation errors
-   [x] **2.2.10** Update import/export statements
-   [x] **2.2.11** Test component functionality

### Week 3: Secondary Components Migration

#### 3.1 RegistrationConfirmComponent.js → RegistrationConfirmComponent.tsx

-   [x] **3.1.1** Rename file to `.tsx` extension
-   [x] **3.1.2** Add type imports from registration.types.ts
-   [x] **3.1.3** Type component props interface
-   [x] **3.1.4** Type all state variables:
    -   [x] `userToken`, `isError`, `selectedEvent`, `pageError`, `user`
-   [x] **3.1.5** Type all function parameters and return types:
    -   [x] `formatPhoneNumber`, `getUser`, `getEvent`, `fetchBusinesses`
-   [x] **3.1.6** Type Redux store integration
-   [x] **3.1.7** Type API response handling
-   [x] **3.1.8** Fix TypeScript compilation errors
-   [x] **3.1.9** Update import/export statements
-   [x] **3.1.10** Test component functionality
-   [x] **3.1.11** Migrate test file to TypeScript (.test.tsx)
-   [x] **3.1.12** Add proper type annotations to test file
-   [x] **3.1.13** Verify tests pass with TypeScript migration
-   [x] **3.1.14** Fix TypeScript compilation errors in test file
-   [x] **3.1.15** Create type declaration for redux-mock-store

#### 3.2 RegistrationEventDetailsContainer.js → RegistrationEventDetailsContainer.tsx

-   [x] **3.2.1** Rename file to `.tsx` extension
-   [x] **3.2.2** Add type imports from registration.types.ts
-   [x] **3.2.3** Type component props interface
-   [x] **3.2.4** Type all state variables:
    -   [x] `isLoading`, `showAuthenticationModal`, `isSuccessful`, `isError`, `pageError`, `selectedEvent`
-   [x] **3.2.5** Type all function parameters and return types:
    -   [x] `getEvent`, `fetchUserToken`, `getUserToken`
-   [x] **3.2.6** Type API response handling
-   [x] **3.2.7** Type navigation logic
-   [x] **3.2.8** Fix TypeScript compilation errors
-   [x] **3.2.9** Update import/export statements
-   [x] **3.2.10** Test component functionality

#### 3.3 RegistrationTextInfoComponent.js → RegistrationTextInfoComponent.tsx

-   [x] **3.3.1** Rename file to `.tsx` extension
-   [x] **3.3.2** Add type imports from registration.types.ts
-   [x] **3.3.3** Type component props interface
-   [x] **3.3.4** Type function parameters and return types:
    -   [x] `clickedRegisterNow`
-   [x] **3.3.5** Type Google Tag Manager integration
-   [x] **3.3.6** Fix TypeScript compilation errors
-   [x] **3.3.7** Update import/export statements
-   [x] **3.3.8** Test component functionality

### Week 4: Utility Components Migration

#### 4.1 RegistrationHeaderComponent.js → RegistrationHeaderComponent.tsx

-   [x] **4.1.1** Rename file to `.tsx` extension
-   [x] **4.1.2** Add type imports from registration.types.ts
-   [x] **4.1.3** Type component props interface
-   [x] **4.1.4** Type event props
-   [x] **4.1.5** Fix TypeScript compilation errors
-   [x] **4.1.6** Update import/export statements
-   [x] **4.1.7** Test component functionality

#### 4.2 RegistrationTextComponent.js → RegistrationTextComponent.tsx

-   [x] **4.2.1** Rename file to `.tsx` extension
-   [x] **4.2.2** Add type imports from registration.types.ts
-   [x] **4.2.3** Type component props interface
-   [x] **4.2.4** Type state variables:
    -   [x] `isRegRequired`
-   [x] **4.2.5** Type useEffect dependencies
-   [x] **4.2.6** Fix TypeScript compilation errors
-   [x] **4.2.7** Update import/export statements
-   [x] **4.2.8** Test component functionality

#### 4.3 QRCodeComponent.js → QRCodeComponent.tsx

-   [x] **4.3.1** Rename file to `.tsx` extension
-   [x] **4.3.2** Add type imports from registration.types.ts
-   [x] **4.3.3** Type component props interface
-   [x] **4.3.4** Type useParams hook
-   [x] **4.3.5** Fix TypeScript compilation errors
-   [x] **4.3.6** Update import/export statements
-   [x] **4.3.7** Test component functionality

---

## Phase 2: Tailwind CSS Migration (Weeks 5-8)

### Week 5: Foundation and Setup

#### 5.1 Bootstrap Class Audit

-   [x] **5.1.1** Audit all Bootstrap classes in RegistrationContainer.tsx
-   [x] **5.1.2** Audit all Bootstrap classes in RegistrationComponent.tsx
-   [x] **5.1.3** Audit all Bootstrap classes in RegistrationConfirmComponent.tsx
-   [x] **5.1.4** Audit all Bootstrap classes in RegistrationEventDetailsContainer.tsx
-   [x] **5.1.5** Audit all Bootstrap classes in RegistrationTextInfoComponent.tsx
-   [x] **5.1.6** Audit all Bootstrap classes in RegistrationHeaderComponent.tsx
-   [x] **5.1.7** Audit all Bootstrap classes in RegistrationTextComponent.tsx
-   [x] **5.1.8** Audit all Bootstrap classes in QRCodeComponent.tsx
-   [x] **5.1.9** Create comprehensive Bootstrap class inventory

#### 5.2 Tailwind Configuration Setup

-   [x] **5.2.1** Review current tailwind.config.js
-   [x] **5.2.2** Update Tailwind configuration for Registration module
-   [x] **5.2.3** Add custom colors matching current theme:
    -   [x] `primary: '#392947'`
    -   [x] `secondary: '#009F56'`
    -   [x] `color-white: '#ffffff'`
    -   [x] `color-black: '#000000'`
    -   [x] `text-color: '#392947'`
    -   [x] `content-text-color: '#666666'`
    -   [x] `color-light: '#F2F0F4'`
    -   [x] `color-light-grey: '#999999'`
    -   [x] `color-red: '#ff0000'`
    -   [x] `default-button: '#E5E5E5'`
    -   [x] `switch-button: '#F2F0F4'`
-   [x] **5.2.4** Add custom font families:
    -   [x] `varela: ['Varela Round', 'sans-serif']`
    -   [x] `noto: ['Noto Sans', 'sans-serif']`
-   [x] **5.2.5** Add custom spacing values:
    -   [x] `100: '25rem'`
    -   [x] `150: '37.5rem'`
-   [x] **5.2.6** Test Tailwind configuration

#### 5.3 Bootstrap to Tailwind Mapping

-   [x] **5.3.1** Create comprehensive mapping document
-   [x] **5.3.2** Map button classes:
    -   [x] `btn custom-button` → shadcn/ui Button component with custom styling
    -   [x] `btn` → shadcn/ui Button component variants
-   [x] **5.3.3** Map form classes:
    -   [x] `form-control` → shadcn/ui Input component
    -   [x] `form-group` → shadcn/ui FormField component
    -   [x] `form-label` → shadcn/ui Label component
    -   [x] `form-select` → shadcn/ui Select component
-   [x] **5.3.4** Map layout classes:
    -   [x] `container` → `max-w-7xl mx-auto px-4`
    -   [x] `row` → `flex flex-wrap -mx-4`
    -   [x] `col-*` → `px-4 flex-1`
-   [x] **5.3.5** Map utility classes:
    -   [x] `d-flex` → `flex`
    -   [x] `justify-content-center` → `justify-center`
    -   [x] `mt-4, mb-4` → `mt-4, mb-4`
    -   [x] `pt-100, pb-100` → `pt-24, pb-24`
-   [x] **5.3.6** Map text classes:
    -   [x] `text-danger` → `text-red-500`
    -   [x] `text-muted` → `text-gray-500`
    -   [x] `font-weight-bold` → `font-bold`
    -   [x] `big-title` → `text-4xl font-bold`
    -   [x] `med-title` → `text-2xl font-semibold`
-   [x] **5.3.7** Map modal classes:
    -   [x] `modal` → shadcn/ui Dialog component
    -   [x] `modal-dialog` → Dialog.Content
    -   [x] `modal-header` → Dialog.Header
    -   [x] `modal-body` → Dialog.Body
    -   [x] `modal-footer` → Dialog.Footer
-   [x] **5.3.8** Map card classes:
    -   [x] `card` → shadcn/ui Card component
    -   [x] `card-body` → Card.Content
    -   [x] `card-header` → Card.Header
    -   [x] `card-footer` → Card.Footer

#### 5.4 Custom Classes Migration Planning

-   [x] **5.4.1** Map `.registration-form` → `max-w-4xl mx-auto`
-   [x] **5.4.2** Map `.register-confirmation` → `max-w-md mx-auto my-5`
-   [x] **5.4.3** Map `.custom-button` → `min-w-[220px]`
-   [x] **5.4.4** Map `.content-wrapper` → `max-w-6xl mx-auto px-4`
-   [x] **5.4.5** Create migration templates for custom classes

#### 5.5 Media Queries Migration Planning

-   [x] **5.5.1** Audit current media queries in SCSS files
-   [x] **5.5.2** Map SCSS media queries to Tailwind responsive classes:
    -   [x] `@media (max-width: 575px)` → `sm:` prefix
    -   [x] `@media (max-width: 767px)` → `md:` prefix
    -   [x] `@media (max-width: 991px)` → `lg:` prefix
    -   [x] `@media (max-width: 1199px)` → `xl:` prefix
    -   [x] `@media (min-width: 1200px)` → `2xl:` prefix
-   [x] **5.5.3** Create responsive design patterns:
    -   [x] Mobile-first approach with Tailwind responsive utilities
    -   [x] Breakpoint-specific styling for form components
    -   [x] Responsive layout adjustments for different screen sizes
-   [x] **5.5.4** Map current responsive classes:
    -   [x] `.mobile-mb` → `mb-4 sm:mb-0`
    -   [x] `.mobile-text-left` → `text-left sm:text-center`
    -   [x] `.mobile-flex` → `flex flex-col sm:flex-row`
-   [x] **5.5.5** Test responsive behavior on all breakpoints

#### 5.6 shadcn/ui Components Setup

-   [x] **5.6.1** Install shadcn/ui CLI and dependencies
-   [x] **5.6.2** Initialize shadcn/ui configuration
-   [x] **5.6.3** Add required shadcn/ui components:
    -   [x] Button component
    -   [x] Input component
    -   [x] Label component
    -   [x] Form components (FormField, FormItem, FormLabel, FormControl, FormMessage)
    -   [x] Select component
    -   [x] Dialog component (for modals)
    -   [x] Card component
    -   [x] Badge component (for status indicators)
    -   [x] Separator component
    -   [x] Alert component (for error messages)
-   [x] **5.6.4** Configure shadcn/ui theme to match current design system
-   [x] **5.6.5** Create custom variants for shadcn/ui components
-   [x] **5.6.6** Test shadcn/ui components integration

### Week 6: Core Components Styling

#### 6.1 RegistrationContainer.tsx Styling

-   [x] **6.1.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **6.1.2** Replace Bootstrap row/column classes with Tailwind flexbox
-   [x] **6.1.3** Replace Bootstrap button classes with shadcn/ui Button component
-   [x] **6.1.4** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **6.1.5** Replace Bootstrap text classes with Tailwind typography
-   [x] **6.1.6** Replace Bootstrap flexbox classes with Tailwind flex utilities
-   [x] **6.1.7** Implement responsive design with Tailwind breakpoints
-   [x] **6.1.8** Replace Bootstrap modal classes with shadcn/ui Dialog component
-   [x] **6.1.9** Test responsive behavior on all screen sizes

#### 6.2 RegistrationComponent.tsx Styling

-   [x] **6.2.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **6.2.2** Replace Bootstrap form classes with shadcn/ui Form components:
    -   [x] `form-control` → shadcn/ui Input component
    -   [x] `form-group` → shadcn/ui FormField component
    -   [x] `form-label` → shadcn/ui Label component
    -   [x] `form-select` → shadcn/ui Select component
-   [x] **6.2.3** Replace Bootstrap button classes with shadcn/ui Button component
-   [x] **6.2.4** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **6.2.5** Replace Bootstrap text classes with Tailwind typography
-   [x] **6.2.6** Replace Bootstrap flexbox classes with Tailwind flex utilities
-   [x] **6.2.7** Style timeline component with custom Tailwind classes
-   [x] **6.2.8** Implement responsive design with Tailwind breakpoints
-   [x] **6.2.9** Replace Bootstrap modal classes with shadcn/ui Dialog component
-   [x] **6.2.10** Test responsive design on all screen sizes
-   [x] **6.2.11** Verify visual consistency with current design
-   [x] **6.2.12** Test form functionality with new shadcn/ui components

### Week 7: Secondary Components Styling

#### 7.1 RegistrationConfirmComponent.tsx Styling

-   [x] **7.1.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **7.1.2** Replace Bootstrap row/column classes with Tailwind flexbox
-   [x] **7.1.3** Replace Bootstrap button classes with shadcn/ui Button component
-   [x] **7.1.4** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **7.1.5** Replace Bootstrap text classes with Tailwind typography
-   [x] **7.1.6** Style QR code component with custom Tailwind classes
-   [x] **7.1.7** Style event card component with shadcn/ui Card component
-   [x] **7.1.8** Implement responsive design with Tailwind breakpoints
-   [x] **7.1.9** Test responsive design on all screen sizes
-   [x] **7.1.10** Verify visual consistency with current design

#### 7.2 RegistrationEventDetailsContainer.tsx Styling

-   [x] **7.2.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **7.2.2** Replace Bootstrap row/column classes with Tailwind flexbox
-   [x] **7.2.3** Replace Bootstrap button classes with shadcn/ui Button component
-   [x] **7.2.4** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **7.2.5** Replace Bootstrap text classes with Tailwind typography
-   [x] **7.2.6** Replace Bootstrap modal classes with shadcn/ui Dialog component
-   [x] **7.2.7** Implement responsive design with Tailwind breakpoints
-   [x] **7.2.8** Test responsive design on all screen sizes
-   [x] **7.2.9** Verify visual consistency with current design

#### 7.3 RegistrationTextInfoComponent.tsx Styling

-   [x] **7.3.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **7.3.2** Replace Bootstrap row/column classes with Tailwind flexbox
-   [x] **7.3.3** Replace Bootstrap button classes with shadcn/ui Button component
-   [x] **7.3.4** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **7.3.5** Replace Bootstrap text classes with Tailwind typography
-   [x] **7.3.6** Style event card component with shadcn/ui Card component
-   [x] **7.3.7** Implement responsive design with Tailwind breakpoints
-   [x] **7.3.8** Test responsive design on all screen sizes
-   [x] **7.3.9** Verify visual consistency with current design

### Week 8: Utility Components Styling

#### 8.1 RegistrationHeaderComponent.tsx Styling

-   [x] **8.1.1** Replace Bootstrap row/column classes with Tailwind flexbox
-   [x] **8.1.2** Replace Bootstrap text classes with Tailwind typography
-   [x] **8.1.3** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **8.1.4** Style title elements with Tailwind typography classes
-   [x] **8.1.5** Implement responsive design with Tailwind breakpoints
-   [x] **8.1.6** Test responsive design on all screen sizes
-   [x] **8.1.7** Verify visual consistency with current design

#### 8.2 RegistrationTextComponent.tsx Styling

-   [x] **8.2.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **8.2.2** Replace Bootstrap text classes with Tailwind typography
-   [x] **8.2.3** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **8.2.4** Style content wrapper with Tailwind utilities
-   [x] **8.2.5** Implement responsive design with Tailwind breakpoints
-   [x] **8.2.6** Test responsive design on all screen sizes
-   [x] **8.2.7** Verify visual consistency with current design

#### 8.3 QRCodeComponent.tsx Styling

-   [x] **8.3.1** Replace Bootstrap container classes with Tailwind utilities
-   [x] **8.3.2** Replace Bootstrap text classes with Tailwind typography
-   [x] **8.3.3** Replace Bootstrap spacing classes with Tailwind spacing
-   [x] **8.3.4** Style QR code container with custom Tailwind classes
-   [x] **8.3.5** Implement responsive design with Tailwind breakpoints
-   [x] **8.3.6** Test responsive design on all screen sizes
-   [x] **8.3.7** Verify visual consistency with current design

#### 8.4 Final Cleanup and Validation

-   [x] **8.4.1** Remove Bootstrap dependencies
-   [x] **8.4.2** Update CSS imports to remove Bootstrap
-   [x] **8.4.3** Remove unused SCSS files
-   [x] **8.4.4** Final visual testing with shadcn/ui components
-   [x] **8.4.5** Performance optimization with Tailwind
-   [x] **8.4.6** Accessibility validation for shadcn/ui components
-   [x] **8.4.7** Cross-browser compatibility testing
-   [x] **8.4.8** Responsive design validation on all breakpoints

---

## Quality Assurance Tasks

### Testing Tasks

-   [ ] **QA.1** Unit testing for all TypeScript components
-   [ ] **QA.2** Integration testing for form flows with shadcn/ui components
-   [ ] **QA.3** Visual regression testing
-   [ ] **QA.4** Accessibility testing for shadcn/ui components
-   [ ] **QA.5** Performance testing
-   [ ] **QA.6** Cross-browser testing
-   [ ] **QA.7** Responsive design testing on all breakpoints

### Documentation Tasks

-   [ ] **DOC.1** Update component documentation with shadcn/ui usage
-   [ ] **DOC.2** Create migration guide for Bootstrap to Tailwind + shadcn/ui
-   [ ] **DOC.3** Update API documentation
-   [ ] **DOC.4** Create troubleshooting guide for shadcn/ui components
-   [ ] **DOC.5** Update README files with new component library
-   [ ] **DOC.6** Document responsive design patterns
-   [ ] **DOC.7** Create shadcn/ui component usage examples

### Deployment Tasks

-   [ ] **DEP.1** Prepare deployment plan
-   [ ] **DEP.2** Create rollback strategy
-   [ ] **DEP.3** Set up feature flags
-   [ ] **DEP.4** Test deployment process
-   [ ] **DEP.5** Monitor post-deployment

---

## Success Metrics Tracking

### Technical Metrics

-   [ ] **TM.1** 100% TypeScript compilation success
-   [ ] **TM.2** 0 TypeScript errors in production
-   [ ] **TM.3** 100% test coverage maintained
-   [ ] **TM.4** Bundle size within 10% of original
-   [ ] **TM.5** Performance metrics maintained

### Quality Metrics

-   [ ] **QM.1** 0 breaking changes to functionality
-   [ ] **QM.2** 100% visual consistency with current design
-   [ ] **QM.3** 100% responsive design compatibility
-   [ ] **QM.4** Accessibility standards maintained with shadcn/ui components
-   [ ] **QM.5** Cross-browser compatibility maintained
-   [ ] **QM.6** shadcn/ui components properly integrated
-   [ ] **QM.7** Media queries properly migrated to Tailwind responsive utilities

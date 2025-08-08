# Registration Module Overview

## Overview

The Registration module is a multi-step form system that allows users to register for food bank events. It handles user authentication, form validation, event slot selection, and registration confirmation with QR code generation.

## Module Structure

### Core Components

#### 1. RegistrationContainer.js (12KB, 430 lines)

**Purpose**: Main container component that orchestrates the entire registration flow
**Key Responsibilities**:

-   Manages user authentication and token handling
-   Fetches event details from API
-   Handles registration submission and error management
-   Manages SMS/email notifications
-   Handles navigation to confirmation page

**Key Features**:

-   User token management and validation
-   Event data fetching and formatting
-   Registration API calls with error handling
-   SMS/email notification sending
-   Google Tag Manager integration
-   Session storage management

**Dependencies**:

-   Redux store (events, user slices)
-   React Router (navigation, params)
-   Axios (API calls)
-   TagManager (analytics)

#### 2. RegistrationComponent.js (7.6KB, 290 lines)

**Purpose**: Multi-step form component with timeline navigation
**Key Responsibilities**:

-   Manages form state and step progression
-   Handles form validation and data collection
-   Renders different form steps based on current step
-   Integrates with One Platform Timeline component

**Form Steps**:

1. **Step 0**: Primary Information (name, DOB, gender)
2. **Step 1**: Address and Contact Information
3. **Step 2**: Family Member Counts

**Key Features**:

-   React Hook Form integration
-   Step-by-step form progression
-   Form data sanitization
-   Timeline component integration
-   Previous/Continue navigation

**Dependencies**:

-   Family module components (PrimaryInfoFormComponent, AddressComponent, etc.)
-   React Hook Form
-   One Platform Timeline component

#### 3. RegistrationConfirmComponent.js (6.5KB, 235 lines)

**Purpose**: Displays registration confirmation with QR code and event details
**Key Responsibilities**:

-   Shows registration confirmation details
-   Generates and displays QR code
-   Displays user information and event details
-   Provides navigation back to home

**Key Features**:

-   QR code generation for event check-in
-   User information display
-   Event details and timing display
-   Phone number formatting
-   Responsive design

**Dependencies**:

-   react-qr-code library
-   Redux store
-   React Router

#### 4. RegistrationEventDetailsContainer.js (3.8KB, 132 lines)

**Purpose**: Handles event details display and authentication flow
**Key Responsibilities**:

-   Fetches and displays event information
-   Manages guest authentication flow
-   Handles navigation to registration form

**Key Features**:

-   Event data fetching
-   Guest authentication token generation
-   User profile creation
-   Navigation management

#### 5. RegistrationTextInfoComponent.js (1.4KB, 52 lines)

**Purpose**: Displays event information and registration button
**Key Responsibilities**:

-   Shows event details
-   Handles registration button click
-   Integrates with Google Tag Manager

**Key Features**:

-   Event card display
-   Registration button with analytics
-   Conditional header display

#### 6. RegistrationHeaderComponent.js (707B, 27 lines)

**Purpose**: Displays registration header with title and text
**Key Responsibilities**:

-   Renders registration title
-   Shows registration text information

#### 7. RegistrationTextComponent.js (857B, 33 lines)

**Purpose**: Displays registration requirement information
**Key Responsibilities**:

-   Shows whether registration is required or optional
-   Displays registration benefits text

#### 8. QRCodeComponent.js (440B, 18 lines)

**Purpose**: Standalone QR code display component
**Key Responsibilities**:

-   Generates QR code from URL parameters
-   Displays QR code for event check-in

## Form Components (Family Module Integration)

The Registration module heavily integrates with Family module components:

### PrimaryInfoFormComponent.js

-   Handles personal information (name, DOB, gender)
-   Date of birth validation and formatting
-   Form validation and error display

### AddressComponent.js

-   Address input fields (street, city, state, zip)
-   Address validation
-   State dropdown component

### ContactInformationComponent.js

-   Phone number input and validation
-   Email input and validation
-   Permission toggles for SMS/email

### MemberCountFormComponent.js

-   Household member count inputs
-   Age group breakdowns (seniors, adults, children)
-   Form validation for member counts

### EventSlotsModalComponent.js

-   Event time slot selection
-   Modal display for slot selection
-   Slot validation and confirmation

## Styling and UI Framework

### Current Implementation

-   **CSS Framework**: Bootstrap with custom SCSS
-   **Styling**: Custom SCSS files with Bootstrap classes
-   **Components**: Mix of Bootstrap and custom components

### Key CSS Classes Used

```scss
// Bootstrap Classes
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

### SCSS Structure

-   `src/Assets/scss/main.scss` - Main stylesheet
-   `src/Assets/scss/_form-elements.scss` - Form styling
-   `src/Assets/css/custom-styles.css` - Custom overrides

## Data Flow

### Registration Flow

1. **Event Selection** → User selects event from event list
2. **Authentication** → Guest token generation and validation
3. **Form Steps** → Multi-step form completion
4. **Validation** → Form validation at each step
5. **Submission** → API calls for user creation and reservation
6. **Confirmation** → QR code generation and confirmation display

### API Integration

-   **Event Details**: `GET /api/event_dates/{id}/event_details`
-   **Guest Auth**: `POST /api/guest_auth`
-   **User Creation**: `POST /api/guest_user`
-   **Reservation**: `POST /api/create_reservation`
-   **SMS Service**: Twilio integration

## State Management

### Redux Store Integration

-   **Event State**: `selectEvent` from eventSlice
-   **User State**: `selectUser` from userSlice
-   **Search State**: Search functionality integration

### Local State

-   Form step progression
-   Form values and validation
-   Loading states
-   Error handling

## Migration Requirements

### TypeScript Migration

**Priority**: High
**Components to Migrate**:

1. RegistrationContainer.js → RegistrationContainer.tsx
2. RegistrationComponent.js → RegistrationComponent.tsx
3. RegistrationConfirmComponent.js → RegistrationConfirmComponent.tsx
4. RegistrationEventDetailsContainer.js → RegistrationEventDetailsContainer.tsx
5. RegistrationTextInfoComponent.js → RegistrationTextInfoComponent.tsx
6. RegistrationHeaderComponent.js → RegistrationHeaderComponent.tsx
7. RegistrationTextComponent.js → RegistrationTextComponent.tsx
8. QRCodeComponent.js → QRCodeComponent.tsx

**Type Definitions Needed**:

```typescript
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
```

### Tailwind CSS Migration

**Priority**: Medium (after TypeScript migration)
**Bootstrap Classes to Replace**:

| Bootstrap Class          | Tailwind Equivalent                                                                                                                           | Usage             |
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

**Custom Classes to Migrate**:

-   `.registration-form` → Tailwind utility classes
-   `.register-confirmation` → Tailwind utility classes
-   `.content-wrapper` → Tailwind utility classes
-   `.big-title, .med-title` → Tailwind typography classes

## Testing

### Current Test Coverage

-   `registrationConfirmComponent.test.js` - Basic component testing
-   Form validation testing needed
-   API integration testing needed
-   User flow testing needed

### Testing Requirements for Migration

1. **Unit Tests**: Component functionality testing
2. **Integration Tests**: Form submission flow testing
3. **Type Testing**: TypeScript type checking
4. **Style Testing**: Tailwind class validation

## Dependencies

### External Libraries

-   `react-hook-form` - Form management
-   `react-qr-code` - QR code generation
-   `@one-platform/opc-timeline` - Timeline component
-   `axios` - HTTP client
-   `react-gtm-module` - Google Tag Manager
-   `moment` - Date manipulation

### Internal Dependencies

-   Family module components
-   General UI components
-   Authentication components
-   Event components
-   Localization system
-   Redux store
-   Utility functions

## Performance Considerations

### Current Performance

-   Form re-renders on each step
-   Large component tree with nested forms
-   Multiple API calls during registration flow

### Optimization Opportunities

-   Memoization of form components
-   Lazy loading of form steps
-   API call optimization
-   Bundle size reduction

## Accessibility

### Current Accessibility

-   Basic form labels and inputs
-   Error message display
-   Keyboard navigation support

### Accessibility Improvements Needed

-   ARIA labels and descriptions
-   Screen reader support
-   Focus management
-   Color contrast compliance
-   Keyboard-only navigation

## Security Considerations

### Current Security

-   Input sanitization
-   Token-based authentication
-   Form validation

### Security Enhancements

-   XSS prevention
-   CSRF protection
-   Input validation strengthening
-   Secure token handling

## Migration Strategy

### Phase 1: TypeScript Migration

1. Create type definitions
2. Migrate components one by one
3. Update imports and exports
4. Fix type errors
5. Update tests

### Phase 2: Tailwind Migration

1. Audit Bootstrap classes
2. Create Tailwind equivalents
3. Update component styles
4. Remove Bootstrap dependencies
5. Test responsive design

### Phase 3: Optimization

1. Performance improvements
2. Accessibility enhancements
3. Security hardening
4. Testing completion

## Conclusion

The Registration module is a complex, multi-step form system that requires careful migration planning. The TypeScript migration should be prioritized first to improve type safety and developer experience, followed by Tailwind CSS migration to modernize the styling approach. The module's integration with the Family module components and external dependencies requires careful coordination during migration.

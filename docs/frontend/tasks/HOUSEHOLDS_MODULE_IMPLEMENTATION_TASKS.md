# Households Module Implementation Tasks

## Overview

This document outlines the detailed implementation tasks for the Households module, organized by phases and priorities. Each task includes acceptance criteria, technical requirements, and dependencies.

## Phase 1: Foundation and Setup (Week 1-2)

### Task 1.1: TypeScript Interfaces and Types

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: None

#### Acceptance Criteria

-   [x] Create comprehensive TypeScript interfaces for all household data structures
-   [x] Define API request/response types for all endpoints
-   [x] Create form validation types and schemas
-   [x] Define error types and error handling interfaces
-   [x] All types are properly exported and documented

#### Technical Requirements

-   [x] Create `src/Modules/Households/types/household.types.ts`
-   [x] Create `src/Modules/Households/types/member.types.ts`
-   [x] Create `src/Modules/Households/types/api.types.ts`
-   [x] Create `src/Modules/Households/types/form.types.ts`
-   [x] Create `src/Modules/Households/types/error.types.ts`

#### Implementation Details

```typescript
// Example interfaces to implement
interface Household {
	id: number;
	primary_user_id: number;
	address_line_1: string;
	address_line_2?: string;
	city: string;
	state: string;
	zip_code: string;
	preferred_language: string;
	notes?: string;
	created_at: string;
	updated_at: string;
	members: HouseholdMember[];
	counts: HouseholdCounts;
}

interface HouseholdMember {
	id: number;
	household_id: number;
	is_primary: boolean;
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	gender?: string;
	phone?: string;
	email?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	date_of_birth?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
```

### Task 1.2: Households API Service

**Priority**: High  
**Estimated Time**: 3 days  
**Dependencies**: Task 1.1

#### Acceptance Criteria

-   [x] Create dedicated HouseholdsApiService class
-   [x] Implement all CRUD operations for households
-   [x] Implement all CRUD operations for household members
-   [x] Add comprehensive error handling
-   [x] Add request/response interceptors for authentication
-   [x] Implement client-side caching for frequently accessed data
-   [x] Add TypeScript types for all API operations

#### Technical Requirements

-   [x] Create `src/Services/HouseholdsApiService.ts`
-   [x] Implement authentication token handling
-   [x] Add error handling with user-friendly messages
-   [x] Implement caching strategy for household data
-   [x] Add retry logic for failed requests

#### Implementation Details

```typescript
class HouseholdsApiService {
	// Household operations
	async createHousehold(data: CreateHouseholdRequest): Promise<Household>;
	async getHousehold(): Promise<Household>;
	async getHouseholdById(id: number): Promise<Household>;
	async updateHousehold(
		id: number,
		data: UpdateHouseholdRequest
	): Promise<Household>;

	// Member operations
	async getMembers(householdId: number): Promise<HouseholdMember[]>;
	async addMember(
		householdId: number,
		data: CreateMemberRequest
	): Promise<HouseholdMember>;
	async updateMember(
		householdId: number,
		memberId: number,
		data: UpdateMemberRequest
	): Promise<HouseholdMember>;
	async deactivateMember(
		householdId: number,
		memberId: number
	): Promise<HouseholdMember>;
}
```

### Task 1.3: Mock Data and Testing Setup

**Priority**: Medium  
**Estimated Time**: 1 day  
**Dependencies**: Task 1.1

#### Acceptance Criteria

-   [x] Create comprehensive mock data for households and members
-   [x] Set up testing framework for household components
-   [x] Create mock API responses for all endpoints
-   [x] Set up test utilities and helpers
-   [x] Create test data factories for different scenarios

#### Technical Requirements

-   [x] Create `src/Testing/mock-households.ts`
-   [x] Create `src/Testing/mock-household-members.ts`
-   [x] Set up Jest configuration for household tests
-   [x] Create test utilities for component testing

### Task 1.4: Authentication Integration ✅

**Priority**: High  
**Estimated Time**: 1 day  
**Dependencies**: Task 1.2

#### Acceptance Criteria

-   [x] Integrate household creation with Cognito authentication
-   [x] Ensure only authenticated users can access household features
-   [x] Handle authentication errors gracefully
-   [x] Implement proper token management for API calls
-   [x] Add authentication guards for household routes

#### Technical Requirements

-   [x] Integrate with existing AuthContext
-   [x] Add authentication checks to household components
-   [x] Implement proper error handling for authentication failures
-   [x] Add loading states for authentication checks

#### Implementation Details

**Created Components:**

-   `useHouseholdAuth.ts` - Custom hook for household authentication
-   `AuthGuard.tsx` - Authentication guard component
-   `HouseholdSetupOffer.tsx` - Household setup offer component
-   `HouseholdSignUpIntegration.ts` - Sign-up integration service
-   `HouseholdSignUpWrapper.tsx` - Sign-up wrapper component
-   `HouseholdRouteGuard.tsx` - Route protection component

**Key Features:**

-   Seamless integration with existing AuthContext
-   Token management and refresh functionality
-   Authentication error handling with user-friendly messages
-   Route protection with automatic redirects
-   Household setup integration with sign-up process
-   Loading states and error boundaries

### Task 1.5: Hybrid Sign-Up Integration Design

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: Task 1.1, 1.2

#### Acceptance Criteria

-   [x] Design hybrid household creation flow after email confirmation
-   [x] Create household setup offer component with skip option
-   [x] Implement household setup completion tracking
-   [x] Add account profile integration for household setup
-   [x] Design progressive enhancement prompts for incomplete profiles
-   [x] Implement graceful fallback for users who skip initial setup

#### Technical Requirements

-   [x] Create `src/Modules/Households/HouseholdSetupOffer.tsx`
-   [x] Create `src/Modules/Households/HouseholdSetupWizard.tsx`
-   [x] Create `src/Modules/Households/HouseholdCompletionPrompt.tsx`
-   [x] Create `src/Modules/Households/HouseholdProfileIntegration.tsx`
-   [x] Integrate with existing sign-up flow
-   [x] Add household setup completion tracking
-   [x] Add navigation flow from sign-up to household setup
-   [x] Implement account profile household management

#### Implementation Details

```typescript
// Hybrid sign-up flow
interface HybridSignUpFlow {
	// Step 1: Basic sign-up (existing)
	email: string;
	password: string;
	name: string;

	// Step 2: Email confirmation (existing)

	// Step 3: Household setup offer (new)
	householdSetupOffer: {
		showOffer: boolean;
		userChoice: "setup" | "skip" | "later";
		completionStatus: "pending" | "completed" | "skipped";
	};

	// Step 4: Dashboard with completion prompts (if skipped)
	dashboardPrompts: {
		showCompletionPrompt: boolean;
		promptFrequency: "immediate" | "delayed" | "periodic";
	};
}
```

#### User Flow Design

**Hybrid Approach: Offer with Skip Option**

-   After email confirmation → Present household setup offer
-   User can choose: "Set up household now" or "Skip for now"
-   If skipped → Dashboard with gentle completion prompts
-   If completed → Full household management in account profile
-   Account profile always has household setup option available

#### Implementation Components

1. **HouseholdSetupOffer Component**

    - Welcome message explaining household benefits
    - "Set up household now" button
    - "Skip for now" button
    - Brief explanation of what can be completed later

2. **HouseholdSetupWizard Component**

    - Multi-step household setup form
    - Address, language preference, primary user details
    - Progress indicators and validation

3. **Account Profile Integration**

    - Household management section in account profile
    - Complete household setup option
    - Edit existing household information
    - Member management capabilities

4. **Completion Tracking**
    - Track household setup completion status
    - Store user choice (setup/skip/later)
    - Implement progressive enhancement prompts

### Task 1.6: Account Profile Integration

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: Task 1.5

#### Acceptance Criteria

-   [x] Integrate household management into account profile
-   [x] Add household setup option for users who skipped initial setup
-   [x] Implement household completion status indicators
-   [x] Add progressive enhancement prompts for incomplete profiles
-   [x] Create seamless navigation between profile and household management

#### Technical Requirements

-   [x] Extend existing account profile components
-   [x] Add household management section to profile
-   [x] Implement completion status tracking
-   [x] Add gentle prompts for profile completion
-   [x] Create navigation flow between profile and household
-   [x] Create `src/Modules/Households/components/AccountProfileIntegration.tsx`
-   [x] Create `src/Modules/Households/components/HouseholdCompletionTracker.tsx`
-   [x] Create `src/Modules/Households/components/HouseholdNavigation.tsx`

#### Implementation Details

```typescript
// Account profile integration
interface AccountProfileIntegration {
	householdSection: {
		completionStatus: "complete" | "incomplete" | "not_started";
		showSetupPrompt: boolean;
		lastPromptDate?: string;
		promptFrequency: "daily" | "weekly" | "monthly";
	};

	navigation: {
		householdManagementPath: string;
		setupWizardPath: string;
		completionTrackingPath: string;
	};
}
```

## Phase 2: Core Components (Week 3-4)

### Task 2.1: Household Dashboard Component

**Priority**: High  
**Estimated Time**: 3 days  
**Dependencies**: Task 1.1, 1.2

#### Acceptance Criteria

-   [x] Create main HouseholdDashboard component
-   [x] Implement household information display
-   [x] Add household counts display (children, adults, seniors, total)
-   [x] Implement household address display
-   [x] Add language preference display
-   [x] Implement edit functionality for household information
-   [x] Add loading states and error handling
-   [x] Ensure responsive design

#### Technical Requirements

-   [x] Create `src/Modules/Households/HouseholdDashboard.tsx`
-   [x] Use shadcn components for consistent styling
-   [x] Implement proper TypeScript types
-   [x] Add comprehensive error handling
-   [x] Ensure accessibility compliance

#### UI Requirements

-   Green header matching mockup design
-   Card-based layout for information display
-   Edit icons for editable fields
-   Responsive design for mobile and desktop
-   Loading states for async operations

### Task 2.2: Member Card Component

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: Task 1.1

#### Acceptance Criteria

-   [x] Create reusable MemberCard component
-   [x] Display member information (name, status, avatar)
-   [x] Show FreshTrak User tags where applicable
-   [x] Implement status indicators (Child, Adult, Senior)
-   [x] Add edit functionality
-   [x] Generate initials-based avatars
-   [x] Ensure proper accessibility

#### Technical Requirements

-   [x] Create `src/Modules/Households/MemberCard.tsx`
-   [x] Implement avatar generation utility
-   [x] Add proper TypeScript types
-   [x] Ensure responsive design
-   [x] Add hover states and interactions

#### UI Requirements

-   Circular avatar with member initials
-   Color-coded status indicators
-   FreshTrak User tags in green pills
-   Edit icons for member information
-   Hover effects and transitions

### Task 2.3: Member List Component

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: Task 2.2

#### Acceptance Criteria

-   [x] Create MemberList component to display all household members
-   [x] Implement grid/list view toggle
-   [x] Add "Add Member" button
-   [x] Implement member filtering and sorting
-   [x] Add loading states for member operations
-   [x] Ensure responsive design

#### Technical Requirements

-   [x] Create `src/Modules/Households/MemberList.tsx`
-   [x] Implement member filtering and sorting
-   [x] Add proper TypeScript types
-   [x] Ensure accessibility compliance
-   [x] Add comprehensive error handling

### Task 2.4: Member Form Components

**Priority**: High  
**Estimated Time**: 3 days  
**Dependencies**: Task 1.1

#### Acceptance Criteria

-   [x] Create AddMemberForm component
-   [x] Create EditMemberForm component
-   [x] Implement comprehensive form validation
-   [x] Add date of birth validation and age calculation
-   [x] Implement address autocomplete integration
-   [x] Add phone number formatting
-   [x] Ensure proper error handling and user feedback

#### Technical Requirements

-   [x] Create `src/Modules/Households/AddMemberForm.tsx`
-   [x] Create `src/Modules/Households/EditMemberForm.tsx`
-   [x] Implement react-hook-form integration
-   [x] Add comprehensive validation schemas
-   [x] Integrate with existing address autocomplete
-   [x] Add phone number formatting utilities

#### Form Fields

-   Personal Information: First name, middle name, last name, suffix
-   Demographics: Date of birth, gender, race, ethnicity
-   Contact Information: Phone, email
-   Address Information: Individual address (optional)
-   Status: Active/inactive

## Phase 3: Advanced Features (Week 5-6)

### Task 3.1: Household Information Management

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: Task 2.1

#### Acceptance Criteria

-   [ ] Implement household address editing
-   [ ] Add language preference selection
-   [ ] Implement household notes functionality
-   [ ] Add household information validation
-   [ ] Implement optimistic updates
-   [ ] Add confirmation dialogs for changes

#### Technical Requirements

-   Extend HouseholdDashboard with edit capabilities
-   Implement form validation for household information
-   Add optimistic updates with rollback on error
-   Implement confirmation dialogs for destructive actions

### Task 3.2: Member Status Management

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: Task 2.2, 2.3

#### Acceptance Criteria

-   [ ] Implement member deactivation functionality
-   [ ] Add member reactivation capability
-   [ ] Implement soft delete with confirmation
-   [ ] Add status change audit trail
-   [ ] Ensure proper error handling

#### Technical Requirements

-   Add deactivation/reactivation functionality to MemberCard
-   Implement confirmation dialogs for destructive actions
-   Add proper error handling and user feedback
-   Implement optimistic updates

### Task 3.3: Address and Contact Management

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: Task 2.4

#### Acceptance Criteria

-   [ ] Implement individual member address management
-   [ ] Add contact information editing
-   [ ] Implement preferred contact selection
-   [ ] Add address validation
-   [ ] Integrate with Google Places API

#### Technical Requirements

-   Extend member forms with address and contact fields
-   Integrate with existing Google Places autocomplete
-   Implement address validation
-   Add preferred contact indicators

### Task 3.4: Language Preference Management

**Priority**: Low  
**Estimated Time**: 1 day  
**Dependencies**: Task 3.1

#### Acceptance Criteria

-   [ ] Implement language preference selection
-   [ ] Add language preference display
-   [ ] Support multiple language options
-   [ ] Persist language preference changes

#### Technical Requirements

-   Create language preference component
-   Integrate with existing localization system
-   Add language preference to household data
-   Implement language preference persistence

## Phase 4: Integration and Testing (Week 7-8)

### Task 4.1: Registration System Integration

**Priority**: High  
**Estimated Time**: 3 days  
**Dependencies**: Task 2.1, 2.2, 2.3

#### Acceptance Criteria

-   [ ] Integrate household data with existing registration forms
-   [ ] Implement household data export for registration
-   [ ] Add member selection for event registration
-   [ ] Ensure backward compatibility with count-based registration
-   [ ] Implement data synchronization between household and registration

#### Technical Requirements

-   Create household data export utilities
-   Integrate with existing registration components
-   Implement member selection functionality
-   Ensure backward compatibility
-   Add data synchronization logic

### Task 4.2: Comprehensive Test Suite

**Priority**: High  
**Estimated Time**: 4 days  
**Dependencies**: All previous tasks

#### Acceptance Criteria

-   [ ] Create unit tests for all components
-   [ ] Create integration tests for API service
-   [ ] Create component interaction tests
-   [ ] Add error scenario testing
-   [ ] Achieve 90%+ test coverage
-   [ ] Add accessibility tests

#### Technical Requirements

-   Create test files for all components
-   Implement comprehensive mock data
-   Add error scenario testing
-   Implement accessibility testing
-   Add performance testing

#### Test Categories

-   Unit Tests: Individual component testing
-   Integration Tests: API service testing
-   Component Tests: Component interaction testing
-   Error Tests: Error handling and edge cases
-   Accessibility Tests: WCAG compliance testing

### Task 4.3: Performance Optimization

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: Task 4.1

#### Acceptance Criteria

-   [ ] Implement lazy loading for large member lists
-   [ ] Add memoization for expensive operations
-   [ ] Optimize bundle size with code splitting
-   [ ] Implement intelligent caching
-   [ ] Optimize re-renders with proper dependency arrays

#### Technical Requirements

-   Implement React.memo and useMemo
-   Add code splitting for large components
-   Implement intelligent caching strategy
-   Optimize API calls and data fetching
-   Add performance monitoring

### Task 4.4: Error Handling and User Experience

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: Task 4.1

#### Acceptance Criteria

-   [ ] Implement comprehensive error handling
-   [ ] Add user-friendly error messages
-   [ ] Implement retry mechanisms
-   [ ] Add loading states for all async operations
-   [ ] Implement offline handling

#### Technical Requirements

-   Create error handling utilities
-   Implement retry logic for failed requests
-   Add comprehensive loading states
-   Implement offline detection and handling
-   Add user feedback for all operations

## Phase 5: Documentation and Deployment (Week 9)

### Task 5.1: Component Documentation

**Priority**: Medium  
**Estimated Time**: 2 days  
**Dependencies**: All previous tasks

#### Acceptance Criteria

-   [ ] Create comprehensive component documentation
-   [ ] Document all props and interfaces
-   [ ] Add usage examples
-   [ ] Document error handling patterns
-   [ ] Create integration guides

#### Technical Requirements

-   Create JSDoc comments for all components
-   Document all TypeScript interfaces
-   Create usage examples and demos
-   Document error handling patterns
-   Create integration guides

### Task 5.2: API Documentation

**Priority**: Medium  
**Estimated Time**: 1 day  
**Dependencies**: Task 1.2

#### Acceptance Criteria

-   [ ] Document all API service methods
-   [ ] Document request/response formats
-   [ ] Add error handling documentation
-   [ ] Create integration examples
-   [ ] Document authentication requirements

#### Technical Requirements

-   Create comprehensive API documentation
-   Document all request/response types
-   Add error handling documentation
-   Create integration examples
-   Document authentication requirements

### Task 5.3: Final Testing and Validation

**Priority**: High  
**Estimated Time**: 2 days  
**Dependencies**: All previous tasks

#### Acceptance Criteria

-   [ ] Conduct comprehensive user acceptance testing
-   [ ] Validate all functionality against requirements
-   [ ] Test across different browsers and devices
-   [ ] Validate accessibility compliance
-   [ ] Conduct performance testing

#### Technical Requirements

-   Create comprehensive test scenarios
-   Test across multiple browsers and devices
-   Validate accessibility compliance
-   Conduct performance testing
-   Document any issues and resolutions

### Task 5.4: Deployment Preparation

**Priority**: High  
**Estimated Time**: 1 day  
**Dependencies**: Task 5.3

#### Acceptance Criteria

-   [ ] Prepare deployment configuration
-   [ ] Create deployment scripts
-   [ ] Validate production build
-   [ ] Create rollback procedures
-   [ ] Document deployment process

#### Technical Requirements

-   Create production build configuration
-   Implement deployment scripts
-   Validate production build
-   Create rollback procedures
-   Document deployment process

## Testing Strategy

### Unit Testing

-   **Components**: Test individual component functionality
-   **Services**: Test API service methods
-   **Utilities**: Test helper functions and utilities
-   **Types**: Validate TypeScript type definitions

### Integration Testing

-   **API Integration**: Test API service integration
-   **Component Integration**: Test component interactions
-   **Authentication**: Test authentication integration
-   **Data Flow**: Test data flow between components

### End-to-End Testing

-   **User Workflows**: Test complete user workflows
-   **Cross-Browser**: Test across different browsers
-   **Mobile**: Test mobile responsiveness
-   **Accessibility**: Test accessibility compliance

### Performance Testing

-   **Load Testing**: Test with large datasets
-   **Memory Usage**: Monitor memory consumption
-   **Bundle Size**: Validate bundle size optimization
-   **Rendering Performance**: Test component rendering performance

## Risk Mitigation

### Technical Risks

-   **API Integration**: Implement comprehensive error handling and fallbacks
-   **Type Complexity**: Start with simple types and gradually add complexity
-   **Performance**: Implement performance monitoring and optimization
-   **Testing**: Maintain high test coverage throughout development

### Project Risks

-   **Timeline**: Build in buffer time for complex features
-   **Scope Creep**: Maintain strict adherence to requirements
-   **Quality**: Implement code review process and quality gates
-   **Integration**: Test integration early and often

## Success Criteria

### Functional Criteria

-   [ ] All household management features work as specified
-   [ ] Seamless integration with existing registration system
-   [ ] Backward compatibility maintained
-   [ ] Authentication integration working properly

### Technical Criteria

-   [ ] 90%+ test coverage achieved
-   [ ] No TypeScript errors
-   [ ] Performance meets requirements
-   [ ] Accessibility compliance achieved

### User Experience Criteria

-   [ ] Intuitive user interface matching mockups
-   [ ] Responsive design across all devices
-   [ ] Comprehensive error handling
-   [ ] Smooth user workflows

## Dependencies and Blockers

### External Dependencies

-   **Backend API**: Household endpoints must be available
-   **Authentication**: Cognito authentication must be working
-   **Design System**: shadcn components must be available
-   **Testing Framework**: Jest and React Testing Library must be configured

### Internal Dependencies

-   **TypeScript Configuration**: Must be properly configured
-   **Build System**: Webpack/build system must be working
-   **CI/CD Pipeline**: Deployment pipeline must be configured
-   **Code Review Process**: Review process must be established

## Conclusion

This comprehensive task list provides a structured approach to implementing the Households module while maintaining quality, ensuring thorough testing, and delivering a robust solution that integrates seamlessly with the existing application architecture.

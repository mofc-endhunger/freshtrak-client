# Households Module Implementation PRD

## Introduction/Overview

The Households module implements a comprehensive household management system that allows authenticated users to create, manage, and maintain household information with individual member profiles. This module serves as the foundation for household data that can be used during event registration processes while maintaining backward compatibility with existing family registration functionality.

**Problem**: The current family registration system uses count-based household information (seniors_in_household, adults_in_household, children_in_household) but the new backend API supports individual household member management with detailed profiles, demographics, and derived counts.

**Goal**: Implement a new Households module that provides individual member management capabilities while maintaining compatibility with existing registration workflows and ensuring seamless integration with the new backend API.

## Goals

1. **Individual Member Management**: Enable users to create, edit, and manage individual household members with detailed profiles
2. **Backward Compatibility**: Maintain existing family registration functionality without breaking changes
3. **Authentication Integration**: Restrict household creation to authenticated Cognito users only
4. **Data Consistency**: Ensure household data can be used seamlessly in registration forms
5. **User Experience**: Provide intuitive member management interface based on provided mockups
6. **API Integration**: Implement dedicated service layer for household operations
7. **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## User Stories

### Primary User Stories

1. **As a new user**, I want to set up my household during the sign-up process so that I can have a complete profile from day one.

2. **As an authenticated user**, I want to create a household with my primary information so that I can manage my family's data in one place.

3. **As a head of household**, I want to add individual family members with their personal details so that I can maintain accurate household information.

4. **As a head of household**, I want to edit member information including contact details, demographics, and address so that I can keep information current.

5. **As a head of household**, I want to deactivate family members who are no longer part of the household so that I can maintain accurate household composition.

6. **As a head of household**, I want to see derived household counts (children, adults, seniors) so that I can understand my household composition at a glance.

7. **As a user**, I want to use my household information during event registration so that I don't have to re-enter family details repeatedly.

### Secondary User Stories

8. **As a developer**, I want comprehensive TypeScript types for household data so that I can ensure data consistency across the application.

9. **As a developer**, I want a dedicated API service for household operations so that I can maintain clean separation of concerns.

10. **As a developer**, I want comprehensive test coverage for household functionality so that I can ensure reliability and maintainability.

## Functional Requirements

### 1. Household Creation and Management

#### 1.1 Household Creation During Sign-Up

-   **Sign-Up Integration**: Household creation integrated into the sign-up process
-   **Post-Confirmation Flow**: Household setup occurs after email confirmation
-   **Required Information**: Basic household information required for account completion
-   **Primary User Setup**: Automatically create primary member from authenticated user data
-   **Address Management**: Support full address information (line 1, line 2, city, state, zip)
-   **Language Preference**: Support preferred language selection
-   **Notes Field**: Optional notes field for household-level information

#### 1.2 Hybrid Household Creation Flow

-   **Post-Confirmation Offer**: Present household setup option after email confirmation
-   **Skip Option**: Users can skip initial setup and complete later
-   **Account Profile Integration**: Household setup available in account profile
-   **Completion Tracking**: Track whether user has completed household setup
-   **Progressive Enhancement**: Encourage completion through gentle prompts
-   **Fallback Handling**: Graceful handling for users who skip initial setup

#### 1.3 Household Information Display

-   **Household Summary**: Display household counts (children, adults, seniors, total)
-   **Address Display**: Show formatted household address
-   **Language Preference**: Display selected language preference
-   **Creation/Update Timestamps**: Show when household was created and last updated

### 2. Member Management

#### 2.1 Member Creation

-   **Personal Information**: First name, middle name, last name, suffix
-   **Demographics**: Date of birth, gender, race, ethnicity
-   **Contact Information**: Phone number, email address (optional)
-   **Address Information**: Individual address (optional, defaults to household address)
-   **Status Management**: Active/inactive status

#### 2.2 Member Information Display

-   **Member Cards**: Individual cards showing member information
-   **Status Indicators**: Visual indicators for member type (Child, Adult, Senior)
-   **FreshTrak User Tags**: Display if member has FreshTrak account
-   **Avatar Generation**: Generate initials-based avatars for members
-   **Edit Capabilities**: Inline editing for member information

#### 2.3 Member Operations

-   **Add Member**: Add new household members with full profile information
-   **Edit Member**: Update member information including all fields
-   **Deactivate Member**: Soft delete members (set is_active = false)
-   **Reactivate Member**: Restore previously deactivated members
-   **Primary Member Management**: Handle primary member designation

### 3. Data Integration and Compatibility

#### 3.1 Registration Integration

-   **Household Data Export**: Provide household data in format compatible with existing registration forms
-   **Count Derivation**: Automatically calculate household counts from member data
-   **Member Selection**: Allow selection of specific members for event registration
-   **Data Synchronization**: Ensure household data stays synchronized with registration data

#### 3.2 Backward Compatibility

-   **Legacy Support**: Maintain support for existing count-based family registration
-   **Data Migration**: Provide migration path for existing users
-   **Hybrid Approach**: Support both individual member and count-based approaches

### 4. User Interface Requirements

#### 4.1 Household Dashboard

-   **Header Section**: Green header with household name/identifier
-   **Profile Card**: Primary user profile with avatar and "Head of Household" designation
-   **Navigation Tabs**: Summary, Messages, Account tabs
-   **Information Cards**: Editable cards for different information categories

#### 4.2 Member Management Interface

-   **Member List**: Grid/list view of household members
-   **Member Cards**: Individual cards with avatar, name, status, and tags
-   **Add Member Button**: Prominent button to add new members
-   **Edit Controls**: Edit icons and inline editing capabilities
-   **Status Indicators**: Visual status indicators (Child, Adult, Senior, FreshTrak User)

#### 4.3 Information Management

-   **Information Card**: Personal details (name, age, demographics)
-   **Address Card**: Address information with edit capability
-   **Contact Card**: Contact information with preferred contact indicators
-   **Language Preference**: Language selection with current preference display
-   **Vehicles Card**: Vehicle information (placeholder for future functionality)

### 5. API Integration

#### 5.1 Household Operations

-   **Create Household**: POST /households
-   **Get Household**: GET /households (user's household)
-   **Update Household**: PATCH /households/:id
-   **Get Household by ID**: GET /households/:id

#### 5.2 Member Operations

-   **List Members**: GET /households/:id/members
-   **Add Member**: POST /households/:id/members
-   **Update Member**: PATCH /households/:id/members/:memberId
-   **Deactivate Member**: DELETE /households/:id/members/:memberId

#### 5.3 Data Handling

-   **Error Handling**: Comprehensive error handling for API operations
-   **Loading States**: Loading indicators for async operations
-   **Optimistic Updates**: Immediate UI updates with rollback on error
-   **Caching**: Client-side caching for improved performance

## Non-Goals (Out of Scope)

1. **Guest User Support**: Guest users cannot create or manage households
2. **Multi-Household Support**: Users can only manage one household per account
3. **Member Authentication**: Dependents do not have individual authentication
4. **Advanced Permissions**: No complex permission system beyond primary user access
5. **Audit Log UI**: No user interface for viewing audit logs
6. **Bulk Operations**: No bulk import/export of member data
7. **Advanced Demographics**: No complex demographic categorization beyond basic fields
8. **Vehicle Management**: Vehicle information is placeholder only
9. **Assessment Integration**: Food/Health assessments are placeholder only
10. **Invitation System**: No member invitation or sharing functionality

## Design Considerations

### UI/UX Requirements

1. **Visual Consistency**: Match the provided mockup design with green headers and card-based layout
2. **Responsive Design**: Ensure functionality works across desktop, tablet, and mobile devices
3. **Accessibility**: Follow WCAG guidelines for accessibility
4. **Loading States**: Provide clear loading indicators for all async operations
5. **Error Handling**: Display user-friendly error messages with recovery options
6. **Confirmation Dialogs**: Use confirmation dialogs for destructive actions

### Component Architecture

1. **Modular Design**: Create reusable components for member cards, information cards, and forms
2. **State Management**: Use React hooks and context for state management
3. **Form Handling**: Implement comprehensive form validation and error handling
4. **Type Safety**: Full TypeScript implementation with strict typing
5. **Performance**: Optimize for performance with proper memoization and lazy loading

### Data Management

1. **Single Source of Truth**: Maintain household data in centralized state
2. **Optimistic Updates**: Update UI immediately with rollback on API errors
3. **Caching Strategy**: Implement intelligent caching for frequently accessed data
4. **Data Validation**: Client-side validation with server-side verification
5. **Error Recovery**: Graceful error handling with retry mechanisms

## Technical Considerations

### TypeScript Implementation

1. **Comprehensive Types**: Define interfaces for all data structures
2. **API Types**: Type all API requests and responses
3. **Form Types**: Type all form data and validation schemas
4. **Component Props**: Type all component props and state
5. **Error Types**: Define error types for consistent error handling

### API Service Architecture

1. **Dedicated Service**: Create HouseholdsApiService for all household operations
2. **Error Handling**: Centralized error handling with user-friendly messages
3. **Request/Response Interceptors**: Handle authentication and error responses
4. **Type Safety**: Full TypeScript integration with API service
5. **Caching**: Implement intelligent caching for API responses

### Testing Strategy

1. **Unit Tests**: Comprehensive unit tests for all components and services
2. **Integration Tests**: Test component interactions and API integration
3. **Mock Data**: Create comprehensive mock data for testing
4. **Error Scenarios**: Test error handling and edge cases
5. **Accessibility Tests**: Ensure components meet accessibility standards

### Performance Considerations

1. **Lazy Loading**: Implement lazy loading for large member lists
2. **Memoization**: Use React.memo and useMemo for performance optimization
3. **Bundle Size**: Optimize bundle size with code splitting
4. **API Optimization**: Minimize API calls with intelligent caching
5. **Rendering Optimization**: Optimize re-renders with proper dependency arrays

## Success Metrics

1. **Functionality**: All household and member management features work as specified
2. **Type Safety**: 100% TypeScript coverage with no type errors
3. **Test Coverage**: 90%+ test coverage for all components and services
4. **Performance**: No performance degradation compared to existing functionality
5. **Accessibility**: Meets WCAG 2.1 AA standards
6. **User Experience**: Intuitive interface matching provided mockups
7. **API Integration**: Seamless integration with backend API endpoints
8. **Backward Compatibility**: Existing registration functionality remains intact
9. **Error Handling**: Graceful error handling with user-friendly messages
10. **Mobile Responsiveness**: Full functionality across all device sizes

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)

-   Set up TypeScript interfaces and types
-   Create HouseholdsApiService
-   Implement basic household creation and retrieval
-   Set up testing framework and mock data

### Phase 2: Core Components (Week 3-4)

-   Implement HouseholdDashboard component
-   Create MemberCard and MemberList components
-   Implement member creation and editing functionality
-   Add comprehensive form validation

### Phase 3: Advanced Features (Week 5-6)

-   Implement member deactivation/reactivation
-   Add household information management
-   Implement address and contact management
-   Add language preference functionality

### Phase 4: Integration and Testing (Week 7-8)

-   Integrate with existing registration system
-   Implement comprehensive test suite
-   Performance optimization and accessibility testing
-   Final UI polish and error handling

### Phase 5: Documentation and Deployment (Week 9)

-   Create comprehensive documentation
-   Final code review and cleanup
-   Deployment preparation and testing
-   User acceptance testing

## Risk Assessment

### High Risk

-   **API Integration**: Risk of breaking changes in API integration
-   **Data Migration**: Risk of data loss during migration from count-based to member-based
-   **Performance Impact**: Risk of performance degradation with complex member management
-   **Backward Compatibility**: Risk of breaking existing registration functionality

### Medium Risk

-   **Type Complexity**: Complex TypeScript types might be challenging to implement
-   **State Management**: Complex state management for household and member data
-   **UI Consistency**: Risk of visual inconsistencies with existing design system
-   **Testing Coverage**: Achieving comprehensive test coverage might be time-consuming

### Low Risk

-   **Component Reusability**: Existing component patterns can be leveraged
-   **Authentication Integration**: Existing authentication system can be extended
-   **Styling**: Tailwind CSS patterns are well-established
-   **Development Tools**: Existing development tools and processes are mature

## Dependencies

1. **Backend API**: New household endpoints must be available and stable
2. **Authentication System**: Cognito authentication must be working
3. **Existing Components**: shadcn components and existing UI patterns
4. **TypeScript Configuration**: Existing TypeScript setup and configuration
5. **Testing Framework**: Existing Jest and React Testing Library setup
6. **Build System**: Existing webpack/build configuration
7. **Design System**: Existing Tailwind CSS configuration and design tokens

## Open Questions

1. **Data Migration Strategy**: How should existing users be migrated from count-based to member-based data?
2. **Error Recovery**: What should be the fallback behavior if household API is unavailable?
3. **Caching Strategy**: How long should household data be cached on the client side?
4. **Offline Support**: Should household data be available offline?
5. **Performance Monitoring**: Should we implement performance monitoring for household operations?
6. **User Onboarding**: Should we provide guided onboarding for new household creation?
7. **Data Export**: Should users be able to export their household data?
8. **Backup Strategy**: What should be the backup strategy for household data?

## Conclusion

The Households module implementation will provide a comprehensive household management system that enhances user experience while maintaining backward compatibility with existing registration functionality. The implementation will be built with TypeScript for type safety, comprehensive testing for reliability, and modern React patterns for maintainability. The module will serve as the foundation for household data management while seamlessly integrating with existing registration workflows.

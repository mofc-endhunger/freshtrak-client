# TypeScript Migration Roadmap for FreshTrak Client

## Project Overview

-   **Current State**: React JavaScript application with 80+ components
-   **Target State**: Fully typed TypeScript React application
-   **Approach**: Incremental migration without breaking existing functionality
-   **Timeline**: Phased approach to minimize risk

## Phase 1: Setup and Infrastructure (Foundation)

### Task 1.1: Install TypeScript Dependencies

-   [x] Install TypeScript and related packages
    ```bash
    npm install --save-dev typescript @types/react @types/react-dom @types/node
    npm install --save-dev @types/jest @types/testing-library__react @types/testing-library__jest-dom
    ```
-   [ ] Install additional type definitions for existing dependencies
    ```bash
    npm install --save-dev @types/react-router-dom @types/react-redux
    npm install --save-dev @types/react-facebook-login @types/qrcode.react
    npm install --save-dev @types/react-places-autocomplete @types/react-rangeslider
    npm install --save-dev @types/react-toastify @types/sweetalert2
    npm install --save-dev @types/moment @types/axios
    ```

### Task 1.2: Configure TypeScript

-   [x] Create `tsconfig.json` with strict settings
-   [ ] Configure ESLint for TypeScript
-   [ ] Update build scripts to handle TypeScript
-   [ ] Create type declaration files for untyped dependencies

### Task 1.3: Create Type Definitions

-   [x] Create `src/types/` directory
-   [x] Define global type interfaces
-   [x] Create Redux store types
-   [x] Define component prop interfaces
-   [x] Create API response types

## Phase 2: Core Infrastructure Migration

### Task 2.1: Migrate Store and Redux

-   [x] Convert `src/Store/store.js` → `src/Store/store.ts`
-   [x] Convert Redux slices:
    -   [x] `src/Store/Events/eventSlice.js` → `eventSlice.ts`
    -   [x] `src/Store/Search/searchSlice.js` → `searchSlice.ts`
    -   [x] `src/Store/userSlice.js` → `userSlice.ts`
    -   [x] `src/Store/languageSlice.js` → `languageSlice.ts`
-   [x] Convert Context API: `src/Store/ContextApi/HeaderContext.js` → `HeaderContext.tsx`

### Task 2.2: Migrate Core Files

-   [x] Convert `src/index.js` → `src/index.tsx`
-   [x] Convert `src/App.js` → `src/App.tsx`
-   [x] Convert `src/Core/Routes.js` → `src/Core/Routes.tsx`
-   [x] Convert `src/Core/ScrollContainer.js` → `src/Core/ScrollContainer.tsx`

### Task 2.3: Migrate Services and Utils

-   [x] Convert `src/Services/ApiService.js` → `src/Services/ApiService.ts`
-   [x] Convert utility files in `src/Utils/`:
    -   [x] `Constants.js` → `Constants.ts`
    -   [x] `DateFormat.js` → `DateFormat.ts`
    -   [x] `EventHandler.js` → `EventHandler.ts`
    -   [x] `PhoneFormat.js` → `PhoneFormat.ts`
    -   [x] `serviceCatFilter.js` → `serviceCatFilter.ts`
    -   [x] `Urls.js` → `Urls.ts`
    -   [x] `UseForm.js` → `UseForm.ts`
    -   [x] `Util.js` → `Util.ts`

## Phase 3: Component Migration (By Module) ✅ COMPLETED

### Task 3.1: Authentication Module ✅

-   [x] Convert `src/Modules/Authentication/AuthenticationModal.js` → `AuthenticationModal.tsx`
-   [x] Convert `src/Modules/Authentication/FacebookLoginComponent.js` → `FacebookLoginComponent.tsx`
-   [x] Convert `src/Modules/Authentication/GuestLoginButtonComponent.js` → `GuestLoginButtonComponent.tsx`

### Task 3.2: Dashboard Module ✅

-   [x] Convert `src/Modules/Dashboard/DashBoardContainer.js` → `DashBoardContainer.tsx`
-   [x] Convert `src/Modules/Dashboard/DashboardCreateAccountComponent.js` → `DashboardCreateAccountComponent.tsx`
-   [x] Convert `src/Modules/Dashboard/DashBoardDataComponent.js` → `DashBoardDataComponent.tsx`
-   [x] Convert `src/Modules/Dashboard/DashBoardFoodBankComponent.js` → `DashBoardFoodBankComponent.tsx`

### Task 3.3: Events Module ✅

-   [x] Convert `src/Modules/Events/AgencyEventListContainer.js` → `AgencyEventListContainer.tsx`
-   [x] Convert `src/Modules/Events/EventCardComponent.js` → `EventCardComponent.tsx`
-   [x] Convert `src/Modules/Events/EventContainer.js` → `EventContainer.tsx`
-   [x] Convert `src/Modules/Events/EventListComponent.js` → `EventListComponent.tsx`
-   [x] Convert `src/Modules/Events/EventListContainer.js` → `EventListContainer.tsx`
-   [x] Convert `src/Modules/Events/HeaderBannerComponent.js` → `HeaderBannerComponent.tsx`
-   [x] Convert `src/Modules/Events/ResourceListComponent.js` → `ResourceListComponent.tsx`

### Task 3.4: Family Module ✅

-   [x] Convert `src/Modules/Family/AdditionalPickUpFormComponent.js` → `AdditionalPickUpFormComponent.tsx`
-   [x] Convert `src/Modules/Family/AddressComponent.js` → `AddressComponent.tsx`
-   [x] Convert `src/Modules/Family/ContactInformationComponent.js` → `ContactInformationComponent.tsx`
-   [x] Convert `src/Modules/Family/EditFamilyContainer.js` → `EditFamilyContainer.tsx`
-   [x] Convert `src/Modules/Family/EventSlotsModalComponent.js` → `EventSlotsModalComponent.tsx`
-   [x] Convert `src/Modules/Family/FamilyContainer.js` → `FamilyContainer.tsx`
-   [x] Convert `src/Modules/Family/MemberCountFormComponent.js` → `MemberCountFormComponent.tsx`
-   [x] Convert `src/Modules/Family/PasswordRegistrationFormComponent.js` → `PasswordRegistrationFormComponent.tsx`
-   [x] Convert `src/Modules/Family/PhoneInputComponent.js` → `PhoneInputComponent.tsx`
-   [x] Convert `src/Modules/Family/PrimaryInfoFormComponent.js` → `PrimaryInfoFormComponent.tsx`
-   [x] Convert `src/Modules/Family/StateDropdownComponent.js` → `StateDropdownComponent.tsx`

### Task 3.5: Footer Module ✅

-   [x] Convert `src/Modules/Footer/FooterComponent.js` → `FooterComponent.tsx`
-   [x] Convert `src/Modules/Footer/FooterContainer.js` → `FooterContainer.tsx`

### Task 3.6: General Module ✅

-   [x] Convert `src/Modules/General/BackButtonComponent.js` → `BackButtonComponent.tsx`
-   [x] Convert `src/Modules/General/BoxComponent.js` → `BoxComponent.tsx`
-   [x] Convert `src/Modules/General/ButtonComponent.js` → `ButtonComponent.tsx`
-   [x] Convert `src/Modules/General/EligibilityModalComponent.js` → `EligibilityModalComponent.tsx`
-   [x] Convert `src/Modules/General/ErrorComponent.js` → `ErrorComponent.tsx`
-   [x] Convert `src/Modules/General/FilterComponent.js` → `FilterComponent.tsx`
-   [x] Convert `src/Modules/General/FoodbankTextComponent.js` → `FoodbankTextComponent.tsx`
-   [x] Convert `src/Modules/General/HouseHoldEligibilityComponent.js` → `HouseHoldEligibilityComponent.tsx`
-   [x] Convert `src/Modules/General/LogoComponent.js` → `LogoComponent.tsx`
-   [x] Convert `src/Modules/General/MainHeadingComponent.js` → `MainHeadingComponent.tsx`
-   [x] Convert `src/Modules/General/NavigationBtnComponent.js` → `NavigationBtnComponent.tsx`
-   [x] Convert `src/Modules/General/SearchComponent.js` → `SearchComponent.tsx`
-   [x] Convert `src/Modules/General/SpinnerComponent.js` → `SpinnerComponent.tsx`
-   [x] Convert `src/Modules/General/TimeDateComponent.js` → `TimeDateComponent.tsx`
-   [x] Convert `src/Modules/General/WrapperComponent.js` → `WrapperComponent.tsx`

### Task 3.7: Header Module ✅

-   [x] Convert `src/Modules/Header/HeaderComponent.js` → `HeaderComponent.tsx`
-   [x] Convert `src/Modules/Header/HeaderContainer.js` → `HeaderContainer.tsx`
-   [x] Convert `src/Modules/Header/HeaderDataComponent.js` → `HeaderDataComponent.tsx`

### Task 3.8: Home Module ✅

-   [x] Convert `src/Modules/Home/EventNearByComponent.js` → `EventNearByComponent.tsx`
-   [x] Convert `src/Modules/Home/HomeContainer.js` → `HomeContainer.tsx`
-   [x] Convert `src/Modules/Home/LocalFoodBankComponent.js` → `LocalFoodBankComponent.tsx`
-   [x] Convert `src/Modules/Home/UsersRegistrations.js` → `UsersRegistrations.tsx`
-   [x] Convert `src/Modules/Home/YourPantriesComponent.js` → `YourPantriesComponent.tsx`

### Task 3.9: Localization Module ✅

-   [x] Convert `src/Modules/Localization/countryListComponent.js` → `countryListComponent.tsx`
-   [x] Convert `src/Modules/Localization/LocalizationComponent.js` → `LocalizationComponent.tsx`

### Task 3.10: Notifications Module ✅

-   [x] Convert `src/Modules/Notifications/NotifyToastComponent.js` → `NotifyToastComponent.tsx`

### Task 3.11: Policies Module ✅

-   [x] Convert `src/Modules/Policies/PrivacyComponent.js` → `PrivacyComponent.tsx`
-   [x] Convert `src/Modules/Policies/TermsComponent.js` → `TermsComponent.tsx`

### Task 3.12: Registration Module ✅

-   [x] Convert `src/Modules/Registration/QRCodeComponent.js` → `QRCodeComponent.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationComponent.js` → `RegistrationComponent.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationConfirmComponent.js` → `RegistrationConfirmComponent.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationContainer.js` → `RegistrationContainer.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationEventDetailsContainer.js` → `RegistrationEventDetailsContainer.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationHeaderComponent.js` → `RegistrationHeaderComponent.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationTextComponent.js` → `RegistrationTextComponent.tsx`
-   [x] Convert `src/Modules/Registration/RegistrationTextInfoComponent.js` → `RegistrationTextInfoComponent.tsx`

### Task 3.13: Sign-In Module ✅

-   [x] Convert `src/Modules/Sign-In/SignInContainer.js` → `SignInContainer.tsx`
-   [x] Convert `src/Modules/Sign-In/SignInFormComponent.js` → `SignInFormComponent.tsx`

### Task 3.14: Static Pages Module ✅

-   [x] Convert `src/Modules/StaticPages/AboutFreshTrakComponent.js` → `AboutFreshTrakComponent.tsx`
-   [x] Convert `src/Modules/StaticPages/StaticPageContainer.js` → `StaticPageContainer.tsx`
-   [x] Convert `src/Modules/StaticPages/WorkingWithFreshTrakComponent.js` → `WorkingWithFreshTrakComponent.tsx`

## Phase 4: Testing Migration (IN PROGRESS)

### Task 4.1: Convert Test Files

-   [ ] Convert all test files in `__test__` directories:
    -   [ ] Events module tests
        -   [ ] `src/Modules/Events/__test__/agencyEventListContainer.test.js` → `agencyEventListContainer.test.tsx`
        -   [ ] `src/Modules/Events/__test__/eventCardComponent.test.js` → `eventCardComponent.test.tsx`
        -   [ ] `src/Modules/Events/__test__/eventContainer.test.js` → `eventContainer.test.tsx`
        -   [ ] `src/Modules/Events/__test__/eventListComponent.test.js` → `eventListComponent.test.tsx`
        -   [ ] `src/Modules/Events/__test__/eventListContainer.test.js` → `eventListContainer.test.tsx`
        -   [ ] `src/Modules/Events/__test__/resourceListComponent.test.js` → `resourceListComponent.test.tsx`
    -   [ ] Family module tests
        -   [ ] `src/Modules/Family/__test__/addressComponent.test.js` → `addressComponent.test.tsx`
        -   [ ] `src/Modules/Family/__test__/editFamilyContainer.test.js` → `editFamilyContainer.test.tsx`
        -   [ ] `src/Modules/Family/__test__/eventSlotsModalComponent.test.js` → `eventSlotsModalComponent.test.tsx`
        -   [ ] `src/Modules/Family/__test__/familyContainer.test.js` → `familyContainer.test.tsx`
        -   [ ] `src/Modules/Family/__test__/memberCountFormComponent.test.js` → `memberCountFormComponent.test.tsx`
        -   [ ] `src/Modules/Family/__test__/primaryInfoFormComponent.test.js` → `primaryInfoFormComponent.test.tsx`
    -   [ ] General module tests
        -   [ ] `src/Modules/General/__test__/foodbanktextComponent.test.js` → `foodbanktextComponent.test.tsx`
        -   [ ] `src/Modules/General/__test__/searchComponent.test.js` → `searchComponent.test.tsx`
    -   [ ] Header module tests
        -   [ ] `src/Modules/Header/__test__/headerDataComponent.test.js` → `headerDataComponent.test.tsx`
    -   [ ] Registration module tests
        -   [ ] `src/Modules/Registration/__test__/registrationConfirmComponent.test.js` → `registrationConfirmComponent.test.tsx`
    -   [ ] Sign-In module tests
        -   [ ] `src/Modules/Sign-In/__test__/SignInContainer.test.js` → `SignInContainer.test.tsx`
-   [ ] Update test configurations for TypeScript
-   [ ] Ensure all tests pass after migration

### Task 4.2: Update Test Configuration

-   [ ] Update Jest configuration for TypeScript support
-   [ ] Configure test environment for TypeScript
-   [ ] Update test utilities and mock files
-   [ ] Ensure proper type checking in tests

### Task 4.3: Test Coverage and Quality

-   [ ] Run existing tests to ensure they still pass
-   [ ] Add type annotations to test files
-   [ ] Update test utilities for TypeScript
-   [ ] Verify test coverage remains intact

## Phase 5: Configuration and Build

### Task 5.1: Update Configuration Files

-   [ ] Update `package.json` scripts for TypeScript
-   [ ] Configure webpack/build tools for TypeScript
-   [ ] Update ESLint configuration
-   [ ] Update Prettier configuration if applicable

### Task 5.2: Build and Deployment

-   [ ] Ensure build process works with TypeScript
-   [ ] Update deployment scripts if necessary
-   [ ] Test production build
-   [ ] Update CI/CD pipeline for TypeScript

## Phase 6: Quality Assurance

### Task 6.1: Code Quality

-   [ ] Run TypeScript compiler with strict mode
-   [ ] Fix all type errors
-   [ ] Add proper JSDoc comments where needed
-   [ ] Ensure no `any` types remain (except where absolutely necessary)

### Task 6.2: Performance and Testing

-   [ ] Run full test suite
-   [ ] Performance testing
-   [ ] Browser compatibility testing
-   [ ] User acceptance testing

## Migration Strategy

### Approach

1. **Incremental Migration**: Convert files one by one, starting with core infrastructure
2. **Dual File System**: Keep both .js and .tsx files during transition
3. **Type Safety**: Gradually add types without breaking existing functionality
4. **Testing**: Ensure all tests pass after each conversion

### Risk Mitigation

-   [ ] Create backup branches before major changes
-   [ ] Test each module after conversion
-   [ ] Maintain backward compatibility during transition
-   [ ] Document all type definitions for team reference

### Success Criteria

-   [ ] All components successfully converted to TypeScript
-   [ ] No runtime errors introduced
-   [ ] All tests passing
-   [ ] Build process working correctly
-   [ ] Performance maintained or improved
-   [ ] Code quality improved with proper typing

## Estimated Timeline

-   **Phase 1**: 1-2 days (Setup and infrastructure)
-   **Phase 2**: 2-3 days (Core migration)
-   **Phase 3**: 5-7 days (Component migration)
-   **Phase 4**: 2-3 days (Testing migration)
-   **Phase 5**: 1-2 days (Configuration)
-   **Phase 6**: 2-3 days (QA and fixes)

**Total Estimated Time**: 13-20 days

## Notes

-   This migration preserves all existing functionality
-   No logic changes unless specifically requested
-   Focus on adding type safety without breaking changes
-   Maintain existing file structure and naming conventions
-   Use React.FC for functional components with proper prop interfaces

# Selector Update Summary

This document summarizes the selector updates made to align E2E tests with the actual application implementation.

## Overview

The initial test setup used placeholder `data-testid` attributes that didn't exist in the application. This document tracks what has been updated and what still needs work.

## ✅ Completed Updates

### 1. Login/Authentication Selectors

**File**: `e2e/utils/selectors.ts` - `LoginSelectors`

**Changes**:
- ✅ Email input: Changed from `[data-testid="email-input"]` to `#email` (using `id` attribute)
- ✅ Password input: Changed from `[data-testid="password-input"]` to `#password` (using `id` attribute)
- ✅ Guest button: Updated to use `getByRole('button', { name: /continue as guest/i })` in Page Object
- ✅ Sign In button: Updated to use `getByRole` with text matching
- ✅ Sign Up button: Updated to use `getByRole` with "Create Account" text
- ✅ Confirmation code: Changed to `#code` (using `id` attribute)
- ✅ Error messages: Updated to use `.text-red-600` class selector

**Status**: ✅ Working - Guest login tests passing

### 2. Dashboard Selectors

**File**: `e2e/utils/selectors.ts` - `DashboardSelectors`

**Changes**:
- ✅ Zip code input: Changed from `[data-testid="zip-code-input"]` to `#zip_code` (using `id` attribute)
- ✅ Search button: Changed to `#search-resource` (using `id` attribute)
- ✅ Street input: Added `#street` selector

**Status**: ⚠️ Partially updated - Needs testing

### 3. Registration Selectors

**File**: `e2e/utils/selectors.ts` - `RegistrationSelectors`

**Changes**:
- ✅ First name: Using `[data-testid="first-name-input"], #first_name` (component has data-testid!)
- ✅ Last name: Using `[data-testid="last-name-input"], #last_name` (component has data-testid!)
- ✅ Date of birth: Using `[data-testid="date-of-birth-input"], #date_of_birth` (component has data-testid!)
- ✅ Gender: Using `[data-testid="gender-select"], #gender` (component has data-testid!)
- ✅ Address fields: Using `id` attributes (`#address_line_1`, `#city`, `#state`, `#zip_code`)
- ✅ Contact fields: Using `id` attributes (`#phone`, `#email`)
- ✅ Member counts: Using `id` attributes (`#seniors_in_household`, `#adults_in_household`, `#children_in_household`)
- ✅ Navigation buttons: Using `[data-testid="continue button"]` and `[data-testid="previous button"]` (HouseholdForm has these!)

**Status**: ✅ Updated - Components already have good data-testid coverage

### 4. URL Constants

**File**: `e2e/utils/constants.ts` - `TEST_URLS`

**Changes**:
- ✅ Updated to match actual `RENDER_URL` constants from `src/Utils/Urls.js`
- ✅ Added registration form URL: `/register/form`
- ✅ Added registration event details URL: `/register/event`
- ✅ Added registration confirm URL: `/register/confirm`
- ✅ Updated events URL to: `/events/list`

**Status**: ✅ Complete

### 5. Page Object Methods

**Files**: `e2e/pages/LoginPage.ts`, `e2e/pages/DashboardPage.ts`

**Changes**:
- ✅ Updated `continueAsGuest()` to use `getByRole` for better reliability
- ✅ Updated `signIn()` to use `getByRole` for buttons
- ✅ Updated `signUp()` to use correct field selectors
- ✅ Updated `searchEvents()` to handle auto-submit behavior

**Status**: ✅ Updated

## ⚠️ Needs Testing/Updates

### 1. Authentication Tests

**Issues**:
- Login tests timing out - likely need valid test credentials or mock authentication
- Sign up tests failing - need to verify confirmation flow
- Logout tests failing - need to check logout implementation

**Action Items**:
- [ ] Set up test user credentials in test environment
- [ ] Mock authentication for tests that don't need real auth
- [ ] Verify logout functionality works correctly

### 2. Events Selectors

**File**: `e2e/utils/selectors.ts` - `EventsSelectors`

**Status**: ⚠️ Needs verification
- Event list selector may need updating
- Event card selectors need to match actual implementation
- Filter selectors need checking

**Action Items**:
- [ ] Check `EventCardComponent.tsx` for available selectors
- [ ] Update event list and card selectors
- [ ] Test event browsing tests

### 3. Family Selectors

**File**: `e2e/utils/selectors.ts` - `FamilySelectors`

**Status**: ⚠️ Needs verification
- Family member list selector
- Add/edit/delete button selectors

**Action Items**:
- [ ] Check `FamilyContainer.tsx` for available selectors
- [ ] Update family selectors
- [ ] Test family management tests

### 4. Account Selectors

**File**: `e2e/utils/selectors.ts` - `AccountSelectors`

**Status**: ⚠️ Needs verification
- Account info display
- Edit and logout buttons

**Action Items**:
- [ ] Check `AccountPage.tsx` for available selectors
- [ ] Update account selectors
- [ ] Test account tests

## 📋 Components with Good data-testid Coverage

These components already have `data-testid` attributes and work well:

1. ✅ **PrimaryInfoFormComponent** - Has data-testid for all inputs
2. ✅ **AddressComponent** - Has data-testid for address fields
3. ✅ **ContactInformationComponent** - Has data-testid for contact fields
4. ✅ **HouseholdForm** - Has data-testid for navigation buttons
5. ✅ **MemberCountFormComponent** - Has data-testid for count inputs

## 📋 Components Needing data-testid

These components should have `data-testid` added (see `e2e/ADDING_DATA_TESTID_GUIDE.md`):

1. ⚠️ **SignInFormComponent** - Needs data-testid for inputs and buttons
2. ⚠️ **SignUpFormComponent** - Needs data-testid for all form fields
3. ⚠️ **SearchComponent** - Has `id` but could add data-testid for consistency
4. ⚠️ **EventCardComponent** - Needs data-testid for event cards
5. ⚠️ **FamilyContainer** - Needs data-testid for family member list
6. ⚠️ **AccountPage** - Needs data-testid for account elements

## 🎯 Priority Actions

### High Priority (Blocking Tests)

1. **Fix Authentication Tests**
   - Set up test credentials or mocks
   - Verify login/logout flow works
   - Fix sign up confirmation flow

2. **Update Events Selectors**
   - Check EventCardComponent implementation
   - Update event list and card selectors
   - Test event browsing

### Medium Priority

3. **Add data-testid to Login Components**
   - SignInFormComponent
   - SignUpFormComponent
   - ConfirmSignUpFormComponent

4. **Update Family/Account Selectors**
   - Check actual component implementations
   - Update selectors accordingly

### Low Priority

5. **Add data-testid for Consistency**
   - SearchComponent (already has `id`, but data-testid would be better)
   - EventCardComponent
   - Other components as needed

## 📝 Testing Checklist

After updating selectors, test:

- [ ] Guest login flow
- [ ] User login flow (with valid credentials)
- [ ] User sign up flow
- [ ] Dashboard search
- [ ] Event browsing
- [ ] Registration flow
- [ ] Family management
- [ ] Account page

## 🔍 How to Find Selectors

1. **Use Playwright Inspector**:
   ```bash
   npm run test:e2e:codegen
   ```

2. **Check Component Files**:
   - Look for `id` attributes
   - Look for `data-testid` attributes
   - Check `name` attributes for form fields

3. **Use Browser DevTools**:
   - Inspect elements in running app
   - Check what attributes are available

## 📚 Related Documentation

- `e2e/ADDING_DATA_TESTID_GUIDE.md` - Guide for adding data-testid attributes
- `e2e/TEST_WRITING_GUIDELINES.md` - Selector strategy guidelines
- `e2e/PAGE_OBJECT_PATTERN.md` - Page Object Model guide
- `e2e/TROUBLESHOOTING.md` - Common issues and solutions

## 🎉 Success Metrics

- ✅ Guest login tests: **3/3 passing**
- ⚠️ User login tests: **1/4 passing** (needs auth setup)
- ⚠️ Sign up tests: **1/4 passing** (needs auth setup)
- ⚠️ Other tests: **Not yet tested**

## Next Steps

1. Set up authentication for tests (test user or mocks)
2. Run full test suite to identify remaining issues
3. Update selectors based on test failures
4. Add data-testid attributes to components (see guide)
5. Continue iterating until all tests pass


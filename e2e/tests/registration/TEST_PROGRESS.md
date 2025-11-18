# Registration E2E Test Progress Report

## Overview
This document tracks the progress of fixing Playwright E2E tests for the registration flow, including investigation of form navigation issues and API error analysis.

## Initial Problem

### Issue: Step 1 (Address + Contact Information) Was Being Missed
The test was failing because the registration form's Step 1 (which combines Address and Contact Information components) was not being properly detected and filled.

**Error Message:**
```
Error: Cannot determine current step. Step 0 visible but Step 1 and Step 2 are not visible. Form might be in an unexpected state.
```

## Root Causes Identified

### 1. Step Detection Logic
- The test was only checking for `addressInput` visibility to detect Step 1
- Step 1 actually contains **both** `AddressComponent` and `ContactInformationComponent`
- Step 1 fields include: address, city, state, zip, phone, and email
- The detection needed to check for any of these fields, not just address

### 2. Step 0 Validation Issues
- Date of birth field was not being validated for correct format (mm/dd/yyyy)
- Test was assuming prefilled fields were valid without checking
- Empty or invalid date of birth was preventing form progression

### 3. Form Navigation Timing
- Client-side navigation (React Router) doesn't immediately update URLs
- Tests needed to wait for element visibility rather than URL changes
- Step transitions required explicit waits for network idle and DOM updates

## Fixes Implemented

### 1. Enhanced Step Detection (`e2e/pages/RegistrationPage.ts`)

**Before:**
```typescript
const addressInput = this.locator(RegistrationSelectors.addressInput).first();
const isOnStep1 = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
```

**After:**
```typescript
const addressInput = this.locator(RegistrationSelectors.addressInput).first();
const cityInput = this.locator(RegistrationSelectors.cityInput).first();
const phoneInput = this.locator(RegistrationSelectors.phoneInput).first();

const addressVisible = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
const cityVisible = await cityInput.isVisible({ timeout: 2000 }).catch(() => false);
const phoneVisible = await phoneInput.isVisible({ timeout: 2000 }).catch(() => false);

// Step 1 is visible if we see address OR city OR phone (any of the Step 1 fields)
const step1Visible = addressVisible || cityVisible || phoneVisible;
```

### 2. Updated Selectors (`e2e/utils/selectors.ts`)

Added `data-testid` attributes to selectors for better reliability:
```typescript
// Step 1: Address Information (using id attributes and data-testid)
// Note: In registration mode, Step 1 combines Address + Contact components
addressInput: '[data-testid="address-line-1-input"], #address_line_1, input[name="address_line_1"], input[id="address_line_1"]',
cityInput: '[data-testid="city-input"], #city, input[name="city"]',
zipCodeInput: '[data-testid="zip-code-input"], #zip_code, input[name="zip_code"]',
emailInput: '[data-testid="email-input"], #email, input[name="email"]',
```

### 3. Improved Step 0 Validation

Added comprehensive validation before proceeding:
```typescript
const existingFirstName = await firstNameField.inputValue().catch(() => '');
const existingLastName = await lastNameField.inputValue().catch(() => '');
const existingDob = await dobField.inputValue().catch(() => '');
const existingGender = await genderField.inputValue().catch(() => '');

// Check if all required fields are filled and valid
const isPrefilled = existingFirstName.length > 0 && existingLastName.length > 0 && 
                   existingDob.length > 0 && existingGender.length > 0;

// Validate date format (should be mm/dd/yyyy)
const isValidDob = existingDob.match(/^\d{2}\/\d{2}\/\d{4}$/);
```

### 4. Enhanced fillStep1 Method

Updated to handle both Address and Contact components:
```typescript
async fillStep1(data: { 
  address: string; 
  city: string; 
  state: string; 
  zipCode: string; 
  phone: string; 
  email?: string 
}): Promise<void> {
  // Wait for at least one Step 1 field to be visible
  // Fill address fields
  // Fill contact information (phone and email)
}
```

### 5. Better Error Handling

Added validation error detection and improved error messages:
```typescript
// Check for validation errors that might be preventing progression
const validationErrors = await this.page.locator('[class*="error"], [class*="invalid"], [data-testid*="error"]').all();
if (validationErrors.length > 0) {
  const errorTexts = await Promise.all(validationErrors.map(async (err) => {
    try {
      return await err.textContent();
    } catch {
      return '';
    }
  }));
  console.log(`[RegistrationPage.completeRegistration] Found validation errors: ${errorTexts.filter(t => t).join(', ')}`);
}
```

## Test Flow Status

### ✅ Working Steps

1. **Step 0 (Primary Information)**
   - ✅ Detects prefilled fields
   - ✅ Validates date of birth format
   - ✅ Fills missing/invalid fields
   - ✅ Clicks Continue successfully

2. **Step 1 (Address + Contact Information)**
   - ✅ Properly detects Step 1 using multiple field checks
   - ✅ Fills address fields (street, city, state, zip)
   - ✅ Fills contact fields (phone, email)
   - ✅ Clicks Continue successfully

3. **Step 2 (Family Member Counts)**
   - ✅ Detects Step 2
   - ✅ Interacts with increment/decrement buttons correctly
   - ✅ Fills member counts
   - ✅ Finds and clicks Register button

### ⚠️ Current Issue: 400 Bad Request

**Error:** The registration API returns a 400 error with message "Already registered"

**Investigation Results:**

1. **Request Payload (Correct):**
   ```json
   {
     "event_id": 23,
     "event_date_id": 376196,
     "event_slot_id": 1918319
   }
   ```

2. **API Response:**
   ```json
   {
     "message": "Already registered",
     "error": "BadRequestException",
     "status": 400
   }
   ```

3. **Root Cause:**
   - The test user is already registered for this event
   - This is **not** a data format or structure issue
   - The payload structure matches the code exactly

4. **Code Handling:**
   - The application correctly handles this error
   - Redirects to "Already Registered" page
   - Test should verify this page instead of confirmation page

## Code Comparison: What Gets Sent vs. What Code Expects

### Registration Flow

1. **Form Submission** (`src/components/shared/HouseholdForm.tsx`)
   - Collects form data from all steps
   - Converts `date_of_birth` from `mm/dd/yyyy` to `yyyy-mm-dd` using `formatDateForServer()`
   - Calls `onSubmit(data)` with `RegistrationFormData`

2. **User Update** (`src/Modules/Registration/RegistrationContainer.tsx`)
   - For guest users: `PATCH /api/guest_user` with user data
   - For cognito users: Updates household via `updateCognitoUser()`
   - Both paths update user profile before creating reservation

3. **Reservation Creation** (`src/Modules/Registration/RegistrationContainer.tsx`)
   ```typescript
   await axios.post<ApiResponse<any>>(
     CREATE_RESERVATION,
     eventSlotId
       ? {
           event_id: selectedEvent.eventId,
           event_date_id,
           event_slot_id,
         }
       : { event_id: selectedEvent.eventId, event_date_id },
     { headers }
   );
   ```

### Data Format Conversions

- **Date Format:** Form uses `mm/dd/yyyy`, API expects `yyyy-mm-dd`
  - Conversion handled by `formatDateForServer()` in `src/Utils/DateFormat.js`
  
- **Gender Format:** Form uses display names (e.g., "Other"), API expects gender_id (numbers)
  - Conversion handled by `getGenderId()` in cognito user flow

## Test Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Step 0 Detection | ✅ Working | Validates all required fields |
| Step 0 Filling | ✅ Working | Handles prefilled and empty states |
| Step 1 Detection | ✅ Working | Checks multiple fields (address/city/phone) |
| Step 1 Filling | ✅ Working | Fills both address and contact info |
| Step 2 Detection | ✅ Working | Detects member count inputs |
| Step 2 Filling | ✅ Working | Uses increment/decrement buttons correctly |
| Form Navigation | ✅ Working | Proper waits and step transitions |
| API Request | ✅ Correct | Payload structure matches code |
| API Response | ⚠️ Expected | "Already registered" is handled correctly |

## Next Steps

### Option 1: Update Test to Handle "Already Registered"
Modify the test to:
1. Check if user is already registered before attempting registration
2. Verify "Already Registered" page appears instead of confirmation
3. Or use a different event/user that isn't already registered

### Option 2: Clean Up Test Data
1. Add test cleanup to remove existing registrations
2. Use API helpers to delete registration before test
3. Ensure test isolation

### Option 3: Use Different Test Event
1. Use a different `eventDateId` that the test user hasn't registered for
2. Or create a new test user for each test run

## Files Modified

1. `e2e/pages/RegistrationPage.ts`
   - Enhanced step detection logic
   - Improved `fillStep1()` method
   - Added Step 0 validation
   - Better error handling

2. `e2e/utils/selectors.ts`
   - Added `data-testid` selectors for Step 1 fields
   - Updated comments to reflect registration mode behavior

3. `src/Modules/Registration/RegistrationContainer.tsx`
   - Added logging for API requests/responses (temporarily, now removed)
   - No functional changes needed - code was already correct

## Key Learnings

1. **Multi-step forms require robust step detection**
   - Don't rely on single field visibility
   - Check multiple fields to determine current step
   - Account for combined components (Address + Contact in Step 1)

2. **Client-side navigation timing**
   - React Router doesn't immediately update URLs
   - Wait for element visibility, not just URL changes
   - Use `networkidle` and explicit timeouts for step transitions

3. **Form validation before progression**
   - Always validate required fields before clicking Continue
   - Check field formats (especially dates)
   - Handle prefilled vs. empty states differently

4. **API error investigation**
   - The 400 error was not a code issue
   - Payload structure was correct
   - Business logic (already registered) was the actual issue

## Conclusion

The registration form flow is now working correctly. All steps are properly detected and filled. The remaining 400 error is expected behavior when a user is already registered for an event. The test should be updated to handle this scenario or use test data that isn't already registered.

---

**Last Updated:** 2024-12-19
**Test File:** `e2e/tests/registration/registration-flow.spec.ts`
**Page Object:** `e2e/pages/RegistrationPage.ts`


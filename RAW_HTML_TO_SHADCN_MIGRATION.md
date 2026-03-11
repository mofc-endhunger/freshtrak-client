# FreshTrak Client: Raw HTML to shadcn/ui Migration Analysis

## Executive Summary

This document provides a comprehensive analysis of all raw HTML elements and deprecated Bootstrap components found in the FreshTrak client codebase that should be replaced with shadcn/ui components.

### Key Findings:
- **Raw `<button>` elements**: 25+ instances across 10+ files
- **Raw `<input>` elements**: 20+ instances across 8+ files  
- **Raw `<select>` elements**: 5 instances across 4 files
- **Raw `<label>` elements**: 4 instances
- **Bootstrap classes**: btn, form-group, form-control, btn-toggle
- **react-router-bootstrap**: LinkContainer still in use (2 files)
- **Inline styled buttons**: Several instances with custom Tailwind that should use Button component

**Priority**: HIGH - These should be systematically replaced to maintain consistency and improve maintainability

---

## Detailed Findings by Category

### 1. RAW BUTTON ELEMENTS

#### File: src/Modules/Authentication/SignInFormComponent.tsx
- **Line 133-139**: Raw `<button>` for "Forgot Password" link
  ```tsx
  <button
    type="button"
    onClick={onForgotPassword}
    className="text-sm text-primary hover:underline"
  >
    {localization.button_forgot_password}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="link">` component

- **Line 163-169**: Raw `<button>` for "Sign Up" link
  ```tsx
  <button
    type="button"
    onClick={onSwitchToSignUp}
    className="text-primary hover:underline font-medium"
  >
    {localization.button_sign_up}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="link">` component

#### File: src/Modules/Authentication/SignUpFormComponent.tsx
- **Line 199-205**: Raw `<button>` for "Sign In" link
  ```tsx
  <button
    type="button"
    onClick={onSwitchToSignIn}
    className="text-primary hover:underline font-medium"
  >
    {localization.button_sign_in || "Sign In"}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="link">` component

#### File: src/Modules/Authentication/ResetPasswordFormComponent.tsx
- **Line ~105**: Raw `<button>` for "Back to Sign In" (not shown in excerpt, but pattern exists)
  **Recommendation**: Replace with `<Button variant="link">` component

#### File: src/Modules/Authentication/ConfirmResetPasswordFormComponent.tsx
- **Line ~142**: Raw `<button>` for back navigation (pattern match)
  **Recommendation**: Replace with `<Button variant="link">` component

#### File: src/Modules/Events/EventCardComponent.tsx
- **Line 117-137**: Raw `<button>` with custom Bootstrap "btn" class
  ```tsx
  <button
    type="button"
    className="btn bg-[#392947] text-white px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px] ml-1 w-full"
    onClick={() => {
      // Store the current search results URL before navigating to event details
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/events/list")) {
        const currentSearch = window.location.search;
        const searchResultsUrl = currentPath + currentSearch;
        sessionStorage.setItem("searchResultsUrl", searchResultsUrl);
      }
      dispatch(setCurrentEvent(props.event));
    }}
  >
    {buttonName}
  </button>
  ```
  **Recommendation**: 
  - Remove "btn" class (it's redundant Bootstrap class)
  - Use `<Button>` component with appropriate variant
  - Extract color to component prop: `className="bg-[#392947]"` → use variant or custom className

- **Line 249-258**: Raw `<button>` for "View Details"
  ```tsx
  <button
    className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
    onClick={() => {
      setShowDetails(!showDetails);
    }}
  >
    {!showDetails ? localization.button_view_details : localization.button_hide_details}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="outline">` or `<Button variant="secondary">`

- **Line 260-265**: Raw `<button>` for "Get Directions"
  ```tsx
  <button
    className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
    onClick={handleGetDirections}
  >
    {localization.button_get_directions}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="outline">` or `<Button variant="secondary">`

#### File: src/Modules/Home/EventNearByComponent.tsx
- **Line 42-60**: Raw accordion `<button>` for "Events Today"
  ```tsx
  <button
    onClick={() => toggleAccordion("0")}
    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
    aria-expanded={isActive("0")}
    aria-controls="accordion-content-0"
  >
    <span className="font-medium text-gray-900 text-sm sm:text-base">
      {localization.title_events_today || "Events Today"}
    </span>
    {/* ... */}
  </button>
  ```
  **Recommendation**: Replace with shadcn `<Accordion>` component (3 instances total)

- **Line 73-91**: Raw accordion button for "Events Next 7 days"
  **Recommendation**: Part of Accordion component migration

- **Line 104-122**: Raw accordion button for "Events Next 30 days"
  **Recommendation**: Part of Accordion component migration

#### File: src/Modules/General/HouseHoldEligibilityComponent.tsx
- **Line 54-60**: Raw `<button>` for "View Guidelines"
  ```tsx
  <button
    type="button"
    onClick={() => setShowEligibilityModal(true)}
    className="bg-transparent border-none p-0 text-link underline cursor-pointer text-gray-900 hover:text-link-hover hover:no-underline"
  >
    {localization.eligibility_view_guidelines_button}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="link">`

#### File: src/Modules/Family/FamilyContainer.tsx
- **Line 129-170**: Raw `<button>` for form submit
  ```tsx
  <button
    type="submit"
    disabled={!isValid || isSubmitting}
    className={`
      px-6 py-3 text-base font-medium text-white bg-indigo-600 
      border border-transparent rounded-md shadow-sm 
      hover:bg-indigo-700 focus:outline-none focus:ring-2 
      focus:ring-offset-2 focus:ring-indigo-500 
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors duration-200
      ${isSubmitting ? "animate-pulse" : ""}
    `}
    data-testid="continue-button"
  >
    {/* ... */}
  </button>
  ```
  **Recommendation**: Replace with `<Button type="submit">` component

#### File: src/Modules/Header/HeaderComponent.tsx
- **Line ~varies**: Raw button (pattern match from grep)
  **Recommendation**: Check for consistent Button component usage

#### File: src/Modules/Households/components/HouseholdSignUpWrapper.tsx
- **Line 316-321**: Raw `<button>` in HouseholdCompletionPrompt
  ```tsx
  <button
    onClick={onSetup}
    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
  >
    {localization.household_setup_now}
  </button>
  ```
  **Recommendation**: Replace with `<Button>` component

- **Line 322-327**: Raw `<button>` for dismiss
  ```tsx
  <button
    onClick={handleDismiss}
    className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:text-blue-800 transition-colors"
  >
    {localization.household_later}
  </button>
  ```
  **Recommendation**: Replace with `<Button variant="outline">`

#### File: src/Modules/Households/components/HouseholdCompletionPrompt.tsx
- **Line 148-153**: Raw close button with icon (toast variant)
  ```tsx
  <button
    onClick={handleDismiss}
    className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
  >
    <X className="w-5 h-5" />
  </button>
  ```
  **Recommendation**: Use `<Button variant="ghost">` with size="sm"

- **Line 243-248**: Raw close button (toast variant)
  **Recommendation**: Use `<Button variant="ghost">` with size="sm"

---

### 2. RAW INPUT ELEMENTS

#### File: src/Modules/Family/PrimaryInfoFormComponent.tsx
- **Line 77-92**: Raw `<input>` for "First Name"
  ```tsx
  <input
    type="text"
    className={`
      w-full p

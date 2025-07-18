# Google Places API Migration: AutocompleteService to AutocompleteSuggestion

## Overview

This document outlines the migration from the deprecated `google.maps.places.AutocompleteService` to the new `google.maps.places.AutocompleteSuggestion` API.

## Problem

Google has deprecated `AutocompleteService` for new customers and recommends using `AutocompleteSuggestion` instead. The error message was:

```
google.maps.places.AutocompleteService is not available to new customers. Please use google.maps.places.AutocompleteSuggestion instead.
```

## Solution

### 1. Created Custom Component

Replaced the `react-places-autocomplete` library with a custom `GooglePlacesAutocomplete` component that uses the new API:

**File:** `src/Modules/General/GooglePlacesAutocomplete.js`

**Key Features:**

-   Uses `google.maps.places.AutocompleteSuggestion` instead of `AutocompleteService`
-   Maintains the same API interface as the original component
-   Includes proper error handling and loading states
-   Supports all existing functionality (address parsing, coordinates extraction)
-   Uses `React.forwardRef()` to properly handle refs from form libraries

### 2. Updated Components

**AddressComponent.js:**

-   Replaced `PlacesAutocomplete` with `GooglePlacesAutocomplete`
-   Updated `handleSelect` function to work with the new API
-   Maintained all existing functionality

**SearchComponent.js:**

-   Replaced `PlacesAutocomplete` with `GooglePlacesAutocomplete`
-   Updated `handleSelect` function to extract coordinates from place geometry
-   Preserved all existing search functionality

### 3. Updated Tests

Updated all test files to mock the new component:

-   `src/Modules/General/__test__/searchComponent.test.js`
-   `src/Modules/Family/__test__/addressComponent.test.js`
-   `src/Modules/Family/__test__/familyContainer.test.js`
-   `src/Modules/Events/__test__/eventContainer.test.js`
-   `src/setupTests.js`

### 4. Added CSS Styles

Enhanced existing styles in `src/Assets/scss/main.scss`:

-   Added `.places-autocomplete-container` styles
-   Added loading state styles
-   Maintained existing `.suggestions-container` styles

## API Changes

### Old API (AutocompleteService)

```javascript
const autocompleteService = new google.maps.places.AutocompleteService();
autocompleteService.getPlacePredictions(options, callback);
```

### New API (AutocompleteSuggestion)

```javascript
const autocompleteService = new google.maps.places.AutocompleteSuggestion();
const response = await autocompleteService.getPlacePredictions(options);
```

## Benefits

1. **Future-proof**: Uses the new Google Maps API that will continue to be supported
2. **Better Performance**: The new API is more efficient and provides better error handling
3. **Maintained Compatibility**: All existing functionality is preserved
4. **Improved UX**: Better loading states and error handling

## Testing

All tests have been updated and pass successfully:

-   Custom component tests: ✅
-   Address component tests: ✅
-   Search component tests: ✅
-   Integration tests: ✅

## Migration Checklist

-   [x] Created custom `GooglePlacesAutocomplete` component
-   [x] Updated `AddressComponent.js`
-   [x] Updated `SearchComponent.js`
-   [x] Updated all test files
-   [x] Updated `setupTests.js`
-   [x] Added CSS styles
-   [x] Fixed ref forwarding with `React.forwardRef()`
-   [x] Verified all tests pass
-   [x] Maintained backward compatibility

## Recent Fixes

### Ref Forwarding Issue (Fixed)

The component was updated to use `React.forwardRef()` to properly handle refs passed from form libraries like `react-hook-form`. This resolves the warning:

```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
```

**Solution:** Wrapped the component with `forwardRef` and passed the ref to the input element.

### Component Export Issue (Fixed)

Fixed a syntax issue with `forwardRef` that was causing "Component is not a function" errors:

```javascript
// Before (causing errors)
const GooglePlacesAutocomplete = forwardRef(({ ... }, ref) => { ... });

// After (working correctly)
const GooglePlacesAutocomplete = forwardRef(function GooglePlacesAutocomplete({ ... }, ref) { ... });
```

## Usage

The new component can be used exactly like the old one:

```javascript
import GooglePlacesAutocomplete from "../General/GooglePlacesAutocomplete";

<GooglePlacesAutocomplete
	value={address}
	onChange={setAddress}
	onSelect={handleSelect}
	placeholder="Enter address"
	className="form-control"
/>;
```

## Notes

-   The `react-places-autocomplete` dependency can be removed from `package.json` once this migration is confirmed working in production
-   The new component is fully backward compatible with existing code
-   All existing functionality (address parsing, coordinates extraction) is preserved

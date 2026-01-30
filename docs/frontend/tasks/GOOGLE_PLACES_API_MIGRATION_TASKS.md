# Google Places API Migration Tasks

## Reference

-   Google Migration Guide: [https://developers.google.com/maps/documentation/javascript/places-migration-overview](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
-   Autocomplete Migration: [https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete](https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete)
-   Legacy Services Status: [https://developers.google.com/maps/legacy](https://developers.google.com/maps/legacy)

---

## Overview

As of **March 1, 2025**, Google has marked `google.maps.places.AutocompleteService` as "not available to new customers". This migration updates the codebase to use the new `AutocompleteSuggestion` API.

### Why Migrate?

| Concern                    | Details                                                 |
| -------------------------- | ------------------------------------------------------- |
| **New API Keys**           | Keys created after March 2025 cannot use the legacy API |
| **Bug Fixes**              | Only major regressions will be fixed in legacy API      |
| **Future Discontinuation** | Expected with 12 months notice                          |
| **Modern API**             | Promise-based, better error handling, expanded features |

---

## Current Implementation Analysis

### Affected Files

| File                                                            | Usage                           |
| --------------------------------------------------------------- | ------------------------------- |
| `src/Modules/General/GooglePlacesAutocomplete.tsx`              | Main component using legacy API |
| `src/Modules/General/__test__/GooglePlacesAutocomplete.test.js` | Test file (needs update)        |
| `src/Modules/Family/AddressComponent.tsx`                       | Uses GooglePlacesAutocomplete   |
| `src/Modules/General/SearchComponent.tsx`                       | Uses GooglePlacesAutocomplete   |

### Legacy API Usage (Current)

```typescript
// Lines 93-96: Autocomplete Service initialization
autocompleteService.current =
	new window.google.maps.places.AutocompleteService();
sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

// Lines 141-181: getPlacePredictions with callback
autocompleteService.current.getPlacePredictions(request, callback);

// Lines 227-264: PlacesService.getDetails with callback
placesService.getDetails(request, callback);
```

---

## Migration Changes

### API Comparison

| Legacy (Current)                         | New (Target)                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `new AutocompleteService()`              | `AutocompleteSuggestion` (static class)                                  |
| `getPlacePredictions(request, callback)` | `AutocompleteSuggestion.fetchAutocompleteSuggestions(request)` → Promise |
| `new AutocompleteSessionToken()`         | Built-in session handling                                                |
| `new PlacesService(div).getDetails()`    | `Place.fetchFields()` → Promise                                          |
| Callback-based                           | Promise-based (async/await)                                              |
| `place.address_components`               | `place.addressComponents` (camelCase)                                    |

### Response Format Changes

**Legacy Response:**

```typescript
{
	place_id: string;
	description: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	}
}
```

**New Response:**

```typescript
{
	placePrediction: {
		placeId: string;
		text: {
			text: string;
			matches: Array<{ startOffset: number; endOffset: number }>;
		}
		structuredFormat: {
			mainText: {
				text: string;
				matches: Array;
			}
			secondaryText: {
				text: string;
				matches: Array;
			}
		}
	}
}
```

---

## 📋 Task List

### Phase 1: Update Type Definitions ✅

-   [x] **Task 1.1:** Create new TypeScript interfaces for `AutocompleteSuggestion` response
-   [x] **Task 1.2:** Update `GooglePlace` interface for new response format
-   [x] **Task 1.3:** Update `GooglePlaceDetails` interface for new `Place` class format
-   [x] **Task 1.4:** Update global Window interface declaration for new API

### Phase 2: Update GooglePlacesAutocomplete Component ✅

-   [x] **Task 2.1:** Replace `AutocompleteService` initialization with new API detection
-   [x] **Task 2.2:** Convert `getPlacePredictions()` to `fetchAutocompleteSuggestions()` (Promise-based)
-   [x] **Task 2.3:** Update response mapping from new format to component state
-   [x] **Task 2.4:** Replace `PlacesService.getDetails()` with `Place.fetchFields()`
-   [x] **Task 2.5:** Update error handling for Promise-based API
-   [x] **Task 2.6:** Remove `AutocompleteSessionToken` (handled automatically by new API)

### Phase 3: Update Consuming Components ✅

-   [x] **Task 3.1:** Verify `AddressComponent.tsx` works with updated response format
-   [x] **Task 3.2:** Verify `SearchComponent.tsx` works with updated response format
-   [x] **Task 3.3:** Update `handleSelect` callbacks if response structure changed

### Phase 4: Update Tests ✅

-   [x] **Task 4.1:** Update `GooglePlacesAutocomplete.test.js` mocks for new API
-   [x] **Task 4.2:** Add tests for Promise-based API calls
-   [x] **Task 4.3:** Add tests for error handling scenarios

### Phase 5: Cleanup & Testing

-   [x] **Task 5.1:** Remove legacy API code paths
-   [ ] **Task 5.2:** Manual testing of address autocomplete in Family registration
-   [ ] **Task 5.3:** Manual testing of address autocomplete in Search component
-   [ ] **Task 5.4:** Verify Google Cloud Console has "Places API (New)" enabled
-   [ ] **Task 5.5:** Update any inline documentation/comments

---

## 📝 Detailed Implementation Notes

### Task 1.1-1.4: New Type Definitions

```typescript
// New interfaces for AutocompleteSuggestion API
interface AutocompleteSuggestionResponse {
	suggestions: PlacePrediction[];
}

interface PlacePrediction {
	placePrediction: {
		placeId: string;
		text: {
			text: string;
			matches?: Array<{ startOffset: number; endOffset: number }>;
		};
		structuredFormat?: {
			mainText: { text: string };
			secondaryText: { text: string };
		};
	};
}

// Updated Place class response
interface PlaceDetails {
	id: string;
	displayName?: { text: string };
	formattedAddress?: string;
	addressComponents?: Array<{
		longText: string;
		shortText: string;
		types: string[];
	}>;
	location?: {
		lat: () => number;
		lng: () => number;
	};
}

// Updated Window interface
declare global {
	interface Window {
		google: {
			maps: {
				places: {
					AutocompleteSuggestion: {
						fetchAutocompleteSuggestions: (
							request: AutocompleteSuggestionRequest
						) => Promise<AutocompleteSuggestionResponse>;
					};
					Place: new (options: { id: string }) => PlaceInstance;
				};
			};
		};
	}
}
```

### Task 2.2: Convert to fetchAutocompleteSuggestions

**Before (Legacy):**

```typescript
autocompleteService.current.getPlacePredictions(
	request,
	(predictions, status) => {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			setSuggestions(predictions);
		}
	}
);
```

**After (New):**

```typescript
const { suggestions } =
	await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
		{
			input,
			includedPrimaryTypes: ["address"],
		}
	);

// Map to component format
const mapped = suggestions.map((s) => ({
	place_id: s.placePrediction.placeId,
	description: s.placePrediction.text.text,
	structured_formatting: s.placePrediction.structuredFormat
		? {
				main_text: s.placePrediction.structuredFormat.mainText.text,
				secondary_text:
					s.placePrediction.structuredFormat.secondaryText.text,
		  }
		: undefined,
}));

setSuggestions(mapped);
```

### Task 2.4: Convert to Place.fetchFields

**Before (Legacy):**

```typescript
const placesService = new google.maps.places.PlacesService(
  document.createElement("div")
);
placesService.getDetails(
  { placeId: suggestion.place_id, fields: [...] },
  (place, status) => { ... }
);
```

**After (New):**

```typescript
const place = new google.maps.places.Place({ id: suggestion.place_id });
await place.fetchFields({
	fields: [
		"addressComponents",
		"formattedAddress",
		"location",
		"displayName",
	],
});

// Access data directly (note camelCase)
const addressComponents = place.addressComponents;
const formattedAddress = place.formattedAddress;
```

### Task 3.1-3.2: Response Mapping for Consuming Components

The `onSelect` callback in consuming components expects:

```typescript
{
  place_id: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry?: { location: { lat: () => number; lng: () => number } };
}
```

We need to map the new response format to maintain backward compatibility:

```typescript
// Map new format to legacy format for consuming components
const mappedPlace = {
	place_id: place.id,
	address_components: (place.addressComponents || []).map((c) => ({
		long_name: c.longText,
		short_name: c.shortText,
		types: c.types,
	})),
	formatted_address: place.formattedAddress || "",
	geometry: place.location
		? {
				location: {
					lat: () => place.location.lat(),
					lng: () => place.location.lng(),
				},
		  }
		: undefined,
};
```

---

## 🔧 Prerequisites

1. **Enable "Places API (New)"** in Google Cloud Console

    - Navigate to: APIs & Services → Library
    - Search for "Places API (New)"
    - Enable the API

2. **Verify API Key Permissions**
    - Ensure API key has access to both old and new Places API during transition

---

## 📅 Estimated Effort

| Phase     | Tasks  | Estimate      |
| --------- | ------ | ------------- |
| Phase 1   | 4      | 1 hour        |
| Phase 2   | 6      | 2-3 hours     |
| Phase 3   | 3      | 1 hour        |
| Phase 4   | 3      | 1-2 hours     |
| Phase 5   | 5      | 1-2 hours     |
| **Total** | **21** | **6-9 hours** |

---

## 🔄 Files to Modify

| File                                                            | Changes                                 |
| --------------------------------------------------------------- | --------------------------------------- |
| `src/Modules/General/GooglePlacesAutocomplete.tsx`              | Main migration - new API calls, types   |
| `src/Modules/General/__test__/GooglePlacesAutocomplete.test.js` | Update mocks and tests                  |
| `src/Modules/Family/AddressComponent.tsx`                       | Verify compatibility (may need updates) |
| `src/Modules/General/SearchComponent.tsx`                       | Verify compatibility (may need updates) |

---

## ✅ Acceptance Criteria

1. Address autocomplete works with new `AutocompleteSuggestion` API
2. Place details fetched using new `Place.fetchFields()` method
3. All existing functionality preserved (address selection, form population)
4. No console deprecation warnings from Google Maps API
5. All tests pass with updated mocks
6. Works with both existing and new Google API keys
7. No TypeScript errors or warnings

---

## ⚠️ Rollback Plan

If issues arise after deployment:

1. The legacy API still works for existing API keys
2. Code can be reverted to use `AutocompleteService` if needed
3. Google promises 12+ months notice before full discontinuation

---

## 📚 Additional Resources

-   [Place Class Reference](https://developers.google.com/maps/documentation/javascript/reference/place)
-   [AutocompleteSuggestion Reference](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-suggestion)
-   [Migration Code Examples](https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete)

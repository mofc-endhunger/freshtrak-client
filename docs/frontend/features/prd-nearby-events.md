# PRD: Nearby Events on Home Page

## Introduction / Overview

FreshTrak users currently discover food-access events exclusively by entering a zip code on the home page. This creates friction for first-time visitors and users who do not know their zip code off the top of their head. This feature adds a **Nearby Events** section to the home page that automatically surfaces relevant events using the device's GPS location — with no manual input required — when the user grants location permission.

> **Privacy-first design:** The browser's Geolocation API is only invoked on the home page, and only after the standard browser permission prompt. If the user denies permission at any point, the Nearby Events section is silently omitted — no error state is shown and no fallback zip-code request is made on their behalf.

**Problem:** Users landing on the home page must know and type their zip code before seeing any events. Location-aware devices could surface relevant events immediately, reducing the time-to-first-event and improving engagement for new or returning users.

**Goal:** Deliver a low-friction, privacy-respecting "Nearby Events" section on the home page that leverages the browser Geolocation API to fetch and display events close to the user's current location, and that degrades gracefully when permission is withheld.

---

## Goals

1. Request the browser geolocation permission only on the home page, only once per session, and only when the section would be visible (user is not already mid-search).
2. Reverse-geocode the obtained coordinates to a zip code and fetch events using the existing `GET api/agencies?zip_code=<zip>&distance=<miles>` endpoint.
3. Render a **Nearby Events** section above the zip-code search form when location is available, using the existing `EventListComponent` / `EventCardComponent` pipeline.
4. Silently hide the section — no empty state, no error message — when the user denies or dismisses the permission prompt.
5. Localize every user-visible string in the section to all 9 fully-translated languages: `en`, `spa`, `som`, `rus`, `tur`, `ara`, `zho`, `hin`, `nep`.
6. Avoid duplicating infrastructure: reuse `MapUtils.geocodeAddress` / `calculateDistance`, the existing `API_URL.EVENTS_LIST` endpoint, and `EventListComponent`.

---

## User Stories

1. **As a user on the home page**, I want the app to ask for my location so that it can show me food-access events happening near me without me having to type my zip code.
2. **As a user who grants location permission**, I want to see a "Nearby Events" section on the home page, automatically populated with events near my current location, so I can quickly find resources without additional input.
3. **As a user who denies location permission**, I want the home page to look and behave exactly as it did before — no error, no section — so that my decision is respected silently.
4. **As a user on a slow connection**, I want to see a loading indicator while the app is resolving my location and fetching events, so I know the page is working.
5. **As a returning user who previously granted location**, I want the Nearby Events section to appear automatically on subsequent visits without being prompted again, so that the experience is seamless.
6. **As a user speaking a supported language**, I want all labels in the Nearby Events section to appear in my language, so that the feature feels native to my experience.

---

## Functional Requirements

### 1. Geolocation Permission Request

1.1 The app must call `navigator.geolocation.getCurrentPosition()` **once** when the home page mounts, guarded by a feature-availability check (`"geolocation" in navigator`).  
1.2 The permission request must be triggered on **home page mount only** — not on route changes, re-renders, or other pages.  
1.3 The app must **not** silently retry or show any UI encouraging the user to re-enable permissions. The `denied` and `unavailable` states both result in the section being hidden.  
1.4 The browser's native permission prompt is the only permission UI. FreshTrak must not render a custom pre-permission interstitial.  
1.5 A `timeout` of **8 000 ms** and `maximumAge` of **300 000 ms** (5 minutes) must be passed to `getCurrentPosition` to balance freshness and performance on mobile devices.

### 2. Nearby Events Section — Visibility Rules

| State                                           | Section visible? | Loading indicator? |
| ----------------------------------------------- | ---------------- | ------------------ |
| Geolocation not yet resolved                    | Yes              | Yes                |
| Coordinates obtained, events loading            | Yes              | Yes                |
| Coordinates obtained, events loaded (≥ 1 event) | Yes              | No                 |
| Coordinates obtained, events loaded (0 events)  | No               | No                 |
| Permission denied / error / API error           | No               | No                 |
| `navigator.geolocation` unavailable             | No               | No                 |

2.1 The section must only be mounted when geolocation is supported AND the permission result is not yet known to be `denied`/`unavailable`.  
2.2 Once the permission result is known to be `denied` or an error occurs, the section must unmount cleanly — leaving no empty container, heading, or placeholder visible.

### 3. Reverse Geocoding and Event Fetching

3.1 After obtaining `GeolocationCoordinates`, the app must call the existing `geocodeWithNominatim` / Google Geocoder pipeline (exposed via a new exported helper `reverseGeocodeToZip(lat, lng)` in `MapUtils.js`) to resolve the coordinates to a **US zip code**.  
3.2 If reverse geocoding fails or returns no zip, the section must be hidden (same as permission denied — no error displayed to the user).  
3.3 Events must be fetched via `GET api/agencies?zip_code=<zip>&distance=25` (25-mile default radius, matching the "Nearby" semantic intent). This reuses the same `API_URL.EVENTS_LIST` constant used by `HomeContainer` and `EventContainer`.  
3.4 The resolved zip code and fetched agency list must be held in **local component state** — no new Redux slice is required for this feature.  
3.5 A single fetch must occur per page load. There must be no auto-refresh or polling.

### 4. Section Layout and Content

4.1 The section heading must read **"Nearby Events"** (localized per §7).  
4.2 The section must be positioned **above** the zip-code search form in `HomeContainer`.  
4.3 Events must be rendered using the existing `EventListComponent` with `showHeader={false}`, `reservedEvents` passed through from the parent, and `zipCode` set to the resolved zip.  
4.4 The section must display a **loading spinner** (`LoadingSpinner size="medium"`) while geolocation is in progress or while the API request is pending.  
4.5 No custom event card layout or distance badge is required in this iteration. Events are sorted by `estimated_distance` as returned by the API (existing behavior).

### 5. Component Architecture

5.1 A new component **`NearbyEventsSection`** must be created at `src/Modules/Home/NearbyEventsSection.tsx`.  
5.2 A new custom hook **`useGeolocation`** must be created at `src/hooks/useGeolocation.ts`. It must expose:

```ts
interface UseGeolocationResult {
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable' | 'error';
  coordinates: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
}
```

5.3 A new utility function **`reverseGeocodeToZip(lat: number, lng: number): Promise<string | null>`** must be added to `src/Utils/MapUtils.js` (or a co-located `MapUtils.ts` if the file is migrated). It wraps the existing geocoder infrastructure to perform reverse geocoding and extract the postal code from the result.  
5.4 `NearbyEventsSection` must receive `reservedEvents: ReservedEvent[]` as a prop (passed down from `HomeContainer`) so it can forward them to `EventListComponent`.  
5.5 `HomeContainer` must import and render `<NearbyEventsSection reservedEvents={reservedEvents} />` as the first child inside the content area (above the zip-code form).

### 6. Error Handling

6.1 **Permission denied** (`error.code === 1`): Hide the section silently.  
6.2 **Position unavailable** (`error.code === 2`): Hide the section silently.  
6.3 **Timeout** (`error.code === 3`): Hide the section silently.  
6.4 **Reverse geocoding failure**: Hide the section silently.  
6.5 **API fetch failure**: Hide the section silently. Log the error with `console.error`.  
6.6 Under no circumstance must an error message, empty-state illustration, or "location failed" copy be displayed to the user.

### 7. Localization

All new user-visible strings must be added to **all 9 translation blocks** in `src/Modules/Localization/LocalizationComponent.js` (`en`, `spa`, `som`, `rus`, `tur`, `ara`, `zho`, `hin`, `nep`).

#### New Localization Keys

| Key                     | English value                  |
| ----------------------- | ------------------------------ |
| `nearby_events_title`   | `"Nearby Events"`              |
| `nearby_events_loading` | `"Finding events near you..."` |

#### Translations per Language

**`en`**

```js
nearby_events_title: 'Nearby Events',
nearby_events_loading: 'Finding events near you...',
```

**`spa` (Español)**

```js
nearby_events_title: 'Eventos Cercanos',
nearby_events_loading: 'Buscando eventos cerca de ti...',
```

**`som` (Soomaali)**

```js
nearby_events_title: 'Dhacdooyinka Dhow',
nearby_events_loading: 'Raadinta dhacdooyinka ku dhow...',
```

**`rus` (Русский)**

```js
nearby_events_title: 'Ближайшие мероприятия',
nearby_events_loading: 'Поиск мероприятий рядом с вами...',
```

**`tur` (Türkçe)**

```js
nearby_events_title: 'Yakın Etkinlikler',
nearby_events_loading: 'Yakınındaki etkinlikler aranıyor...',
```

**`ara` (العربية)**

```js
nearby_events_title: 'الأحداث القريبة',
nearby_events_loading: 'البحث عن الأحداث بالقرب منك...',
```

**`zho` (中文)**

```js
nearby_events_title: '附近活动',
nearby_events_loading: '正在查找您附近的活动...',
```

**`hin` (हिन्दी)**

```js
nearby_events_title: 'निकटवर्ती कार्यक्रम',
nearby_events_loading: 'आपके पास के कार्यक्रम खोजे जा रहे हैं...',
```

**`nep` (नेपाली)**

```js
nearby_events_title: 'नजिकका कार्यक्रमहरू',
nearby_events_loading: 'तपाईंको नजिकका कार्यक्रमहरू खोज्दै...',
```

### 8. Accessibility

8.1 The section heading (`<h2>`) must use the `nearby_events_title` localization key.  
8.2 The loading state must include `role="status"` and an `aria-label` so screen readers announce when the lookup is in progress.  
8.3 The section must not trap keyboard focus; tab order must flow naturally into the event list once loaded.

---

## Non-Goals (Out of Scope for This Iteration)

- A custom pre-prompt dialog explaining why location is needed before the browser prompt fires.
- Displaying the user's resolved zip code or distance in the section heading.
- Persisting the geolocation result to Redux, localStorage, or any server-side store.
- A user-facing "retry" or "enable location" button.
- Filtering or sorting the nearby results by distance on the client (the API already returns events sorted by `estimated_distance`).
- Replacing the zip-code search form with the GPS result.
- Supporting non-US addresses or international zip formats.
- Saving a preferred radius / distance setting.

---

## Technical Design Notes

### Reverse Geocoding Strategy

The existing `geocodeAddress` in `MapUtils.js` encodes a _forward_ address → coordinates. For _reverse_ geocoding (coordinates → zip), a new `reverseGeocodeToZip` helper must be added:

1. **Google Maps Geocoder (preferred when available):** Call `geocoder.geocode({ location: { lat, lng } })` and extract the `postal_code` component from the result.
2. **Nominatim fallback (non-test envs):** Call `https://nominatim.openstreetmap.org/reverse?format=json&lat=<lat>&lon=<lng>` and read `address.postcode`.
3. Return `null` if neither strategy yields a zip.

### API Distance Parameter

The `GET api/agencies` endpoint already accepts a `distance` query param (used by `EventContainer`). A fixed value of **25 miles** is appropriate for "Nearby Events." This is consistent with the smallest named distance option in the existing EventContainer distance filter and represents a reasonable urban/suburban radius.

### Hook Design

`useGeolocation` must use `useEffect` with an empty dependency array to request position once on mount. It must clean up any pending async operations on unmount using the `isMounted` ref pattern already established in `HomeContainer`.

### Relation to Existing `EventNearByComponent`

`EventNearByComponent` renders the date-bucketed accordion (Today / Next 7 Days / Next 30 Days) for events found via **zip search**. The new `NearbyEventsSection` is a **separate, independent section** above the zip form that shows a flat, non-bucketed event list from GPS. They coexist; the same event may appear in both sections.

---

## File Impact Summary

| File                                                     | Change type | Description                                                                               |
| -------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `src/hooks/useGeolocation.ts`                            | **New**     | Custom hook managing geolocation permission state and coordinates                         |
| `src/Modules/Home/NearbyEventsSection.tsx`               | **New**     | Section component that orchestrates geolocation → reverse geocode → events fetch → render |
| `src/Modules/Home/types/home.types.ts`                   | **Update**  | Add `NearbyEventsSectionProps` type                                                       |
| `src/Utils/MapUtils.js`                                  | **Update**  | Add `reverseGeocodeToZip(lat, lng)` exported helper                                       |
| `src/Modules/Home/HomeContainer.tsx`                     | **Update**  | Import and render `<NearbyEventsSection>` above the zip form                              |
| `src/Modules/Localization/LocalizationComponent.js`      | **Update**  | Add 2 keys × 9 language blocks = 18 new translation entries                               |
| `src/Modules/Home/__test__/NearbyEventsSection.test.tsx` | **New**     | Unit tests for the new section component                                                  |
| `src/hooks/__test__/useGeolocation.test.ts`              | **New**     | Unit tests for the geolocation hook                                                       |

---

## Testing Requirements

### `useGeolocation` hook tests

- Returns `status: "loading"` while position is pending.
- Returns `status: "granted"` and coordinates when `getCurrentPosition` succeeds.
- Returns `status: "denied"` when error code is `1`.
- Returns `status: "unavailable"` when error code is `2`.
- Returns `status: "error"` when error code is `3` (timeout).
- Does not call `getCurrentPosition` when `navigator.geolocation` is unavailable.

### `NearbyEventsSection` component tests

- Renders a loading spinner while `useGeolocation` is in `"loading"` state.
- Renders nothing when `useGeolocation` returns `"denied"`.
- Renders nothing when `useGeolocation` returns `"unavailable"` or `"error"`.
- Renders section heading (`nearby_events_title`) when events are loaded.
- Renders `EventListComponent` with correct props when events are available.
- Renders nothing (no heading) when API returns zero events.
- Calls `reverseGeocodeToZip` with the resolved coordinates.
- Does not render the section if reverse geocoding returns `null`.

### `HomeContainer` integration tests

- Renders `NearbyEventsSection` as the first section inside the content area.
- `NearbyEventsSection` receives `reservedEvents` prop from `HomeContainer`.

---

## Acceptance Criteria

| #     | Criterion                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | When a user on the home page grants location permission, a "Nearby Events" section appears above the zip-code form with events from within 25 miles. |
| AC-2  | When a user denies location permission, no Nearby Events section, heading, spinner, or error copy is visible anywhere on the page.                   |
| AC-3  | A loading spinner is visible while the geolocation request and/or event API request is in progress.                                                  |
| AC-4  | If the location resolves but no events are within 25 miles, the section is hidden entirely.                                                          |
| AC-5  | All text in the Nearby Events section is rendered in the user's selected language for all 9 supported languages.                                     |
| AC-6  | Switching the app language updates the Nearby Events section heading immediately without re-fetching.                                                |
| AC-7  | The section does not appear in browsers where `navigator.geolocation` is unavailable.                                                                |
| AC-8  | All unit tests for `useGeolocation` and `NearbyEventsSection` pass with no TypeScript errors.                                                        |
| AC-9  | The zip-code search form and existing `EventNearByComponent` continue to function independently and are unaffected by the Nearby Events feature.     |
| AC-10 | No location data (coordinates or resolved zip) is persisted to localStorage, Redux, or any external service.                                         |

---

## Open Questions

| #    | Question                                                                                                                                               | Owner             | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------ |
| OQ-1 | Should the default 25-mile radius be configurable via a feature flag or environment variable for different deployment environments?                    | Product / Backend | Open   |
| OQ-2 | Should the Nearby Events section be hidden when the user has already performed a manual zip-code search (to avoid duplication)?                        | Product           | Open   |
| OQ-3 | Does the backend `api/agencies` endpoint support a lat/lng query parameter directly, which would eliminate the need for client-side reverse geocoding? | Backend           | Open   |
| OQ-4 | Should a pre-permission explainer ("We'd like to use your location to show nearby events") appear before the browser prompt fires?                     | Design / Product  | Open   |
| OQ-5 | What is the desired behavior on iOS Safari where the geolocation permission is per-session and not persisted between page loads?                       | Product           | Open   |

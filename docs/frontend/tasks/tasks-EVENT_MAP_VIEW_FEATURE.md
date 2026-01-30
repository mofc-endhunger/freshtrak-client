# Event Map View Feature Tasks

## Overview

Add a hybrid map+list view to event search results. When users toggle to "list" view, they will see a map on the left showing all events with numbered markers and a search radius circle, alongside a scrollable list of event cards on the right. Grid view remains unchanged.

## Relevant Files

-   `src/Modules/Events/EventListComponent.tsx` - Main event list component with view toggle
-   `src/Modules/Events/EventCardComponent.tsx` - Event card component (tile and list variants)
-   `src/Modules/Events/ViewToggle.tsx` - Grid/list view toggle component
-   `src/Modules/Events/EventContainer.tsx` - Parent container with search params (zipCode, distance)
-   `src/Modules/Events/EventListContainer.tsx` - Wrapper that processes and filters events
-   `src/Modules/General/MiniMapComponent.js` - Existing mini-map component (reference)
-   `src/Modules/General/FullMapModalComponent.js` - Existing full map modal (reference)
-   `src/Utils/MapUtils.js` - Geocoding and map utilities
-   `src/Utils/Constants.js` - Contains DEFAULT_DISTANCE constant

## Tasks

-   [x] 1.0 Create EventMapComponent

    -   [x] 1.1 Create `src/Modules/Events/EventMapComponent.tsx` with TypeScript interfaces
    -   [x] 1.2 Initialize Leaflet map with OpenStreetMap tiles
    -   [x] 1.3 Implement zip code geocoding for map center (using MapUtils)
    -   [x] 1.4 Add circle overlay showing search radius (distance in miles converted to meters)
    -   [x] 1.5 Create numbered markers for each event location (1, 2, 3... matching list order)
    -   [x] 1.6 Implement custom marker styling with numbers using L.divIcon
    -   [x] 1.7 Add marker click handler to show event popup with basic info
    -   [x] 1.8 Handle events with missing coordinates gracefully
    -   [x] 1.9 Add loading and error states for map initialization

-   [x] 2.0 Modify ViewToggle Component

    -   [x] 2.1 Change list view icon from `<List />` to map+list hybrid icon (e.g., `<Map />` or custom)
    -   [x] 2.2 Update aria-label for list button to indicate "Map with list view"
    -   [x] 2.3 Keep grid icon (`<LayoutGrid />`) unchanged

-   [x] 3.0 Update EventListComponent for Hybrid Layout

    -   [x] 3.1 Add EventMapComponent import
    -   [x] 3.2 Pass zipCode and distance props to EventListComponent (from parent)
    -   [x] 3.3 Implement side-by-side layout when viewMode === "list" (map left ~50%, list right ~50%)
    -   [x] 3.4 Keep grid layout unchanged when viewMode === "grid"
    -   [x] 3.5 Add responsive behavior: stack map above list on mobile (< md breakpoint)
    -   [x] 3.6 Make the list section scrollable with fixed height
    -   [x] 3.7 Flatten events array for sequential numbering on map

-   [x] 4.0 Update EventCardComponent

    -   [x] 4.1 Remove "View Map" button from desktop list variant (lines 211-224)
    -   [x] 4.2 Remove "View Map" menu item from mobile dropdown in list variant (lines 314-325)
    -   [x] 4.3 Keep "View Map" functionality in tile/grid variant unchanged
    -   [x] 4.4 Optionally add event number badge to list variant cards (matching map markers)

-   [x] 5.0 Update Parent Components

    -   [x] 5.1 Pass `distance` prop from EventContainer to EventListContainer
    -   [x] 5.2 Pass `distance` prop from EventListContainer to EventListComponent
    -   [x] 5.3 Ensure zipCode is available in EventListComponent

-   [x] 6.0 Styling and Responsive Design

    -   [x] 6.1 Style the hybrid layout container with Tailwind CSS
    -   [x] 6.2 Set appropriate heights for map and list sections
    -   [x] 6.3 Add custom styles for numbered markers
    -   [x] 6.4 Style the search radius circle (semi-transparent fill, visible border)
    -   [x] 6.5 Ensure mobile responsiveness (stacked layout below md breakpoint)
    -   [x] 6.6 Match existing FreshTrak design patterns and colors

-   [x] 7.0 Interactive Features (Optional Enhancement)

    -   [x] 7.1 Highlight corresponding card when hovering map marker
    -   [x] 7.2 Pan/zoom map to marker when clicking list card
    -   [x] 7.3 Scroll list to card when clicking map marker

-   [x] 8.0 Testing and Validation

    -   [x] 8.1 Verify TypeScript compilation without errors
    -   [ ] 8.2 Test map rendering with various event counts (0, 1, many)
    -   [ ] 8.3 Test with events that have missing coordinates
    -   [ ] 8.4 Verify numbered markers match list order
    -   [ ] 8.5 Test search radius circle displays correctly
    -   [ ] 8.6 Test responsive layout on mobile/tablet/desktop
    -   [x] 8.7 Test view toggle persistence (localStorage)
    -   [x] 8.8 Verify grid view remains unchanged
    -   [x] 8.9 Run existing test suites

-   [ ] 9.0 Documentation and Review
    -   [ ] 9.1 Update MAP_FEATURE_README.md with new hybrid view documentation
    -   [ ] 9.2 Add inline comments for complex logic
    -   [ ] 9.3 Final code review and quality check

## Technical Notes

### Map Configuration

-   Use Leaflet (already installed: `leaflet@1.9.4`, `react-leaflet@4.2.1`)
-   OpenStreetMap tiles (no API key required)
-   Circle radius: `distance * 1609.34` (miles to meters conversion)

### Numbered Markers

```typescript
const createNumberedIcon = (number: number) =>
	L.divIcon({
		className: "numbered-marker",
		html: `<div class="marker-number">${number}</div>`,
		iconSize: [30, 30],
		iconAnchor: [15, 15],
	});
```

### Layout Structure (List View)

```
┌─────────────────────────────────────────────┐
│ Header: "Resource Events near {zipCode}"    │
├─────────────────────────────────────────────┤
│ ┌───────────────────┐ ┌───────────────────┐ │
│ │                   │ │ Event Card 1      │ │
│ │       MAP         │ ├───────────────────┤ │
│ │   (with circle    │ │ Event Card 2      │ │
│ │   and numbered    │ ├───────────────────┤ │
│ │   markers)        │ │ Event Card 3      │ │
│ │                   │ │ (scrollable)      │ │
│ └───────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────┘
```

### Props Flow

```
EventContainer (zipCode, distance)
  └── EventListContainer (zipCode, distance)
        └── EventListComponent (zipCode, distance, events)
              └── EventMapComponent (zipCode, distance, events)
```

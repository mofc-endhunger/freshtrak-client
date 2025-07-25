# FreshTrak Map Feature Implementation

## Overview

This implementation adds interactive maps to the FreshTrak result cards, allowing users to see the location of agencies and view detailed maps when needed.

## Features Implemented

### 1. Mini-Map on Result Cards

-   **Location**: Each event card now displays a small map showing the agency location
-   **Functionality**:
    -   Shows a static map with the agency pinned
    -   No zoom/pan controls (as requested)
    -   Clickable to open full-size map
    -   Responsive design for different screen sizes
    -   Loading and error states handled gracefully

### 2. Full-Size Map Modal

-   **Trigger**: Clicking the mini-map opens a modal with a full-featured map
-   **Features**:
    -   Full pan/zoom controls
    -   Agency location pinned with popup showing details
    -   Close button and click-outside-to-close functionality
    -   Responsive design

### 3. Geocoding Service

-   **Primary**: Google Geocoding API (when available)
-   **Fallback**: OpenStreetMap Nominatim service
-   **Error Handling**: Graceful degradation when geocoding fails

## Technical Implementation

### Dependencies Added

-   `leaflet@1.9.4` - Open-source mapping library
-   `react-leaflet@4.2.1` - React wrapper for Leaflet

### New Components Created

#### 1. `MiniMapComponent` (`src/Modules/General/MiniMapComponent.js`)

-   Renders a small, non-interactive map
-   Handles geocoding of addresses
-   Manages loading and error states
-   Triggers full map modal on click

#### 2. `FullMapModalComponent` (`src/Modules/General/FullMapModalComponent.js`)

-   Modal overlay with full-featured map
-   Complete map controls (zoom, pan, etc.)
-   Agency information popup
-   Accessibility features (keyboard navigation, ARIA labels)

#### 3. `MapUtils` (`src/Utils/MapUtils.js`)

-   Geocoding functionality with fallback services
-   Address formatting utilities
-   Distance calculation functions

### Modified Components

#### `EventCardComponent` (`src/Modules/Events/EventCardComponent.js`)

-   Added mini-map display
-   Integrated full map modal
-   Added state management for map interactions

### Styling

-   Added comprehensive CSS/SCSS styles in `src/Assets/scss/main.scss`
-   Responsive design for mobile and desktop
-   Smooth animations and hover effects
-   Consistent with existing FreshTrak design system

## Testing

### Test Coverage

-   **MapUtils**: Unit tests for geocoding, address formatting, and distance calculation
-   **MiniMapComponent**: Component tests for rendering, interactions, and error states
-   **FullMapModalComponent**: Modal functionality and user interactions

### Test Files

-   `src/Utils/__test__/MapUtils.test.js`
-   `src/Modules/General/__test__/MiniMapComponent.test.js`
-   `src/Modules/General/__test__/FullMapModalComponent.test.js`

## Usage

### For Users

1. **View Mini-Map**: Each result card now shows a small map with the agency location
2. **Open Full Map**: Click the mini-map to see a detailed, interactive map
3. **Close Map**: Click the X button or click outside the modal to close

### For Developers

1. **Add to New Components**: Import and use `MiniMapComponent` with address props
2. **Customize Styling**: Modify SCSS variables in `main.scss` for theme changes
3. **Extend Functionality**: Build upon the `MapUtils` functions for additional features

## Configuration

### Environment Variables

-   `REACT_APP_GOOGLE_API_KEY`: Google Maps API key (optional, for enhanced geocoding)

### Leaflet Configuration

-   Uses OpenStreetMap tiles (free, no API key required)
-   Customizable tile providers in map components
-   Marker icons and styling can be customized

## Browser Support

-   Modern browsers with ES6+ support
-   Mobile-responsive design
-   Progressive enhancement (works without JavaScript, but maps won't load)

## Performance Considerations

-   Maps are loaded on-demand when cards are rendered
-   Geocoding results are not cached (could be added for optimization)
-   Leaflet maps are lightweight and efficient
-   No impact on existing functionality

## Accessibility

-   Keyboard navigation support
-   Screen reader friendly
-   ARIA labels and roles
-   Focus management for modal interactions

## Future Enhancements

-   Caching of geocoding results
-   User location integration
-   Route planning features
-   Multiple marker support for related locations
-   Custom map themes and styling options

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "mutationobserver-shim";

window.scrollTo = () => {};

window.google = {
	maps: {
		Marker: class {},
		Map: class {
			setTilt() {}
			fitBounds() {}
		},
		LatLngBounds: class {},
		places: {
			AutocompleteSuggestion: class {
				getPlacePredictions(options) {
					return Promise.resolve({
						predictions: [],
					});
				}
			},
			PlacesServiceStatus: {
				INVALID_REQUEST: "INVALID_REQUEST",
				NOT_FOUND: "NOT_FOUND",
				OK: "OK",
				OVER_QUERY_LIMIT: "OVER_QUERY_LIMIT",
				REQUEST_DENIED: "REQUEST_DENIED",
				UNKNOWN_ERROR: "UNKNOWN_ERROR",
				ZERO_RESULTS: "ZERO_RESULTS",
			},
		},

		MarkerClusterer: class {},
		Geocoder: class {},
	},
};

// Mock Leaflet for tests
window.L = {
	map: jest.fn(() => ({
		setView: jest.fn(),
		fitBounds: jest.fn(),
		remove: jest.fn(),
		on: jest.fn(),
		off: jest.fn(),
	})),
	tileLayer: jest.fn(() => ({
		addTo: jest.fn(),
	})),
	marker: jest.fn(() => ({
		addTo: jest.fn(),
		bindPopup: jest.fn(() => ({
			openPopup: jest.fn(),
		})),
		getLatLng: jest.fn(() => ({
			toBounds: jest.fn(),
		})),
	})),
	Icon: {
		Default: {
			prototype: {
				_getIconUrl: jest.fn(),
			},
			mergeOptions: jest.fn(),
		},
	},
};

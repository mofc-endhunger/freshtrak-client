/**
 * EventMapComponent
 * Displays all events on a map with numbered markers and a search radius circle
 */
import React, {
	useEffect,
	useRef,
	useState,
	useMemo,
	useCallback,
} from "react";
import L from "leaflet";
import { geocodeAddress } from "../../Utils/MapUtils";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper to check if a coordinate is valid
const isValidCoord = (val: number | string | undefined | null): boolean => {
	if (
		val === undefined ||
		val === null ||
		val === "" ||
		val === "0.0" ||
		val === "0"
	)
		return false;
	return parseFloat(String(val)) !== 0;
};

// Convert miles to meters for Leaflet circle radius
const milesToMeters = (miles: number): number => miles * 1609.34;

// Create numbered marker icon - supports single or multiple numbers
const createNumberedIcon = (numbers: number[]): L.DivIcon => {
	const isMultiple = numbers.length > 1;
	const firstNumber = Math.min(...numbers);
	const count = numbers.length;

	if (isMultiple) {
		// Multiple events: Show first number with count badge
		return L.divIcon({
			className: "numbered-marker numbered-marker-multi",
			html: `
				<div class="marker-number-multi">
					<span class="marker-main-number">${firstNumber}</span>
					<span class="marker-count-badge">×${count}</span>
				</div>
			`,
			iconSize: [36, 36],
			iconAnchor: [18, 18],
		});
	} else {
		// Single event: Simple number
		return L.divIcon({
			className: "numbered-marker",
			html: `<div class="marker-number">${numbers[0]}</div>`,
			iconSize: [28, 28],
			iconAnchor: [14, 14],
		});
	}
};

// Group events by location (same address)
interface LocationGroup {
	lat: number;
	lng: number;
	events: { event: EventLocation; originalIndex: number }[];
}

const groupEventsByLocation = (
	eventsWithOriginalIndices: { event: EventLocation; originalIndex: number }[]
): Map<string, LocationGroup> => {
	const groups = new Map<string, LocationGroup>();

	eventsWithOriginalIndices.forEach(({ event, originalIndex }) => {
		const lat = Number(event.latitude || event.agencyLatitude);
		const lng = Number(event.longitude || event.agencyLongitude);

		// Group by normalized address string (more reliable than coordinates)
		// This handles cases where same address has slightly different geocoded coords
		const addressKey = `${event.eventAddress?.toLowerCase().trim()},${event.eventCity?.toLowerCase().trim()},${event.eventZip?.trim()}`;

		if (!groups.has(addressKey)) {
			groups.set(addressKey, { lat, lng, events: [] });
		}
		groups.get(addressKey)!.events.push({ event, originalIndex });
	});

	return groups;
};

export interface EventLocation {
	id: string;
	eventName: string;
	agencyName: string;
	eventAddress: string;
	eventCity: string;
	eventState: string;
	eventZip: string;
	latitude?: number;
	longitude?: number;
	agencyLatitude?: number;
	agencyLongitude?: number;
	startTime?: string;
	endTime?: string;
	date?: string;
}

interface EventMapComponentProps {
	events: EventLocation[];
	zipCode: string;
	distance: number;
	onMarkerClick?: (event: EventLocation, index: number) => void;
	onMarkerHover?: (event: EventLocation | null, index: number | null) => void;
	highlightedIndex?: number | null;
	focusedIndex?: number | null; // When set, pans map to this marker
	className?: string;
}

const EventMapComponent: React.FC<EventMapComponentProps> = ({
	events,
	zipCode,
	distance,
	onMarkerClick,
	onMarkerHover,
	highlightedIndex,
	focusedIndex,
	className = "",
}) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);
	const markersRef = useRef<L.Marker[]>([]);
	const indexToMarkerRef = useRef<Map<number, L.Marker>>(new Map());

	const [centerCoords, setCenterCoords] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [isGeocodingComplete, setIsGeocodingComplete] = useState(false);
	const [isMapReady, setIsMapReady] = useState(false);
	const [hasError, setHasError] = useState(false);

	// Filter events with valid coordinates, preserving original index for correct numbering
	const eventsWithCoords = useMemo(() => {
		return events
			.map((event, index) => ({ event, originalIndex: index }))
			.filter(({ event }) => {
				const lat = event.latitude || event.agencyLatitude;
				const lng = event.longitude || event.agencyLongitude;
				return isValidCoord(lat) && isValidCoord(lng);
			});
	}, [events]);

	// Clear all markers helper
	const clearMarkers = useCallback(() => {
		markersRef.current.forEach((marker) => {
			try {
				marker.off();
				marker.remove();
			} catch (e) {
				// Ignore cleanup errors
			}
		});
		markersRef.current = [];
		indexToMarkerRef.current.clear();
	}, []);

	// Add markers to map helper
	const addMarkers = useCallback(
		(map: L.Map) => {
			clearMarkers();

			const locationGroups = groupEventsByLocation(eventsWithCoords);

			locationGroups.forEach((group) => {
				// Use originalIndex for correct numbering that matches the list
				const eventNumbers = group.events.map((e) => e.originalIndex + 1);
				const eventIndices = group.events.map((e) => e.originalIndex);

				const marker = L.marker([group.lat, group.lng], {
					icon: createNumberedIcon(eventNumbers),
				}).addTo(map);

				// Create popup content
				const firstEvent = group.events[0].event;
				const addressLine = `${firstEvent.eventAddress}, ${firstEvent.eventCity}, ${firstEvent.eventState} ${firstEvent.eventZip}`;

				const popupContent =
					group.events.length === 1
						? `<div class="event-popup">
							<strong>${firstEvent.agencyName}</strong>
							<span class="event-popup-eventname">${firstEvent.eventName}</span>
							<small class="event-popup-address">${addressLine}</small>
							${
								firstEvent.date
									? `<div class="event-popup-datetime">${
											firstEvent.date
									  } • ${firstEvent.startTime || ""} - ${
											firstEvent.endTime || ""
									  }</div>`
									: ""
							}
						</div>`
						: `<div class="event-popup event-popup-multi">
							<div class="event-popup-header">
								<strong>${firstEvent.agencyName}</strong>
								<small class="event-popup-address">${addressLine}</small>
							</div>
							<div class="event-popup-count">${
								group.events.length
							} events at this location</div>
							<ul class="event-popup-list">
								${group.events
									.map(
										(e) =>
											`<li class="event-popup-item" data-index="${
												e.originalIndex
											}">
												<span class="event-number">${e.originalIndex + 1}</span>
												<div class="event-item-info">
													<span class="event-item-name">${e.event.eventName}</span>
													<span class="event-item-datetime">${e.event.date || ""} • ${
												e.event.startTime || ""
											} - ${e.event.endTime || ""}</span>
												</div>
											</li>`
									)
									.join("")}
							</ul>
						</div>`;

				marker.bindPopup(popupContent, {
					maxWidth: 320,
					autoPan: false, // Prevent map from jumping when popup opens
					closeButton: true,
				});

				// Store index mapping using originalIndex
				eventIndices.forEach((idx) => {
					indexToMarkerRef.current.set(idx, marker);
				});

				// Event handlers
				marker.on("click", () => {
					if (group.events.length === 1) {
						onMarkerClick?.(
							group.events[0].event,
							group.events[0].originalIndex
						);
					}
				});

				// Note: Popup item click handlers are now managed via document-level
				// event delegation for better reliability

				marker.on("mouseover", () => {
					if (group.events.length === 1) {
						onMarkerHover?.(
							group.events[0].event,
							group.events[0].originalIndex
						);
					}
					marker.openPopup();
				});

				marker.on("mouseout", () => {
					onMarkerHover?.(null, null);
				});

				markersRef.current.push(marker);
			});
		},
		[eventsWithCoords, onMarkerClick, onMarkerHover, clearMarkers]
	);

	// Step 1: Geocode zip code first (before rendering map)
	useEffect(() => {
		let cancelled = false;

		const geocodeZip = async () => {
			if (!zipCode) {
				setHasError(true);
				setIsGeocodingComplete(true);
				return;
			}

			setIsGeocodingComplete(false);
			setIsMapReady(false);
			setHasError(false);
			setCenterCoords(null);

			try {
				const coords = await geocodeAddress("", "", "", zipCode);
				if (cancelled) return;

				if (coords) {
					setCenterCoords(coords);
				} else if (eventsWithCoords.length > 0) {
					const firstEvent = eventsWithCoords[0].event;
					const lat =
						firstEvent.latitude || firstEvent.agencyLatitude;
					const lng =
						firstEvent.longitude || firstEvent.agencyLongitude;
					if (lat && lng) {
						setCenterCoords({ lat: Number(lat), lng: Number(lng) });
					} else {
						setHasError(true);
					}
				} else {
					setHasError(true);
				}
			} catch (error) {
				if (cancelled) return;
				console.error("Error geocoding zip code:", error);
				setHasError(true);
			} finally {
				if (!cancelled) {
					setIsGeocodingComplete(true);
				}
			}
		};

		geocodeZip();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zipCode]); // Only re-geocode when zipCode changes, not when events change

	// Step 2: Initialize map only after geocoding is complete and we have coordinates
	useEffect(() => {
		if (!isGeocodingComplete || !centerCoords || !mapRef.current) {
			return;
		}

		// Clean up any existing map first
		if (mapInstanceRef.current) {
			try {
				clearMarkers();
				mapInstanceRef.current.off();
				mapInstanceRef.current.remove();
			} catch (e) {
				// Ignore
			}
			mapInstanceRef.current = null;
		}

		// Small delay to ensure DOM is ready
		const initTimeout = setTimeout(() => {
			if (!mapRef.current) return;

			try {
				const map = L.map(mapRef.current, {
					center: [centerCoords.lat, centerCoords.lng],
					zoom: 11,
					zoomControl: true,
					scrollWheelZoom: true,
					doubleClickZoom: true,
					dragging: true,
					touchZoom: true,
					attributionControl: true,
				});

				L.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						maxZoom: 19,
						attribution: "© OpenStreetMap contributors",
					}
				).addTo(map);

				// Add search radius circle
				const radiusInMeters = milesToMeters(distance);
				const circle = L.circle([centerCoords.lat, centerCoords.lng], {
					radius: radiusInMeters,
					color: "#28CE85", // Primary green
					fillColor: "#28CE85", // Primary green
					fillOpacity: 0.15,
					weight: 2,
				}).addTo(map);

				map.fitBounds(circle.getBounds(), { padding: [20, 20] });

				mapInstanceRef.current = map;
				setIsMapReady(true);
			} catch (error) {
				console.error("Error initializing map:", error);
				setHasError(true);
			}
		}, 50);

		return () => {
			clearTimeout(initTimeout);

			const mapToCleanup = mapInstanceRef.current;
			mapInstanceRef.current = null;
			setIsMapReady(false);

			if (mapToCleanup) {
				try {
					clearMarkers();
					mapToCleanup.stop();
					mapToCleanup.off();
					mapToCleanup.remove();
				} catch (e) {
					// Ignore cleanup errors
				}
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGeocodingComplete, centerCoords, distance]); // Don't include addMarkers/clearMarkers to avoid re-init on event changes

	// Step 3: Update markers when events change or map becomes ready
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || !isMapReady) return;

		// Small delay to ensure map is fully initialized
		const markerTimeout = setTimeout(() => {
			if (mapInstanceRef.current) {
				addMarkers(mapInstanceRef.current);
			}
		}, 100);

		return () => clearTimeout(markerTimeout);
	}, [eventsWithCoords, isMapReady, addMarkers]);

	// Event delegation for popup item clicks - handles clicks on multi-event popup items
	useEffect(() => {
		const handlePopupItemClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const popupItem = target.closest(".event-popup-item");
			if (!popupItem) return;

			const indexStr = popupItem.getAttribute("data-index");
			if (indexStr === null) return;

			const originalIdx = parseInt(indexStr, 10);
			const eventData = eventsWithCoords.find(
				(ev) => ev.originalIndex === originalIdx
			);

			if (eventData) {
				e.preventDefault();
				e.stopPropagation();
				onMarkerClick?.(eventData.event, originalIdx);
			}
		};

		// Add listener to document to catch clicks on Leaflet popups
		// (popups are appended to a separate DOM layer)
		document.addEventListener("click", handlePopupItemClick, true);

		return () => {
			document.removeEventListener("click", handlePopupItemClick, true);
		};
	}, [eventsWithCoords, onMarkerClick]);

	// Highlight marker when highlightedIndex changes
	useEffect(() => {
		if (!isMapReady) return;

		try {
			if (highlightedIndex === null || highlightedIndex === undefined) {
				markersRef.current.forEach((marker) => {
					const iconElement = marker.getElement();
					if (iconElement) {
						const markerDiv =
							iconElement.querySelector(".marker-number");
						if (markerDiv) {
							markerDiv.classList.remove("highlighted");
						}
					}
				});
				return;
			}

			const targetMarker = indexToMarkerRef.current.get(highlightedIndex);
			markersRef.current.forEach((marker) => {
				const iconElement = marker.getElement();
				if (iconElement) {
					const markerDiv =
						iconElement.querySelector(".marker-number");
					if (markerDiv) {
						if (marker === targetMarker) {
							markerDiv.classList.add("highlighted");
						} else {
							markerDiv.classList.remove("highlighted");
						}
					}
				}
			});
		} catch (e) {
			// Ignore
		}
	}, [highlightedIndex, isMapReady]);

	// Pan to marker when focusedIndex changes
	useEffect(() => {
		if (
			!isMapReady ||
			focusedIndex === null ||
			focusedIndex === undefined ||
			focusedIndex < 0
		)
			return;

		const timeoutId = setTimeout(() => {
			const map = mapInstanceRef.current;
			if (!map) return;

			try {
				const marker = indexToMarkerRef.current.get(focusedIndex);
				if (marker) {
					const latLng = marker.getLatLng();
					map.setView(latLng, 14, { animate: true });
					marker.openPopup();
				}
			} catch (e) {
				// Ignore
			}
		}, 150);

		return () => clearTimeout(timeoutId);
	}, [focusedIndex, isMapReady]);

	// Loading state - show until geocoding is complete
	if (!isGeocodingComplete) {
		return (
			<div
				className={`flex items-center justify-center bg-gray-100 ${className}`}
				style={{ minHeight: 400 }}
			>
				<div className="flex flex-col items-center gap-2">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<div className="text-gray-600">Loading map...</div>
				</div>
			</div>
		);
	}

	// Error state
	if (hasError || !centerCoords) {
		return (
			<div
				className={`flex items-center justify-center bg-gray-100 ${className}`}
				style={{ minHeight: 400 }}
			>
				<div className="text-gray-500">Map unavailable</div>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			<div
				ref={mapRef}
				className="w-full h-full"
				style={{ minHeight: 400 }}
			/>
			{!isMapReady && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
					<div className="flex flex-col items-center gap-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<div className="text-gray-600">Initializing map...</div>
					</div>
				</div>
			)}
			{isMapReady && eventsWithCoords.length === 0 && (
				<div className="absolute top-2 left-2 bg-white px-3 py-1 rounded shadow text-sm text-gray-600">
					No locations to display
				</div>
			)}
		</div>
	);
};

export default EventMapComponent;

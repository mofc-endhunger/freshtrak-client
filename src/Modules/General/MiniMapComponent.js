import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { geocodeAddress } from "../../Utils/MapUtils";

// Fix for default markers in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper to check if a coordinate is valid (not 0, '0', or '0.0')
const isValidCoord = val => {
	if (
		val === undefined ||
		val === null ||
		val === "" ||
		val === "0.0" ||
		val === "0"
	)
		return false;
	return parseFloat(val) !== 0;
};

const MiniMapComponent = ({
	address,
	city,
	state,
	zip,
	onClick,
	className = "mini-map",
	latitude, // new prop
	longitude, // new prop
}) => {
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markerRef = useRef(null);
	const [coordinates, setCoordinates] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const currentMapRef = mapRef.current;
		const loadMap = async () => {
			let coords = null;
			if (isValidCoord(latitude) && isValidCoord(longitude)) {
				coords = {
					lat: parseFloat(latitude),
					lng: parseFloat(longitude),
				};
			} else if (
				coordinates &&
				isValidCoord(coordinates.lat) &&
				isValidCoord(coordinates.lng)
			) {
				coords = coordinates;
			} else {
				coords = await geocodeAddress(address, city, state, zip);
			}

			if (coords) {
				setCoordinates(coords);
				setIsLoading(false);
				setHasError(false);
				return;
			}

			setIsLoading(false);
			setHasError(true);
		};

		loadMap();

		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
				markerRef.current = null;
			}
			if (currentMapRef) {
				currentMapRef.innerHTML = "";
			}
		};
	}, [address, city, state, zip, latitude, longitude, coordinates]);

	// New effect: initialize map only when coordinates are set and container is visible
	useEffect(() => {
		const currentMapRef = mapRef.current;
		const tryInitMap = () => {
			if (
				currentMapRef &&
				currentMapRef.offsetHeight > 0 &&
				coordinates &&
				!mapInstanceRef.current
			) {
				const map = L.map(currentMapRef, {
					center: [coordinates.lat, coordinates.lng],
					maxZoom: 12, // less zoomed in
					zoomControl: false,
					scrollWheelZoom: false,
					doubleClickZoom: false,
					dragging: false,
					touchZoom: false,
					boxZoom: false,
					keyboard: false,
					attributionControl: false,
					fadeAnimation: false,
					zoomAnimation: false,
					markerZoomAnimation: false,
				});

				L.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						maxZoom: 19,
						attribution: "© OpenStreetMap contributors",
					}
				).addTo(map);

				const marker = L.marker([
					coordinates.lat,
					coordinates.lng,
				]).addTo(map);
				markerRef.current = marker;
				mapInstanceRef.current = map;
				// Guard fitBounds
				if (map && map._container && map._container.parentNode) {
					map.fitBounds(marker.getLatLng().toBounds(0.02));
				}
			}
		};

		tryInitMap();
		let timeout;
		if (!mapInstanceRef.current && coordinates) {
			timeout = setTimeout(tryInitMap, 100);
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [coordinates]);

	const handleClick = e => {
		e.preventDefault();
		e.stopPropagation();
		if (onClick && coordinates) {
			onClick(coordinates, { address, city, state, zip });
		}
	};

	if (isLoading) {
		return (
			<div className={`${className} loading`}>
				<div className="loading-spinner">Loading map...</div>
			</div>
		);
	}

	if (hasError || !coordinates) {
		return (
			<div className={`${className} error`}>
				<div className="error-message">Map unavailable</div>
			</div>
		);
	}

	return (
		<div
			className={`${className} clickable`}
			onClick={handleClick}
			title="Click to view larger map"
			role="button"
			tabIndex={0}
			onKeyDown={e => {
				if (e.key === "Enter" || e.key === " ") {
					handleClick(e);
				}
			}}
		>
			<div
				ref={mapRef}
				className="map-container"
				style={{ height: "100%", minHeight: 100 }}
			/>
			<div className="map-overlay"></div>
		</div>
	);
};

export default MiniMapComponent;

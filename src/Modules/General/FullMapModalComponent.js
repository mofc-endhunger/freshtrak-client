import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { formatAddress } from "../../Utils/MapUtils";

// Fix for default markers in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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

const FullMapModalComponent = ({
	isOpen,
	onClose,
	coordinates,
	address,
	city,
	state,
	zip,
	agencyName,
	latitude, // new prop
	longitude, // new prop
}) => {
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markerRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [mapCoordinates, setMapCoordinates] = useState(null); // new state

	useEffect(() => {
		const getCoords = async () => {
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
				// fallback geocoding if needed
				const { geocodeAddress } = await import("../../Utils/MapUtils");
				coords = await geocodeAddress(address, city, state, zip);
			}
			setMapCoordinates(coords);
		};
		if (isOpen) {
			getCoords();
		}
	}, [isOpen, latitude, longitude, coordinates, address, city, state, zip]);

	// New effect: initialize map only when coordinates are set and modal is open
	useEffect(() => {
		const currentMapRef = mapRef.current;
		const tryInitMap = () => {
			if (
				isOpen &&
				currentMapRef &&
				currentMapRef.offsetHeight > 0 &&
				mapCoordinates &&
				!mapInstanceRef.current
			) {
				try {
					setIsLoading(true);

					const map = L.map(currentMapRef, {
						center: [mapCoordinates.lat, mapCoordinates.lng],
						zoom: 15,
						zoomControl: true,
						scrollWheelZoom: true,
						doubleClickZoom: true,
						dragging: true,
						touchZoom: true,
						boxZoom: true,
						keyboard: true,
						attributionControl: true,
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

					const formattedAddress = formatAddress(
						address,
						city,
						state,
						zip
					);
					const popupContent = `
            <div class="map-popup">
              <h4>${agencyName || "Agency Location"}</h4>
              <p>${formattedAddress}</p>
            </div>
          `;

					const marker = L.marker([
						mapCoordinates.lat,
						mapCoordinates.lng,
					])
						.addTo(map)
						.bindPopup(popupContent);

					markerRef.current = marker;
					mapInstanceRef.current = map;

					// Set a fixed zoom and center
					map.setView([mapCoordinates.lat, mapCoordinates.lng], 13);

					setTimeout(() => {
						marker.openPopup();
					}, 500);

					setIsLoading(false);
				} catch (error) {
					console.error("Error initializing full map:", error);
					setIsLoading(false);
				}
			}
		};

		tryInitMap();
		let timeout;
		if (!mapInstanceRef.current && mapCoordinates && isOpen) {
			timeout = setTimeout(tryInitMap, 100);
		}
		return () => {
			if (timeout) clearTimeout(timeout);
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
				markerRef.current = null;
			}
			if (currentMapRef) {
				currentMapRef.innerHTML = "";
			}
		};
	}, [isOpen, mapCoordinates, address, city, state, zip, agencyName]);

	const handleBackdropClick = e => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleCloseClick = () => {
		onClose();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="full-map-modal-overlay"
			onClick={handleBackdropClick}
			role="presentation"
		>
			<div className="full-map-modal">
				<div className="full-map-modal-header">
					<h3>{agencyName || "Agency Location"}</h3>
					<button
						className="close-button"
						onClick={handleCloseClick}
						aria-label="Close map"
					>
						×
					</button>
				</div>
				<div className="full-map-modal-body">
					{isLoading && (
						<div className="map-loading">
							<div className="loading-spinner">
								Loading map...
							</div>
						</div>
					)}
					<div ref={mapRef} className="full-map-container" />
				</div>
			</div>
		</div>
	);
};

export default FullMapModalComponent;

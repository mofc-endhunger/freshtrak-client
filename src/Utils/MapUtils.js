/**
 * Map utility functions for FreshTrak
 */

/**
 * Geocodes an address to get coordinates
 * @param {string} address - The street address
 * @param {string} city - The city
 * @param {string} state - The state
 * @param {string} zip - The zip code
 * @returns {Promise<{lat: number, lng: number} | null>} - Returns coordinates or null if geocoding fails
 */
export const geocodeAddress = async (address, city, state, zip) => {
	try {
		// Return null if any required address component is missing
		if (!address || !city || !state || !zip) {
			return null;
		}

		const fullAddress = `${address}, ${city}, ${state} ${zip}`;

		// Use Google Geocoding API if available
		if (
			window.google &&
			window.google.maps &&
			window.google.maps.Geocoder
		) {
			return new Promise(resolve => {
				const geocoder = new window.google.maps.Geocoder();
				geocoder.geocode(
					{ address: fullAddress },
					(results, status) => {
						if (status === "OK" && results[0]) {
							const location = results[0].geometry.location;
							resolve({
								lat: location.lat(),
								lng: location.lng(),
							});
						} else {
							// If Google fails, try Nominatim as fallback (but not in test environment)
							if (process.env.NODE_ENV !== "test") {
								geocodeWithNominatim(fullAddress).then(resolve);
							} else {
								resolve(null);
							}
						}
					}
				);
			});
		}

		// If Google API is not available, use Nominatim as fallback (but not in test environment)
		if (process.env.NODE_ENV !== "test") {
			return await geocodeWithNominatim(fullAddress);
		}

		return null;
	} catch (error) {
		console.error("Error geocoding address:", error);
		return null;
	}
};

/**
 * Geocodes an address using Nominatim API
 * @param {string} address - The full address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} - Returns coordinates or null if geocoding fails
 */
const geocodeWithNominatim = async address => {
	try {
		const encodedAddress = encodeURIComponent(address);
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

		const response = await fetch(url);
		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (data && data.length > 0) {
			return {
				lat: parseFloat(data[0].lat),
				lng: parseFloat(data[0].lon),
			};
		}

		return null;
	} catch (error) {
		console.error("Error geocoding with Nominatim:", error);
		return null;
	}
};

/**
 * Formats an address for display
 * @param {string} address - The street address
 * @param {string} city - The city
 * @param {string} state - The state
 * @param {string} zip - The zip code
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address, city, state, zip) => {
	return `${address}, ${city}, ${state} ${zip}`;
};

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 3959; // Earth's radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

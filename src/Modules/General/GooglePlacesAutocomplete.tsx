import React, { useState, useEffect, forwardRef } from "react";
import localization from "../Localization/LocalizationComponent";

interface GooglePlacesAutocompleteProps {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSelect?: (value: string, place: any) => void;
	placeholder?: string;
	className?: string;
	id?: string;
	name?: string;
	[key: string]: any;
}

// Internal interface for component state (maintains backward compatibility)
interface GooglePlace {
	place_id: string;
	description: string;
	structured_formatting?: {
		main_text: string;
		secondary_text: string;
	};
}

// Interface for place details returned to consuming components (maintains backward compatibility)
interface GooglePlaceDetails {
	place_id: string;
	address_components: Array<{
		long_name: string;
		short_name: string;
		types: string[];
	}>;
	formatted_address: string;
	geometry?: {
		location: {
			lat: () => number;
			lng: () => number;
		};
	};
	name?: string;
}

// New API interfaces for AutocompleteSuggestion
interface AutocompleteSuggestionRequest {
	input: string;
	includedPrimaryTypes?: string[];
	includedRegionCodes?: string[];
	language?: string;
}

interface PlacePredictionText {
	text: string;
	matches?: Array<{ startOffset: number; endOffset: number }>;
}

interface PlacePrediction {
	placeId: string;
	text: PlacePredictionText;
	structuredFormat?: {
		mainText: PlacePredictionText;
		secondaryText: PlacePredictionText;
	};
}

interface AutocompleteSuggestion {
	placePrediction: PlacePrediction;
}

interface AutocompleteSuggestionResponse {
	suggestions: AutocompleteSuggestion[];
}

declare global {
	interface Window {
		google: typeof google;
	}

	namespace google.maps {
		class LatLng {
			lat(): number;
			lng(): number;
		}

		namespace places {
			// New API
			class AutocompleteSuggestion {
				static fetchAutocompleteSuggestions(
					request: AutocompleteSuggestionRequest
				): Promise<AutocompleteSuggestionResponse>;
			}

			class Place {
				constructor(options: { id: string });
				id: string;
				displayName?: { text: string; languageCode?: string };
				formattedAddress?: string;
				addressComponents?: Array<{
					longText: string;
					shortText: string;
					types: string[];
				}>;
				location?: LatLng;
				fetchFields(options: {
					fields: string[];
				}): Promise<{ place: Place }>;
			}

			// Legacy API (kept for type compatibility during transition)
			class AutocompleteService {
				getPlacePredictions(
					request: any,
					callback: (predictions: any[], status: string) => void
				): void;
			}

			class AutocompleteSessionToken {}

			class PlacesService {
				constructor(attrContainer: HTMLElement);
				getDetails(
					request: any,
					callback: (place: any, status: string) => void
				): void;
			}

			const PlacesServiceStatus: {
				OK: string;
				REQUEST_DENIED: string;
				OVER_QUERY_LIMIT: string;
				INVALID_REQUEST: string;
			};
		}
	}
}

const GooglePlacesAutocomplete = forwardRef<
	HTMLInputElement,
	GooglePlacesAutocompleteProps
>(function GooglePlacesAutocomplete(
	{
		value,
		onChange,
		onSelect,
		placeholder = localization.placeholder_type_address,
		className = "form-control",
		id,
		name,
		...props
	},
	ref
) {
	const [suggestions, setSuggestions] = useState<GooglePlace[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [isApiAvailable, setIsApiAvailable] = useState<boolean>(false);

	useEffect(() => {
		// Check if new Google Places API is available
		const checkApiAvailability = () => {
			if (window.google?.maps?.places?.AutocompleteSuggestion) {
				setIsApiAvailable(true);
				return true;
			}
			return false;
		};

		// Try to check immediately
		if (checkApiAvailability()) return;

		// If not available immediately, wait and try again
		const timer = setTimeout(checkApiAvailability, 1000);
		return () => clearTimeout(timer);
	}, []);

	const getPlacePredictions = async (input: string) => {
		if (!input.trim()) {
			setSuggestions([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			// Use the new AutocompleteSuggestion API
			if (isApiAvailable) {
				const request: AutocompleteSuggestionRequest = {
					input,
					includedPrimaryTypes: [
						"street_address",
						"premise",
						"subpremise",
					],
				};

				const { suggestions: apiSuggestions } =
					await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
						request
					);

				// Map new API response to internal format for backward compatibility
				const mappedSuggestions: GooglePlace[] = apiSuggestions.map(
					(suggestion) => ({
						place_id: suggestion.placePrediction.placeId,
						description: suggestion.placePrediction.text.text,
						structured_formatting: suggestion.placePrediction
							.structuredFormat
							? {
									main_text:
										suggestion.placePrediction
											.structuredFormat.mainText.text,
									secondary_text:
										suggestion.placePrediction
											.structuredFormat.secondaryText
											.text,
							  }
							: undefined,
					})
				);

				setSuggestions(mappedSuggestions);
			} else {
				// API not available - users can manually type their address
				setSuggestions([]);
			}
		} catch (error) {
			console.error("Error fetching place predictions:", error);
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		// Always pass the event object to maintain compatibility
		if (typeof onChange === "function") {
			onChange(e);
		}

		if (inputValue.length > 2) {
			getPlacePredictions(inputValue);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const handleSuggestionClick = async (suggestion: GooglePlace) => {
		setShowSuggestions(false);

		// Create a proper event object for onChange
		const event = {
			target: {
				value: suggestion.description,
				name: name || "address",
			},
		} as React.ChangeEvent<HTMLInputElement>;
		onChange(event);

		// Fetch detailed place information using the new Place API
		if (isApiAvailable && window.google?.maps?.places?.Place) {
			try {
				const place = new google.maps.places.Place({
					id: suggestion.place_id,
				});

				const { place: placeDetails } = await place.fetchFields({
					fields: [
						"addressComponents",
						"formattedAddress",
						"location",
						"displayName",
					],
				});

				// Map new API response to legacy format for backward compatibility with consuming components
				const mappedPlace: GooglePlaceDetails = {
					place_id: suggestion.place_id,
					address_components: (
						placeDetails.addressComponents || []
					).map((component) => ({
						long_name: component.longText,
						short_name: component.shortText,
						types: component.types,
					})),
					formatted_address:
						placeDetails.formattedAddress || suggestion.description,
					geometry: placeDetails.location
						? {
								location: {
									lat: () => placeDetails.location!.lat(),
									lng: () => placeDetails.location!.lng(),
								},
						  }
						: undefined,
					name: placeDetails.displayName?.text,
				};

				if (onSelect) {
					onSelect(suggestion.description, mappedPlace);
				}
			} catch (error) {
				console.error("Error fetching place details:", error);
				// Fallback if detailed place info fails
				if (onSelect) {
					const fallbackPlace = {
						place_id: suggestion.place_id,
						description: suggestion.description,
					};
					onSelect(suggestion.description, fallbackPlace);
				}
			}
		} else {
			// Fallback when Places API is not available
			if (onSelect) {
				const fallbackPlace = {
					place_id: suggestion.place_id,
					description: suggestion.description,
				};
				onSelect(suggestion.description, fallbackPlace);
			}
		}
	};

	const handleInputBlur = () => {
		// Delay hiding suggestions to allow for clicks
		setTimeout(() => {
			setShowSuggestions(false);
		}, 200);
	};

	return (
		<div className="places-autocomplete-container">
			<input
				ref={ref}
				type="text"
				className={className}
				id={id}
				name={name}
				value={value}
				onChange={handleInputChange}
				onBlur={handleInputBlur}
				placeholder={placeholder}
				autoComplete="off"
				{...props}
			/>

			{loading && <div className="loading">Loading...</div>}

			{showSuggestions && suggestions.length > 0 && (
				<div className="suggestions-container">
					{suggestions.map((suggestion) => (
						<div
							key={suggestion.place_id}
							className="suggestion-item"
							onClick={() => handleSuggestionClick(suggestion)}
						>
							{suggestion.description}
						</div>
					))}
				</div>
			)}
		</div>
	);
});

GooglePlacesAutocomplete.displayName = "GooglePlacesAutocomplete";

export default GooglePlacesAutocomplete;

import React, { useState, useEffect, useRef, forwardRef } from "react";

const GooglePlacesAutocomplete = forwardRef(function GooglePlacesAutocomplete(
	{
		value,
		onChange,
		onSelect,
		placeholder = "Type Address",
		className = "form-control",
		id,
		name,
		...props
	},
	ref
) {
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const autocompleteService = useRef(null);
	const sessionToken = useRef(null);

	useEffect(() => {
		// Initialize Google Places Autocomplete Service
		const initializePlacesService = () => {
			if (
				window.google &&
				window.google.maps &&
				window.google.maps.places
			) {
				try {
					// Try to use the new AutocompleteSuggestion API if available
					if (window.google.maps.places.AutocompleteSuggestion) {
						autocompleteService.current =
							new window.google.maps.places.AutocompleteSuggestion();
					} else if (window.google.maps.places.AutocompleteService) {
						// Fallback to the deprecated AutocompleteService
						autocompleteService.current =
							new window.google.maps.places.AutocompleteService();
					}

					if (window.google.maps.places.AutocompleteSessionToken) {
						sessionToken.current =
							new window.google.maps.places.AutocompleteSessionToken();
					}
				} catch (error) {
					console.error(
						"Error initializing Google Places service:",
						error
					);
				}
			}
		};

		// Try to initialize immediately
		initializePlacesService();

		// If not available immediately, wait a bit and try again
		if (!window.google) {
			const timer = setTimeout(initializePlacesService, 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const getPlacePredictions = async input => {
		if (!input.trim()) {
			setSuggestions([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			// Check if Google Places API is available and working
			if (
				autocompleteService.current &&
				autocompleteService.current.getPlacePredictions
			) {
				console.log("Using Google Places API");

				const request = {
					input,
					sessionToken: sessionToken.current,
					types: ["address"],
				};

				autocompleteService.current.getPlacePredictions(
					request,
					(predictions, status) => {
						console.log("Places API response:", {
							predictions,
							status,
						});
						if (
							status ===
								window.google.maps.places.PlacesServiceStatus
									.OK &&
							predictions
						) {
							setSuggestions(predictions);
						} else if (
							status ===
							window.google.maps.places.PlacesServiceStatus
								.REQUEST_DENIED
						) {
							console.error(
								"Google Places API request denied. Check if Places API is enabled for your API key."
							);
							setSuggestions([]);
						} else if (
							status ===
							window.google.maps.places.PlacesServiceStatus
								.OVER_QUERY_LIMIT
						) {
							console.error("Google Places API quota exceeded.");
							setSuggestions([]);
						} else if (
							status ===
							window.google.maps.places.PlacesServiceStatus
								.INVALID_REQUEST
						) {
							console.error(
								"Invalid request to Google Places API."
							);
							setSuggestions([]);
						} else {
							console.log(
								"No predictions found or other status:",
								status
							);
							setSuggestions([]);
						}
						setLoading(false);
					}
				);
			} else {
				// Fallback: provide basic autocomplete functionality
				console.log(
					"Google Places API not available (likely domain-restricted), using basic autocomplete"
				);

				// Don't show fallback suggestions to avoid confusion
				// Just let the user type their address manually
				setSuggestions([]);
				setLoading(false);
			}
		} catch (error) {
			console.error("Error fetching predictions:", error);
			setSuggestions([]);
			setLoading(false);
		}
	};

	const handleInputChange = e => {
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

	const handleSuggestionClick = suggestion => {
		setShowSuggestions(false);

		// Create a proper event object for onChange
		const event = {
			target: {
				value: suggestion.description,
				name: name || "address",
			},
		};
		onChange(event);

		if (onSelect) {
			// Create a simplified place object since we don't have detailed components
			const place = {
				place_id: suggestion.place_id,
				description: suggestion.description,
				// Note: Detailed address components and geometry are not available
				// with the new API. You may need to implement a separate geocoding
				// service to get these details if needed.
			};

			onSelect(suggestion.description, place);
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
					{suggestions.map(suggestion => (
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

			{/* Show a helpful message when Google Places is not available */}
			{!autocompleteService.current && (
				<div className="text-muted small mt-1">
					Type your address manually (autocomplete not available due
					to domain restrictions)
				</div>
			)}
		</div>
	);
});

export default GooglePlacesAutocomplete;

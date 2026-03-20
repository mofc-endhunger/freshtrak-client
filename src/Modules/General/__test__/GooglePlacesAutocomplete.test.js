import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import GooglePlacesAutocomplete from "../GooglePlacesAutocomplete";

// Mock response for the new AutocompleteSuggestion API
const mockSuggestionsResponse = {
	suggestions: [
		{
			placePrediction: {
				placeId: "place_1",
				text: { text: "123 Main St, City, State" },
				structuredFormat: {
					mainText: { text: "123 Main St" },
					secondaryText: { text: "City, State" },
				},
			},
		},
		{
			placePrediction: {
				placeId: "place_2",
				text: { text: "456 Oak Ave, City, State" },
				structuredFormat: {
					mainText: { text: "456 Oak Ave" },
					secondaryText: { text: "City, State" },
				},
			},
		},
	],
};

// Mock Place class instance
const createMockPlace = (id) => ({
	id,
	displayName: { text: "Test Place" },
	formattedAddress: "123 Main St, City, State 12345",
	addressComponents: [
		{ longText: "123", shortText: "123", types: ["street_number"] },
		{ longText: "Main St", shortText: "Main St", types: ["route"] },
		{ longText: "City", shortText: "City", types: ["locality"] },
		{
			longText: "State",
			shortText: "ST",
			types: ["administrative_area_level_1"],
		},
		{ longText: "12345", shortText: "12345", types: ["postal_code"] },
	],
	location: {
		lat: () => 40.7128,
		lng: () => -74.006,
	},
});

beforeEach(() => {
	// Setup Google Maps API mock with new API structure
	window.google = {
		maps: {
			places: {
				AutocompleteSuggestion: {
					fetchAutocompleteSuggestions: jest
						.fn()
						.mockResolvedValue(mockSuggestionsResponse),
				},
				Place: jest.fn().mockImplementation((options) => ({
					...createMockPlace(options.id),
					fetchFields: jest.fn().mockResolvedValue({
						place: createMockPlace(options.id),
					}),
				})),
			},
		},
	};
});

afterEach(() => {
	jest.clearAllMocks();
});

describe("GooglePlacesAutocomplete", () => {
	const defaultProps = {
		value: "",
		onChange: jest.fn(),
		onSelect: jest.fn(),
	};

	test("renders input field", () => {
		render(<GooglePlacesAutocomplete {...defaultProps} />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	test("calls onChange when input changes", () => {
		render(<GooglePlacesAutocomplete {...defaultProps} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "123 Main" } });

		// Check that onChange was called with an event object
		expect(defaultProps.onChange).toHaveBeenCalledWith(
			expect.objectContaining({
				target: expect.any(Object),
				type: "change",
			})
		);
	});

	test("shows placeholder text", () => {
		render(
			<GooglePlacesAutocomplete
				{...defaultProps}
				placeholder="Enter address"
			/>
		);
		expect(
			screen.getByPlaceholderText("Enter address")
		).toBeInTheDocument();
	});

	test("applies custom className", () => {
		render(
			<GooglePlacesAutocomplete
				{...defaultProps}
				className="custom-class"
			/>
		);
		const input = screen.getByRole("textbox");
		expect(input).toHaveClass("custom-class");
	});

	test("fetches suggestions when input length > 2", async () => {
		render(<GooglePlacesAutocomplete {...defaultProps} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "123 Main Street" } });

		await waitFor(() => {
			expect(
				window.google.maps.places.AutocompleteSuggestion
					.fetchAutocompleteSuggestions
			).toHaveBeenCalledWith(
				expect.objectContaining({
					input: "123 Main Street",
					includedPrimaryTypes: expect.any(Array),
				})
			);
		});
	});

	test("does not fetch suggestions when input length <= 2", async () => {
		render(<GooglePlacesAutocomplete {...defaultProps} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "12" } });

		// Wait a bit to ensure no API call is made
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(
			window.google.maps.places.AutocompleteSuggestion
				.fetchAutocompleteSuggestions
		).not.toHaveBeenCalled();
	});

	test("displays suggestions after API response", async () => {
		render(<GooglePlacesAutocomplete {...defaultProps} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "123 Main" } });

		await waitFor(() => {
			expect(
				screen.getByText("123 Main St, City, State")
			).toBeInTheDocument();
			expect(
				screen.getByText("456 Oak Ave, City, State")
			).toBeInTheDocument();
		});
	});

	test("calls onSelect with place details when suggestion is clicked", async () => {
		const onSelect = jest.fn();
		render(
			<GooglePlacesAutocomplete {...defaultProps} onSelect={onSelect} />
		);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "123 Main" } });

		await waitFor(() => {
			expect(
				screen.getByText("123 Main St, City, State")
			).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText("123 Main St, City, State"));

		await waitFor(() => {
			expect(onSelect).toHaveBeenCalledWith(
				"123 Main St, City, State",
				expect.objectContaining({
					place_id: "place_1",
					address_components: expect.any(Array),
					formatted_address: expect.any(String),
				})
			);
		});
	});

	test("handles API errors gracefully", async () => {
		// Mock API to reject
		window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions =
			jest.fn().mockRejectedValue(new Error("API Error"));

		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		render(<GooglePlacesAutocomplete {...defaultProps} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "123 Main" } });

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Error fetching place predictions:",
				expect.any(Error)
			);
		});

		consoleSpy.mockRestore();
	});
});

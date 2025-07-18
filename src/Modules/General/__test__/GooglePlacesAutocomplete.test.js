import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import GooglePlacesAutocomplete from "../GooglePlacesAutocomplete";

// Mock Google Maps API
const mockAutocompleteSuggestion = {
	getPlacePredictions: jest.fn().mockResolvedValue({
		predictions: [
			{
				place_id: "1",
				description: "123 Main St, City, State",
			},
			{
				place_id: "2",
				description: "456 Oak Ave, City, State",
			},
		],
	}),
};

const mockPlacesService = {
	getDetails: jest.fn(),
};

beforeEach(() => {
	// Setup Google Maps API mock
	window.google = {
		maps: {
			places: {
				AutocompleteSuggestion: jest.fn(
					() => mockAutocompleteSuggestion
				),
				PlacesService: jest.fn(() => mockPlacesService),
				PlacesServiceStatus: {
					OK: "OK",
				},
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
});

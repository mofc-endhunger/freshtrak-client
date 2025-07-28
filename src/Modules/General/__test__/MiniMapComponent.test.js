import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import MiniMapComponent from "../MiniMapComponent";

// Mock the MapUtils
jest.mock("../../../Utils/MapUtils", () => ({
	geocodeAddress: jest.fn(),
}));

// Mock Leaflet
jest.mock("leaflet", () => ({
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
}));

describe("MiniMapComponent", () => {
	const mockProps = {
		address: "123 Main St",
		city: "Columbus",
		state: "OH",
		zip: "43215",
		onClick: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render loading state initially", () => {
		render(<MiniMapComponent {...mockProps} />);
		expect(screen.getByText("Loading map...")).toBeInTheDocument();
	});

	it("should render error state when address is missing", async () => {
		await act(async () => {
			render(
				<MiniMapComponent
					address=""
					city=""
					state=""
					zip=""
					onClick={jest.fn()}
				/>
			);
		});

		// Wait for the async state updates to complete
		await waitFor(() => {
			expect(screen.getByText("Map unavailable")).toBeInTheDocument();
		});
	});

	it("should render error state when geocoding fails", async () => {
		const { geocodeAddress } = require("../../../Utils/MapUtils");
		geocodeAddress.mockResolvedValue(null);

		await act(async () => {
			render(<MiniMapComponent {...mockProps} />);
		});

		// Wait for the async geocoding to complete
		await waitFor(() => {
			expect(screen.getByText("Map unavailable")).toBeInTheDocument();
		});
	});

	it("should render map when geocoding succeeds", async () => {
		const { geocodeAddress } = require("../../../Utils/MapUtils");
		geocodeAddress.mockResolvedValue({ lat: 40.7128, lng: -74.006 });

		await act(async () => {
			render(<MiniMapComponent {...mockProps} />);
		});

		// Wait for the map container to be rendered
		await waitFor(() => {
			const mapContainer = document.querySelector(".map-container");
			expect(mapContainer).toBeInTheDocument();
		});
	});

	it("should call onClick when map is clicked", async () => {
		const { geocodeAddress } = require("../../../Utils/MapUtils");
		geocodeAddress.mockResolvedValue({ lat: 40.7128, lng: -74.006 });

		const mockOnClick = jest.fn();
		await act(async () => {
			render(<MiniMapComponent {...mockProps} onClick={mockOnClick} />);
		});

		// Wait for map to load
		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		// Click the map
		fireEvent.click(screen.getByRole("button"));

		expect(mockOnClick).toHaveBeenCalledWith(
			{ lat: 40.7128, lng: -74.006 },
			{
				address: "123 Main St",
				city: "Columbus",
				state: "OH",
				zip: "43215",
			}
		);
	});

	it("should handle keyboard navigation", async () => {
		const { geocodeAddress } = require("../../../Utils/MapUtils");
		geocodeAddress.mockResolvedValue({ lat: 40.7128, lng: -74.006 });

		const mockOnClick = jest.fn();
		await act(async () => {
			render(<MiniMapComponent {...mockProps} onClick={mockOnClick} />);
		});

		// Wait for map to load
		await waitFor(() => {
			expect(screen.getByRole("button")).toBeInTheDocument();
		});

		// Press Enter key
		fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

		expect(mockOnClick).toHaveBeenCalled();
	});
});

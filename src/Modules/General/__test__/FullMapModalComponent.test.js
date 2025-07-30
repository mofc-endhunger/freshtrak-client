import React from "react";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from "@testing-library/react";
import FullMapModalComponent from "../FullMapModalComponent";

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
}));

describe("FullMapModalComponent", () => {
	const mockProps = {
		isOpen: true,
		onClose: jest.fn(),
		coordinates: { lat: 40.7128, lng: -74.006 },
		address: "123 Main St",
		city: "New York",
		state: "NY",
		zip: "10001",
		agencyName: "Test Agency",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should not render when isOpen is false", () => {
		render(<FullMapModalComponent {...mockProps} isOpen={false} />);
		expect(screen.queryByText("Test Agency")).not.toBeInTheDocument();
	});

	it("should render modal header with agency name", () => {
		render(<FullMapModalComponent {...mockProps} />);
		expect(screen.getByText("Test Agency")).toBeInTheDocument();
	});

	it("should render close button", () => {
		render(<FullMapModalComponent {...mockProps} />);
		expect(
			screen.getByRole("button", { name: /close map/i })
		).toBeInTheDocument();
	});

	it("should call onClose when close button is clicked", () => {
		const mockOnClose = jest.fn();
		render(<FullMapModalComponent {...mockProps} onClose={mockOnClose} />);

		fireEvent.click(screen.getByRole("button", { name: /close map/i }));
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should call onClose when backdrop is clicked", () => {
		const mockOnClose = jest.fn();
		render(<FullMapModalComponent {...mockProps} onClose={mockOnClose} />);

		const overlay = screen.getByRole("presentation");
		fireEvent.click(overlay);
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should render map container when coordinates are provided", async () => {
		await act(async () => {
			render(<FullMapModalComponent {...mockProps} />);
		});

		await waitFor(() => {
			const mapContainer = document.querySelector(".full-map-container");
			expect(mapContainer).toBeInTheDocument();
		});
	});

	it("should render loading state initially", () => {
		render(<FullMapModalComponent {...mockProps} />);
		expect(screen.getByText("Loading map...")).toBeInTheDocument();
	});

	it("should handle missing coordinates gracefully", () => {
		render(<FullMapModalComponent {...mockProps} coordinates={null} />);
		expect(screen.getByText("Loading map...")).toBeInTheDocument();
	});

	it("should handle missing agency name", () => {
		render(<FullMapModalComponent {...mockProps} agencyName="" />);
		expect(screen.getByText("Agency Location")).toBeInTheDocument();
	});
});

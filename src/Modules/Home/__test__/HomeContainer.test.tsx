import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import HomeContainer from "../HomeContainer";
// search slice mocked in test

// Mock axios
jest.mock("axios");
const mockAxios = require("axios");

// Mock the LoadingSpinner component
jest.mock("../../General/LoadingSpinner", () => {
	return function MockLoadingSpinner({ size }: { size: string }) {
		return <div data-testid={`loading-spinner-${size}`}>Loading...</div>;
	};
});

// Mock the EventListComponent
jest.mock("../../Events/EventListComponent", () => {
	return function MockEventListComponent({ events, zipCode }: any) {
		return (
			<div data-testid="event-list-component">
				Mock Event List for zip: {zipCode}
			</div>
		);
	};
});

// Mock the EventHandler and HomeEventFormat functions
jest.mock(
	"../../../Utils/EventHandler",
	() => ({
		EventHandler: jest.fn(data => ({
			"2024-01-01": [{ id: "1", name: "Test Event" }],
		})),
		HomeEventFormat: jest.fn((event, dateId) => ({
			id: "1",
			eventName: "Test Event",
			acceptReservations: true,
			acceptInterest: true,
			acceptWalkin: true,
			eventService: "test-service",
		})),
	}),
	{ virtual: true }
);

// Create a mock store
const createMockStore = () => {
	return configureStore({
		reducer: {
			// Use a minimal mock reducer for the search slice to avoid TS/module resolution issues
			search: (state = {}, _action) => state,
		},
	});
};

describe("HomeContainer", () => {
	let mockStore: ReturnType<typeof createMockStore>;

	beforeEach(() => {
		mockStore = createMockStore();
		mockAxios.get.mockClear();

		// Mock localStorage
		Object.defineProperty(window, "localStorage", {
			value: {
				getItem: jest.fn(key => {
					if (key === "search_zip") return "12345";
					if (key === "userToken") return "mock-token";
					return null;
				}),
				setItem: jest.fn(),
			},
			writable: true,
		});
	});

	const renderWithProvider = () => {
		return render(
			<Provider store={mockStore}>
				<HomeContainer />
			</Provider>
		);
	};

	it("renders the component with correct heading and form", () => {
		renderWithProvider();

		expect(screen.getByText("Zip Code")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Enter zip code")
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Search" })
		).toBeInTheDocument();
	});

	it("renders all child components", () => {
		renderWithProvider();

		expect(screen.getByText("Your Local Food Bank")).toBeInTheDocument();
		expect(
			screen.getByText("Your UpComing Reservations")
		).toBeInTheDocument();
		expect(screen.getByText("Resource Events")).toBeInTheDocument();
	});

	it("handles form submission correctly", async () => {
		mockAxios.get.mockResolvedValueOnce({
			data: { agencies: [] },
		});

		renderWithProvider();

		const zipInput = screen.getByPlaceholderText("Enter zip code");
		const searchButton = screen.getByRole("button", { name: "Search" });

		// Fill in the form
		fireEvent.change(zipInput, { target: { value: "67890" } });
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(zipInput).toHaveValue("67890");
		});
	});

	it("shows validation error for empty zip code", async () => {
		renderWithProvider();

		const searchButton = screen.getByRole("button", { name: "Search" });
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(
				screen.getByText("Zip code is required")
			).toBeInTheDocument();
		});
	});

	it("calls API with correct parameters when form is submitted", async () => {
		mockAxios.get.mockResolvedValueOnce({
			data: { agencies: [] },
		});

		renderWithProvider();

		const zipInput = screen.getByPlaceholderText("Enter zip code");
		const searchButton = screen.getByRole("button", { name: "Search" });

		fireEvent.change(zipInput, { target: { value: "67890" } });
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(mockAxios.get).toHaveBeenCalledWith(expect.any(String), {
				params: { zip_code: "67890" },
			});
		});
	});

	it("shows loading spinner when fetching events", async () => {
		mockAxios.get.mockImplementation(
			() => new Promise(resolve => setTimeout(resolve, 100))
		);

		renderWithProvider();

		const zipInput = screen.getByPlaceholderText("Enter zip code");
		const searchButton = screen.getByRole("button", { name: "Search" });

		fireEvent.change(zipInput, { target: { value: "67890" } });
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(
				screen.getByTestId("loading-spinner-medium")
			).toBeInTheDocument();
		});
	});

	it("handles API errors gracefully", async () => {
		mockAxios.get.mockRejectedValueOnce(new Error("API Error"));

		renderWithProvider();

		const zipInput = screen.getByPlaceholderText("Enter zip code");
		const searchButton = screen.getByRole("button", { name: "Search" });

		fireEvent.change(zipInput, { target: { value: "67890" } });
		fireEvent.click(searchButton);

		await waitFor(() => {
			// Should still render the component
			expect(screen.getByText("Zip Code")).toBeInTheDocument();
		});
	});

	it("fetches user reservations on component mount", async () => {
		mockAxios.get.mockResolvedValueOnce({
			data: [],
		});

		renderWithProvider();

		await waitFor(() => {
			expect(mockAxios.get).toHaveBeenCalledWith(expect.any(String), {
				headers: { Authorization: "Bearer mock-token" },
			});
		});
	});

	it("renders with correct background and spacing classes", () => {
		renderWithProvider();

		const section = screen.getByText("Zip Code").closest("section");
		expect(section).toHaveClass("bg-[#F2F0F4]");

		const container = section?.querySelector(".container");
		expect(container).toHaveClass(
			"pt-16",
			"sm:pt-24",
			"lg:pt-[150px]",
			"pb-16",
			"sm:pb-24",
			"lg:pb-[150px]"
		);
	});

	it("renders form with shadcn components", () => {
		renderWithProvider();

		// Check that Label component is used
		const label = screen.getByText("Zip Code");
		expect(label.tagName).toBe("LABEL");

		// Check that Input component is used
		const input = screen.getByPlaceholderText("Enter zip code");
		expect(input).toBeInTheDocument();

		// Check that Button component is used
		const button = screen.getByRole("button", { name: "Search" });
		expect(button).toBeInTheDocument();
	});
});

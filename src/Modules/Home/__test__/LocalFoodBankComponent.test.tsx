import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LocalFoodBankComponent from "../LocalFoodBankComponent";

// Mock axios
jest.mock("axios");
const mockAxios = require("axios");

// Mock the SpinnerComponent
jest.mock("../../General/SpinnerComponent", () => {
	return function MockSpinner() {
		return <div data-testid="spinner">Loading...</div>;
	};
});

// Create a mock store
const createMockStore = () => {
	return configureStore({
		reducer: {
			search: (state = {}, action) => state, // Simple mock reducer
		},
	});
};

describe("LocalFoodBankComponent", () => {
	let mockStore: ReturnType<typeof createMockStore>;

	beforeEach(() => {
		mockStore = createMockStore();
		mockAxios.get.mockClear();
	});

	const renderWithProvider = (props: any) => {
		return render(
			<Provider store={mockStore}>
				<LocalFoodBankComponent {...props} />
			</Provider>
		);
	};

	it("renders the component with correct heading", () => {
		renderWithProvider({ zipCode: "12345" });

		expect(screen.getByText("Your Local Food Bank")).toBeInTheDocument();
	});

	it("shows spinner when no zip code is provided", () => {
		renderWithProvider({ zipCode: null });

		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("shows spinner when zip code is empty string", () => {
		renderWithProvider({ zipCode: "" });

		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it('shows "NO FOOD BANKS FOUND" message when API returns no results', async () => {
		mockAxios.get.mockResolvedValueOnce({
			data: { foodbanks: [] },
		});

		renderWithProvider({ zipCode: "12345" });

		await waitFor(() => {
			expect(
				screen.getByText("NO FOOD BANKS FOUND WITHIN THE ZIP CODE")
			).toBeInTheDocument();
		});
	});

	it("renders food bank data when API returns results", async () => {
		const mockFoodBankData = {
			foodbanks: [
				{
					name: "Test Food Bank",
					logo: "test-logo.png",
					address: "123 Test St",
					city: "Test City",
					state: "TS",
					zip: "12345",
					phone: "555-1234",
					display_url: "https://testfoodbank.org",
				},
			],
		};

		mockAxios.get.mockResolvedValueOnce({
			data: mockFoodBankData,
		});

		renderWithProvider({ zipCode: "12345" });

		await waitFor(() => {
			expect(screen.getByText("Test Food Bank")).toBeInTheDocument();
			expect(
				screen.getByText("123 Test St Test City, TS 12345")
			).toBeInTheDocument();
			expect(screen.getByText("555-1234")).toBeInTheDocument();
			expect(
				screen.getByText("https://testfoodbank.org")
			).toBeInTheDocument();
		});
	});

	it("handles API errors gracefully", async () => {
		mockAxios.get.mockRejectedValueOnce(new Error("API Error"));

		renderWithProvider({ zipCode: "12345" });

		// Should still show the heading
		expect(screen.getByText("Your Local Food Bank")).toBeInTheDocument();

		// Should show spinner initially
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});
});

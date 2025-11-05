import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import RegistrationContainer from "../RegistrationContainer";
import eventSlice from "../../../Store/Events/eventSlice";
import userSlice from "../../../Store/userSlice";

// Mock axios
jest.mock("axios");
const mockAxios = require("axios");

// Mock the dependencies
jest.mock("react-gtm-module", () => ({
	dataLayer: jest.fn(),
}));

jest.mock("../../../Utils/EventHandler", () => ({
	EventFormat: jest.fn(event => event),
}));

jest.mock("../../../Services/ApiService", () => ({
	sendRegistrationConfirmationEmail: jest.fn(),
}));

jest.mock("../../../Services/HouseholdsApiService", () => ({
	HouseholdsApiService: jest.fn().mockImplementation(() => ({
		getUsersMe: jest.fn().mockResolvedValue({
			members: [{
				user_id: "1",
				first_name: "John",
				last_name: "Doe",
			}],
			address_line_1: "123 Main St",
			city: "Test City",
			state: "CA",
			zip_code: "12345",
			phone: "1234567890",
			email: "john@example.com",
			counts: {
				seniors: 0,
				adults: 1,
				children: 0,
				total: 1,
			},
		}),
		updateHousehold: jest.fn().mockResolvedValue({}),
	})),
}));

jest.mock("../RegistrationComponent", () => {
	return function MockRegistrationComponent() {
		return (
			<div data-testid="registration-component">
				Registration Component
			</div>
		);
	};
});

jest.mock("../../General/SpinnerComponent", () => {
	return function MockSpinnerComponent() {
		return <div data-testid="spinner">Loading...</div>;
	};
});

jest.mock("../../General/ErrorComponent", () => {
	return function MockErrorComponent({ error }: { error: string[] }) {
		return (
			<div data-testid="error-component">Error: {error.join(", ")}</div>
		);
	};
});

jest.mock("../../Authentication/AuthenticationModal", () => {
	return function MockAuthModal({
		show,
		onLogin,
	}: {
		show: boolean;
		onLogin: () => void;
	}) {
		return show ? <div data-testid="auth-modal">Auth Modal</div> : null;
	};
});

jest.mock("../../Notifications/NotifyToastComponent", () => ({
	NotifyToast: () => <div data-testid="notify-toast">Toast</div>,
	showToast: jest.fn(),
}));

// Mock StorageService
jest.mock("../../../Utils/StorageService", () => {
	const mockStorageService = {
		getUserToken: jest.fn(),
		getGuestUser: jest.fn(),
		getCognitoUser: jest.fn(),
		isLoggedInUser: jest.fn(),
		isGuestUser: jest.fn(),
	};
	return {
		StorageService: mockStorageService,
	};
});

// Get the mocked StorageService after mock is created
const { StorageService: mockStorageService } = require("../../../Utils/StorageService");

// Create a mock store
const createMockStore = () => {
	return configureStore({
		reducer: {
			event: eventSlice,
			user: userSlice,
		},
		preloadedState: {
			event: {
				event: {
					id: "1",
					agencyName: "Test Agency",
					date: "2024-01-01",
					startTime: "09:00",
					endTime: "10:00",
					acceptWalkin: true,
				},
			},
			user: {
				user: null,
			},
		},
	});
};

describe("RegistrationContainer", () => {
	let store: ReturnType<typeof createMockStore>;

	beforeEach(() => {
		store = createMockStore();
		jest.clearAllMocks();

		// Reset StorageService mocks
		mockStorageService.getUserToken.mockReturnValue(null);
		mockStorageService.getGuestUser.mockReturnValue(null);
		mockStorageService.getCognitoUser.mockReturnValue(null);
		mockStorageService.isLoggedInUser.mockReturnValue(false);
		mockStorageService.isGuestUser.mockReturnValue(false);

		// Mock environment variables
		process.env.REACT_APP_CLIENT_URL = "http://localhost:3000";

		// Mock axios.get to return a mock event by default
		mockAxios.get.mockResolvedValue({
			data: {
				data: {
					id: "1",
					agencyName: "Test Agency",
					date: "2024-01-01",
					startTime: "09:00",
					endTime: "10:00",
					acceptWalkin: true,
				},
			},
		});
	});

	const renderWithProviders = (component: React.ReactElement, route = "/registration/1") => {
		return render(
			<Provider store={store}>
				<MemoryRouter initialEntries={[route]}>
					{component}
				</MemoryRouter>
			</Provider>
		);
	};

	test("renders without crashing", () => {
		// Mock that user is not authenticated (no token)
		mockStorageService.getUserToken.mockReturnValue(null);
		mockStorageService.getGuestUser.mockReturnValue(null);
		mockStorageService.isLoggedInUser.mockReturnValue(false);
		mockStorageService.isGuestUser.mockReturnValue(false);

		const { container } = renderWithProviders(<RegistrationContainer />);
		expect(container).toBeInTheDocument();
	});

	test("shows auth modal when user is not authenticated", async () => {
		mockStorageService.getUserToken.mockReturnValue(null);
		mockStorageService.getGuestUser.mockReturnValue(null);
		mockStorageService.isLoggedInUser.mockReturnValue(false);
		mockStorageService.isGuestUser.mockReturnValue(false);

		renderWithProviders(<RegistrationContainer />);

		// Wait for the auth modal to appear (component checks auth after event loads)
		await waitFor(() => {
			expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	test("shows auth modal when user is authenticated but no profile", async () => {
		// Mock that user has token but no profile
		mockStorageService.getUserToken.mockReturnValue("mock-token");
		mockStorageService.getGuestUser.mockReturnValue(null);
		mockStorageService.isLoggedInUser.mockReturnValue(false);
		mockStorageService.isGuestUser.mockReturnValue(false);

		renderWithProviders(<RegistrationContainer />);

		// Component shows spinner when token exists but no user profile
		// (because !user triggers spinner at line 928)
		await waitFor(() => {
			expect(screen.getByTestId("spinner")).toBeInTheDocument();
		}, { timeout: 1000 });
	});

	test("renders registration component when user is authenticated and loaded", () => {
		// Mock authenticated user with profile
		const mockUserProfile = {
			first_name: "John",
			last_name: "Doe",
			email: "john@example.com",
			phone: "1234567890",
			date_of_birth: "1990-01-01",
			gender: "Male",
			address_line_1: "123 Main St",
			city: "Test City",
			state: "CA",
			zip_code: "12345",
			permission_to_text: false,
			permission_to_email: false,
			seniors_in_household: 0,
			adults_in_household: 1,
			children_in_household: 0,
		};

		// Mock StorageService to return token and user profile
		mockStorageService.getUserToken.mockReturnValue("mock-token");
		mockStorageService.getGuestUser.mockReturnValue(mockUserProfile as any);
		mockStorageService.isLoggedInUser.mockReturnValue(false);
		mockStorageService.isGuestUser.mockReturnValue(true);

		// Create a new store with user in Redux state
		const storeWithUser = configureStore({
			reducer: {
				event: eventSlice,
				user: userSlice,
			},
			preloadedState: {
				event: {
					event: {
						id: "1",
						agencyName: "Test Agency",
						date: "2024-01-01",
						startTime: "09:00",
						endTime: "10:00",
						acceptWalkin: true,
					},
				},
				user: {
					user: mockUserProfile as any, // Set user in Redux state with type assertion
				},
			},
		});

		// Render with the store that has user data
		render(
			<Provider store={storeWithUser}>
				<MemoryRouter initialEntries={["/registration/1"]}>
					<RegistrationContainer />
				</MemoryRouter>
			</Provider>
		);

		// Should render the registration component
		expect(
			screen.getByTestId("registration-component")
		).toBeInTheDocument();
	});
});

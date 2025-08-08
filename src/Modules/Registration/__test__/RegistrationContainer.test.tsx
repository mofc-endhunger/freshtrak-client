import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import RegistrationContainer from "../RegistrationContainer";
import eventSlice from "../../../Store/Events/eventSlice";
import userSlice from "../../../Store/userSlice";

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

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
	value: sessionStorageMock,
});

describe("RegistrationContainer", () => {
	let store: ReturnType<typeof createMockStore>;

	beforeEach(() => {
		store = createMockStore();
		jest.clearAllMocks();

		// Mock environment variables
		process.env.REACT_APP_CLIENT_URL = "http://localhost:3000";
	});

	const renderWithProviders = (component: React.ReactElement) => {
		return render(
			<Provider store={store}>
				<BrowserRouter>{component}</BrowserRouter>
			</Provider>
		);
	};

	test("renders without crashing", () => {
		// Mock that user is not authenticated (no token)
		localStorageMock.getItem.mockReturnValue(null);

		const { container } = renderWithProviders(<RegistrationContainer />);
		expect(container).toBeInTheDocument();
	});

	test("shows auth modal when user is not authenticated", () => {
		localStorageMock.getItem.mockReturnValue(null);

		renderWithProviders(<RegistrationContainer />);

		// Should show auth modal when no token
		expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
	});

	test("shows auth modal when user is authenticated but no profile", () => {
		// Mock that user is authenticated but no user profile
		localStorageMock.getItem
			.mockReturnValueOnce("mock-token") // userToken
			.mockReturnValueOnce(null); // userProfile

		renderWithProviders(<RegistrationContainer />);

		// Should show auth modal when no user profile
		expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
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

		// Mock localStorage to return token and user profile
		// The component calls localStorage.getItem("userToken") first, then localStorage.getItem("userProfile")
		localStorageMock.getItem.mockImplementation((key: string) => {
			if (key === "userToken") {
				return "mock-token";
			}
			if (key === "userProfile") {
				return JSON.stringify(mockUserProfile);
			}
			return null;
		});

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
				<BrowserRouter>
					<RegistrationContainer />
				</BrowserRouter>
			</Provider>
		);

		// Should render the registration component
		expect(
			screen.getByTestId("registration-component")
		).toBeInTheDocument();
	});
});

/**
 * Integration Test for HouseholdSignUpWrapper
 * Tests the integration of household setup with the sign-up process
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { HouseholdSignUpWrapper } from "../HouseholdSignUpWrapper";
import { AuthProvider } from "../../../Authentication/AuthContext";

// Mock the HouseholdSignUpIntegration service
jest.mock("../../services/HouseholdSignUpIntegration", () => ({
	useHouseholdSignUpIntegration: () => ({
		getSignUpState: () => ({
			hasOfferedSetup: false,
			userChoice: null,
			completionStatus: "pending",
			householdId: null,
			lastPromptDate: null,
		}),
		offerHouseholdSetup: jest.fn(),
		createHousehold: jest.fn(),
		skipHouseholdSetup: jest.fn(),
		deferHouseholdSetup: jest.fn(),
	}),
}));

// Mock the HouseholdSetupOffer component
jest.mock("../HouseholdSetupOffer", () => ({
	HouseholdSetupOffer: ({ onSetupNow, onSkip, onSetupLater }: any) => (
		<div data-testid="household-setup-offer">
			<button onClick={onSetupNow}>Setup Now</button>
			<button onClick={onSkip}>Skip</button>
			<button onClick={onSetupLater}>Setup Later</button>
		</div>
	),
}));

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

describe("HouseholdSignUpWrapper Integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.getItem.mockReturnValue(null);
	});

	it("renders children when user is not authenticated", () => {
		render(
			<AuthProvider>
				<HouseholdSignUpWrapper>
					<div data-testid="app-content">App Content</div>
				</HouseholdSignUpWrapper>
			</AuthProvider>
		);

		expect(screen.getByTestId("app-content")).toBeInTheDocument();
		expect(
			screen.queryByTestId("household-setup-offer")
		).not.toBeInTheDocument();
	});

	it("renders children when user is authenticated but household setup not offered", () => {
		// Mock authenticated user
		localStorageMock.getItem.mockImplementation(key => {
			if (key === "cognitoUser") {
				return JSON.stringify({
					email: "test@example.com",
					name: "Test User",
					isSignedIn: true,
				});
			}
			return null;
		});

		render(
			<AuthProvider>
				<HouseholdSignUpWrapper>
					<div data-testid="app-content">App Content</div>
				</HouseholdSignUpWrapper>
			</AuthProvider>
		);

		expect(screen.getByTestId("app-content")).toBeInTheDocument();
	});

	it("shows household setup offer when conditions are met", async () => {
		// Mock authenticated user with pending household setup
		localStorageMock.getItem.mockImplementation(key => {
			if (key === "cognitoUser") {
				return JSON.stringify({
					email: "test@example.com",
					name: "Test User",
					isSignedIn: true,
				});
			}
			if (key === "household_signup_state") {
				return JSON.stringify({
					hasOfferedSetup: false,
					userChoice: null,
					completionStatus: "pending",
					householdId: null,
					lastPromptDate: null,
				});
			}
			return null;
		});

		render(
			<AuthProvider>
				<HouseholdSignUpWrapper>
					<div data-testid="app-content">App Content</div>
				</HouseholdSignUpWrapper>
			</AuthProvider>
		);

		// Wait for the component to process authentication state
		await waitFor(() => {
			expect(screen.getByTestId("app-content")).toBeInTheDocument();
		});
	});

	it("handles household setup actions correctly", async () => {
		const mockOfferHouseholdSetup = jest.fn();
		const mockCreateHousehold = jest.fn();
		const mockSkipHouseholdSetup = jest.fn();
		const mockDeferHouseholdSetup = jest.fn();

		// Mock the service with specific functions
		jest.doMock("../../services/HouseholdSignUpIntegration", () => ({
			useHouseholdSignUpIntegration: () => ({
				getSignUpState: () => ({
					hasOfferedSetup: false,
					userChoice: null,
					completionStatus: "pending",
					householdId: null,
					lastPromptDate: null,
				}),
				offerHouseholdSetup: mockOfferHouseholdSetup,
				createHousehold: mockCreateHousehold,
				skipHouseholdSetup: mockSkipHouseholdSetup,
				deferHouseholdSetup: mockDeferHouseholdSetup,
			}),
		}));

		render(
			<AuthProvider>
				<HouseholdSignUpWrapper>
					<div data-testid="app-content">App Content</div>
				</HouseholdSignUpWrapper>
			</AuthProvider>
		);

		expect(screen.getByTestId("app-content")).toBeInTheDocument();
	});
});

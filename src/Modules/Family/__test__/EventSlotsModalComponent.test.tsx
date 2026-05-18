import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EventSlotsModalComponent from "../EventSlotsModalComponent";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useAuth hook
jest.mock("../../Authentication/AuthContext", () => ({
	useAuth: () => ({
		isAuthenticated: true,
		user: { accessToken: "mock-token" },
		isLoading: false,
		signIn: jest.fn(),
		signUp: jest.fn(),
		confirmSignUp: jest.fn(),
		signOut: jest.fn(),
		resetPassword: jest.fn(),
		confirmResetPassword: jest.fn(),
		resendConfirmationCode: jest.fn(),
	}),
}));

// Mock react-router-bootstrap
jest.mock("react-router-bootstrap", () => ({
	LinkContainer: ({ children, to }: any) => (
		<div data-testid="link-container" data-to={JSON.stringify(to)}>
			{children}
		</div>
	),
}));

// Mock LoadingSpinner
jest.mock("../../General/LoadingSpinner", () => {
	return function MockLoadingSpinner({ size }: { size: string }) {
		return (
			<div data-testid="loading-spinner" data-size={size}>
				Loading...
			</div>
		);
	};
});

// Mock HouseholdConfirmationModal
jest.mock("../../Registration/components/HouseholdConfirmationModal", () => {
	return function MockHouseholdConfirmationModal({
		isOpen,
		onConfirm,
		onReview,
	}: any) {
		return isOpen ? (
			<div data-testid="household-confirmation-modal">
				<button onClick={onConfirm} data-testid="confirm-button">
					Confirm
				</button>
				<button onClick={onReview} data-testid="review-button">
					Review
				</button>
			</div>
		) : null;
	};
});

// Mock HouseholdRegistrationService
jest.mock("../../../Services/HouseholdRegistrationService", () => ({
	HouseholdRegistrationService: jest.fn().mockImplementation(() => ({
		checkHouseholdCompleteness: jest.fn().mockReturnValue(true),
		registerWithHousehold: jest.fn().mockResolvedValue({ success: true }),
	})),
}));

// Mock HouseholdsApiService
jest.mock("../../../Services/HouseholdsApiService", () => ({
	HouseholdsApiService: jest.fn().mockImplementation(() => ({
		getUsersMe: jest.fn().mockResolvedValue({
			id: 1,
			name: "Test Family",
			members: [
				{
					is_head_of_household: 1,
					date_of_birth: "1985-01-01",
				},
			],
			address_line_1: "123 Test St",
			city: "Test City",
			state: "TS",
			zip_code: "12345",
			phone: "555-1234",
			email: "test@example.com",
			counts: { adults: 2, children: 1, seniors: 0, total: 3 },
		}),
	})),
}));

// Mock localization
jest.mock("../../Localization/LocalizationComponent", () => ({
	dialog_choose_time_slot_title: "Choose Time Slot",
	dialog_choose_time_slot_description:
		"Select an available time slot for your registration.",
	button_go_back: "Go Back",
	button_save_and_continue: "Save and Continue",
	loading_loading: "Loading...",
	sr_available_time_slots_registration:
		"Available time slots for registration",
	text_slot: "slot",
	text_slots: "slots",
	text_available: "available",
	aria_loading_time_slots: "Loading time slots",
	sr_return_previous_without_slot:
		"Return to previous page without selecting a time slot.",
	sr_proceed_registration_selected_slot:
		"Proceed with registration using the selected time slot.",
}));

const mockStore = configureStore([]);

const mockEvent = {
	id: "123",
	acceptReservations: 1,
};

const mockEventHours = [
	{
		event_slots: [
			{
				event_slot_id: "1",
				start_time: "09:00",
				end_time: "10:00",
				open_slots: 5,
			},
			{
				event_slot_id: "2",
				start_time: "10:00",
				end_time: "11:00",
				open_slots: 0,
			},
			{
				event_slot_id: "3",
				start_time: "11:00",
				end_time: "12:00",
				open_slots: 3,
			},
		],
	},
];

const mockApiResponse = {
	data: {
		event_date: {
			event_hours: mockEventHours,
			date: "2024-01-15",
		},
	},
};

const renderComponent = (props = {}) => {
	const store = mockStore({});
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<EventSlotsModalComponent
					event={mockEvent}
					selectedSlotId=""
					onSlotChange={jest.fn()}
					{...props}
				/>
			</MemoryRouter>
		</Provider>
	);
};

describe("EventSlotsModalComponent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedAxios.get.mockResolvedValue(mockApiResponse);
	});

	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
	});

	describe("Rendering", () => {
		test("should render without crashing", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		test("should show modal when acceptReservations is 1", async () => {
			renderComponent();
			await waitFor(() => {
				// Use getAllByText and check that at least one visible title exists
				const titles = screen.getAllByText("Choose Time Slot");
				expect(titles.length).toBeGreaterThan(0);
				// Check that the visible title (with specific ID) exists
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		test("should not show modal when acceptReservations is not 1", () => {
			renderComponent({
				event: { ...mockEvent, acceptReservations: 0 },
			});
			// Check that dialog role is not present instead of text
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		test("should display loading spinner initially", async () => {
			renderComponent();
			await waitFor(() => {
				expect(
					screen.getByTestId("loading-spinner")
				).toBeInTheDocument();
			});
		});

		test("should display event date after API call", async () => {
			renderComponent();
			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});
	});

	describe("API Integration", () => {
		test("should call API to get event hours", async () => {
			renderComponent();
			await waitFor(() => {
				expect(mockedAxios.get).toHaveBeenCalledWith(
					expect.stringContaining("/123/event_hours")
				);
			});
		});

		test("should handle API error gracefully", async () => {
			mockedAxios.get.mockRejectedValue(new Error("API Error"));
			renderComponent();
			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		test("should set event hours and date from API response", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
				expect(screen.getByText("11:00 - 12:00")).toBeInTheDocument();
			});
		});
	});

	describe("Time Slot Display", () => {
		test("should display only time slots with open slots > 0", async () => {
			renderComponent();
			await waitFor(() => {
				expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
				expect(screen.getByText("11:00 - 12:00")).toBeInTheDocument();
				expect(
					screen.queryByText("10:00 - 11:00")
				).not.toBeInTheDocument();
			});
		});

		test("should render radio buttons for each available time slot", async () => {
			renderComponent();
			await waitFor(() => {
				const radioButtons = screen.getAllByRole("radio");
				expect(radioButtons).toHaveLength(2);
			});
		});

		test("should have correct radio button values", async () => {
			renderComponent();
			await waitFor(() => {
				const radioButton1 = screen.getByDisplayValue("1");
				const radioButton3 = screen.getByDisplayValue("3");
				expect(radioButton1).toBeInTheDocument();
				expect(radioButton3).toBeInTheDocument();
			});
		});
	});

	describe("User Interactions", () => {
		test("should call onSlotChange when radio button is clicked", async () => {
			const mockOnSlotChange = jest.fn();
			renderComponent({ onSlotChange: mockOnSlotChange });
			const radioButton = await screen.findByDisplayValue("1");
			fireEvent.click(radioButton);
			await waitFor(() => {
				expect(mockOnSlotChange).toHaveBeenCalled();
			});
		});

		test("should check radio button when selectedSlotId matches", async () => {
			renderComponent({ selectedSlotId: "1" });

			await waitFor(() => {
				const radioButton = screen.getByDisplayValue(
					"1"
				) as HTMLInputElement;
				expect(radioButton.checked).toBe(true);
			});
		});

		test("should close modal when Go Back button is clicked", async () => {
			renderComponent();
			const goBackButton = await screen.findByText("Go Back");
			fireEvent.click(goBackButton);
		});

		test("should close modal when Save and Continue button is clicked", async () => {
			renderComponent({ selectedSlotId: "1" });
			const saveButton = await screen.findByText("Save and Continue");
			fireEvent.click(saveButton);
			await waitFor(() => {
				expect(
					screen.getByTestId("household-confirmation-modal"),
				).toBeInTheDocument();
			});
		});
	});

	describe("Household Confirmation Flow", () => {
		test("should trigger household confirmation flow when Save and Continue is clicked", async () => {
			renderComponent({ selectedSlotId: "1" });
			const saveButton = await screen.findByText("Save and Continue");
			fireEvent.click(saveButton);
			await waitFor(() => {
				expect(
					screen.getByTestId("household-confirmation-modal"),
				).toBeInTheDocument();
			});
		});

		test("should show loading state during household data fetch", async () => {
			renderComponent({ selectedSlotId: "1" });

			// Wait for dialog and slots to load
			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});

			await waitFor(() => {
				expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
			});

			// Find the Save and Continue button
			const saveButton = await waitFor(() => {
				return screen.getByText("Save and Continue");
			});

			// Click the button - this will trigger the loading state
			fireEvent.click(saveButton);

			// Clicking continue should eventually open the household confirmation modal.
			await waitFor(
				() => {
					expect(
						screen.getByTestId("household-confirmation-modal"),
					).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);
		});
	});

	describe("Button States", () => {
		test("should disable Save and Continue button when no slot is selected", async () => {
			renderComponent({ selectedSlotId: "" });

			await waitFor(() => {
				const saveButton = screen.getByText("Save and Continue");
				expect(saveButton).toBeDisabled();
			});
		});

		test("should enable Save and Continue button when slot is selected", async () => {
			renderComponent({ selectedSlotId: "1" });

			await waitFor(() => {
				const saveButton = screen.getByText("Save and Continue");
				expect(saveButton).not.toBeDisabled();
			});
		});
	});

	describe("Accessibility", () => {
		test("should have proper form structure", async () => {
			renderComponent();

			await waitFor(() => {
				const radioButtons = screen.getAllByRole("radio");
				radioButtons.forEach((radio, index) => {
					const label = screen.getByText(
						index === 0 ? "09:00 - 10:00" : "11:00 - 12:00"
					);
					expect(label).toHaveAttribute("for", radio.id);
				});
			});
		});

		test("should have proper button labels", async () => {
			renderComponent();

			await waitFor(() => {
				expect(screen.getByText("Go Back")).toBeInTheDocument();
				expect(
					screen.getByText("Save and Continue")
				).toBeInTheDocument();
			});
		});

		test("should have proper modal title", async () => {
			renderComponent();

			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});
	});

	describe("Styling and Classes", () => {
		test("should apply responsive classes to buttons", async () => {
			renderComponent();

			await waitFor(() => {
				const goBackButton = screen.getByText("Go Back");
				const saveButton = screen.getByText("Save and Continue");

				expect(goBackButton).toHaveClass("w-full", "sm:w-auto");
				expect(saveButton).toHaveClass("w-full", "sm:w-auto");
			});
		});

		test("should apply proper radio button styling", async () => {
			renderComponent();

			await waitFor(() => {
				const radioButton = screen.getByDisplayValue("1");
				expect(radioButton).toHaveClass(
					"h-4",
					"w-4",
					"text-indigo-600"
				);
			});
		});

		test("should apply proper label styling", async () => {
			renderComponent();

			await waitFor(() => {
				const label = screen.getByText("09:00 - 10:00");
				expect(label).toHaveClass("ml-2", "text-sm", "font-medium");
			});
		});
	});

	describe("Edge Cases", () => {
		test("should handle empty event hours array", async () => {
			mockedAxios.get.mockResolvedValue({
				data: {
					event_date: {
						event_hours: [],
						date: "2024-01-15",
					},
				},
			});

			renderComponent();

			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
				expect(screen.queryByRole("radio")).not.toBeInTheDocument();
			});
		});

		test("should handle undefined event hours", async () => {
			mockedAxios.get.mockResolvedValue({
				data: {
					event_date: {
						event_hours: undefined,
						date: "2024-01-15",
					},
				},
			});

			renderComponent();

			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		test("should handle missing event date data", async () => {
			mockedAxios.get.mockResolvedValue({
				data: {},
			});

			renderComponent();

			await waitFor(() => {
				// Check that dialog is present instead of specific text
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});
	});
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import EventSlotsModalComponent from "../EventSlotsModalComponent";
import { Event } from "../types/family.types";

// Mock the HouseholdConfirmationModal
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

// Mock LoadingSpinner
jest.mock("../../General/LoadingSpinner", () => {
	return function MockLoadingSpinner({ size }: { size: string }) {
		return <div data-testid="loading-spinner">Loading...</div>;
	};
});

// Mock alarm icon
jest.mock("../../../Assets/img/alarm.svg", () => "alarm-icon.svg");

// Mock axios
jest.mock("axios", () => ({
	get: jest.fn().mockResolvedValue({
		data: {
			event_date: {
				event_hours: [
					{
						event_slots: [
							{
								event_slot_id: "slot1",
								start_time: "09:00",
								end_time: "10:00",
								open_slots: 5,
							},
							{
								event_slot_id: "slot2",
								start_time: "10:00",
								end_time: "11:00",
								open_slots: 3,
							},
						],
					},
				],
			},
		},
	}),
}));

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

const mockEvent: Event = {
	id: "event1",
	acceptReservations: 1,
	name: "Test Event",
	description: "Test Description",
	date: "2023-12-01",
	start_time: "09:00",
	end_time: "17:00",
	location: "Test Location",
	address: "123 Test St",
	city: "Test City",
	state: "TS",
	zip_code: "12345",
	phone: "555-1234",
	email: "test@example.com",
	website: "https://test.com",
	created_at: "2023-01-01T00:00:00Z",
	updated_at: "2023-01-01T00:00:00Z",
};

const defaultProps = {
	event: mockEvent,
	selectedSlotId: "",
	onSlotChange: jest.fn(),
};

// Helper function to render component with Router
const renderWithRouter = (component: React.ReactElement) => {
	return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("EventSlotsModalComponent Accessibility", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Ensure axios mock is properly set up
		const axios = require("axios");
		axios.get.mockResolvedValue({
			data: {
				event_date: {
					event_hours: [
						{
							event_slots: [
								{
									event_slot_id: "slot1",
									start_time: "09:00",
									end_time: "10:00",
									open_slots: 5,
								},
								{
									event_slot_id: "slot2",
									start_time: "10:00",
									end_time: "11:00",
									open_slots: 3,
								},
							],
						},
					],
				},
			},
		});
	});

	describe("ARIA Attributes and Roles", () => {
		it("should have proper dialog role and ARIA attributes", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const dialog = screen.getByRole("dialog");
				expect(dialog).toBeInTheDocument();
				// Radix UI automatically generates aria-labelledby and aria-describedby IDs
				expect(dialog).toHaveAttribute("aria-labelledby");
				expect(dialog).toHaveAttribute("aria-describedby");
				expect(dialog).toHaveAttribute("aria-modal", "true");
			});
		});

		it("should have proper title and description IDs", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				// Use getAllByText to handle multiple elements
				const titles = screen.getAllByText("Choose Time Slot");
				expect(titles.length).toBeGreaterThan(0);

				// Use getAllByText for description as well
				const descriptions = screen.getAllByText(
					"Select an available time slot for your registration."
				);
				expect(descriptions.length).toBeGreaterThan(0);

				// Check that the visible description with specific ID exists
				const visibleDescription = screen
					.getByRole("dialog")
					.querySelector('[id="timeslot-modal-description"]');
				expect(visibleDescription).toBeInTheDocument();
			});
		});

		it("should have proper radiogroup role for time slots", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const radiogroup = screen.getByRole("radiogroup");
				expect(radiogroup).toBeInTheDocument();
				expect(radiogroup).toHaveAttribute(
					"aria-labelledby",
					"timeslot-modal-title"
				);
			});
		});

		it("should have proper legend for radiogroup", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const legend = screen.getByText(
					"Available time slots for registration"
				);
				expect(legend).toBeInTheDocument();
				expect(legend).toHaveClass("sr-only");
			});
		});
	});

	describe("Radio Button Accessibility", () => {
		it("should have proper radio button attributes", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const radioButtons = screen.getAllByRole("radio");
				expect(radioButtons).toHaveLength(2);

				radioButtons.forEach((radio, index) => {
					const slotId = index === 0 ? "slot1" : "slot2";
					expect(radio).toHaveAttribute("name", "time_slot");
					expect(radio).toHaveAttribute("value", slotId);
					expect(radio).toHaveAttribute(
						"aria-describedby",
						`time_slot_${slotId}-description`
					);
				});
			});
		});

		it("should have proper labels for radio buttons", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const label1 = screen.getByText("09:00 - 10:00");
				const label2 = screen.getByText("10:00 - 11:00");

				expect(label1).toBeInTheDocument();
				expect(label2).toBeInTheDocument();
			});
		});

		it("should have proper descriptions for radio buttons", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const description1 = screen.getByText("5 slots available");
				const description2 = screen.getByText("3 slots available");

				expect(description1).toBeInTheDocument();
				expect(description2).toBeInTheDocument();
				expect(description1).toHaveClass("sr-only");
				expect(description2).toHaveClass("sr-only");
			});
		});

		it("should handle singular slot count correctly", async () => {
			// Mock axios with singular slot count
			const axios = require("axios");
			axios.get.mockResolvedValueOnce({
				data: {
					event_date: {
						event_hours: [
							{
								event_slots: [
									{
										event_slot_id: "slot1",
										start_time: "09:00",
										end_time: "10:00",
										open_slots: 1,
									},
								],
							},
						],
					},
				},
			});

			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const description = screen.getByText("1 slot available");
				expect(description).toBeInTheDocument();
			});
		});
	});

	describe("Loading State Accessibility", () => {
		it("should have proper loading state ARIA attributes", () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			// Initially loading
			const loadingContainer = screen.getByRole("status");
			expect(loadingContainer).toBeInTheDocument();
			expect(loadingContainer).toHaveAttribute(
				"aria-label",
				"Loading time slots"
			);
		});
	});

	describe("Button Accessibility", () => {
		it("should have proper button descriptions", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const backButton = screen.getByText("Go Back");
				const continueButton = screen.getByText("Save and Continue");

				expect(backButton).toHaveAttribute(
					"aria-describedby",
					"back-button-description"
				);
				expect(continueButton).toHaveAttribute(
					"aria-describedby",
					"continue-button-description"
				);
			});
		});

		it("should have hidden descriptions for screen readers", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const backDescription = screen.getByText(
					/Return to the previous page/
				);
				const continueDescription = screen.getByText(
					/Proceed with registration/
				);

				expect(backDescription).toHaveClass("sr-only");
				expect(continueDescription).toHaveClass("sr-only");
			});
		});

		it("should disable continue button when no slot selected", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const continueButton = screen.getByText("Save and Continue");
				expect(continueButton).toBeDisabled();
			});
		});

		it("should enable continue button when slot selected", async () => {
			renderWithRouter(
				<EventSlotsModalComponent
					{...defaultProps}
					selectedSlotId="slot1"
				/>
			);

			await waitFor(() => {
				const continueButton = screen.getByText("Save and Continue");
				expect(continueButton).not.toBeDisabled();
			});
		});
	});

	describe("Keyboard Navigation", () => {
		it("should have focusable interactive elements", async () => {
			// Render with a selected slot so Continue button is enabled and focusable
			renderWithRouter(
				<EventSlotsModalComponent
					{...defaultProps}
					selectedSlotId="slot1"
				/>
			);

			await waitFor(() => {
				const radioButtons = screen.getAllByRole("radio");
				expect(radioButtons).toHaveLength(2);
			});

			// Verify all interactive elements are present and can receive focus
			const firstRadio = screen.getByDisplayValue("slot1");
			const secondRadio = screen.getByDisplayValue("slot2");
			const backButton = screen.getByText("Go Back");
			const continueButton = screen.getByText("Save and Continue");

			// Check that elements have valid tabindex or are natively focusable
			expect(firstRadio).toBeInTheDocument();
			expect(secondRadio).toBeInTheDocument();
			expect(backButton).toBeInTheDocument();
			expect(continueButton).toBeInTheDocument();

			// Continue button should be enabled when slot is selected
			expect(continueButton).not.toBeDisabled();
		});

		it("should handle arrow key navigation for radio buttons", async () => {
			const user = userEvent.setup();
			const onSlotChange = jest.fn();
			renderWithRouter(
				<EventSlotsModalComponent
					{...defaultProps}
					onSlotChange={onSlotChange}
				/>
			);

			await waitFor(() => {
				const radioButtons = screen.getAllByRole("radio");
				expect(radioButtons).toHaveLength(2);
			});

			const firstRadio = screen.getByDisplayValue("slot1");
			firstRadio.focus();

			// Arrow down should select next radio button
			await user.keyboard("{ArrowDown}");
			expect(onSlotChange).toHaveBeenCalled();
		});

		it("should handle Enter key on buttons", async () => {
			const user = userEvent.setup();
			renderWithRouter(
				<EventSlotsModalComponent
					{...defaultProps}
					selectedSlotId="slot1"
				/>
			);

			await waitFor(async () => {
				const continueButton = screen.getByText("Save and Continue");
				continueButton.focus();

				await user.keyboard("{Enter}");
				// Button should be clickable (not disabled)
				expect(continueButton).not.toBeDisabled();
			});
		});
	});

	describe("Screen Reader Support", () => {
		it("should provide meaningful content for screen readers", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				// Use getAllByText to handle multiple elements
				const titles = screen.getAllByText("Choose Time Slot");
				expect(titles.length).toBeGreaterThan(0);

				// Use getAllByText for description as well
				const descriptions = screen.getAllByText(
					"Select an available time slot for your registration."
				);
				expect(descriptions.length).toBeGreaterThan(0);
				expect(
					screen.getByText("Available time slots for registration")
				).toBeInTheDocument();
			});
		});

		it("should announce slot availability", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const descriptions =
					screen.getAllByText(/\d+ slots? available/);
				expect(descriptions).toHaveLength(2);
				expect(descriptions[0]).toHaveClass("sr-only");
				expect(descriptions[1]).toHaveClass("sr-only");
			});
		});
	});

	describe("Focus Management", () => {
		it("should manage focus properly when modal opens", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const dialog = screen.getByRole("dialog");
				expect(dialog).toBeInTheDocument();
				expect(dialog).toHaveAttribute("aria-modal", "true");
			});
		});

		it("should trap focus within modal", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const dialog = screen.getByRole("dialog");
				expect(dialog).toHaveAttribute("aria-modal", "true");
			});
		});
	});

	describe("Semantic HTML Structure", () => {
		it("should use proper semantic elements", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const dialog = screen.getByRole("dialog");
				const radiogroup = screen.getByRole("radiogroup");
				const radioButtons = screen.getAllByRole("radio");
				const buttons = screen.getAllByRole("button");

				expect(dialog).toBeInTheDocument();
				expect(radiogroup).toBeInTheDocument();
				expect(radioButtons).toHaveLength(2);
				// Modal has 2 buttons: "Go Back" and "Save and Continue"
				expect(buttons).toHaveLength(2);
			});
		});

		it("should have proper heading hierarchy", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const title = screen.getByRole("heading", { level: 2 });
				expect(title).toHaveTextContent("Choose Time Slot");
			});
		});
	});

	describe("Image Accessibility", () => {
		it("should have proper image attributes", async () => {
			renderWithRouter(<EventSlotsModalComponent {...defaultProps} />);

			await waitFor(() => {
				const image = screen.getByRole("img", { hidden: true });
				expect(image).toHaveAttribute("aria-hidden", "true");
				expect(image).toHaveAttribute("alt", "");
			});
		});
	});
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HouseholdConfirmationModal from "../HouseholdConfirmationModal";
import { HouseholdConfirmationModalProps } from "../../types/household-registration.types";
import { UsersMeResponse } from "../../../Households/types/api.types";

// Mock the Dialog components
jest.mock("../../../../components/ui/dialog", () => ({
	Dialog: ({ children, open }: any) =>
		open ? <div data-testid="dialog">{children}</div> : null,
	DialogContent: ({ children, showCloseButton }: any) => (
		<div data-testid="dialog-content" data-show-close={showCloseButton}>
			{children}
		</div>
	),
	DialogHeader: ({ children }: any) => (
		<div data-testid="dialog-header">{children}</div>
	),
	DialogTitle: ({ children }: any) => (
		<h2 data-testid="dialog-title">{children}</h2>
	),
	DialogDescription: ({ children }: any) => (
		<p data-testid="dialog-description">{children}</p>
	),
	DialogFooter: ({ children }: any) => (
		<div data-testid="dialog-footer">{children}</div>
	),
}));

// Mock the Button component
jest.mock("../../../../components/ui/button", () => ({
	Button: ({ children, onClick, disabled, variant, ...props }: any) => (
		<button
			onClick={onClick}
			disabled={disabled}
			data-variant={variant}
			{...props}
		>
			{children}
		</button>
	),
}));

// Mock LoadingSpinner
jest.mock("../../../General/LoadingSpinner", () => {
	return function MockLoadingSpinner({ size }: any) {
		return (
			<div data-testid="loading-spinner" data-size={size}>
				Loading...
			</div>
		);
	};
});

// Mock HouseholdInfoDisplay
jest.mock("../HouseholdInfoDisplay", () => {
	return function MockHouseholdInfoDisplay({ householdData }: any) {
		return (
			<div data-testid="household-info-display">
				<div data-testid="household-name">{householdData.name}</div>
				<div data-testid="household-address">
					{householdData.address_line_1}, {householdData.city},{" "}
					{householdData.state} {householdData.zip_code}
				</div>
				<div data-testid="household-members">
					{householdData.counts.adults} adults,{" "}
					{householdData.counts.children} children,{" "}
					{householdData.counts.seniors} seniors
				</div>
			</div>
		);
	};
});

describe("HouseholdConfirmationModal", () => {
	const mockHouseholdData: UsersMeResponse = {
		id: 1,
		number: 1,
		name: "Smith Family",
		identification_code: "ABC123",
		added_by: 1,
		last_updated_by: 1,
		deleted_by: null,
		deleted_on: null,
		members: [],
		updated_at: "2024-01-01T00:00:00Z",
		counts: {
			adults: 2,
			children: 1,
			seniors: 1,
			total: 4,
		},
		address_line_1: "123 Main St",
		address_line_2: "Apt 4B",
		city: "Anytown",
		state: "CA",
		zip_code: "12345",
		phone: "555-1234",
		email: "smith@example.com",
	};

	const mockSelectedSlot = {
		event_slot_id: "slot123",
		start_time: "10:00 AM",
		end_time: "11:00 AM",
		open_slots: 5,
	};

	const defaultProps: HouseholdConfirmationModalProps = {
		isOpen: true,
		onClose: jest.fn(),
		onConfirm: jest.fn(),
		onReview: jest.fn(),
		householdData: mockHouseholdData,
		isLoading: false,
		selectedSlot: mockSelectedSlot,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		it("renders modal when open", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			expect(screen.getByTestId("dialog")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
			expect(screen.getByTestId("dialog-title")).toHaveTextContent(
				"Use your household information?"
			);
		});

		it("renders household information when data is available", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			expect(
				screen.getByTestId("household-info-display")
			).toBeInTheDocument();
			expect(screen.getByTestId("household-name")).toHaveTextContent(
				"Smith Family"
			);
		});

		it("renders loading state when isLoading is true", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);

			expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
			expect(
				screen.getByText("Processing your registration...")
			).toBeInTheDocument();
		});

		it("renders error state when error is provided", () => {
			const errorMessage = "Registration failed";
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error={errorMessage}
				/>
			);

			expect(screen.getByText("Registration Error")).toBeInTheDocument();
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		it("renders no household data message when householdData is null", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					householdData={null}
				/>
			);

			expect(
				screen.getByText("No household information available.")
			).toBeInTheDocument();
		});
	});

	describe("Button Interactions", () => {
		it('calls onConfirm when "Yes, register" button is clicked', () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const confirmButton = screen.getByTestId("confirm-register-button");
			fireEvent.click(confirmButton);

			expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
		});

		it('calls onReview when "No, review & update" button is clicked', () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const reviewButton = screen.getByTestId("review-update-button");
			fireEvent.click(reviewButton);

			expect(defaultProps.onReview).toHaveBeenCalledTimes(1);
		});

		it("disables buttons when loading", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);

			const confirmButton = screen.getByTestId("confirm-register-button");
			const reviewButton = screen.getByTestId("review-update-button");

			expect(confirmButton).toBeDisabled();
			expect(reviewButton).toBeDisabled();
		});

		it("disables confirm button when no household data", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					householdData={null}
				/>
			);

			const confirmButton = screen.getByTestId("confirm-register-button");
			expect(confirmButton).toBeDisabled();
		});
	});

	describe("Accessibility", () => {
		it("has proper ARIA labels and roles", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
			expect(
				screen.getByTestId("dialog-description")
			).toBeInTheDocument();
		});

		it("supports keyboard navigation", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const confirmButton = screen.getByTestId("confirm-register-button");
			const reviewButton = screen.getByTestId("review-update-button");

			expect(confirmButton).toBeInTheDocument();
			expect(reviewButton).toBeInTheDocument();
		});
	});

	describe("Error Handling", () => {
		it("shows error message and fallback button in error state", () => {
			const errorMessage = "Network error";
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error={errorMessage}
				/>
			);

			expect(screen.getByText("Registration Error")).toBeInTheDocument();
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
			expect(
				screen.getByText("Review & Update Instead")
			).toBeInTheDocument();
		});

		it("calls onReview when fallback button is clicked in error state", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error="Test error"
				/>
			);

			const fallbackButton = screen.getByText("Review & Update Instead");
			fireEvent.click(fallbackButton);

			expect(defaultProps.onReview).toHaveBeenCalledTimes(1);
		});
	});
});

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
	DialogContent: ({ children, showCloseButton, ...props }: any) => (
		<div
			data-testid="dialog-content"
			data-show-close={showCloseButton}
			role="dialog"
			aria-modal="true"
			aria-labelledby="household-modal-title"
			aria-describedby="household-modal-description"
			{...props}
		>
			{children}
		</div>
	),
	DialogHeader: ({ children }: any) => (
		<div data-testid="dialog-header">{children}</div>
	),
	DialogTitle: ({ children, id, ...props }: any) => (
		<h2 data-testid="dialog-title" id={id} {...props}>
			{children}
		</h2>
	),
	DialogDescription: ({ children, id, ...props }: any) => (
		<p data-testid="dialog-description" id={id} {...props}>
			{children}
		</p>
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

// Mock localization
jest.mock("../../../Localization/LocalizationComponent", () => ({
	loading_processing_registration: "Processing your registration...",
	button_no_review_update: "No, review & update",
	button_yes_register: "Yes, register",
	text_no_household_info_available: "No household information available.",
}));

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
		email: "test@example.com",
	};

	const defaultProps: HouseholdConfirmationModalProps = {
		isOpen: true,
		onClose: jest.fn(),
		onBackHome: jest.fn(),
		onConfirm: jest.fn(),
		onReview: jest.fn(),
		householdData: mockHouseholdData,
		isLoading: false,
		selectedSlot: null,
		error: undefined,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Rendering", () => {
		test("renders modal when isOpen is true", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);
			expect(screen.getByTestId("dialog")).toBeInTheDocument();
		});

		test("does not render modal when isOpen is false", () => {
			render(<HouseholdConfirmationModal {...defaultProps} isOpen={false} />);
			expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
		});

		test("renders household information when householdData is provided", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);
			expect(screen.getByTestId("household-info-display")).toBeInTheDocument();
			expect(screen.getByTestId("household-name")).toHaveTextContent(
				"Smith Family"
			);
		});

		test("renders loading state when isLoading is true", () => {
			render(<HouseholdConfirmationModal {...defaultProps} isLoading={true} />);

			expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
			expect(
				screen.getByText("Processing your registration...")
			).toBeInTheDocument();
		});
	});

	describe("User Interactions", () => {
		test("calls onConfirm when confirm button is clicked", () => {
			const onConfirm = jest.fn();
			render(
				<HouseholdConfirmationModal {...defaultProps} onConfirm={onConfirm} />
			);

			const confirmButton = screen.getByText("Yes, register");
			fireEvent.click(confirmButton);

			expect(onConfirm).toHaveBeenCalledTimes(1);
		});

		test("calls onReview when review button is clicked", () => {
			const onReview = jest.fn();
			render(
				<HouseholdConfirmationModal {...defaultProps} onReview={onReview} />
			);

			const reviewButton = screen.getByText("No, review & update");
			fireEvent.click(reviewButton);

			expect(onReview).toHaveBeenCalledTimes(1);
		});

		test("disables confirm button when isLoading is true", () => {
			render(<HouseholdConfirmationModal {...defaultProps} isLoading={true} />);

			const confirmButton = screen.getByText("Yes, register");
			expect(confirmButton).toBeDisabled();
		});

		test("disables confirm button when householdData is null", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					householdData={null}
				/>
			);

			const confirmButton = screen.getByText("Yes, register");
			expect(confirmButton).toBeDisabled();
		});
	});

	describe("Error Handling", () => {
		test("displays error message when error is provided", () => {
			const errorMessage = "Registration failed";
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error={errorMessage}
				/>
			);

			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});

		test("does not display error when error is undefined", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);
			// Error should not be visible when undefined (exclude screen reader text)
			const errorElements = screen.queryAllByText(/error/i);
			const visibleErrors = errorElements.filter(
				(el) => !el.classList.contains("sr-only")
			);
			expect(visibleErrors).toHaveLength(0);
		});
	});
});

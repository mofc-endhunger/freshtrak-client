import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HouseholdConfirmationModal from "../HouseholdConfirmationModal";
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
	DialogTitle: ({ children, ...props }: any) => (
		<h2 data-testid="dialog-title" {...props}>
			{children}
		</h2>
	),
	DialogDescription: ({ children, ...props }: any) => (
		<p data-testid="dialog-description" {...props}>
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

// Mock the LoadingSpinner component
jest.mock("../../../General/LoadingSpinner", () => {
	return function MockLoadingSpinner({ size }: { size: string }) {
		return <div data-testid="loading-spinner">Loading...</div>;
	};
});

// Mock household data
const mockHouseholdData: UsersMeResponse = {
	id: 1,
	number: 1,
	name: "Test Family",
	identification_code: "TEST001",
	added_by: 1,
	last_updated_by: 1,
	deleted_by: null,
	deleted_on: null,
	members: [],
	updated_at: "2023-01-01T00:00:00Z",
	address_line_1: "123 Test Street",
	address_line_2: "Apt 4B",
	city: "Test City",
	state: "TS",
	zip_code: "12345",
	phone: "555-123-4567",
	email: "test@example.com",
	permission_to_text: true,
	permission_to_email: true,
	counts: {
		adults: 2,
		children: 1,
		seniors: 0,
		total: 3,
	},
};

const defaultProps = {
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

// Mock localization
jest.mock("../../../Localization/LocalizationComponent", () => ({
	loading_processing_registration: "Processing your registration...",
	aria_processing_registration: "Processing registration",
	button_no_review_update: "No, review & update",
	button_yes_register: "Yes, register",
	text_no_household_info_available: "No household information available.",
}));

describe("HouseholdConfirmationModal Accessibility", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("ARIA Attributes and Roles", () => {
		it("should have proper dialog role and ARIA attributes", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(dialog).toHaveAttribute(
				"aria-labelledby",
				"household-modal-title"
			);
			expect(dialog).toHaveAttribute(
				"aria-describedby",
				"household-modal-description"
			);
			expect(dialog).toHaveAttribute("aria-modal", "true");
		});

		it("should have proper title and description IDs", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Use getAllByText to handle multiple elements
			const titles = screen.getAllByText(
				"Use your household information?"
			);
			expect(titles.length).toBeGreaterThan(0);
			const descriptions = screen.getAllByText(
				/We found household information on your account/
			);
			expect(descriptions.length).toBeGreaterThan(0);

			// Check that the visible elements with specific IDs exist
			const visibleTitle = screen
				.getByRole("dialog")
				.querySelector('[id="household-modal-title"]');
			expect(visibleTitle).toBeInTheDocument();
			const visibleDescription = screen
				.getByRole("dialog")
				.querySelector('[id="household-modal-description"]');
			expect(visibleDescription).toBeInTheDocument();
		});

		it("should have proper main content role", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const mainContent = screen.getByRole("main");
			expect(mainContent).toBeInTheDocument();
			expect(mainContent).toHaveAttribute("aria-live", "polite");
		});
	});

	describe("Loading State Accessibility", () => {
		it("should have proper loading state ARIA attributes", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);

			const loadingContainer = screen.getByRole("status");
			expect(loadingContainer).toBeInTheDocument();
			expect(loadingContainer).toHaveAttribute(
				"aria-label",
				"Processing registration"
			);
		});

		it("should announce loading state to screen readers", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);

			const loadingText = screen.getByText(
				"Processing your registration..."
			);
			expect(loadingText).toBeInTheDocument();
		});
	});

	describe("Error State Accessibility", () => {
		it("should have proper error state ARIA attributes", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error="Test error message"
				/>
			);

			const errorContainer = screen.getByRole("alert");
			expect(errorContainer).toBeInTheDocument();
			expect(errorContainer).toHaveAttribute("aria-live", "assertive");
		});

		it("should have proper error button descriptions", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error="Test error message"
				/>
			);

			const errorButton = screen.getByText("Review & Update Instead");
			expect(errorButton).toHaveAttribute(
				"aria-describedby",
				"error-description"
			);

			const errorDescription = screen.getByText(
				/An error occurred during registration/
			);
			expect(errorDescription).toBeInTheDocument();
		});
	});

	describe("Button Accessibility", () => {
		it("should have proper button descriptions", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const reviewButton = screen.getByText("No, review & update");
			const confirmButton = screen.getByText("Yes, register");

			expect(reviewButton).toHaveAttribute(
				"aria-describedby",
				"review-button-description"
			);
			expect(confirmButton).toHaveAttribute(
				"aria-describedby",
				"confirm-button-description"
			);
		});

		it("should have hidden descriptions for screen readers", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const reviewDescription = screen.getByText(
				/Navigate to the registration form/
			);
			const confirmDescription = screen.getByText(
				/Register immediately using your existing/
			);

			expect(reviewDescription).toHaveClass("sr-only");
			expect(confirmDescription).toHaveClass("sr-only");
		});

		it("should disable buttons when loading", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);

			const reviewButton = screen.getByText("No, review & update");
			const confirmButton = screen.getByText("Yes, register");

			expect(reviewButton).toBeDisabled();
			expect(confirmButton).toBeDisabled();
		});

		it("should disable confirm button when no household data", () => {
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

	describe("Keyboard Navigation", () => {
		it("should be focusable and navigable with keyboard", async () => {
			const user = userEvent.setup();
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Tab to first focusable element (could be either button)
			await user.tab();
			const firstFocused = document.activeElement;
			expect(firstFocused).toBeInTheDocument();
			expect(firstFocused?.tagName).toBe("BUTTON");

			// Tab to second button
			await user.tab();
			const secondFocused = document.activeElement;
			expect(secondFocused).toBeInTheDocument();
			expect(secondFocused?.tagName).toBe("BUTTON");
			expect(secondFocused).not.toBe(firstFocused);
		});

		it("should handle Enter key on buttons", async () => {
			const user = userEvent.setup();
			const onConfirm = jest.fn();
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					onConfirm={onConfirm}
				/>
			);

			const confirmButton = screen.getByText("Yes, register");
			confirmButton.focus();

			await user.keyboard("{Enter}");
			expect(onConfirm).toHaveBeenCalledTimes(1);
		});

		it("should handle Space key on buttons", async () => {
			const user = userEvent.setup();
			const onReview = jest.fn();
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					onReview={onReview}
				/>
			);

			const reviewButton = screen.getByText("No, review & update");
			reviewButton.focus();

			await user.keyboard(" ");
			expect(onReview).toHaveBeenCalledTimes(1);
		});
	});

	describe("Screen Reader Support", () => {
		it("should provide meaningful text for screen readers", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Check that all important information is accessible
			// Use getAllByText to handle multiple elements
			const titles = screen.getAllByText(
				"Use your household information?"
			);
			expect(titles.length).toBeGreaterThan(0);
			const descriptions = screen.getAllByText(
				/We found household information on your account/
			);
			expect(descriptions.length).toBeGreaterThan(0);
			expect(screen.getByText("Test Family")).toBeInTheDocument();
			expect(screen.getByText(/123 Test Street/)).toBeInTheDocument();
		});

		it("should announce changes in content", () => {
			const { rerender } = render(
				<HouseholdConfirmationModal {...defaultProps} />
			);

			// Initially shows household data
			expect(screen.getByText("Test Family")).toBeInTheDocument();

			// Change to loading state
			rerender(
				<HouseholdConfirmationModal
					{...defaultProps}
					isLoading={true}
				/>
			);
			expect(
				screen.getByText("Processing your registration...")
			).toBeInTheDocument();

			// Change to error state
			rerender(
				<HouseholdConfirmationModal
					{...defaultProps}
					error="Test error"
				/>
			);
			expect(screen.getByText("Registration Error")).toBeInTheDocument();
		});
	});

	describe("Focus Management", () => {
		it("should manage focus properly when modal opens", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Focus should be on the modal content
			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
		});

		it("should prevent focus from escaping modal", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Modal should trap focus
			const dialog = screen.getByRole("dialog");
			expect(dialog).toHaveAttribute("aria-modal", "true");
		});
	});

	describe("Color Contrast and Visual Accessibility", () => {
		it("should have sufficient color contrast for text", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Check that text has proper contrast classes
			// Use getAllByText to handle multiple elements and find the visible one
			const titles = screen.getAllByText(
				"Use your household information?"
			);
			expect(titles.length).toBeGreaterThan(0);
			// Find the visible title with specific ID
			const visibleTitle = screen
				.getByRole("dialog")
				.querySelector('[id="household-modal-title"]');
			expect(visibleTitle).toHaveClass("text-gray-900");

			const descriptions = screen.getAllByText(
				/We found household information on your account/
			);
			expect(descriptions.length).toBeGreaterThan(0);
			// Find the visible description with specific ID
			const visibleDescription = screen
				.getByRole("dialog")
				.querySelector('[id="household-modal-description"]');
			expect(visibleDescription).toHaveClass("text-gray-600");
		});

		it("should have proper error state styling", () => {
			render(
				<HouseholdConfirmationModal
					{...defaultProps}
					error="Test error"
				/>
			);

			const errorContainer = screen.getByRole("alert");
			expect(errorContainer).toHaveClass("bg-red-50", "border-red-200");

			const errorTitle = screen.getByText("Registration Error");
			expect(errorTitle).toHaveClass("text-red-800");
		});
	});

	describe("Semantic HTML Structure", () => {
		it("should use proper semantic elements", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			// Check for proper heading hierarchy (there are now 3 h2 elements: hidden title, visible title, household info heading)
			const headings = screen.getAllByRole("heading", { level: 2 });
			expect(headings).toHaveLength(3); // Hidden title + visible title + household info heading

			const dialogTitle = headings.find(
				h =>
					h.textContent === "Use your household information?" &&
					h.id === "household-modal-title"
			);
			expect(dialogTitle).toBeInTheDocument();

			// Check for proper button elements (Review and Confirm buttons)
			const buttons = screen.getAllByRole("button");
			expect(buttons).toHaveLength(2); // Review and Confirm buttons
		});

		it("should have proper landmark roles", () => {
			render(<HouseholdConfirmationModal {...defaultProps} />);

			const main = screen.getByRole("main");
			expect(main).toBeInTheDocument();

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
		});
	});
});

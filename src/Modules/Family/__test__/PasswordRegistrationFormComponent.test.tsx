import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordRegistrationFormComponent from "../PasswordRegistrationFormComponent";

// Mock react-hook-form
const mockRegister = jest.fn();
const mockGetValues = jest.fn();
const mockErrors = {};

const renderPasswordRegistrationForm = () => {
	return render(
		<PasswordRegistrationFormComponent
			register={mockRegister}
			errors={mockErrors}
			getValues={mockGetValues}
		/>
	);
};

describe("PasswordRegistrationFormComponent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRegister.mockImplementation((fieldName, options) => ({
			name: fieldName,
			...options,
		}));
		mockGetValues.mockReturnValue({ password: "testpassword123" });
	});

	describe("Initial Rendering", () => {
		it("renders the main heading", () => {
			renderPasswordRegistrationForm();
			expect(
				screen.getByText("Create FreshTrak Account")
			).toBeInTheDocument();
		});

		it("renders the description text", () => {
			renderPasswordRegistrationForm();
			expect(
				screen.getByText(
					/Input a password to create a FreshTrak account/
				)
			).toBeInTheDocument();
		});

		it("renders email input field", () => {
			renderPasswordRegistrationForm();
			const emailInput = screen.getByLabelText("Email Address");
			expect(emailInput).toBeInTheDocument();
			expect(emailInput).toHaveAttribute("type", "email");
			expect(emailInput).toHaveAttribute(
				"placeholder",
				"Enter your email address"
			);
		});

		it("renders password input field", () => {
			renderPasswordRegistrationForm();
			const passwordInput = screen.getByLabelText("Password");
			expect(passwordInput).toBeInTheDocument();
			expect(passwordInput).toHaveAttribute("type", "password");
			expect(passwordInput).toHaveAttribute(
				"placeholder",
				"Enter your password"
			);
		});

		it("renders confirm password input field", () => {
			renderPasswordRegistrationForm();
			const confirmPasswordInput =
				screen.getByLabelText("Confirm Password");
			expect(confirmPasswordInput).toBeInTheDocument();
			expect(confirmPasswordInput).toHaveAttribute("type", "password");
			expect(confirmPasswordInput).toHaveAttribute(
				"placeholder",
				"Confirm your password"
			);
		});

		it("renders Google email link", () => {
			renderPasswordRegistrationForm();
			const emailLink = screen.getByText("Get one free from Google.");
			expect(emailLink).toBeInTheDocument();
			expect(emailLink).toHaveAttribute(
				"href",
				"https://support.google.com/mail/answer/56256"
			);
			expect(emailLink).toHaveAttribute("target", "_blank");
			expect(emailLink).toHaveAttribute("rel", "noopener noreferrer");
		});
	});

	describe("Form Validation", () => {
		it("registers email field with required validation", () => {
			renderPasswordRegistrationForm();
			expect(mockRegister).toHaveBeenCalledWith("email", {
				required: "Email is required",
			});
		});

		it("registers password field with required validation", () => {
			renderPasswordRegistrationForm();
			expect(mockRegister).toHaveBeenCalledWith("password", {
				required: "Password is required",
			});
		});

		it("registers confirm password field with required and custom validation", () => {
			renderPasswordRegistrationForm();
			expect(mockRegister).toHaveBeenCalledWith("password_confirm", {
				required: "Please confirm password",
				validate: {
					matchesPassword: expect.any(Function),
				},
			});
		});

		it("validates password confirmation matches", () => {
			renderPasswordRegistrationForm();

			// Get the validation function from the last call to register
			const lastCall = mockRegister.mock.calls.find(
				call => call[0] === "password_confirm"
			);
			const validationOptions = lastCall[1];
			const matchesPasswordValidator =
				validationOptions.validate.matchesPassword;

			// Test with matching password
			expect(matchesPasswordValidator("testpassword123")).toBe(true);

			// Test with non-matching password
			expect(matchesPasswordValidator("differentpassword")).toBe(
				"Passwords should match!"
			);
		});
	});

	describe("Error Display", () => {
		it("displays email error when present", () => {
			const errorsWithEmail = { email: { message: "Email is invalid" } };
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={errorsWithEmail}
					getValues={mockGetValues}
				/>
			);

			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});

		it("displays password error when present", () => {
			const errorsWithPassword = {
				password: { message: "Password is too short" },
			};
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={errorsWithPassword}
					getValues={mockGetValues}
				/>
			);

			expect(
				screen.getByText("Password is too short")
			).toBeInTheDocument();
		});

		it("displays confirm password error when present", () => {
			const errorsWithConfirmPassword = {
				password_confirm: { message: "Passwords should match!" },
			};
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={errorsWithConfirmPassword}
					getValues={mockGetValues}
				/>
			);

			expect(
				screen.getByText("Passwords should match!")
			).toBeInTheDocument();
		});

		it("displays fallback error message when no specific message is provided", () => {
			const errorsWithGeneric = { email: {} };
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={errorsWithGeneric}
					getValues={mockGetValues}
				/>
			);

			expect(
				screen.getByText("This field is required")
			).toBeInTheDocument();
		});
	});

	describe("Input Attributes and Accessibility", () => {
		it("has proper autocomplete attributes", () => {
			renderPasswordRegistrationForm();

			const emailInput = screen.getByLabelText("Email Address");
			const passwordInput = screen.getByLabelText("Password");
			const confirmPasswordInput =
				screen.getByLabelText("Confirm Password");

			expect(emailInput).toHaveAttribute("autoComplete", "off");
			expect(passwordInput).toHaveAttribute(
				"autoComplete",
				"new-password"
			);
			expect(confirmPasswordInput).toHaveAttribute(
				"autoComplete",
				"new-password"
			);
		});

		it("has proper labels associated with inputs", () => {
			renderPasswordRegistrationForm();

			const emailInput = screen.getByLabelText("Email Address");
			const passwordInput = screen.getByLabelText("Password");
			const confirmPasswordInput =
				screen.getByLabelText("Confirm Password");

			expect(emailInput).toHaveAttribute("id", "email");
			expect(passwordInput).toHaveAttribute("id", "password");
			expect(confirmPasswordInput).toHaveAttribute(
				"id",
				"password_confirm"
			);
		});

		it("has proper form structure", () => {
			renderPasswordRegistrationForm();

			const form = screen
				.getByText("Create FreshTrak Account")
				.closest("div");
			expect(form).toBeInTheDocument();
		});
	});

	describe("Responsive Design", () => {
		it("applies responsive text alignment classes", () => {
			renderPasswordRegistrationForm();

			const headerContainer = screen
				.getByText("Create FreshTrak Account")
				.closest("div");
			expect(headerContainer).toHaveClass("text-center", "md:text-left");
		});

		it("applies responsive margin classes", () => {
			renderPasswordRegistrationForm();

			const descriptionContainer = screen
				.getByText(/Input a password/)
				.closest("p");
			expect(descriptionContainer).toHaveClass(
				"max-w-md",
				"mx-auto",
				"md:mx-0"
			);
		});

		it("applies consistent spacing classes", () => {
			renderPasswordRegistrationForm();

			// The root div should have space-y-6
			const rootContainer = screen
				.getByText("Create FreshTrak Account")
				.closest("div")?.parentElement;
			expect(rootContainer).toHaveClass("space-y-6");

			const formFieldsContainer = screen
				.getByLabelText("Email Address")
				.closest("div");
			expect(formFieldsContainer?.parentElement).toHaveClass("space-y-4");
		});

		it("applies responsive text sizing", () => {
			renderPasswordRegistrationForm();

			const heading = screen.getByText("Create FreshTrak Account");
			const description = screen.getByText(/Input a password/);

			expect(heading).toHaveClass("text-2xl");
			expect(description).toHaveClass("text-sm");
		});

		it("applies responsive spacing between elements", () => {
			renderPasswordRegistrationForm();

			const emailField = screen
				.getByLabelText("Email Address")
				.closest("div");
			expect(emailField).toHaveClass("space-y-2");
		});
	});

	describe("Component Integration", () => {
		it("forwards ref correctly", () => {
			const ref = React.createRef<HTMLDivElement>();
			render(
				<PasswordRegistrationFormComponent
					ref={ref}
					register={mockRegister}
					errors={mockErrors}
					getValues={mockGetValues}
				/>
			);

			expect(ref.current).toBeInTheDocument();
		});

		it("has proper display name", () => {
			expect(PasswordRegistrationFormComponent.displayName).toBe(
				"PasswordRegistrationFormComponent"
			);
		});

		it("integrates with react-hook-form register function", () => {
			renderPasswordRegistrationForm();

			expect(mockRegister).toHaveBeenCalledTimes(3); // email, password, password_confirm
			expect(mockRegister).toHaveBeenCalledWith(
				"email",
				expect.any(Object)
			);
			expect(mockRegister).toHaveBeenCalledWith(
				"password",
				expect.any(Object)
			);
			expect(mockRegister).toHaveBeenCalledWith(
				"password_confirm",
				expect.any(Object)
			);
		});

		it("integrates with react-hook-form getValues function", () => {
			renderPasswordRegistrationForm();

			// Trigger validation by calling the matchesPassword validator
			const lastCall = mockRegister.mock.calls.find(
				call => call[0] === "password_confirm"
			);
			const validationOptions = lastCall[1];
			const matchesPasswordValidator =
				validationOptions.validate.matchesPassword;

			matchesPasswordValidator("testpassword123");
			expect(mockGetValues).toHaveBeenCalled();
		});
	});

	describe("Styling and Visual Elements", () => {
		it("applies error styling to inputs with errors", () => {
			const errorsWithEmail = { email: { message: "Email is invalid" } };
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={errorsWithEmail}
					getValues={mockGetValues}
				/>
			);

			const emailInput = screen.getByLabelText("Email Address");
			expect(emailInput).toHaveClass(
				"border-red-500",
				"focus:border-red-500",
				"focus:ring-red-500"
			);
		});

		it("applies proper text colors", () => {
			renderPasswordRegistrationForm();

			const heading = screen.getByText("Create FreshTrak Account");
			const description = screen.getByText(/Input a password/);
			const emailLink = screen.getByText("Get one free from Google.");

			expect(heading).toHaveClass("text-gray-900");
			expect(description).toHaveClass("text-gray-600");
			expect(emailLink).toHaveClass("text-blue-600");
		});

		it("applies proper hover states to links", () => {
			renderPasswordRegistrationForm();

			const emailLink = screen.getByText("Get one free from Google.");
			expect(emailLink).toHaveClass("hover:text-blue-800");
		});

		it("applies proper font weights", () => {
			renderPasswordRegistrationForm();

			const heading = screen.getByText("Create FreshTrak Account");
			const labels = screen.getAllByText(
				/Email Address|Password|Confirm Password/
			);

			expect(heading).toHaveClass("font-bold");
			labels.forEach(label => {
				expect(label).toHaveClass("font-medium");
			});
		});
	});

	describe("Error Handling Edge Cases", () => {
		it("handles undefined errors gracefully", () => {
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={undefined}
					getValues={mockGetValues}
				/>
			);

			// Should render without crashing
			expect(
				screen.getByText("Create FreshTrak Account")
			).toBeInTheDocument();
		});

		it("handles empty errors object gracefully", () => {
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={{}}
					getValues={mockGetValues}
				/>
			);

			// Should render without crashing
			expect(
				screen.getByText("Create FreshTrak Account")
			).toBeInTheDocument();
		});

		it("handles missing getValues function gracefully", () => {
			render(
				<PasswordRegistrationFormComponent
					register={mockRegister}
					errors={mockErrors}
					getValues={undefined}
				/>
			);

			// Should render without crashing
			expect(
				screen.getByText("Create FreshTrak Account")
			).toBeInTheDocument();
		});
	});
});

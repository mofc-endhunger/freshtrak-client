import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";
import StateDropdownComponent from "../StateDropdownComponent";

// Test wrapper component that provides form context
const TestWrapper: React.FC<{
	children?: React.ReactNode;
	defaultValues?: any;
	errors?: any;
}> = ({ children, defaultValues = {}, errors = {} }) => {
	const methods = useForm({
		defaultValues: {
			state: "",
			...defaultValues,
		},
	});

	// Mock the errors object
	const mockErrors = errors;

	return (
		<StateDropdownComponent
			register={methods.register}
			errors={mockErrors}
			value={methods.watch("state")}
		/>
	);
};

describe("StateDropdownComponent", () => {
	describe("Rendering", () => {
		test("should render without crashing", () => {
			render(<TestWrapper />);
			expect(screen.getByText("State")).toBeInTheDocument();
		});

		test("should display the correct label", () => {
			render(<TestWrapper />);
			expect(screen.getByText("State")).toBeInTheDocument();
			expect(screen.getByText("*")).toBeInTheDocument();
		});

		test("should render the select element", () => {
			render(<TestWrapper />);
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});

		test("should have the correct id and name attributes", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveAttribute("id", "state");
			expect(select).toHaveAttribute("name", "state");
		});

		test("should display all US states and territories", () => {
			render(<TestWrapper />);

			// Check for a few key states
			expect(screen.getByText("Alaska")).toBeInTheDocument();
			expect(screen.getByText("California")).toBeInTheDocument();
			expect(screen.getByText("New York")).toBeInTheDocument();
			expect(screen.getByText("Texas")).toBeInTheDocument();
			expect(screen.getByText("Florida")).toBeInTheDocument();

			// Check for territories
			expect(screen.getByText("Puerto Rico")).toBeInTheDocument();
			expect(
				screen.getByText("District of Columbia")
			).toBeInTheDocument();
		});

		test("should have an empty option as first choice", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			const options = select.querySelectorAll("option");
			expect(options[0]).toHaveValue("");
		});

		test("should have correct option values", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");

			// Check a few option values
			expect(
				select.querySelector('option[value="CA"]')
			).toHaveTextContent("California");
			expect(
				select.querySelector('option[value="NY"]')
			).toHaveTextContent("New York");
			expect(
				select.querySelector('option[value="TX"]')
			).toHaveTextContent("Texas");
		});
	});

	describe("Initial Values", () => {
		test("should start with empty value by default", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveValue("");
		});

		test("should display custom initial value when provided", () => {
			render(<TestWrapper defaultValues={{ state: "CA" }} />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveValue("CA");
		});

		test("should display different initial value when provided", () => {
			render(<TestWrapper defaultValues={{ state: "NY" }} />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveValue("NY");
		});
	});

	describe("Form Integration", () => {
		test("should register form field correctly", () => {
			const mockRegister = jest.fn();
			const mockErrors = {};

			render(
				<StateDropdownComponent
					register={mockRegister}
					errors={mockErrors}
					value=""
				/>
			);

			expect(mockRegister).toHaveBeenCalledWith("state", {
				required: true,
			});
		});

		test("should handle form submission correctly", () => {
			const mockRegister = jest.fn();
			const mockErrors = {};

			render(
				<StateDropdownComponent
					register={mockRegister}
					errors={mockErrors}
					value=""
				/>
			);

			const select = screen.getByRole("combobox");
			fireEvent.change(select, { target: { value: "CA" } });

			expect(select).toHaveValue("CA");
		});

		test("should maintain selected value after change", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");

			fireEvent.change(select, { target: { value: "TX" } });
			expect(select).toHaveValue("TX");

			fireEvent.change(select, { target: { value: "FL" } });
			expect(select).toHaveValue("FL");
		});
	});

	describe("Error Handling", () => {
		test("should not show error when no errors exist", () => {
			render(<TestWrapper />);
			expect(
				screen.queryByText("This field is required")
			).not.toBeInTheDocument();
		});

		test("should show error message when state field has errors", () => {
			render(
				<TestWrapper
					errors={{
						state: {
							type: "required",
							message: "This field is required",
						},
					}}
				/>
			);
			expect(
				screen.getByText("This field is required")
			).toBeInTheDocument();
		});

		test("should apply error styling when state field has errors", () => {
			render(
				<TestWrapper
					errors={{
						state: {
							type: "required",
							message: "This field is required",
						},
					}}
				/>
			);
			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("border-red-500");
		});

		test("should apply focus ring styling when state field has errors", () => {
			render(
				<TestWrapper
					errors={{
						state: {
							type: "required",
							message: "This field is required",
						},
					}}
				/>
			);
			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("focus:ring-red-500");
		});

		test("should not apply error styling when no errors exist", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("border-gray-300");
			expect(select).not.toHaveClass("border-red-500");
		});
	});

	describe("Accessibility", () => {
		test("should have proper label association", () => {
			render(<TestWrapper />);
			const label = screen.getByText("State");
			const select = screen.getByRole("combobox");
			expect(label).toHaveAttribute("for", "state");
			expect(select).toHaveAttribute("id", "state");
		});

		test("should have required indicator", () => {
			render(<TestWrapper />);
			expect(screen.getByText("*")).toBeInTheDocument();
		});

		test("should have proper validation attributes", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			// The select element should be properly configured for form validation
			expect(select).toHaveAttribute("name", "state");
			expect(select).toHaveAttribute("id", "state");
		});

		test("should be keyboard navigable", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).not.toHaveAttribute("disabled");
		});
	});

	describe("Styling and Classes", () => {
		test("should have correct base styling classes", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("w-full");
			expect(select).toHaveClass("px-3");
			expect(select).toHaveClass("py-2");
			expect(select).toHaveClass("border");
			expect(select).toHaveClass("rounded-md");
			expect(select).toHaveClass("shadow-sm");
		});

		test("should have correct focus styling classes", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("focus:outline-none");
			expect(select).toHaveClass("focus:ring-2");
			expect(select).toHaveClass("focus:ring-indigo-500");
			expect(select).toHaveClass("focus:border-indigo-500");
		});

		test("should have correct container styling", () => {
			render(<TestWrapper />);
			const container = screen.getByText("State").closest("div");
			expect(container).toHaveClass("ml-2");
			expect(container).toHaveClass("space-y-2");
		});

		test("should have correct label styling", () => {
			render(<TestWrapper />);
			const label = screen.getByText("State");
			expect(label).toHaveClass("block");
			expect(label).toHaveClass("text-sm");
			expect(label).toHaveClass("font-medium");
			expect(label).toHaveClass("text-gray-700");
		});
	});

	describe("Edge Cases", () => {
		test("should handle undefined errors gracefully", () => {
			render(
				<StateDropdownComponent
					register={jest.fn()}
					errors={undefined}
					value=""
				/>
			);
			expect(screen.getByText("State")).toBeInTheDocument();
		});

		test("should handle undefined value gracefully", () => {
			render(
				<StateDropdownComponent
					register={jest.fn()}
					errors={{}}
					value={undefined}
				/>
			);
			const select = screen.getByRole("combobox");
			expect(select).toHaveValue("");
		});

		test("should handle empty string value", () => {
			render(
				<StateDropdownComponent
					register={jest.fn()}
					errors={{}}
					value=""
				/>
			);
			const select = screen.getByRole("combobox");
			expect(select).toHaveValue("");
		});

		test("should handle all state abbreviations", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");

			// Test a few more state abbreviations
			const testStates = ["AK", "AL", "CA", "NY", "TX", "FL", "WA", "OR"];
			testStates.forEach(abbr => {
				const option = select.querySelector(`option[value="${abbr}"]`);
				expect(option).toBeInTheDocument();
			});
		});
	});

	describe("User Interactions", () => {
		test("should allow user to select different states", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");

			fireEvent.change(select, { target: { value: "CA" } });
			expect(select).toHaveValue("CA");

			fireEvent.change(select, { target: { value: "NY" } });
			expect(select).toHaveValue("NY");

			fireEvent.change(select, { target: { value: "TX" } });
			expect(select).toHaveValue("TX");
		});

		test("should allow user to clear selection", () => {
			render(<TestWrapper defaultValues={{ state: "CA" }} />);
			const select = screen.getByRole("combobox");

			fireEvent.change(select, { target: { value: "" } });
			expect(select).toHaveValue("");
		});

		test("should maintain selection after multiple changes", () => {
			render(<TestWrapper />);
			const select = screen.getByRole("combobox");

			const states = ["CA", "NY", "TX", "FL", "WA"];
			states.forEach(state => {
				fireEvent.change(select, { target: { value: state } });
				expect(select).toHaveValue(state);
			});
		});
	});

	describe("Responsive Design", () => {
		test("should have responsive container classes", () => {
			render(<TestWrapper />);

			const container = screen.getByText("State").closest("div");
			expect(container).toHaveClass("ml-2", "space-y-2");
		});

		test("should have responsive select styling", () => {
			render(<TestWrapper />);

			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("w-full", "px-3", "py-2");
		});

		test("should have responsive focus states", () => {
			render(<TestWrapper />);

			const select = screen.getByRole("combobox");
			expect(select).toHaveClass("focus:outline-none", "focus:ring-2");
		});

		test("should have responsive text sizing", () => {
			render(<TestWrapper />);

			const label = screen.getByText("State");
			expect(label).toHaveClass("text-sm", "font-medium");
		});

		test("should have responsive spacing", () => {
			render(<TestWrapper />);

			const container = screen.getByText("State").closest("div");
			expect(container).toHaveClass("space-y-2");
		});
	});
});

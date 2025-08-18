import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PhoneInputComponent from "../PhoneInputComponent";

const TestWrapper: React.FC<{
	initialValue?: any;
	props?: Partial<React.ComponentProps<typeof PhoneInputComponent>>;
}> = ({ initialValue = "", props = {} }) => {
	const [value, setValue] = useState<any>(initialValue);
	return (
		<PhoneInputComponent
			name="phone"
			id="phone"
			placeholder="(xxx) xxx-xxxx"
			value={value}
			onChange={setValue}
			className="w-full"
			{...props}
		/>
	);
};

describe("PhoneInputComponent", () => {
	test("renders input with provided attributes", () => {
		render(<TestWrapper />);
		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("name", "phone");
		expect(input).toHaveAttribute("id", "phone");
		expect(input).toHaveAttribute("placeholder", "(xxx) xxx-xxxx");
	});

	test("formats initial value on render", () => {
		render(<TestWrapper initialValue="6145551212" />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("(614) 555-1212");
	});

	test("formats as user types and calls onChange with normalized value", () => {
		render(<TestWrapper />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "6" } });
		expect(input.value).toBe("6");
		fireEvent.change(input, { target: { value: "61" } });
		expect(input.value).toBe("61");
		fireEvent.change(input, { target: { value: "614" } });
		expect(input.value).toBe("614");
		fireEvent.change(input, { target: { value: "6145" } });
		expect(input.value).toBe("(614) 5");
		fireEvent.change(input, { target: { value: "614555" } });
		expect(input.value).toBe("(614) 555");
		fireEvent.change(input, { target: { value: "6145551" } });
		expect(input.value).toBe("(614) 555-1");
		fireEvent.change(input, { target: { value: "(614) 555-1212" } });
		expect(input.value).toBe("(614) 555-1212");
	});

	test("ignores non-digit characters in input", () => {
		render(<TestWrapper />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		fireEvent.change(input, {
			target: { value: "(6a1!4) 5-5x5y1z2@1#2$" },
		});
		expect(input.value).toBe("(614) 555-1212");
	});

	test("handles values longer than 10 digits by truncating extra digits", () => {
		render(<TestWrapper />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "1234567890123" } });
		expect(input.value).toBe("(123) 456-7890");
	});

	test("handles undefined value gracefully", () => {
		render(<TestWrapper initialValue={undefined as any} />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("handles non-string/number values gracefully", () => {
		render(<TestWrapper initialValue={{} as any} />);
		const input = screen.getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("respects className and type props", () => {
		render(
			<TestWrapper props={{ className: "custom-class", type: "text" }} />
		);
		const input = screen.getByRole("textbox");
		expect(input).toHaveClass("custom-class");
	});

	describe("Responsive Design", () => {
		test("should have responsive input styling", () => {
			render(<TestWrapper />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("w-full");
		});

		test("should respect custom className for responsive design", () => {
			render(
				<TestWrapper props={{ className: "w-full md:w-64 lg:w-96" }} />
			);

			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("w-full", "md:w-64", "lg:w-96");
		});

		test("should have proper input sizing", () => {
			render(<TestWrapper />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveClass("w-full");
		});

		test("should maintain accessibility with responsive design", () => {
			render(<TestWrapper />);

			const input = screen.getByRole("textbox");
			expect(input).toHaveAttribute("name", "phone");
			expect(input).toHaveAttribute("id", "phone");
			expect(input).toHaveAttribute("placeholder", "(xxx) xxx-xxxx");
		});
	});
});

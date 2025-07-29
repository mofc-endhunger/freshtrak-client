import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ButtonComponent from "../ButtonComponent";

describe("ButtonComponent", () => {
	const mockOnClick = jest.fn();

	beforeEach(() => {
		mockOnClick.mockClear();
	});

	test("renders with default props", () => {
		render(
			<ButtonComponent name="test-button" onClickfunction={mockOnClick} />
		);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Button");
	});

	test("renders with custom value", () => {
		render(
			<ButtonComponent
				name="test-button"
				value="Custom Button"
				onClickfunction={mockOnClick}
			/>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Custom Button");
	});

	test("renders with custom variant", () => {
		render(
			<ButtonComponent
				name="test-button"
				variant="primary"
				onClickfunction={mockOnClick}
			/>
		);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	test("calls onClick function when clicked", () => {
		render(
			<ButtonComponent name="test-button" onClickfunction={mockOnClick} />
		);
		const button = screen.getByRole("button");
		fireEvent.click(button);
		expect(mockOnClick).toHaveBeenCalledTimes(1);
	});

	test("renders with custom className", () => {
		render(
			<ButtonComponent
				name="test-button"
				className="custom-class"
				onClickfunction={mockOnClick}
			/>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("custom-class");
	});

	test("renders with all props", () => {
		render(
			<ButtonComponent
				type="submit"
				name="test-button"
				dataid="test-data"
				id="test-id"
				value="Submit"
				className="custom-class"
				variant="primary"
				onClickfunction={mockOnClick}
			/>
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "submit");
		expect(button).toHaveAttribute("name", "test-button");
		expect(button).toHaveAttribute("data-id", "test-data");
		expect(button).toHaveAttribute("id", "test-id");
		expect(button).toHaveTextContent("Submit");
		expect(button).toHaveClass("custom-class");
	});
});

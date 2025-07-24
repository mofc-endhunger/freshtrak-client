import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
	test("renders with default props", () => {
		render(<LoadingSpinner />);
		const spinner = screen.getByTestId("loading-spinner");
		expect(spinner).toBeInTheDocument();
	});

	test("renders with custom size", () => {
		render(<LoadingSpinner size="large" />);
		const spinner = screen.getByTestId("loading-spinner");
		expect(spinner).toBeInTheDocument();
	});

	test("renders with custom color", () => {
		render(<LoadingSpinner color="secondary" />);
		const spinner = screen.getByTestId("loading-spinner");
		expect(spinner).toBeInTheDocument();
	});

	test("renders with custom test id", () => {
		render(<LoadingSpinner data-testid="custom-spinner" />);
		const spinner = screen.getByTestId("custom-spinner");
		expect(spinner).toBeInTheDocument();
	});

	test("renders with custom className", () => {
		render(<LoadingSpinner className="custom-class" />);
		const spinner = screen.getByTestId("loading-spinner");
		expect(spinner).toHaveClass("custom-class");
	});
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventNearByComponent from "../EventNearByComponent";

// Mock the EventList component
const MockEventList = ({ filter }: { filter: string }) => (
	<div data-testid={`event-list-${filter}`}>Mock Event List for {filter}</div>
);

describe("EventNearByComponent", () => {
	const defaultProps = {
		EventList: MockEventList,
	};

	beforeEach(() => {
		// Clear any previous renders
		jest.clearAllMocks();
	});

	it("renders the component with correct heading", () => {
		render(<EventNearByComponent {...defaultProps} />);

		expect(screen.getByText("Resource Events")).toBeInTheDocument();
		expect(screen.getByText("Events Today")).toBeInTheDocument();
		expect(screen.getByText("Events for Next 7 days")).toBeInTheDocument();
		expect(screen.getByText("Events for Next 30 days")).toBeInTheDocument();
	});

	it("renders all three accordion items", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Check that all accordion headers are present
		expect(screen.getByText("Events Today")).toBeInTheDocument();
		expect(screen.getByText("Events for Next 7 days")).toBeInTheDocument();
		expect(screen.getByText("Events for Next 30 days")).toBeInTheDocument();
	});

	it("starts with first accordion item expanded by default", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// First item should be expanded (active)
		expect(screen.getByTestId("event-list-today")).toBeInTheDocument();

		// Other items should not be visible initially
		expect(screen.queryByTestId("event-list-week")).not.toBeInTheDocument();
		expect(screen.queryByTestId("event-list-all")).not.toBeInTheDocument();
	});

	it("toggles accordion items when clicked", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Click on second accordion item
		const secondAccordionButton = screen.getByText(
			"Events for Next 7 days"
		);
		fireEvent.click(secondAccordionButton);

		// Second item should now be visible
		expect(screen.getByTestId("event-list-week")).toBeInTheDocument();

		// First item should now be hidden (traditional accordion behavior)
		expect(
			screen.queryByTestId("event-list-today")
		).not.toBeInTheDocument();
	});

	it("closes accordion item when clicked again", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Click on first accordion item to close it
		const firstAccordionButton = screen.getByText("Events Today");
		fireEvent.click(firstAccordionButton);

		// First item should now be hidden
		expect(
			screen.queryByTestId("event-list-today")
		).not.toBeInTheDocument();
	});

	it("has proper accessibility attributes", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Check ARIA attributes for first accordion
		const firstButton = screen.getByText("Events Today").closest("button");
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
		expect(firstButton).toHaveAttribute(
			"aria-controls",
			"accordion-content-0"
		);

		// Check ARIA attributes for second accordion
		const secondButton = screen
			.getByText("Events for Next 7 days")
			.closest("button");
		expect(secondButton).toHaveAttribute("aria-expanded", "false");
		expect(secondButton).toHaveAttribute(
			"aria-controls",
			"accordion-content-1"
		);
	});

	it("renders emoji indicators with proper accessibility", () => {
		render(<EventNearByComponent {...defaultProps} />);

		const emojis = screen.getAllByRole("img", { name: "expand/collapse" });
		expect(emojis).toHaveLength(3);

		// First emoji should be rotated (expanded)
		const firstEmoji = emojis[0];
		expect(firstEmoji).toHaveClass("rotate-180");
	});

	it("calls EventList with correct filter props", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Check that EventList is called with correct filters
		expect(screen.getByTestId("event-list-today")).toBeInTheDocument();

		// Click on week accordion to see week events
		fireEvent.click(screen.getByText("Events for Next 7 days"));
		expect(screen.getByTestId("event-list-week")).toBeInTheDocument();

		// Click on all events accordion
		fireEvent.click(screen.getByText("Events for Next 30 days"));
		expect(screen.getByTestId("event-list-all")).toBeInTheDocument();
	});

	it("maintains traditional accordion behavior (only one open at a time)", () => {
		render(<EventNearByComponent {...defaultProps} />);

		// Start with first item open
		expect(screen.getByTestId("event-list-today")).toBeInTheDocument();

		// Open second item (first should close)
		fireEvent.click(screen.getByText("Events for Next 7 days"));
		expect(screen.getByTestId("event-list-week")).toBeInTheDocument();
		expect(
			screen.queryByTestId("event-list-today")
		).not.toBeInTheDocument();

		// Open third item (second should close)
		fireEvent.click(screen.getByText("Events for Next 30 days"));
		expect(screen.getByTestId("event-list-all")).toBeInTheDocument();
		expect(screen.queryByTestId("event-list-week")).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("event-list-today")
		).not.toBeInTheDocument();
	});
});

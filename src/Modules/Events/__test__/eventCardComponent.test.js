import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, fireEvent } from "../../../Testing/mock-provider";
import EventCardComponent from "../EventCardComponent";
import { preformattedEventData } from "../../../Testing";

test("should display the events", () => {
	const { getByText } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={preformattedEventData} />
		</MemoryRouter>
	);
	getByText(preformattedEventData.eventName);
	getByText(preformattedEventData.eventService);
	getByText(preformattedEventData.agencyName);
});

test(`should not display the exceptionNote if exceptionNote equals ''`, () => {
	const { getByText, queryByTestId } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={preformattedEventData} />
		</MemoryRouter>
	);
	getByText(preformattedEventData.agencyName);
	expect(queryByTestId("exception-note")).toBeNull();
});

test(`should display the exceptionNote if exists`, () => {
	const dataWithException = {
		...preformattedEventData,
		exceptionNote: "I am an exception",
	};
	const { getByText, queryByTestId } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={dataWithException} />
		</MemoryRouter>
	);
	getByText(preformattedEventData.agencyName);
	expect(queryByTestId("exception-note")).toBeTruthy();
	getByText("I am an exception");
});

test("should render Get Directions button and open Google Maps when clicked", () => {
	// Mock window.open
	const mockOpen = jest.fn();
	Object.defineProperty(window, "open", {
		writable: true,
		value: mockOpen,
	});

	const { getByText } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={preformattedEventData} />
		</MemoryRouter>
	);

	// Check that the button is rendered
	const directionsButton = getByText("Get Directions");
	expect(directionsButton).toBeInTheDocument();

	// Click the button
	fireEvent.click(directionsButton);

	// Verify that window.open was called with the correct URL
	expect(mockOpen).toHaveBeenCalledWith(
		expect.stringContaining(
			"https://www.google.com/maps/dir/?api=1&destination="
		),
		"_blank"
	);

	// Verify the URL contains the event address
	const callArgs = mockOpen.mock.calls[0];
	const url = callArgs[0];
	expect(url).toContain(
		encodeURIComponent(
			`${preformattedEventData.eventAddress}, ${preformattedEventData.eventCity}, ${preformattedEventData.eventState} ${preformattedEventData.eventZip}`
		)
	);
});

import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "../../../Testing/mock-provider";
import EventCardComponent from "../EventCardComponent";
import { preformattedEventData } from "../../../Testing";

test("should display the events", () => {
	const { getByText } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={preformattedEventData as any} />
		</MemoryRouter>
	);
	getByText(preformattedEventData.eventName);
	getByText(preformattedEventData.eventService);
	getByText(preformattedEventData.agencyName);
});

test(`should not display the exceptionNote if exceptionNote equals ''`, () => {
	const { getByText, queryByTestId } = render(
		<MemoryRouter initialEntries={["/events/list"]}>
			<EventCardComponent event={preformattedEventData as any} />
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
			<EventCardComponent event={dataWithException as any} />
		</MemoryRouter>
	);
	getByText(preformattedEventData.agencyName);
	expect(queryByTestId("exception-note")).toBeTruthy();
	getByText("I am an exception");
});

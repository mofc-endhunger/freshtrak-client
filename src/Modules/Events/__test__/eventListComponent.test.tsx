import React from "react";
import EventListComponent from "../EventListComponent";
import { preformattedEventData, renderWithRouter } from "../../../Testing";

// Suppress the moment warning. This is a consequence of using test-data-bot
// and does not show in reality
const originalWarn = console.warn.bind(console.warn);
beforeAll(() => {
	console.warn = (msg: string) =>
		!msg.toString().includes("Deprecation warning") && originalWarn(msg);
});
afterAll(() => {
	console.warn = originalWarn;
});

test("should render that there are no events scheduled if an empty object is passed to it", () => {
	const { getByText } = renderWithRouter(
		<EventListComponent events={{}} zipCode={""} />
	);
	getByText("No Events Currently Scheduled");
});

test("should display the data if data is passed to it", () => {
	const testData = { [preformattedEventData.date]: [preformattedEventData] };
	const { getByText } = renderWithRouter(
		<EventListComponent events={testData as any} zipCode={"43123"} />
	);
	getByText(preformattedEventData.agencyName);
	getByText(/Resource Events Serving Residents of Zip Code 43123/i);
});

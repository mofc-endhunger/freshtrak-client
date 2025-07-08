import React from "react";
import {
	renderWithRouter,
	mockAgency,
	mockEventDate,
	mockEvent,
} from "../../../Testing";
import axios from "axios";
import AgencyEventListContainer from "../AgencyEventListContainer";
import { waitFor } from "@testing-library/react";

jest.mock("axios");

const route = `/agency/events/${mockAgency.id}`;
const path = "/agency/events/:agencyId";
const location = {
	state: {
		agencyId: mockAgency.id,
	},
};

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

it("should show loading", async () => {
	const response = {
		status: 200,
		data: { agency: {} },
	};
	(axios.get as jest.Mock).mockImplementationOnce(() =>
		Promise.resolve(response)
	);
	const { getByTestId } = renderWithRouter(<AgencyEventListContainer />, {
		route,
		path,
	});
	getByTestId("spinning component");
	await waitFor(() => {});
});

it("should show error if server error", async () => {
	const failedResponse = {
		status: 500,
		statusText: "ERROR",
	};
	(axios.get as jest.Mock).mockImplementationOnce(() =>
		Promise.reject(failedResponse)
	);
	const { getByText } = renderWithRouter(<AgencyEventListContainer />, {
		route,
		path,
	});
	await waitFor(() => {
		getByText(/something went wrong/i);
	});
});

it("should show the results from the events api", async () => {
	const testMockEvent = { ...mockEvent, event_dates: [mockEventDate] };
	const testAgency = { ...mockAgency, events: [testMockEvent] };
	const response = {
		status: 200,
		data: { agency: testAgency },
	};
	(axios.get as jest.Mock).mockImplementationOnce(() =>
		Promise.resolve(response)
	);
	const { getByText } = renderWithRouter(<AgencyEventListContainer />, {
		route,
		path,
	});
	await waitFor(() => {
		getByText(testMockEvent.name);
	});
});

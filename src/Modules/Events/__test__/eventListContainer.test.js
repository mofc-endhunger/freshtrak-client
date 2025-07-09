import React from "react";
import { waitFor, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EventListContainer from "../EventListContainer";
import {
	mockEvent,
	mockAgency,
	mockEventDate,
	mockForms,
	testData,
} from "../../../Testing";
import { Provider } from "react-redux";
import axios from "axios";

jest.mock("axios");

const mockStore = configureStore([]);
const store = mockStore({});

// Suppress the moment warning. This is a consequence of using test-data-bot
// and does not show in reality
const originalWarn = console.warn.bind(console.warn);
beforeAll(() => {
	console.warn = msg =>
		!msg.toString().includes("Deprecation warning") && originalWarn(msg);
});
afterAll(() => {
	console.warn = originalWarn;
});

describe("EventListContainer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("should load without errors", () => {
		axios.get.mockResolvedValue({ data: [] });
		expect(() => {
			render(
				<Provider store={store}>
					<MemoryRouter>
						<EventListContainer searchData={{}} />
					</MemoryRouter>
				</Provider>
			);
		}).not.toThrowError();
	});

	test("Successful Api with no Events dates", async () => {
		axios.get.mockResolvedValue({ data: [] });
		const { getByText } = render(
			<Provider store={store}>
				<MemoryRouter>
					<EventListContainer zipCode={mockAgency.zip} />
				</MemoryRouter>
			</Provider>
		);
		await waitFor(() => {
			getByText(/No Events Currently Scheduled/i);
		});
	});

	test("Successful Api with Events dates", async () => {
		// No need to mock axios for this test, just pass agencyData
		const eventName = testData[0].events[0].name;
		const { getByText } = render(
			<Provider store={store}>
				<MemoryRouter>
					<EventListContainer
						agencyData={testData}
						zipCode={mockAgency.zip}
					/>
				</MemoryRouter>
			</Provider>
		);
		await waitFor(() => {
			getByText(eventName);
		});
	});
});

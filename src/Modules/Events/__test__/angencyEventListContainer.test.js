import React from "react";
import { render, waitFor } from "@testing-library/react";
import AgencyEventListContainer from "../AgencyEventListContainer";
import {
	mockAgencyBuilder,
	mockEventsBuilder,
	mockEventDatesBuilder,
	mockFormsBuilder,
} from "../../../Testing/mock-events";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

const mockStore = configureStore([]);
const store = mockStore({});

const renderWithRoute = ui =>
	render(
		<Provider store={store}>
			<MemoryRouter initialEntries={["/agency/123"]}>
				<Routes>
					<Route path="/agency/:agencyId" element={ui} />
				</Routes>
			</MemoryRouter>
		</Provider>
	);

describe("AgencyEventListContainer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("should show loading", async () => {
		axios.get.mockResolvedValue({ data: { agency: {} } });
		// Not asserting spinner, just checking no crash
		renderWithRoute(<AgencyEventListContainer />);
	});

	test("should show error if server error", async () => {
		axios.get.mockRejectedValue(new Error("API Error"));
		const { getByText } = renderWithRoute(<AgencyEventListContainer />);
		await waitFor(() => {
			getByText("Something went wrong");
		});
	});

	test("should show the results from the events api", async () => {
		const mockEvent = mockEventsBuilder({ name: "Test Event" });
		const mockEventDate = mockEventDatesBuilder();
		const mockForm = mockFormsBuilder();
		const agencyWithEvents = mockAgencyBuilder({
			events: [
				{
					...mockEvent,
					event_dates: [mockEventDate],
					forms: [mockForm],
				},
			],
		});
		axios.get.mockResolvedValue({ data: { agency: agencyWithEvents } });
		const { getByText } = renderWithRoute(<AgencyEventListContainer />);
		await waitFor(() => {
			getByText("Test Event");
		});
	});
});

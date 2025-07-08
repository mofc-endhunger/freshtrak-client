import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, waitFor } from "@testing-library/react";
import EventContainer from "../EventContainer";
import axios from "axios";
import { mockFoodBank, mockEvent } from "../../../Testing";

jest.mock("axios");

const mockStore = configureStore([]);
const store = mockStore({
	addressSearch: { zipCode: "12345" },
	event: { event: mockEvent },
});

// Mocking Google API library without which it shows error.
jest.mock("react-places-autocomplete", () => {
	const React = require("react"); // eslint-disable-line
	class PlacesAutocomplete extends React.Component {
		renderProps = {
			getInputProps: jest.fn(({ placeholder, className }) => ({
				placeholder,
				className,
			})),
			suggestions: [],
			getSuggestionItemProps: jest.fn(),
		};

		render() {
			return <>{this.props.children(this.renderProps)}</>;
		}
	}

	return PlacesAutocomplete;
});

jest.mock("../EventListContainer", () => () => <mock-event-list-container />);

const testFoodBank = {
	name: "Test Food Bank",
	address: "123 Main St",
	city: "Testville",
	state: "TS",
	zip: "12345",
	phone: "555-1234",
	display_url: "https://testfoodbank.org",
	logo: "https://testfoodbank.org/logo.png",
	foodbank_texts: [
		{
			show_eligibilty_box: 0,
			text: "Welcome to Test Food Bank",
			image_resource: "",
			link_href: "",
			link_text: "",
		},
	],
};

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

test("should load without errors", () => {
	expect(() => {
		render(
			<Provider store={store}>
				<MemoryRouter initialEntries={["/events/list/12345/10/"]}>
					<Routes>
						<Route
							path="/events/list/:zipCode/:distance?/:serviceCat?"
							element={<EventContainer />}
						/>
					</Routes>
				</MemoryRouter>
			</Provider>
		);
	}).not.toThrow();
});

test("Successful api call", async () => {
	const successResponse = {
		data: {
			foodbanks: [testFoodBank],
		},
		status: 200,
		statusText: "OK",
	};
	// Mock axios.get for both endpoints
	axios.get.mockImplementation(url => {
		if (url.includes("api/foodbanks")) {
			return Promise.resolve({ data: { foodbanks: [testFoodBank] } });
		}
		if (url.includes("api/agencies")) {
			return Promise.resolve({ data: { agencies: [] } });
		}
		return Promise.resolve(successResponse);
	});

	const { getByText } = render(
		<Provider store={store}>
			<MemoryRouter initialEntries={["/events/list/12345/10/"]}>
				<Routes>
					<Route
						path="/events/list/:zipCode/:distance?/:serviceCat?"
						element={<EventContainer />}
					/>
				</Routes>
			</MemoryRouter>
		</Provider>
	);

	await waitFor(() => {
		getByText("Test Food Bank");
	});
});

test("Failed api call", async () => {
	const failedResponse = {
		status: 500,
		statusText: "Internal Server Error",
	};
	// Mock axios.get to fail for foodbanks endpoint
	axios.get.mockImplementation(url => {
		if (url.includes("api/foodbanks")) {
			return Promise.reject(failedResponse);
		}
		if (url.includes("api/agencies")) {
			return Promise.resolve({ data: { agencies: [] } });
		}
		return Promise.resolve({ data: {} });
	});

	const { getByText } = render(
		<Provider store={store}>
			<MemoryRouter initialEntries={["/events/list/12345/10/"]}>
				<Routes>
					<Route
						path="/events/list/:zipCode/:distance?/:serviceCat?"
						element={<EventContainer />}
					/>
				</Routes>
			</MemoryRouter>
		</Provider>
	);

	await waitFor(() => {
		getByText(/something went wrong/i);
	});
});

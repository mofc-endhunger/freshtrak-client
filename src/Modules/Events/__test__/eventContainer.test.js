import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, waitFor } from "@testing-library/react";
import EventContainer from "../EventContainer";
import axios from "axios";
import { mockFoodBank } from "../../../Testing";

jest.mock("axios");

const initialState = {
	addressSearch: { zipCode: "12345" },
};
const mockStore = configureStore([]);
const store = mockStore(initialState);

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

const renderWithRoute = ui =>
	render(
		<Provider store={store}>
			<MemoryRouter initialEntries={["/events/list/12345"]}>
				<Routes>
					<Route path="/events/list/:zipCode" element={ui} />
				</Routes>
			</MemoryRouter>
		</Provider>
	);

describe("EventContainer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("should load without errors", () => {
		axios.get.mockResolvedValue({ data: { foodbanks: [mockFoodBank] } });
		expect(() => {
			renderWithRoute(<EventContainer />);
		}).not.toThrowError();
	});

	test("Successful api call", async () => {
		axios.get.mockResolvedValue({ data: { foodbanks: [mockFoodBank] } });
		const { getByText } = renderWithRoute(<EventContainer />);
		await waitFor(() => {
			getByText(mockFoodBank.name);
		});
	});

	test("Failed api call", async () => {
		axios.get.mockRejectedValue(new Error("API Error"));
		const { getByText } = renderWithRoute(<EventContainer />);
		await waitFor(() => {
			getByText("Something went wrong");
		});
	});
});

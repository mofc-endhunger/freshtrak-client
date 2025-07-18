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
jest.mock("../../General/GooglePlacesAutocomplete", () => {
	const React = require("react"); // eslint-disable-line
	class GooglePlacesAutocomplete extends React.Component {
		render() {
			return (
				<input
					type="text"
					className={this.props.className}
					id={this.props.id}
					name={this.props.name}
					value={this.props.value}
					onChange={this.props.onChange}
					placeholder={this.props.placeholder}
					{...this.props}
				/>
			);
		}
	}

	return GooglePlacesAutocomplete;
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

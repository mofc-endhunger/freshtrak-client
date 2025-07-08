import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { preformattedEventData, mockFamily } from "../../../Testing";
import RegistrationConfirmComponent from "../RegistrationConfirmComponent";

const mockStore = configureStore([]);
window.HTMLCanvasElement.prototype.getContext = () => {};

describe("MyComponent should render", () => {
	it("should render", () => {
		window.HTMLCanvasElement.prototype.getContext = () => {};
	});
});

test("should load without errors", () => {
	const store = mockStore({
		event: { event: {} },
		user: mockFamily,
		eventTimeStamp: {},
	});
	const user_mock_data = { user: mockFamily, eventTimeStamp: {} };
	expect(() => {
		render(
			<Provider store={store}>
				<MemoryRouter
					initialEntries={[{ pathname: "/", state: user_mock_data }]}
				>
					<RegistrationConfirmComponent />
				</MemoryRouter>
			</Provider>
		);
	}).not.toThrowError();
});

test("show the event data and user data", () => {
	const { agencyName } = preformattedEventData;
	const user_mock_data = { user: mockFamily };
	const { identification_code } = mockFamily;
	const store = mockStore({
		event: { event: preformattedEventData },
		user: mockFamily,
	});
	const { getByText } = render(
		<Provider store={store}>
			<MemoryRouter
				initialEntries={[{ pathname: "/", state: user_mock_data }]}
			>
				<RegistrationConfirmComponent />
			</MemoryRouter>
		</Provider>
	);
	// getByText(agencyName);
	getByText(identification_code);
});

import React from "react";
import App from "./App";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

jest.mock("./Core/Routes", () => {
	return function MockAppRoutes() {
		return <div data-testid="app-routes">Routes</div>;
	};
});
// const mockStore = configureStore([]);
const mockStore = configureStore([]);

it("renders without crashing", () => {
	expect(() => {
		const store = mockStore({
			language: {},
			addressSearch: { zipCode: "" },
		});
		render(
			<Provider store={store}>
				<App />
			</Provider>
		);
	}).not.toThrow();
});

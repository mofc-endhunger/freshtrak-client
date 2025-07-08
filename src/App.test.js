import React from "react";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
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
	}).not.toThrowError();
});

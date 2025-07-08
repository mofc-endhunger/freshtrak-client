import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import EditFamilyContainer from "../EditFamilyContainer";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);
const store = mockStore({
	language: {},
	addressSearch: {
		zipCode: 43214,
	},
});

test("should render without errors", () => {
	expect(() => {
		render(
			<Router>
				<Provider store={store as any}>
					<EditFamilyContainer />
				</Provider>
			</Router>
		);
	}).not.toThrow();
});

test("should show loading till fake data comes", async () => {
	const { getByTestId } = render(
		<Router>
			<Provider store={store as any}>
				<EditFamilyContainer />
			</Provider>
		</Router>
	);

	getByTestId(/spinning component/i);
});

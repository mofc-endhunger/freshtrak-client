import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "../../Store/store";

// test utils file
export function renderWithRouter(
	ui,
	{
		route = "/",
		// path is not needed for MemoryRouter
		// history is not needed for MemoryRouter
	} = {}
) {
	const Wrapper = ({ children }) => (
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
		</Provider>
	);
	return {
		...render(ui, { wrapper: Wrapper }),
		// history is not returned, but you can use MemoryRouter's location via hooks in your components
	};
}

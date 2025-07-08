import React from "react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "../../Store/store";

// test utils file
export function renderWithRouter(
	ui,
	{ route = "/", path = "/", initialEntries = [route] } = {}
) {
	const Wrapper = ({ children }) => (
		<Provider store={store}>
			<MemoryRouter initialEntries={initialEntries}>
				{children}
			</MemoryRouter>
		</Provider>
	);
	return {
		...render(ui, { wrapper: Wrapper }),
	};
}

export function renderWithBrowserRouter(ui, { route = "/" } = {}) {
	const Wrapper = ({ children }) => (
		<Provider store={store}>
			<BrowserRouter>{children}</BrowserRouter>
		</Provider>
	);
	return {
		...render(ui, { wrapper: Wrapper }),
	};
}

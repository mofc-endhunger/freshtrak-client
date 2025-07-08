import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ResourceListComponent from "../ResourceListComponent";
import { mockFoodBank, renderWithRouter } from "../../../Testing";

const mockStore = configureStore([]);

test(`should say 'No Food Banks found within the zip code' if none are present`, () => {
	const { getByText } = renderWithRouter(
		<ResourceListComponent dataToChild={{ foodbanks: [] }} />
	);
	getByText(/No Food Banks found within the zip code/i);
});

test(`should say 'Food bank serving zip code' if only 1 food bank is present`, () => {
	const store = mockStore({ addressSearch: { zipCode: 43214 } });
	const { getByText } = renderWithRouter(
		<Provider store={store as any}>
			<ResourceListComponent
				dataToChild={{ foodbanks: [mockFoodBank] }}
			/>
		</Provider>
	);
	getByText("Food bank serving zip code [43214]");
});

test(`should say 'Food banks serving zip code' if more than 1 is present`, () => {
	const store = mockStore({ addressSearch: { zipCode: 43214 } });
	const { getByText } = renderWithRouter(
		<Provider store={store as any}>
			<ResourceListComponent
				dataToChild={{ foodbanks: [mockFoodBank, mockFoodBank] }}
			/>
		</Provider>
	);
	getByText("Food banks serving zip code [43214]");
});

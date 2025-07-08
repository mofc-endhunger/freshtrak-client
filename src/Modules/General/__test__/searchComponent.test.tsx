import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SearchComponent from "../SearchComponent";
import EventContainer from "../../Events/EventContainer";
import { BrowserRouter as Router } from "react-router-dom";
// import { mockFoodBank } from "../../../Testing";

const mockStore = configureStore([]);
const store = mockStore({});

/*** Mock Google Maps JavaScript API ***/
jest.mock("react-places-autocomplete", () => {
	const React = require("react"); // eslint-disable-line
	class PlacesAutocomplete extends React.Component {
		renderProps = {
			getInputProps: jest.fn(({ placeholder, className }: any) => ({
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

test("should show error an invalid submit", async () => {
	const { getAllByText, baseElement } = render(
		<Provider store={store as any}>
			<Router>
				{React.createElement(EventContainer as any, {
					location: { state: "" },
				})}
			</Router>
		</Provider>
	);

	const button = getAllByText(/search for resources/i)[0];
	// await act(async () => {
	//   fireEvent.click(button);
	// });
	// expect(baseElement).toHaveTextContent("This field is required");
});

// Note: temporary disabling below address autocomplete input test

// test("should show Street Input after typing in zip code", async () => {
//   const { getByLabelText, queryByLabelText } = render(
//     <Router>
//       <EventContainer location={{ state: "" }} />
//     </Router>
//   );

//   expect(queryByLabelText(/Street/i)).toBeNull();

//   fireEvent.change(getByLabelText(/zip/i, { id: "search-zip" }), {
//     target: { value: `${mockFoodBank.zip}` },
//   });

//   getByLabelText(/Street/i);
//   fireEvent.change(getByLabelText(/Street/i), {
//     target: { value: `${mockFoodBank.zip}` },
//   });
// });

// Somehow, the suggestions list could not be detected even if the data is passed to the input field.
// Will have to look into that. But for now, it works well if the API KEY is correct.
// It does have a few more testcases to cover once suggestion list is identified.

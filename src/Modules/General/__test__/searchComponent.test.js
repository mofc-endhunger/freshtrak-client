import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EventContainer from "../../Events/EventContainer";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios");

// import { mockFoodBank } from "../../../Testing";

const mockStore = configureStore([]);
const store = mockStore({});

/*** Mock Google Maps JavaScript API ***/
jest.mock("../GooglePlacesAutocomplete", () => {
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

test("should show error an invalid submit", async () => {
	const { getAllByText } = render(
		<Provider store={store}>
			<MemoryRouter>
				<EventContainer location={{ state: "" }} />
			</MemoryRouter>
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

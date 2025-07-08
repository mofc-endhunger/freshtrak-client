import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render, fireEvent, act, getByText } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import FamilyContainer from "../FamilyContainer";
import { mockEvent } from "../../../Testing";

// Mock React Hook Form
jest.mock("react-hook-form", () => ({
	useForm: () => ({
		register: jest.fn(),
		handleSubmit: jest.fn(fn => fn),
		formState: { errors: {} },
		getValues: jest.fn(),
		setValue: jest.fn(),
		watch: jest.fn(),
	}),
}));

const mockStore = configureStore([]);

/*** Mock Google Maps JavaScript API ***/
jest.mock("react-places-autocomplete", () => {
	const React = require("react"); // eslint-disable-line
	class PlacesAutocomplete extends React.Component {
		renderProps = {
			getInputProps: jest.fn(),
			suggestions: [],
			getSuggestionItemProps: jest.fn(),
		};

		render() {
			return <>{this.props.children(this.renderProps)}</>;
		}
	}

	return PlacesAutocomplete;
});

test("it should render without errors", () => {
	const store = mockStore({ event: { event: mockEvent } });
	expect(() => {
		render(
			<Provider store={store as any}>
				<Router>
					<FamilyContainer />
				</Router>
			</Provider>
		);
	}).not.toThrow();
});

// test(`should show to click 'No Phone Available' if no phone available is not clicked and nothing is in the phone number`, async () => {
//   const store = mockStore({ event: { event: mockEvent } });
//   const { getByLabelText, getByTestId, queryByTestId } = render(
//     <Provider store={store}>
//       <Router>
//         <FamilyContainer event={mockEvent} />
//       </Router>
//     </Provider>
//   );

//   // Act is necessary for react-hook-forms to fire in the testing env
//   // Notice the lack of await within the inner async.
//   // https://github.com/react-hook-form/react-hook-form/issues/532
//   await act(async () => {
//     fireEvent.click(getByTestId(/continue button/i));
//   });
//   getByTestId('no phone error');
//   getByTestId(/phone permission/i);

//   await act(async () => {
//     fireEvent.input(
//       getByLabelText(/No Phone Available/i, { id: 'no_phone_number' }),
//       {
//         target: { checked: true }
//       }
//     );
//     fireEvent.click(getByTestId(/continue button/i));
//   });
//   expect(queryByTestId('no phone error')).toBeNull();
//   // Also conditionally hide the phone permission text
//   expect(queryByTestId(/phone permission/i)).toBeNull();
// });

// test(`should show to click 'No Email Available' if no email available is not clicked and nothing is in the email`, async () => {
//   const store = mockStore({ event: { event: mockEvent } });
//   const { getByLabelText, getByTestId, queryByTestId } = render(
//     <Provider store={store}>
//       <Router>
//         <FamilyContainer event={mockEvent} />
//       </Router>
//     </Provider>
//   );

//   await act(async () => {
//     fireEvent.click(getByTestId(/continue button/i));
//   });
//   getByTestId('no email error');
//   getByTestId(/email permission/i);

//   await act(async () => {
//     fireEvent.input(
//       getByLabelText(/No Email Available/i, { id: 'no_email' }),
//       {
//         target: { checked: true }
//       }
//     );
//     fireEvent.click(getByTestId(/continue button/i));
//   });
//   expect(queryByTestId('no email error')).toBeNull();
//   // Also conditionally hide the email permission text
//   expect(queryByTestId(/email permission/i)).toBeNull();
// });

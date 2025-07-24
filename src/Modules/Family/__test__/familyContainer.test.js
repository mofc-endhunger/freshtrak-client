import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FamilyContainer from "../FamilyContainer.js";

const mockStore = configureStore([]);

// Provide a complete mockEvent object with all required fields
const mockEvent = {
	id: 1,
	name: "Test Event",
	city: "Test City",
	phone: "123-456-7890",
	address: "123 Test St",
	state: "TS",
	zip: "12345",
	// Add any other fields required by the component tree
};

// Mock form components to avoid errors related to missing form context/props
jest.mock("../PrimaryInfoFormComponent", () => () => (
	<div>Mocked PrimaryInfoFormComponent</div>
));
jest.mock("../ContactInformationComponent", () => () => (
	<div>Mocked ContactInformationComponent</div>
));

// Mock AddressComponent to avoid errors related to missing city/errors.city
jest.mock("../AddressComponent", () => () => (
	<div>Mocked AddressComponent</div>
));

/*** Mock Google Maps JavaScript API ***/
jest.mock("../../General/GooglePlacesAutocomplete", () => {
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

test("it should render without errors", () => {
	const store = mockStore({ event: { event: mockEvent } });
	expect(() => {
		render(
			<Provider store={store}>
				<MemoryRouter>
					<FamilyContainer />
				</MemoryRouter>
			</Provider>
		);
	}).not.toThrowError();
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

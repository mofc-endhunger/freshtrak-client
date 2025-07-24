import React from "react";
import { render } from "@testing-library/react";
import AddressComponent from "../AddressComponent";
import { noop } from "../../../Testing";

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

test("should render", () => {
	expect(() => {
		render(
			<AddressComponent
				register={noop}
				errors={noop}
				setValue={noop}
				watch={noop}
			/>
		);
	}).not.toThrowError();
});

test("should show invalid form if required field is not filled out", () => {
	const { getByText } = render(
		<AddressComponent
			register={noop}
			errors={{ address_line_1: true }}
			setValue={noop}
			watch={noop}
		/>
	);
	getByText(/This field is required/i);
});

// Somehow, the suggestions list could not be detected even if the data is passed to the input field.
// Will have to look into that. But for now, it works well if the API KEY is correct.
// It does have a few more testcases to cover once suggestion list is identified.

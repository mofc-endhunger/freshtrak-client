import React from "react";
import { Dropdown } from "semantic-ui-react";

const countryOptions = [
	{ key: "en", value: "en", flag: "us", text: "English" },
	{ key: "spa", value: "spa", flag: "mx", text: "Spanish" },
	{ key: "som", value: "som", flag: "so", text: "Somali" },
	{ key: "rus", value: "rus", flag: "ru", text: "Russian" },
	{ key: "tur", value: "tur", flag: "tr", text: "Turkish" },
	{ key: "ara", value: "ara", flag: "ae", text: "Arabic" },
	{ key: "zho", value: "zho", flag: "cn", text: "China" },
	{ key: "hin", value: "hin", flag: "in", text: "Hindi" },
	{ key: "nep", value: "nep", flag: "np", text: "Nepali" },
];

const CountryListComponent = props => (
	<Dropdown
		onChange={props.change}
		placeholder="Select Language"
		search
		selection
		options={countryOptions}
	/>
);

export default CountryListComponent;

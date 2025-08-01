import React from "react";
import { Dropdown } from "semantic-ui-react";

const countryOptions = [
	{ key: "en", value: "en", text: "English" },
	{ key: "spa", value: "spa", text: "Español" },
	{ key: "som", value: "som", text: "Soomaali" },
	{ key: "rus", value: "rus", text: "Русский" },
	{ key: "tur", value: "tur", text: "Türkçe" },
	{ key: "ara", value: "ara", text: "العربية" },
	{ key: "zho", value: "zho", text: "中文" },
	{ key: "hin", value: "hin", text: "हिन्दी" },
	{ key: "nep", value: "nep", text: "नेपाली" },
	{ key: "tgl", value: "tgl", text: "Tagalog" },
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

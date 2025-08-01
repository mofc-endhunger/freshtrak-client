import React, { useState } from "react";

const countryOptions = [
	{ key: "en", value: "en", text: "English" },
	{ key: "spa", value: "spa", text: "Spanish" },
	{ key: "som", value: "som", text: "Somali" },
	{ key: "rus", value: "rus", text: "Russian" },
	{ key: "tur", value: "tur", text: "Turkish" },
	{ key: "ara", value: "ara", text: "Arabic" },
	{ key: "zho", value: "zho", text: "China" },
	{ key: "hin", value: "hin", text: "Hindi" },
	{ key: "nep", value: "nep", text: "Nepali" },
];

const CountryListComponent = props => {
	const [isOpen, setIsOpen] = useState(false);

	const handleChange = event => {
		const selectedValue = event.target.value;
		props.change(event, { value: selectedValue });
	};

	const handleFocus = () => {
		setIsOpen(true);
	};

	const handleBlur = () => {
		setIsOpen(false);
	};

	return (
		<select
			onChange={handleChange}
			onFocus={handleFocus}
			onBlur={handleBlur}
			id="language-select"
			className="text-gray-400 border border-white rounded px-2 md:px-3 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
			defaultValue=""
		>
			<option value="" disabled>
				Select Language
			</option>
			{!isOpen && (
				<option value="" disabled>
					Select Language
				</option>
			)}
			{countryOptions.map(option => (
				<option
					key={option.key}
					value={option.value}
					className="text-gray-900"
				>
					{option.text}
				</option>
			))}
		</select>
	);
};

export default CountryListComponent;

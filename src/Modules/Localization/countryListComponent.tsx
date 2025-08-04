import React, { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

interface CountryOption {
	key: string;
	value: string;
	text: string;
}

interface CountryListComponentProps {
	change: (
		event: React.ChangeEvent<HTMLSelectElement>,
		data: { value: string }
	) => void;
}

const countryOptions: CountryOption[] = [
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

const CountryListComponent: React.FC<CountryListComponentProps> = props => {
	const [selectedValue, setSelectedValue] = useState<string>("");

	const handleValueChange = (value: string) => {
		setSelectedValue(value);
		// Create a synthetic event to maintain compatibility with existing code
		const syntheticEvent = {
			target: { value },
		} as React.ChangeEvent<HTMLSelectElement>;
		props.change(syntheticEvent, { value });
	};

	return (
		<Select value={selectedValue} onValueChange={handleValueChange}>
			<SelectTrigger className="bg-white text-gray-400 border border-white rounded px-2 md:px-3 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 h-auto min-w-[140px]">
				<SelectValue placeholder="Select Language" />
			</SelectTrigger>
			<SelectContent className="bg-white">
				{countryOptions.map(option => (
					<SelectItem
						key={option.key}
						value={option.value}
						className="text-gray-900"
					>
						{option.text}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default CountryListComponent;

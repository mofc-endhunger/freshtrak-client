import React, { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import localization from "./LocalizationComponent";

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

const CountryListComponent: React.FC<CountryListComponentProps> = (props) => {
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
				<SelectValue placeholder={localization.placeholder_select_language} />
			</SelectTrigger>
			<SelectContent className="bg-white z-[10000]">
				{countryOptions.map((option) => (
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

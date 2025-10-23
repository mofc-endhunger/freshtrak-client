import React from "react";
import {
	UseFormRegister,
	UseFormWatch,
	UseFormSetValue,
	FieldErrors,
} from "react-hook-form";
import StateDropdownComponent from "./StateDropdownComponent";
import localization from "../Localization/LocalizationComponent";
import GooglePlacesAutocomplete from "../General/GooglePlacesAutocomplete";

// Component props interface
interface AddressComponentProps {
	register: UseFormRegister<any>;
	watch: UseFormWatch<any>;
	setValue: UseFormSetValue<any>;
	errors: FieldErrors<any>;
	className?: string;
	"data-testid"?: string;
}

// Google Places address component interface
interface GoogleAddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

// Destructured address interface
interface DestructuredAddress {
	neighborhood?: string;
	street_number?: string;
	route?: string;
	locality?: string;
	administrative_area_level_1?: string;
	administrative_area_level_1_short?: string;
	country?: string;
	postal_code?: string;
}

const AddressComponent: React.FC<AddressComponentProps> = ({
	register,
	watch,
	setValue,
	errors,
	className = "",
	"data-testid": testId = "address-component",
}) => {
	const addressLine1 = watch("address_line_1") || "";
	const cityName = watch("city") || "";
	const shortStateName = watch("state") || "";
	const zip = watch("zip_code") || "";

	const handleSelect = async (value: string, place: any) => {
		// Remove errors when selecting a new address
		if (errors.city) delete errors.city;
		if (errors.zip_code) delete errors.zip_code;

		if (place && place.address_components) {
			let destructuredAddress = getDestructured(place.address_components);
			setValue(
				"address_line_1",
				destructuredAddress["street_number"] !== undefined
					? `${destructuredAddress["street_number"]} ${destructuredAddress["route"]}`
					: ""
			);
			setValue("city", destructuredAddress["locality"]);
			setValue(
				"state",
				destructuredAddress["administrative_area_level_1_short"]
			);
			setValue("zip_code", destructuredAddress["postal_code"]);
		}
	};

	const getDestructured = (
		address_components: GoogleAddressComponent[]
	): DestructuredAddress => {
		let destructured: DestructuredAddress = {};

		address_components.forEach(component => {
			switch (component["types"][0]) {
				case "neighborhood":
					destructured["neighborhood"] = component.long_name;
					break;
				case "street_number":
					destructured["street_number"] = component.long_name;
					break;
				case "route":
					destructured["route"] = component.short_name;
					break;
				case "locality":
					destructured["locality"] = component.long_name;
					break;
				case "administrative_area_level_1":
					destructured["administrative_area_level_1"] =
						component.long_name;
					destructured["administrative_area_level_1_short"] =
						component.short_name;
					break;
				case "country":
					destructured["country"] = component.long_name;
					break;
				case "postal_code":
					destructured["postal_code"] = component.long_name;
					break;
				default:
					break;
			}
		});
		return destructured;
	};

	const addressFieldName = "address_line_1";

	return (
		<div className={`space-y-6 ${className}`} data-testid={testId}>
			<h2 className="text-lg font-semibold text-gray-900">
				{localization.register_where_you_live}
			</h2>

			{/* Street Address Field */}
			<div className="space-y-2">
				<label
					htmlFor="address_line_1"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.street_address}
					<span className="text-red-500 ml-1">*</span>
				</label>
				<GooglePlacesAutocomplete
					value={addressLine1}
					onSelect={handleSelect}
					className={`
						w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
						placeholder-gray-400 focus:outline-none focus:ring-2
						focus:ring-indigo-500 focus:border-indigo-500
						${
							errors.address_line_1
								? "border-red-500 focus:ring-red-500 focus:border-red-500"
								: ""
						}
					`}
					id="address_line_1"
					data-testid="address-line-1-input"
					{...register(addressFieldName, {
						required: true,
					})}
				/>
				{errors.address_line_1 && (
					<span
						className="text-sm text-red-600"
						data-testid="address-line-1-error"
					>
						This field is required
					</span>
				)}
			</div>

			{/* Address Line 2 Field */}
			<div className="space-y-2">
				<label
					htmlFor="address_line_2"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.lot_suite}
				</label>
				<input
					type="text"
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
								placeholder-gray-400 focus:outline-none focus:ring-2
								focus:ring-indigo-500 focus:border-indigo-500"
					id="address_line_2"
					data-testid="address-line-2-input"
					{...register("address_line_2")}
				/>
			</div>

			{/* City, State, Zip Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* City Field */}
				<div className="space-y-2">
					<label
						htmlFor="city"
						className="block text-sm font-medium text-gray-700"
					>
						{localization.city}
						<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="text"
						className={`
							w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-indigo-500 focus:border-indigo-500
							${errors.city ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
						`}
						id="city"
						defaultValue={cityName}
						data-testid="city-input"
						{...register("city", { required: true })}
					/>
					{errors.city && (
						<span
							className="text-sm text-red-600"
							data-testid="city-error"
						>
							This field is required
						</span>
					)}
				</div>

				{/* State Dropdown */}
				<div className="space-y-2">
					<StateDropdownComponent
						register={register}
						errors={errors}
						value={shortStateName}
					/>
				</div>

				{/* Zip Code Field */}
				<div className="space-y-2">
					<label
						htmlFor="zip_code"
						className="block text-sm font-medium text-gray-700"
					>
						{localization.zip_code}
						<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="text"
						className={`
							w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-indigo-500 focus:border-indigo-500
							${
								errors.zip_code
									? "border-red-500 focus:ring-red-500 focus:border-red-500"
									: ""
							}
						`}
						defaultValue={zip}
						id="zip_code"
						data-testid="zip-code-input"
						{...register("zip_code", { required: true })}
					/>
					{errors.zip_code && (
						<span
							className="text-sm text-red-600"
							data-testid="zip-code-error"
						>
							This field is required
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default AddressComponent;

import React, { Fragment, forwardRef } from "react";
import StateDropdownComponent from "./StateDropdownComponent";
import localization from "../Localization/LocalizationComponent";
import {
	UseFormRegister,
	UseFormSetValue,
	UseFormWatch,
	FieldErrors,
} from "react-hook-form";
import PlacesAutocomplete, {
	geocodeByAddress,
} from "react-places-autocomplete";

interface FormData {
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	[key: string]: any;
}

interface AddressComponentProps {
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	watch: UseFormWatch<FormData>;
	setValue: UseFormSetValue<FormData>;
}

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

interface DestructuredAddress {
	neighborhood?: string;
	street_number?: string;
	route?: string;
	locality?: string;
	administrative_area_level_1?: string;
	administrative_area_level_1_short?: string;
	country?: string;
	postal_code?: string;
	[key: string]: string | undefined;
}

const AddressComponent = forwardRef<HTMLDivElement, AddressComponentProps>(
	({ register, errors, watch, setValue }, ref) => {
		const addressLine1 = watch("address_line_1") || "";
		const cityName = watch("city") || "";
		const shortStateName = watch("state") || "";
		const zip = watch("zip_code") || "";

		const handleSelect = async (value: string): Promise<void> => {
			const results = await geocodeByAddress(value);
			//remove errors when selecting a new address
			delete errors.city;
			delete errors.zip_code;
			let destructuredAddress = getDestructured(
				results[0]["address_components"]
			);
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
		};

		const getDestructured = (
			address_components: AddressComponent[]
		): DestructuredAddress => {
			let destructured: DestructuredAddress = {};
			// eslint-disable-next-line array-callback-return
			address_components.filter(component => {
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
						return null;
				}
			});
			return destructured;
		};

		return (
			<Fragment>
				<h2>{localization.register_where_you_live}</h2>
				<div className="form-group relative">
					<label htmlFor="address_line_1">
						{localization.street_address}
						<span className="text-danger">*</span>
					</label>
					<PlacesAutocomplete
						value={addressLine1}
						onChange={(e: string) => setValue("address_line_1", e)}
						onSelect={handleSelect}
					>
						{({
							getInputProps,
							suggestions,
							getSuggestionItemProps,
							loading,
						}) => (
							<>
								<input
									type="text"
									className={`form-control ${
										errors.address_line_1 && "invalid"
									}`}
									id="address_line_1"
									{...getInputProps()}
									{...register("address_line_1", {
										required: true,
									})}
									autoComplete="off"
								/>
								{errors.address_line_1 && (
									<span className="text-danger">
										This field is required
									</span>
								)}
								{/* No spinners are set here as of now. You can re-use the loader from EventContainer page; 
                      though the size of the spinner is set as 10em,fixed in main.scss file. */}
								{loading ? "Loading..." : null}
								{suggestions.length > 0 && (
									<div
										data-testid="suggestions"
										id="suggestions"
										className="suggestions-container"
									>
										{suggestions.map(suggestion => {
											return (
												<div
													{...getSuggestionItemProps(
														suggestion
													)}
													key={suggestion.id}
												>
													{suggestion.description}
												</div>
											);
										})}
									</div>
								)}
							</>
						)}
					</PlacesAutocomplete>
				</div>

				<div className="form-group">
					<label htmlFor="address_line_2">
						{localization.lot_suite}
					</label>
					<input
						type="text"
						className="form-control"
						id="address_line_2"
						{...register("address_line_2")}
					/>
				</div>

				<div className="d-flex city-state-form">
					<div className="form-group">
						<label htmlFor="city">
							{localization.city}
							<span className="text-danger">*</span>
						</label>
						<input
							type="text"
							className={`form-control ${
								errors.city && "invalid"
							}`}
							id="city"
							defaultValue={cityName}
							{...register("city", { required: true })}
						/>
						{errors.city && (
							<span className="text-danger">
								This field is required
							</span>
						)}
					</div>
					<StateDropdownComponent
						register={register}
						errors={errors}
						defaultValue={shortStateName}
					/>

					<div className="form-group ml-2">
						<label htmlFor="zip_code">
							{localization.zip_code}
							<span className="text-danger">*</span>
						</label>
						<input
							type="text"
							className={`form-control ${
								errors.zip_code && "invalid"
							}`}
							defaultValue={zip}
							id="zip_code"
							{...register("zip_code", { required: true })}
						/>
						{errors.zip_code && (
							<span className="text-danger">
								This field is required
							</span>
						)}
					</div>
				</div>
			</Fragment>
		);
	}
);

export default AddressComponent;

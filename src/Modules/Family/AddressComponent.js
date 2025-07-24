import React, { Fragment } from "react";
import StateDropdownComponent from "./StateDropdownComponent";
import localization from "../Localization/LocalizationComponent";
import GooglePlacesAutocomplete from "../General/GooglePlacesAutocomplete";

const AddressComponent = ({
	register,
	errors = {},
	watch = () => "",
	setValue,
}) => {
	const addressLine1 = watch("address_line_1") || "";
	const cityName = watch("city") || "";
	const shortStateName = watch("state") || "";
	const zip = watch("zip_code") || "";

	const handleSelect = async (value, place) => {
		//remove errors when selecting a new address
		delete errors.city;
		delete errors.zip_code;

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

	const getDestructured = address_components => {
		let destructured = {};
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

	const addressFieldName = "address_line_1";

	return (
		<Fragment>
			<h2>{localization.register_where_you_live}</h2>
			<div className="form-group relative">
				<label htmlFor="address_line_1">
					{localization.street_address}
					<span className="text-danger">*</span>
				</label>
				<GooglePlacesAutocomplete
					value={addressLine1}
					onChange={e => setValue("address_line_1", e.target.value)}
					onSelect={handleSelect}
					className={`form-control ${
						errors.address_line_1 && "invalid"
					}`}
					name={addressFieldName}
					id="address_line_1"
					{...register(addressFieldName, {
						required: true,
					})}
				/>
				{errors.address_line_1 && (
					<span className="text-danger">This field is required</span>
				)}
			</div>

			<div className="form-group">
				<label htmlFor="address_line_2">{localization.lot_suite}</label>
				<input
					type="text"
					className="form-control"
					name="address_line_2"
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
						className={`form-control ${errors.city && "invalid"}`}
						name="city"
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
					value={shortStateName}
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
						name="zip_code"
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
};

export default AddressComponent;

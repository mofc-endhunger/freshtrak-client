import React, { forwardRef, useState } from "react";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import FilterComponent from "./FilterComponent";
import localization from "../Localization/LocalizationComponent";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { Fragment } from "react";

const SearchComponent = forwardRef(
	(
		{ register, errors = {}, onSubmitHandler, z_code, range, categories },
		ref
	) => {
		const [address, setAddress] = useState("");
		// const [zip] = React.useState("");
		const [lat, setLat] = useState("");
		const [long, setLong] = useState("");
		const [showAddress, setShowAddress] = useState(false);
		const showDistance = z_code.length > 4 ? true : false;
		const [zipCode, setZipCode] = useState(z_code);
		const [distance, setDistance] = useState(range);
		const [serviceCat, setServiceCat] = useState("");
		const [showFilter, setShowFilter] = useState(z_code !== undefined);
		const handleSelect = async (value, place) => {
			setAddress(value);

			if (place && place.address_components) {
				let destructuredAddress = getDestructured(
					place.address_components
				);
				setAddress(
					destructuredAddress["street_number"] !== undefined
						? `${destructuredAddress["street_number"]} ${destructuredAddress["route"]}`
						: ""
				);

				// Note: Coordinates are not available with the new API
				// You may need to implement a separate geocoding service
				// to get coordinates if needed
				// For now, we'll set empty coordinates
				setLat("");
				setLong("");
			}
		};

		const getDestructured = address_components => {
			let destructured = {};
			// eslint-disable-next-line array-callback-return
			address_components.filter(component => {
				switch (component["types"][0]) {
					case "street_number":
						destructured["street_number"] = component.long_name;
						break;
					case "route":
						destructured["route"] = component.long_name;
						break;
					default:
						return null;
				}
			});
			return destructured;
		};
		return (
			<Fragment>
				<div className="flex flex-wrap items-end gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex gap-4">
							{showAddress && (
								<div
									className="flex-1"
									data-testid="search-street"
								>
									<Label htmlFor="street">Street</Label>
									<GooglePlacesAutocomplete
										onSelect={handleSelect}
										value={address}
										onChange={e =>
											setAddress(e.target.value)
										}
										className="mt-1"
										name="street"
										id="street"
										placeholder="Type Address"
										{...register("street")}
									/>
								</div>
							)}
							<div className="w-full">
								<Label htmlFor="zip_code">
									{localization.house_hold_zip}
								</Label>
								<Input
									type="text"
									id="zip_code"
									name="zip_code"
									defaultValue={zipCode}
									className="mt-1 min-h-[50px] border-[#392947] w-full text-gray-600 bg-white outline-none focus:border-[#392947] focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)] focus:ring-0 focus-visible:border-[#392947] focus-visible:ring-0 focus-visible:ring-transparent"
									{...register("zip_code", {
										required: true,
										onChange: e => {
											if (e.target.value.length === 5) {
												setShowAddress(false);
												setZipCode(e.target.value);
												setDistance(DEFAULT_DISTANCE);
												setShowFilter(true);
												setServiceCat(null);
												onSubmitHandler({
													zip_code: e.target.value,
													distance: DEFAULT_DISTANCE,
													serviceCat: "",
												});
											} else {
												setShowFilter(false);
											}
										},
									})}
								/>

								{errors.zip_code && (
									<span className="text-sm text-[#ff0000] absolute">
										This field is required
									</span>
								)}
							</div>
							<input
								type="hidden"
								defaultValue={lat || ""}
								{...register("lat")}
								name="lat"
							/>
							<input
								type="hidden"
								defaultValue={long || ""}
								{...register("long")}
								name="long"
							/>
						</div>
					</div>
					<div className="flex-shrink-0">
						<Button
							type="submit"
							variant="mofcprimary"
							name="searchForResources"
							dataid=""
							id="search-resource"
							value="Search For Resources"
							className="w-full sm:w-auto min-h-[50px]"
						>
							{localization.search_for_resources}
						</Button>
					</div>
					<div className="w-full mt-2">
						{address.length === 0 && showAddress && (
							<p className="text-sm text-gray-600">
								Enter your address for customized results
								(Optional){" "}
							</p>
						)}
					</div>
				</div>
				<Fragment>
					{showFilter && (
						<FilterComponent
							closeFilter={() => {
								setShowFilter(false);
								onSubmitHandler({
									zip_code: zipCode,
									distance: null,
									serviceCat: "",
								});
							}}
							distance={{
								show: showDistance,
								defaultValue: distance,
								onChangeHandler: e => {
									setDistance(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: e.target.value,
										serviceCat: serviceCat,
									});
								},
							}}
							serviceCat={{
								show: showDistance,
								defaultValue: serviceCat,
								data: categories,
								onChangeHandler: e => {
									setServiceCat(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: distance,
										serviceCat: e.target.value,
									});
								},
							}}
						/>
					)}
				</Fragment>
			</Fragment>
		);
	}
);

SearchComponent.defaultProps = {
	range: "",
	z_code: "",
};
export default SearchComponent;

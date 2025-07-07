import React, { forwardRef, useState } from "react";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import FilterComponent from "./FilterComponent";
import localization from "../Localization/LocalizationComponent";

import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete";
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
		const handleSelect = async value => {
			setAddress(value);
			const results = await geocodeByAddress(value);
			let destructuredAddress = getDestructured(
				results[0]["address_components"]
			);
			setAddress(
				destructuredAddress["street_number"] !== undefined
					? `${destructuredAddress["street_number"]} ${destructuredAddress["route"]}`
					: ""
			);

			//  Here we get the coordinates lat and long.
			const coordinates = await getLatLng(results[0]);
			setLat(coordinates.lat);
			setLong(coordinates.lng);
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
				<div className=" row align-items-end">
					<div className="col-sm-6 col-md-6 col-lg-7 col-xl-8 search-order-1">
						<div className="d-flex">
							{showAddress && (
								<div
									className="form-group flex-grow-1"
									data-testid="search-street"
								>
									<label htmlFor="street">Street</label>
									<PlacesAutocomplete
										onSelect={handleSelect}
										value={address}
										onChange={setAddress}
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
													className="form-control"
													name="street"
													id="street"
													{...getInputProps({
														placeholder:
															"Type Address",
													})}
													{...register("street")}
												/>

												{/* No spinners are set here as of now. You can re-use the loader from EventContainer page;
                      though the size of the spinner is set as 10em,fixed in main.scss file. */}
												{loading ? "Loading..." : null}

												{suggestions.length > 0 && (
													<div
														data-testid="suggestions"
														className="suggestions-container"
													>
														{suggestions.map(
															suggestion => {
																return (
																	<div
																		{...getSuggestionItemProps(
																			suggestion
																		)}
																		key={
																			suggestion.id
																		}
																	>
																		{
																			suggestion.description
																		}
																	</div>
																);
															}
														)}
													</div>
												)}
											</>
										)}
									</PlacesAutocomplete>
								</div>
							)}
							<div className="form-group zip-code">
								<label htmlFor="zip_code">
									{localization.house_hold_zip}
								</label>
								<input
									type="text"
									className="form-control zip"
									id="zip_code"
									name="zip_code"
									defaultValue={zipCode}
									onChange={e => {
										if (e.target.value.length === 5) {
											setShowAddress(false);
											setZipCode(e.target.value);
											setDistance(DEFAULT_DISTANCE);
											setShowFilter(true);
											setServiceCat(null);
											onSubmitHandler({
												zip_code: e.target.value,
												distance: DEFAULT_DISTANCE,
												serviceCat: null,
											});
										} else {
											setShowFilter(false);
										}
									}}
									{...register("zip_code", {
										required: true,
									})}
								/>

								{errors.zip_code && (
									<span className="validationError">
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
					<div className="col-sm-6 col-md-6 col-lg-5 col-xl-4 text-right search-order-3">
						<button
							type="submit"
							name="searchForResources"
							dataid=""
							id="search-resource"
							value="Search For Resources"
							className="btn custom-button search-button"
						>
							{localization.search_for_resources}
						</button>
					</div>
					<div className="col-12 search-order-2 mt-2">
						{address.length === 0 && showAddress && (
							<p>
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
									serviceCat: null,
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

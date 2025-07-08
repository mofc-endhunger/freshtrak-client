import React, { forwardRef, useState } from "react";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import FilterComponent from "./FilterComponent";
import localization from "../Localization/LocalizationComponent";
import { UseFormRegister, FieldErrors } from "react-hook-form";

import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete";
import { Fragment } from "react";

interface FormData {
	zip_code: string;
	street?: string;
	lat?: string;
	long?: string;
	distance?: string;
	serviceCat?: string;
}

interface SearchComponentProps {
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	onSubmitHandler: (data: Partial<FormData>) => void;
	z_code?: string;
	range?: string | number;
	searchData?: any;
	agencyData?: any[];
	categories?: any[];
	enableFilter?: boolean;
}

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

interface DestructuredAddress {
	street_number?: string;
	route?: string;
	[key: string]: string | undefined;
}

const SearchComponent = forwardRef<HTMLDivElement, SearchComponentProps>(
	(
		{
			register,
			errors = {},
			onSubmitHandler,
			z_code = "",
			range = "",
			categories = [],
		},
		ref
	) => {
		const [address, setAddress] = useState<string>("");
		const [lat, setLat] = useState<string>("");
		const [long, setLong] = useState<string>("");
		const [showAddress, setShowAddress] = useState<boolean>(false);
		const showDistance = z_code.length > 4 ? true : false;
		const [zipCode, setZipCode] = useState<string>(z_code);
		const [distance, setDistance] = useState<string | number>(range);
		const [serviceCat, setServiceCat] = useState<string>("");
		const [showFilter, setShowFilter] = useState<boolean>(
			z_code !== undefined
		);

		const handleSelect = async (value: string): Promise<void> => {
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
			setLat(coordinates.lat.toString());
			setLong(coordinates.lng.toString());
		};

		const getDestructured = (
			address_components: AddressComponent[]
		): DestructuredAddress => {
			let destructured: DestructuredAddress = {};
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
									defaultValue={zipCode}
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
							/>
							<input
								type="hidden"
								defaultValue={long || ""}
								{...register("long")}
							/>
						</div>
					</div>
					<div className="col-sm-6 col-md-6 col-lg-5 col-xl-4 text-right search-order-3">
						<button
							type="submit"
							name="searchForResources"
							data-testid=""
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
									distance: undefined,
									serviceCat: undefined,
								});
							}}
							distance={{
								show: showDistance,
								defaultValue: distance,
								onChangeHandler: e => {
									setDistance(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: e.target.value.toString(),
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
										distance: distance?.toString(),
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

export default SearchComponent;

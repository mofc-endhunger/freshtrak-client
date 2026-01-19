import React, { forwardRef, useState } from "react";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import FilterComponent from "./FilterComponent";
import localization from "../Localization/LocalizationComponent";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { Fragment } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

interface Place {
	address_components: AddressComponent[];
}

interface ServiceCategory {
	id: number;
	service_category_name: string;
}

export interface SearchFormData {
	zip_code: string;
	distance: string;
	serviceCat: string;
	availability: string;
	reservations: boolean;
	street?: string;
	lat?: string;
	long?: string;
}

interface SearchComponentProps {
	register: UseFormRegister<SearchFormData>;
	errors: FieldErrors<SearchFormData>;
	onSubmitHandler: (data: SearchFormData) => void;
	z_code: string;
	range: string;
	categories: ServiceCategory[];
	isLoading?: boolean;
	initialAvailability?: string;
	initialReservations?: boolean;
}

const SearchComponent = forwardRef<HTMLDivElement, SearchComponentProps>(
	(
		{
			register,
			errors = {},
			onSubmitHandler,
			z_code,
			range,
			categories,
			isLoading = false,
			initialAvailability = "All",
			initialReservations = false,
		},
		ref
	) => {
		const [address, setAddress] = useState<string>("");
		const [lat, setLat] = useState<string>("");
		const [long, setLong] = useState<string>("");
		const [showAddress, setShowAddress] = useState<boolean>(false);
		const showDistance = z_code?.length > 4 ? true : false;
		const [zipCode, setZipCode] = useState<string>(z_code);
		const [distance, setDistance] = useState<string>(range);
		const [serviceCat, setServiceCat] = useState<string>("");
		const [availability, setAvailability] = useState<string>(initialAvailability);
		const [reservations, setReservations] = useState<boolean>(initialReservations);
		const [showFilter, setShowFilter] = useState<boolean>(
			z_code !== undefined
		);

		const handleSelect = async (value: string, place: Place) => {
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

		const getDestructured = (address_components: AddressComponent[]) => {
			let destructured: Record<string, string> = {};
			// eslint-disable-next-line array-callback-return
			address_components.filter((component) => {
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
				<div
					className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end w-full"
					ref={ref}
				>
					<div className="sm:col-span-2">
						<div className="flex flex-col gap-4">
							{showAddress && (
								<div
									className="w-full"
									data-testid="search-street"
								>
									<Label htmlFor="street">Street</Label>
									<GooglePlacesAutocomplete
										onSelect={handleSelect}
										value={address}
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) => setAddress(e.target.value)}
										className="mt-1"
										id="street"
										placeholder={localization.placeholder_type_address}
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
									defaultValue={zipCode}
									className="mt-1 min-h-[50px] border-[#392947] w-full text-gray-600 bg-white outline-none focus:border-[#392947] focus:shadow-[0_0_0_0.2rem_rgba(0,123,255,0.25)] focus:ring-0 focus-visible:border-[#392947] focus-visible:ring-0 focus-visible:ring-transparent"
									{...register("zip_code", {
										required: true,
										onChange: (
											e: React.ChangeEvent<HTMLInputElement>
										) => {
											if (e.target.value.length === 5) {
												setShowAddress(false);
												setZipCode(e.target.value);
												setDistance(
													DEFAULT_DISTANCE.toString()
												);
												setShowFilter(true);
												setServiceCat("");
												setAvailability("All");
												setReservations(false);
												onSubmitHandler({
													zip_code: e.target.value,
													distance:
														DEFAULT_DISTANCE.toString(),
													serviceCat: "",
													availability: "All",
													reservations: false,
												});
											} else {
												setShowFilter(false);
											}
										},
									})}
								/>

								{errors.zip_code && (
									<span className="text-sm text-[#ff0000] absolute my-1">
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
					<div className="sm:col-span-1">
						<Button
							type="submit"
							variant="mofcprimary"
							name="searchForResources"
							id="search-resource"
							value="Search For Resources"
							className="w-full min-h-[50px]"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center justify-center space-x-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span>Searching...</span>
								</div>
							) : (
								localization.search_for_resources
							)}
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
									distance: "",
									serviceCat: "",
									availability: "All",
									reservations: false,
								});
							}}
							distance={{
								show: showDistance,
								defaultValue: distance,
								onChangeHandler: (e: {
									target: { value: string };
								}) => {
									setDistance(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: e.target.value,
										serviceCat: serviceCat,
										availability: availability,
										reservations: reservations,
									});
								},
							}}
							serviceCat={{
								show: showDistance,
								defaultValue: serviceCat,
								data: categories,
								onChangeHandler: (e: {
									target: { value: string };
								}) => {
									setServiceCat(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: distance,
										serviceCat: e.target.value,
										availability: availability,
										reservations: reservations,
									});
								},
							}}
							availability={{
								show: showDistance,
								defaultValue: availability,
								onChangeHandler: (e: {
									target: { value: string };
								}) => {
									setAvailability(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: distance,
										serviceCat: serviceCat,
										availability: e.target.value,
										reservations: reservations,
									});
								},
							}}
							reservations={{
								show: showDistance,
								defaultValue: reservations,
								onChangeHandler: (e: {
									target: { value: boolean };
								}) => {
									setReservations(e.target.value);
									onSubmitHandler({
										zip_code: zipCode,
										distance: distance,
										serviceCat: serviceCat,
										availability: availability,
										reservations: e.target.value,
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

SearchComponent.displayName = "SearchComponent";

export default SearchComponent;

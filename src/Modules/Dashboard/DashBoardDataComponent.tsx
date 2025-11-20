import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SearchComponent, { SearchFormData } from "../General/SearchComponent";
import DashboardCreateAccountComponent from "./DashboardCreateAccountComponent";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import { DashBoardDataComponentProps } from "./types/dashboard.types";

/**
 * DashBoardDataComponent - Handles search functionality and main content display
 *
 * This component manages the search form for finding food access resources by zip code
 * and distance. It integrates with react-hook-form for form management and uses
 * SearchComponent for the search interface. Upon form submission, it navigates to
 * the events list with search parameters.
 *
 * @component
 * @param {DashBoardDataComponentProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The search form and main content area
 *
 * @example
 * ```tsx
 * <DashBoardDataComponent />
 * ```
 */
const DashBoardDataComponent: React.FC<DashBoardDataComponentProps> = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SearchFormData>();

	const navigate = useNavigate();

	/**
	 * Handles form submission and navigates to events list
	 * @param {SearchFormData} data - Form data containing zip_code, distance, and availability
	 */
	const onSubmit = ({
		zip_code,
		distance,
		availability,
		reservations,
	}: SearchFormData) => {
		let url = `/events/list/`;
		if (zip_code) {
			url += zip_code + "/";
		}
		if (distance) {
			url += distance + "/";
		}
		// Use query parameters for availability and reservations
		const queryParams = new URLSearchParams();
		if (availability && availability !== "All") {
			queryParams.set("availability", availability);
		}
		if (reservations) {
			queryParams.set("reservations", "true");
		}

		if (queryParams.toString()) {
			url += `?${queryParams.toString()}`;
		}

		navigate(url);
	};

	return (
		<div className="container mx-auto pt-24 pb-24 px-4 sm:px-6 lg:px-8">
			<div className="min-h-[130px] bg-white rounded-lg shadow-md -mt-40 sm:-mt-52 mb-12 mx-auto p-4 sm:p-6 md:p-8 text-left w-full sm:w-full sm:min-w-auto md:w-11/12 md:min-w-auto lg:min-w-[600px] lg:w-auto lg:max-w-[900px]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<SearchComponent
						register={register}
						errors={errors}
						onSubmitHandler={onSubmit}
						range={String(DEFAULT_DISTANCE)}
						z_code=""
						categories={[]}
					/>
				</form>
			</div>

			<DashboardCreateAccountComponent />
		</div>
	);
};

export default DashBoardDataComponent;

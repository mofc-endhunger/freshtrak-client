import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import SearchComponent, { SearchFormData } from "../General/SearchComponent";
import ResourceListComponent from "./ResourceListComponent";
import EventListContainer from "./EventListContainer";
import { API_URL } from "../../Utils/Urls";
import { setCurrentZip } from "../../Store/Search/searchSlice";
import axios from "axios";
import "../../Assets/scss/main.scss";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import serviceCatFilter from "../../Utils/serviceCatFilter";
import LoadingSpinner from "../General/LoadingSpinner";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

// Number of agencies to render per batch for progressive loading
const AGENCIES_PER_BATCH = 10;

interface Agency {
	id: string;
	name: string;
	nickname: string;
	events: any[];
	[key: string]: any;
}

interface FoodBankData {
	foodbanks: any[];
	[key: string]: any;
}

const EventContainer: React.FC = () => {
	const {
		zipCode = "",
		distance = DEFAULT_DISTANCE,
		serviceCat,
	} = useParams<{
		zipCode?: string;
		distance?: string;
		serviceCat?: string;
	}>();

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	// Default to "next_7_days" to show events from today plus 7 days
	// Map old "this_week" value to "next_7_days" for backward compatibility
	const availabilityParam = searchParams.get("availability");
	const availability =
		availabilityParam === "this_week" || !availabilityParam
			? "next_7_days"
			: availabilityParam;
	const reservations = searchParams.get("reservations") === "true";

	const [foodBankResponse, setFoodBankResponse] = useState<boolean>(false);
	const [foodBankData, setFoodBankData] = useState<FoodBankData>({
		foodbanks: [],
	});

	const [serverError, setServerError] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [agencyData, setAgencyData] = useState<Agency[]>([]);
	const [filteredData, setFilteredData] = useState<Agency[]>([]);
	const [zip, setZip] = useState<string | null>(null);

	// Progressive rendering state
	const [visibleAgencyCount, setVisibleAgencyCount] =
		useState<number>(AGENCIES_PER_BATCH);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const categories = serviceCatFilter(filteredData);

	// Calculate visible agencies for progressive rendering
	const visibleAgencies = agencyData.slice(0, visibleAgencyCount);
	const hasMoreAgencies = visibleAgencyCount < agencyData.length;

	// Load more agencies handler for infinite scroll
	const loadMoreAgencies = useCallback(() => {
		if (loadingMore || !hasMoreAgencies) return;

		setLoadingMore(true);
		// Use setTimeout to simulate async loading and allow UI to update
		setTimeout(() => {
			setVisibleAgencyCount(prev =>
				Math.min(prev + AGENCIES_PER_BATCH, agencyData.length)
			);
			setLoadingMore(false);
		}, 100);
	}, [loadingMore, hasMoreAgencies, agencyData.length]);

	// Infinite scroll hook
	const { lastElementRef } = useInfiniteScroll({
		onLoadMore: loadMoreAgencies,
		hasMore: hasMoreAgencies,
		isLoading: loadingMore,
	});

	const getEvents = async (): Promise<void> => {
		if (zipCode) {
			setLoading(true);
			try {
				const resp = await axios.get(API_URL.EVENTS_LIST, {
					params: {
						zip_code: zipCode,
						distance: distance,
						category: serviceCat,
					},
				});
				const {
					data: { agencies },
				} = resp;

				setAgencyData(agencies);
				if (zip !== zipCode || filteredData.length === 0) {
					setZip(zipCode);
					setFilteredData(agencies);
				}
				setLoading(false);
			} catch (err) {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		if (zipCode) {
			// Reset progressive rendering when search params change
			setVisibleAgencyCount(AGENCIES_PER_BATCH);
			getEvents();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zipCode, distance, serviceCat, availability, reservations]);

	useEffect(() => {
		if (zipCode) {
			dispatch(setCurrentZip(zipCode));
			getFoodbanks(zipCode);
		}
	}, [zipCode, dispatch]);

	const ResourceList: React.FC = () => {
		if (foodBankResponse) {
			return <ResourceListComponent dataToChild={foodBankData} />;
		}
		if (serverError) {
			return <h2>Something went wrong</h2>;
		}
		return null;
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SearchFormData>();

	const getFoodbanks = async (zip: string): Promise<void> => {
		if (zip) {
			setLoading(true);
			let foodBankUri = API_URL.FOODBANK_LIST;

			try {
				const resp = await axios.get(foodBankUri, {
					params: { zip_code: zip },
				});
				const { data } = resp;
				setFoodBankData(data);
				setFoodBankResponse(true);
				setLoading(false);
			} catch (err) {
				setServerError(true);
				setLoading(false);
			}
		}
	};

	const onSubmit = ({
		zip_code,
		distance,
		serviceCat,
		availability,
		reservations,
	}: SearchFormData): void => {
		let url = `/events/list/`;
		if (zip_code) {
			url += zip_code + "/";
		}
		if (distance) {
			url += distance + "/";
		}
		// Only add serviceCat if it's not "All" or empty
		if (serviceCat && serviceCat !== "All") {
			url += serviceCat + "/";
		}

		// Use query parameters for availability and reservations to avoid URL structure issues
		const queryParams = new URLSearchParams();
		// Always include availability in URL so we can distinguish between
		// default (next_7_days) and user explicitly selecting "All"
		if (availability) {
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

	localStorage.setItem("search_zip", `${zipCode}`);

	return (
		<div>
			<section className="bg-[#F2F0F4]">
				<div className="container mx-auto px-4 pt-24 pb-24">
					<div className="min-h-[130px] bg-white rounded-lg shadow-md -mt-56 mb-12 mx-auto p-8 text-left sm:w-full sm:min-w-auto sm:p-6 sm:-mt-36 md:w-11/12 md:min-w-auto lg:min-w-[600px] lg:w-auto lg:max-w-[900px]">
						<form onSubmit={handleSubmit(onSubmit)}>
							<SearchComponent
								register={register}
								errors={errors}
								onSubmitHandler={onSubmit}
								z_code={zipCode}
								range={distance?.toString() || ""}
								categories={categories}
								isLoading={loading}
								initialAvailability={availability}
								initialReservations={reservations}
							/>
						</form>
						{loading && (
							<div className="pt-4">
								<LoadingSpinner size="medium" />
							</div>
						)}
						{!loading && <ResourceList />}
					</div>
					{!loading && (
						<EventListContainer
							agencyData={visibleAgencies}
							zipCode={zipCode}
							availabilityFilter={availability}
							reservationsFilter={reservations}
							lastItemRef={lastElementRef}
							loadingMore={loadingMore}
							hasMore={hasMoreAgencies}
						/>
					)}
					{loading && <LoadingSpinner />}
				</div>
			</section>
		</div>
	);
};

export default EventContainer;

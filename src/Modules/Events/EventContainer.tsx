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
import { Button } from "../../components/ui/button";

// Pagination constants
const ITEMS_PER_PAGE = 20;

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
	const availability = searchParams.get("availability") || "All";
	const reservations = searchParams.get("reservations") === "true";

	const [foodBankResponse, setFoodBankResponse] = useState<boolean>(false);
	const [foodBankData, setFoodBankData] = useState<FoodBankData>({
		foodbanks: [],
	});

	const [serverError, setServerError] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [agencyData, setAgencyData] = useState<Agency[]>([]);
	const [filteredData, setFilteredData] = useState<Agency[]>([]);
	const [zip, setZip] = useState<string | null>(null);
	
	// Pagination state
	const [page, setPage] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const categories = serviceCatFilter(filteredData);

	const getEvents = useCallback(async (pageNum: number = 1, append: boolean = false): Promise<void> => {
		if (!zipCode) return;

		// Use different loading states for initial load vs loading more
		if (pageNum === 1) {
			setLoading(true);
			if (!append) {
				setAgencyData([]); // Clear previous results on new search
			}
		} else {
			setLoadingMore(true);
		}

		try {
			const resp = await axios.get(API_URL.EVENTS_LIST, {
				params: {
					zip_code: zipCode,
					distance: distance,
					category: serviceCat,
					page: pageNum,
					limit: ITEMS_PER_PAGE,
				},
			});

			const {
				data: { agencies, meta },
			} = resp;

			// Append or replace based on whether it's a new search or load more
			setAgencyData(prev => append ? [...prev, ...agencies] : agencies);
			
			if (zip !== zipCode || filteredData.length === 0) {
				setZip(zipCode);
				setFilteredData(prev => append ? [...prev, ...agencies] : agencies);
			} else if (append) {
				setFilteredData(prev => [...prev, ...agencies]);
			}

			setPage(pageNum);
			// Handle pagination meta - check if there's more data
			setHasMore(meta?.hasMore ?? agencies.length === ITEMS_PER_PAGE);

		} catch (err) {
			console.error("Error fetching events:", err);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	}, [zipCode, distance, serviceCat, zip, filteredData.length]);

	// Load more handler
	const loadMore = useCallback(() => {
		if (!loadingMore && hasMore) {
			getEvents(page + 1, true);
		}
	}, [loadingMore, hasMore, page, getEvents]);

	useEffect(() => {
		if (zipCode) {
			// Reset pagination on new search
			setPage(1);
			setHasMore(true);
			getEvents(1, false);
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
							agencyData={agencyData}
							zipCode={zipCode}
							availabilityFilter={availability}
							reservationsFilter={reservations}
							distance={Number(distance) || 10}
						/>
					)}
					{loading && <LoadingSpinner />}
				</div>
			</section>
		</div>
	);
};

export default EventContainer;

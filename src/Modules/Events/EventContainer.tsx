import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ProgressBar } from "react-bootstrap";
import SearchComponent from "../General/SearchComponent";
import ResourceListComponent from "./ResourceListComponent";
import EventListContainer from "./EventListContainer";
import { API_URL } from "../../Utils/Urls";
import { setCurrentZip } from "../../Store/Search/searchSlice";
import axios from "axios";
import "../../Assets/scss/main.scss";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import serviceCatFilter from "../../Utils/serviceCatFilter";
import SpinnerComponent from "../General/SpinnerComponent";

interface AgencyData {
	id: number;
	name: string;
	address?: string;
	phone?: string;
	website?: string;
	services?: string[];
	[key: string]: any;
}

interface FoodBankData {
	foodbanks?: any[];
	[key: string]: any;
}

interface SearchDetails {
	[key: string]: any;
}

interface FormData {
	zip_code: string;
	street?: string;
	lat?: string;
	long?: string;
	distance?: string;
	serviceCat?: string;
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

	const [foodBankResponse, setFoodBankResponse] = useState<boolean>(false);
	const [foodBankData, setFoodBankData] = useState<FoodBankData>({});
	const [searchDetails, setSearchDetails] = useState<SearchDetails>({});
	const [serverError, setServerError] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [agencyData, setAgencyData] = useState<AgencyData[]>([]);
	const [filteredData, setFilteredData] = useState<AgencyData[]>([]);
	const [zip, setZip] = useState<string | null>(null);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const categories = serviceCatFilter(filteredData);

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
			getEvents();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [zipCode, distance, serviceCat]);

	useEffect(() => {
		if (zipCode) {
			dispatch(setCurrentZip(zipCode));
			getFoodbanks(zipCode);
		}
	}, [zipCode, dispatch]);

	const ResourceList: React.FC = () => {
		if (foodBankResponse) {
			return <ResourceListComponent dataToChild={foodBankData as any} />;
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
	} = useForm<FormData>();

	const getFoodbanks = async (zip: string): Promise<void> => {
		if (zip) {
			setLoading(true);
			let foodBankUri = API_URL.FOODBANK_LIST;
			setSearchDetails({ zip });

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

	const onSubmit = (data: Partial<FormData>): void => {
		let url = `/events/list/`;
		if (data.zip_code) {
			url += data.zip_code + "/";
		}
		if (data.distance) {
			url += data.distance + "/";
		}
		if (data.serviceCat) {
			url += data.serviceCat + "/";
		}
		navigate(url);
	};

	localStorage.setItem("search_zip", `${zipCode}`);

	return (
		<div>
			<section className="gray-bg">
				<div className="container pt-150 pb-150">
					<div className="search-area text-left">
						<form onSubmit={handleSubmit(onSubmit)}>
							<SearchComponent
								register={register}
								errors={errors}
								onSubmitHandler={onSubmit}
								searchData={searchDetails}
								z_code={zipCode}
								range={distance}
								agencyData={agencyData}
								categories={categories}
							/>
						</form>
						{loading && (
							<div className="pt-4">
								<ProgressBar
									animated
									now={100}
									data-testid="loading"
								/>
							</div>
						)}
						{!loading && <ResourceList />}
					</div>
					{!loading && (
						<EventListContainer
							agencyData={agencyData as any}
							zipCode={zipCode}
						/>
					)}
					{loading && <SpinnerComponent />}
				</div>
			</section>
		</div>
	);
};

export default EventContainer;

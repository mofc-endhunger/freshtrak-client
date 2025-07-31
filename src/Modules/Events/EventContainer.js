import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import SearchComponent from "../General/SearchComponent";
import ResourceListComponent from "./ResourceListComponent";
import EventListContainer from "./EventListContainer";
import { API_URL } from "../../Utils/Urls";
import { setCurrentZip } from "../../Store/Search/searchSlice";
import axios from "axios";
import "../../Assets/scss/main.scss";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";
import serviceCatFilter from "../../Utils/serviceCatFilter";
import LoadingSpinner from "../General/LoadingSpinner";

const EventContainer = () => {
	const {
		zipCode = "",
		distance = DEFAULT_DISTANCE,
		serviceCat,
	} = useParams();
	const [foodBankResponse, setFoodBankResponse] = useState(false);
	let [foodBankData, setFoodBankData] = useState({});
	let [searchDetails, setSearchDetails] = useState({});
	const [serverError, setServerError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [agencyData, setAgencyData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [zip, setZip] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const categories = serviceCatFilter(filteredData);

	const getEvents = async () => {
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

	const ResourceList = () => {
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
	} = useForm();

	const getFoodbanks = async zip => {
		if (zip) {
			setLoading(true);
			let foodBankUri = API_URL.FOODBANK_LIST;
			setSearchDetails(zip);

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

	const onSubmit = ({ zip_code, distance, serviceCat }) => {
		let url = `/events/list/`;
		if (zip_code) {
			url += zip_code + "/";
		}
		if (distance) {
			url += distance + "/";
		}
		if (serviceCat) {
			url += serviceCat + "/";
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
								<LoadingSpinner size="medium" />
							</div>
						)}
						{!loading && <ResourceList />}
					</div>
					{!loading && (
						<EventListContainer
							agencyData={agencyData}
							zipCode={zipCode}
							distance={distance}
							serviceCat={serviceCat}
						/>
					)}
					{loading && <LoadingSpinner />}
				</div>
			</section>
		</div>
	);
};

export default EventContainer;

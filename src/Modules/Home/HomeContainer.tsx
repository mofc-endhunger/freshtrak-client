import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { ProgressBar } from "react-bootstrap";
import SearchComponent from "../General/SearchComponent";
import SpinnerComponent from "../General/SpinnerComponent";
import LocalFoodBankComponent from "../Home/LocalFoodBankComponent";
import UsersRegistrations from "../Home/UsersRegistrations";
import EventNearByComponent from "../Home/EventNearByComponent";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import { setCurrentZip } from "../../Store/Search/searchSlice";
import axios from "axios";
import "../../Assets/scss/main.scss";
import EventListComponent from "../Events/EventListComponent";
import { EventHandler, HomeEventFormat } from "../../Utils/EventHandler";
import moment from "moment";

interface FormData {
	zip_code: string;
	street?: string;
	lat?: string;
	long?: string;
	distance?: string;
	serviceCat?: string;
}

interface AgencyData {
	[key: string]: any;
}

interface ReservedEvent {
	event_date_id: number;
	[key: string]: any;
}

interface EventListProps {
	filter?: string;
}

const HomeContainer: React.FC = () => {
	const [agencyResponse, setAgencyResponse] = useState<boolean>(false);
	const [agencyData, setAgencyData] = useState<AgencyData>({});
	const [reservedEvents, setReservedEvents] = useState<ReservedEvent[]>([]);
	const [zipCode, setZipCode] = useState<string | null>(
		localStorage.getItem("search_zip")
	);
	let [searchDetails] = useState<Record<string, any>>({});
	const [loading, setLoading] = useState<boolean>(false);
	const dispatch = useDispatch();

	useEffect(() => {
		getUsersReservations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getUsersReservations = async (): Promise<void> => {
		const userToken = localStorage.getItem("userToken");
		const { CREATE_RESERVATION } = API_URL;
		try {
			const usersRegData = await axios.get(CREATE_RESERVATION, {
				headers: { Authorization: `Bearer ${userToken}` },
			});
			// setUsersReservation(usersRegData.data);
			getEventByDateId(usersRegData.data);
			// setLoading();
		} catch (e) {
			console.log(e);
		}
	};

	const getEventByDateId = async (
		userRegData: ReservedEvent[]
	): Promise<void> => {
		const userRegEvents: Promise<any>[] = [];
		const { EVENT_URL } = API_URL;
		userRegData.forEach(userReg => {
			userRegEvents.push(
				axios.get(`${EVENT_URL}?event_date_id=${userReg.event_date_id}`)
			);
		});
		const regEvents = await axios.all(userRegEvents);
		const events: any[] = [];
		regEvents.forEach((event, index) => {
			let filteredEvents;
			if (event.data?.events[0]) {
				filteredEvents = HomeEventFormat(
					event.data.events[0],
					userRegData[index].event_date_id.toString()
				);
			}
			filteredEvents && events.push(filteredEvents);
		});
		setReservedEvents(events);
	};

	useEffect(() => {
		if (zipCode) {
			getEvents(zipCode);
			dispatch(setCurrentZip(zipCode));
		}
	}, [zipCode, dispatch]);

	const getEvents = async (zip: string): Promise<void> => {
		if (zip) {
			setLoading(true);
			try {
				const resp = await axios.get(API_URL.EVENTS_LIST, {
					params: { zip_code: zip },
				});

				const {
					data: { agencies },
				} = resp;
				setAgencyData(agencies);
				setAgencyResponse(true);
				setLoading(false);
			} catch (err) {
				console.error(err);
				setLoading(false);
			}
		}
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>();

	const onSubmit = (data: Partial<FormData>): void => {
		if (data) {
			const { zip_code } = data;
			setZipCode(zip_code || null);
		}
	};

	const EventList: React.FC<EventListProps> = props => {
		const filterEvents = (
			eventList: Record<string, any>
		): Record<string, any> => {
			if (props.filter === "today") {
				const todayDate = moment(new Date()).format("YYYY-MM-DD");
				return eventList[todayDate]
					? { [todayDate]: eventList[todayDate] }
					: {};
			}
			if (props.filter === "week") {
				const todayDate = moment(new Date()).format("YYYY-MM-DD");
				const thisWeek = moment()
					.day(1 + 7)
					.format("YYYY-MM-DD");
				const entries = Object.entries(eventList);
				const weekevents = entries.reduce(
					(acc: Record<string, any>, item) => {
						if (item[0] > todayDate && item[0] <= thisWeek) {
							acc[item[0]] = item[1];
						}
						return acc;
					},
					{}
				);
				return weekevents;
			}
			return eventList;
		};

		if (agencyResponse) {
			let agencyDataSorted = EventHandler(agencyData as any[]);
			agencyDataSorted = filterEvents(agencyDataSorted);
			return (
				<EventListComponent
					targetUrl={RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}
					events={agencyDataSorted}
					zipCode={zipCode || ""}
					showHeader={false}
					reservedEvents={reservedEvents as any}
				/>
			);
		}
		return <SpinnerComponent variant="small" />;
	};

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
					</div>
					<div className="foodbank-and-events">
						<LocalFoodBankComponent zipCode={zipCode || ""} />
						<UsersRegistrations
							reservedEvents={reservedEvents as any}
						/>
						<EventNearByComponent EventList={EventList} />
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomeContainer;

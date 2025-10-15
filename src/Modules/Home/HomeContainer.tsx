import React, { useState, useEffect } from "react";

/**
 * HomeContainer - Main container component for the Home module
 *
 * This component has been migrated from JavaScript to TypeScript and from Bootstrap to Tailwind CSS.
 * It provides the main landing page functionality including:
 * - Zip code search form for finding local events and food banks
 * - Display of user's event reservations
 * - Integration with local food bank and event services
 *
 * Features:
 * - Responsive design using Tailwind CSS
 * - Type-safe implementation with TypeScript
 * - Form handling with react-hook-form
 * - Redux integration for state management
 * - API integration for events and food bank data
 */
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import LoadingSpinner from "../General/LoadingSpinner";
import LocalFoodBankComponent from "../Home/LocalFoodBankComponent";
import UsersRegistrations from "../Home/UsersRegistrations";
import EventNearByComponent from "../Home/EventNearByComponent";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import { setCurrentZip } from "../../Store/Search/searchSlice";
import axios from "axios";
import EventListComponent from "../Events/EventListComponent";
import { EventHandler, HomeEventFormat } from "../../Utils/EventHandler";
import moment from "moment";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
	HomeContainerProps,
	ZipCodeFormData,
	FilteredEvents,
	ReservedEvent,
	UserRegistration,
	EventsListApiResponse,
	UserReservationsApiResponse,
	EventListProps,
	HomeEventFormatData,
} from "./types/home.types";

const HomeContainer: React.FC<HomeContainerProps> = () => {
	const [agencyResponse, setAgencyResponse] = useState<boolean>(false);
	const [agencyData, setAgencyData] = useState<any>({});
	const [reservedEvents, setReservedEvents] = useState<ReservedEvent[]>([]);
	const [zipCode, setZipCode] = useState<string | null>(
		localStorage.getItem("search_zip")
	);
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
			const usersRegData: UserReservationsApiResponse = await axios.get(
				CREATE_RESERVATION,
				{
					headers: { Authorization: `Bearer ${userToken}` },
				}
			);
			getEventByDateId(usersRegData.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getEventByDateId = async (
		userRegData: UserRegistration[]
	): Promise<void> => {
		const userRegEvents: Promise<any>[] = [];
		const { EVENT_URL } = API_URL;
		userRegData.forEach((userReg: UserRegistration) => {
			userRegEvents.push(
				axios.get(`${EVENT_URL}?event_date_id=${userReg.event_date_id}`)
			);
		});
		const regEvents = await axios.all(userRegEvents);
		const events: ReservedEvent[] = [];
		regEvents.forEach((event: any, index: number) => {
			let filteredEvents: HomeEventFormatData | null = null;
			if (event.data?.events[0]) {
				filteredEvents = HomeEventFormat(
					event.data.events[0],
					userRegData[index].event_date_id
				);
			}
			if (filteredEvents) {
				// Convert HomeEventFormatData to ReservedEvent
				const reservedEvent: ReservedEvent = {
					...filteredEvents,
					name: filteredEvents.eventName, // Add the missing name property
					event_date_id: userRegData[index].event_date_id,
					acceptReservations: filteredEvents.acceptReservations,
					acceptInterest: filteredEvents.acceptInterest,
					acceptWalkin: filteredEvents.acceptWalkin,
					eventService: filteredEvents.eventService || "", // Provide default value for eventService
				};
				events.push(reservedEvent);
			}
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
				const resp: { data: EventsListApiResponse } = await axios.get(
					API_URL.EVENTS_LIST,
					{
						params: { zip_code: zip },
					}
				);

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
	} = useForm<ZipCodeFormData>();

	const onSubmit = (data: ZipCodeFormData): void => {
		if (data) {
			const { zip_code } = data;
			setZipCode(zip_code);
		}
	};

	const EventList: React.FC<EventListProps> = props => {
		const filterEvents = (eventList: FilteredEvents): FilteredEvents => {
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
					(acc: FilteredEvents, item: [string, any]) => {
						if (item[0] > todayDate && item[0] <= thisWeek) {
							acc[item[0]] = item[1];
						}
						return acc;
					},
					{} as FilteredEvents
				);
				return weekevents;
			}
			return eventList;
		};

		if (agencyResponse) {
			let agencyDataSorted: FilteredEvents = EventHandler(
				agencyData
			) as FilteredEvents;
			agencyDataSorted = filterEvents(agencyDataSorted);
			return (
				<EventListComponent
					targetUrl={RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}
					events={agencyDataSorted}
					zipCode={zipCode || ""}
					showHeader={false}
					reservedEvents={reservedEvents}
				/>
			);
		}
		return <LoadingSpinner size="small" />;
	};

	return (
		<div>
			<section className="bg-[#F2F0F4]">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-[150px] pb-16 sm:pb-24 lg:pb-[150px]">
					<div className="text-left">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
								<div className="space-y-2 w-full sm:w-auto sm:flex-1">
									<Label htmlFor="zip_code">Zip Code</Label>
									<Input
										type="text"
										id="zip_code"
										{...register("zip_code", {
											required: "Zip code is required",
										})}
										placeholder="Enter zip code"
										className="w-full"
									/>
									{errors.zip_code && (
										<p className="text-red-500 text-sm">
											{errors.zip_code.message}
										</p>
									)}
								</div>
								<Button
									type="submit"
									className="px-4 py-2 w-full sm:w-auto"
									disabled={loading}
								>
									{loading ? (
										<div className="flex items-center justify-center space-x-2">
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											<span>Searching...</span>
										</div>
									) : (
										"Search"
									)}
								</Button>
							</div>
						</form>
						{loading && (
							<div className="pt-4">
								<LoadingSpinner size="medium" />
							</div>
						)}
					</div>
					<div className="space-y-8 px-4 sm:px-8 lg:px-[105px]">
						<LocalFoodBankComponent zipCode={zipCode} />
						<UsersRegistrations reservedEvents={reservedEvents} />
						<EventNearByComponent EventList={EventList} />
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomeContainer;

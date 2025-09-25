import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SpinnerComponent from "../General/SpinnerComponent";
import axios from "axios";
import { API_URL } from "../../Utils/Urls";
import { EventHandler } from "../../Utils/EventHandler";
import EventListComponent from "./EventListComponent";

interface Agency {
	id: string;
	nickname: string;
	name?: string;
	description?: string;
	[key: string]: any;
}

interface Event {
	id: string;
	startTime: string;
	endTime: string;
	date: string;
	eventAddress: string;
	eventCity: string;
	eventState: string;
	eventZip: string;
	phoneNumber: string;
	agencyName: string;
	eventName: string;
	eventService: string;
	acceptReservations: boolean;
	acceptInterest: boolean;
	acceptWalkin: boolean;
	eventDetails: string;
	exceptionNote?: string;
	latitude?: number;
	longitude?: number;
	[key: string]: any;
}

interface AgencyEventListContainerProps {
	[key: string]: any;
}

const AgencyEventListContainer: React.FC<
	AgencyEventListContainerProps
> = props => {
	const { agencyId } = useParams<{ agencyId: string }>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setErrors] = useState<boolean>(false);
	const [targetAgency, setTargetAgency] = useState<Agency>({} as Agency);
	const [agencyEvents, setAgencyEvents] = useState<Event[]>([]);

	useEffect(() => {
		if (agencyId) {
			getAgencyEvents(agencyId);
		}
	}, [agencyId]);

	const getAgencyEvents = async (id: string): Promise<void> => {
		setLoading(true);
		try {
			const resp = await axios.get(`${API_URL.AGENCY_EVENTS}/${id}`);
			const {
				data: { agency },
			} = resp;
			setTargetAgency(agency);
			setAgencyEvents(EventHandler([agency]) as Event[]);
			setLoading(false);
		} catch (e) {
			setErrors(true);
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 mt-24">
			{loading && <SpinnerComponent />}
			{error && (
				<h1 className="text-2xl font-bold text-red-600">
					Something went wrong
				</h1>
			)}
			{!loading && targetAgency && (
				<div className="pb-4">
					<h1 className="text-3xl font-bold text-gray-900">
						Events for {targetAgency.nickname}
					</h1>
				</div>
			)}
			{!loading && agencyEvents && (
				<div className="bg-gray-100">
					<div className="container mx-auto px-4 pt-24 pb-24">
						<EventListComponent
							events={
								agencyEvents as unknown as Record<
									string,
									Event[]
								>
							}
							showHeader={false}
							zipCode=""
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default AgencyEventListContainer;

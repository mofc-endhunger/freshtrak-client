import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import SpinnerComponent from "../General/SpinnerComponent";

import axios from "axios";
import { API_URL } from "../../Utils/Urls";
import { EventHandler } from "../../Utils/EventHandler";
import EventListComponent from "./EventListComponent";

interface Agency {
	id: number;
	nickname: string;
	name: string;
	events: any[];
	phone: string;
	estimated_distance: number;
	[key: string]: any;
}

const AgencyEventListContainer: React.FC = () => {
	const { agencyId } = useParams<{ agencyId?: string }>();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setErrors] = useState<boolean>(false);
	const [targetAgency, setTargetAgency] = useState<Agency | {}>({});
	const [agencyEvents, setAgencyEvents] = useState<{ [key: string]: any[] }>(
		{}
	);

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
			setAgencyEvents(EventHandler([agency]));
			setLoading(false);
		} catch (e) {
			setErrors(true);
		}
	};

	return (
		<div className="container mt-100">
			{loading && <SpinnerComponent />}
			{error && <h1>Something went wrong</h1>}
			{!loading && targetAgency && "nickname" in targetAgency && (
				<div className="pb-4">
					<h1>Events for {(targetAgency as Agency).nickname}</h1>
				</div>
			)}
			{!loading && agencyEvents && (
				<div className="gray-bg">
					<div className="container pt-150 pb-150">
						<EventListComponent
							events={agencyEvents}
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

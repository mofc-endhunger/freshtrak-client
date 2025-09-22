import React, { Fragment } from "react";
import EventListComponent from "./EventListComponent";
import { EventHandler } from "../../Utils/EventHandler";
import {
	filterEventsByAvailability,
	filterEventsByReservations,
} from "../../Utils/availabilityFilter";

interface Agency {
	id: string;
	name: string;
	nickname: string;
	events: any[];
	[key: string]: any;
}

interface EventListContainerProps {
	zipCode: string;
	agencyData: Agency[];
	availabilityFilter?: string;
	reservationsFilter?: boolean;
}

const EventListContainer: React.FC<EventListContainerProps> = ({
	zipCode,
	agencyData,
	availabilityFilter = "All",
	reservationsFilter = false,
}) => {
	const EventList: React.FC = () => {
		const agencyDataSorted = EventHandler(agencyData);
		const availabilityFilteredEvents = filterEventsByAvailability(
			agencyDataSorted,
			availabilityFilter
		);
		const filteredEvents = filterEventsByReservations(
			availabilityFilteredEvents,
			reservationsFilter
		);
		return (
			<EventListComponent
				events={filteredEvents as Record<string, any[]>}
				zipCode={zipCode}
			/>
		);
	};

	return (
		<Fragment>
			<EventList />
		</Fragment>
	);
};

export default EventListContainer;

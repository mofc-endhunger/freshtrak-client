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
	lastItemRef?: (node: HTMLElement | null) => void;
	loadingMore?: boolean;
	hasMore?: boolean;
}

const EventListContainer: React.FC<EventListContainerProps> = ({
	zipCode,
	agencyData,
	availabilityFilter = "next_7_days",
	reservationsFilter = false,
	lastItemRef,
	loadingMore = false,
	hasMore = false,
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
				lastItemRef={lastItemRef}
				loadingMore={loadingMore}
				hasMore={hasMore}
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

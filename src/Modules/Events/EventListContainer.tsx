import React, { Fragment } from "react";
import EventListComponent from "./EventListComponent";
import { EventHandler } from "../../Utils/EventHandler";

interface Agency {
	events: any[];
	phone: string;
	name: string;
	estimated_distance: number;
}

interface EventListContainerProps {
	zipCode: string;
	agencyData: Agency[];
}

const EventListContainer: React.FC<EventListContainerProps> = ({
	zipCode,
	agencyData,
}) => {
	const EventList: React.FC = () => {
		const agencyDataSorted = EventHandler(agencyData);
		return (
			<EventListComponent events={agencyDataSorted} zipCode={zipCode} />
		);
	};

	return (
		<Fragment>
			<EventList />
		</Fragment>
	);
};

export default EventListContainer;

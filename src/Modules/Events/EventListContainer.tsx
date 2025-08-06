import React, { Fragment } from "react";
import EventListComponent from "./EventListComponent";
import { EventHandler } from "../../Utils/EventHandler";

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
}

const EventListContainer: React.FC<EventListContainerProps> = ({
	zipCode,
	agencyData,
}) => {
	const EventList: React.FC = () => {
		const agencyDataSorted = EventHandler(agencyData);
		return (
			<EventListComponent
				events={agencyDataSorted as Record<string, any[]>}
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

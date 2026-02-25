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
	visibleEventCount?: number;
	availabilityFilter?: string;
	reservationsFilter?: boolean;
	distance?: number;
	lastItemRef?: (node: HTMLElement | null) => void;
	loadingMore?: boolean;
	onHasMoreChange?: (hasMore: boolean) => void;
}

const EventListContainer: React.FC<EventListContainerProps> = ({
	zipCode,
	agencyData,
	visibleEventCount = 30,
	availabilityFilter = "next_7_days",
	reservationsFilter = false,
	distance = 10,
	lastItemRef,
	loadingMore = false,
	onHasMoreChange,
}) => {
	const EventList: React.FC = () => {
		// ALWAYS process ALL agencies to get ALL events
		// This ensures filters work correctly and we have complete data
		const allEvents = EventHandler(agencyData);
		
		// Apply availability filter
		const availabilityFilteredEvents = filterEventsByAvailability(
			allEvents,
			availabilityFilter
		);
		
		// Apply reservations filter
		const filteredEvents = filterEventsByReservations(
			availabilityFilteredEvents,
			reservationsFilter
		) as Record<string, any[]>;

		// Progressively render events by date
		// Sort dates chronologically
		const sortedDates = Object.keys(filteredEvents).sort((a, b) => {
			const dateA = new Date(a.replace(/\//g, '-'));
			const dateB = new Date(b.replace(/\//g, '-'));
			return dateA.getTime() - dateB.getTime();
		});

		// Count total events and determine which dates to show
		let eventCount = 0;
		const visibleDates: string[] = [];
		
		for (const date of sortedDates) {
			const eventsForDate = filteredEvents[date];
			if (eventCount + eventsForDate.length <= visibleEventCount) {
				// Show all events for this date
				visibleDates.push(date);
				eventCount += eventsForDate.length;
			} else {
				// Partially show this date if we have room
				const remainingSlots = visibleEventCount - eventCount;
				if (remainingSlots > 0) {
					visibleDates.push(date);
				}
				break;
			}
		}

		// Build the visible events object
		const visibleEvents: Record<string, any[]> = {};
		let currentEventCount = 0;
		
		for (const date of visibleDates) {
			const eventsForDate = filteredEvents[date];
			if (currentEventCount + eventsForDate.length <= visibleEventCount) {
				// Show all events for this date
				visibleEvents[date] = eventsForDate;
				currentEventCount += eventsForDate.length;
			} else {
				// Show partial events for this date
				const remainingSlots = visibleEventCount - currentEventCount;
				visibleEvents[date] = eventsForDate.slice(0, remainingSlots);
				break;
			}
		}

		// Calculate if there are more events to show
		const totalEventCount = sortedDates.reduce(
			(sum, date) => sum + filteredEvents[date].length,
			0
		);
		const hasMore = currentEventCount < totalEventCount;

		// Notify parent component about hasMore state change
		React.useEffect(() => {
			if (onHasMoreChange) {
				onHasMoreChange(hasMore);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [hasMore]);

		return (
			<EventListComponent
				events={visibleEvents}
				zipCode={zipCode}
				distance={distance}
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

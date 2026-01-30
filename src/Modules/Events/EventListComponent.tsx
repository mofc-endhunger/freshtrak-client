/**
 * EventList Component
 */
import React from "react";
import EventCardComponent from "./EventCardComponent";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import "../../Assets/scss/main.scss";
import localization from "../Localization/LocalizationComponent";

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
	agencyLatitude?: number;
	agencyLongitude?: number;
	[key: string]: any;
}

interface ReservedEvent {
	id: string;
	[key: string]: any;
}

interface EventListComponentProps {
	events: Record<string, Event[]>;
	showHeader?: boolean;
	zipCode: string;
	targetUrl?: string;
	registrationView?: boolean;
	reservedEvents?: ReservedEvent[];
	lastItemRef?: (node: HTMLElement | null) => void;
	loadingMore?: boolean;
	hasMore?: boolean;
}

const EventListComponent: React.FC<EventListComponentProps> = ({
	events,
	showHeader = true,
	zipCode,
	targetUrl,
	registrationView,
	reservedEvents,
	lastItemRef,
	loadingMore = false,
	hasMore = false,
}) => {
	const isRegisteredEvent = (event: Event): boolean => {
		const found =
			reservedEvents &&
			reservedEvents.find(reservedEvent => {
				return reservedEvent.id === event.id;
			});
		return !!found;
	};

	return (
		<div className="space-y-8" aria-live="polite">
			{showHeader && (
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 sm:text-left">
						{localization.resource_zip_code_events} {zipCode}
					</h2>
					{/* Out of scope */}
					{/* <div className="col-lg-4 col-xl-4 d-none-xs d-none-sm">
          <div className="switch-view d-flex justify-content-center">
            <input id="toggle-on" className="toggle toggle-left" name="toggle" value="false" type="radio" checked onChange={onChangeHandler} />
            <label htmlFor="toggle-on" className="btn-toggle">List</label>
            <input id="toggle-off" className="toggle toggle-right" name="toggle" value="true" type="radio" onChange={onChangeHandler}/>
            <label htmlFor="toggle-off" className="btn-toggle">Map</label>
          </div>
        </div>
        <div className="col-lg-4 col-xl-4">
          <div className="form-group">
            <label>Sort by</label>
            <select className="form-control">
                <option>Recommended</option>
            </select>
          </div>
        </div> */}
				</div>
			)}
			{Object.keys(events).length === 0 && (
				<h3 className="text-xl font-semibold text-gray-700">
					{localization.no_events_scheduled}
				</h3>
			)}
			{Object.keys(events).length > 0 &&
				(() => {
					const dateEntries = Object.entries(events);
					const lastDateIndex = dateEntries.length - 1;

					return dateEntries.map(([date, event], dateIndex) => {
						const isLastDateGroup = dateIndex === lastDateIndex;
						const lastEventIndex = event.length - 1;

						return (
							<div key={date} className="space-y-4">
								<div className="mb-4">
									<h3 className="text-lg font-semibold text-gray-800 mb-3">
										{formatDateDayAndDate(date)}
									</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{event &&
										event.map((ev, eventIndex) => {
											const isLastItem =
												isLastDateGroup &&
												eventIndex === lastEventIndex;

											return (
												<div
													key={ev.id}
													ref={
														isLastItem
															? lastItemRef
															: null
													}
												>
													<EventCardComponent
														event={ev}
														targetUrl={targetUrl}
														registrationView={
															registrationView
														}
														alreadyRegistered={isRegisteredEvent(
															ev
														)}
														agencyLatitude={
															ev.agencyLatitude
														}
														agencyLongitude={
															ev.agencyLongitude
														}
													/>
												</div>
											);
										})}
								</div>
							</div>
						);
					});
				})()}

			{/* Loading indicator for infinite scroll */}
			{loadingMore && (
				<div className="flex justify-center py-6">
					<div className="flex items-center space-x-2 text-gray-600">
						<div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
						<span>{localization.loading_more_events || "Loading more events..."}</span>
					</div>
				</div>
			)}

			{/* End of results indicator */}
			{!hasMore && Object.keys(events).length > 0 && !loadingMore && (
				<div className="text-center py-4 text-gray-500">
					<span>{localization.no_more_events || "No more events to load"}</span>
				</div>
			)}
		</div>
	);
};

export default EventListComponent;

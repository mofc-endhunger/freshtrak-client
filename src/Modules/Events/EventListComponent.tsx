/**
 * EventList Component
 */
import React, { useState, useEffect } from "react";
import EventCardComponent from "./EventCardComponent";
import ViewToggle, { ViewMode } from "./ViewToggle";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import "../../Assets/scss/main.scss";
import localization from "../Localization/LocalizationComponent";

const VIEW_MODE_STORAGE_KEY = "freshtrak_event_view_mode";

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
}

const EventListComponent: React.FC<EventListComponentProps> = ({
	events,
	showHeader = true,
	zipCode,
	targetUrl,
	registrationView,
	reservedEvents,
}) => {
	const [viewMode, setViewMode] = useState<ViewMode>(() => {
		const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
		return stored === "list" || stored === "grid" ? stored : "grid";
	});

	useEffect(() => {
		localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
	}, [viewMode]);

	const isRegisteredEvent = (event: Event): boolean => {
		const found =
			reservedEvents &&
			reservedEvents.find((reservedEvent) => {
				return reservedEvent.id === event.id;
			});
		return !!found;
	};

	return (
		<div className="space-y-8" aria-live="polite">
			{showHeader && (
				<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h2 className="text-2xl font-bold text-gray-900">
						{localization.resource_zip_code_events} {zipCode}
					</h2>
					<ViewToggle
						viewMode={viewMode}
						onViewModeChange={setViewMode}
					/>
				</div>
			)}
			{Object.keys(events).length === 0 && (
				<h3 className="text-xl font-semibold text-gray-700">
					{localization.no_events_scheduled}
				</h3>
			)}
			{Object.keys(events).length > 0 &&
				Object.entries(events).map(([date, event]) => (
					<div key={date} className="space-y-4">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-3">
								{formatDateDayAndDate(date)}
							</h3>
						</div>
						<div
							className={
								viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
									: "flex flex-col gap-4"
							}
						>
							{event &&
								event.map((ev) => (
									<EventCardComponent
										key={ev.id}
										event={ev}
										targetUrl={targetUrl}
										registrationView={registrationView}
										alreadyRegistered={isRegisteredEvent(
											ev
										)}
										variant={
											viewMode === "list"
												? "list"
												: "tile"
										}
										agencyLatitude={ev.agencyLatitude}
										agencyLongitude={ev.agencyLongitude}
									/>
								))}
						</div>
					</div>
				))}
		</div>
	);
};

export default EventListComponent;

/**
 * EventList Component
 */
import React from "react";
import EventCardComponent from "./EventCardComponent";
import { formatDateDayAndDate } from "../../Utils/DateFormat";
import "../../Assets/scss/main.scss";
import localization from "../Localization/LocalizationComponent";

const EventListComponent = props => {
	const {
		events,
		showHeader = true,
		zipCode,
		targetUrl,
		registrationView,
		reservedEvents,
	} = props;
	const isRegisteredEvent = event => {
		const found =
			reservedEvents &&
			reservedEvents.find(reservedEvent => {
				return reservedEvent.id === event.id;
			});
		return !!found;
	};
	return (
		<div className="search-results-list" aria-live="polite">
			{showHeader && (
				<div className="row m-0">
					<h2 className="font-weight-bold mobile-text-left">
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
				<h3>{localization.no_events_scheduled}</h3>
			)}
			{Object.keys(events).length > 0 &&
				Object.entries(events).map(([date, event]) => (
					<div key={date} className="row mt-5">
						<div className="col-md-12">
							<div className="day-view">
								<div className="row">
									<div className="col-md-12">
										<span className="day-view-title">
											{formatDateDayAndDate(date)}
										</span>
									</div>
								</div>
								<div className="row mt-2">
									{event &&
										event.map(ev => (
											<EventCardComponent
												key={ev.id}
												event={ev}
												targetUrl={targetUrl}
												registrationView={
													registrationView
												}
												alreadyRegistered={isRegisteredEvent(
													ev
												)}
												// Fallback: pass agency latitude/longitude if present
												agencyLatitude={
													ev.agencyLatitude
												}
												agencyLongitude={
													ev.agencyLongitude
												}
											/>
										))}
								</div>
							</div>
						</div>
					</div>
				))}
		</div>
	);
};

export default EventListComponent;

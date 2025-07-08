import React, { Fragment } from "react";
import TagManager from "react-gtm-module";

import RegistrationHeaderComponent from "./RegistrationHeaderComponent";
import EventCardComponent from "../Events/EventCardComponent";
import BackButtonComponent from "../General/BackButtonComponent";
import { getItemLocalStorage } from "../../Utils/Util";
import localization from "../Localization/LocalizationComponent";

interface EventData {
	id: number;
	eventId: number;
	acceptReservations: boolean;
	acceptInterest: boolean;
	acceptWalkin: boolean;
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
	exceptionNote: string;
	eventService: string;
	estimated_distance?: number;
	estimatedDistance?: number;
	eventDetails: string;
	seniorAge: number;
	adultAge: number;
}

interface RegistrationTextInfoComponentProps {
	event: EventData;
	onRegisterNow: (value: boolean) => void;
}

const RegistrationTextInfoComponent: React.FC<
	RegistrationTextInfoComponentProps
> = ({ event, onRegisterNow }) => {
	const isLoggedIn = JSON.parse(getItemLocalStorage("isLoggedIn") || "false");

	const clickedRegisterNow = (): void => {
		onRegisterNow(true);
		TagManager.dataLayer({
			dataLayer: {
				event: "modal-open",
			},
		});
	};

	return (
		<Fragment>
			<BackButtonComponent />
			{!isLoggedIn && <RegistrationHeaderComponent event={event} />}
			{event && (
				<div className="col-6">
					<div className="day-view">
						<EventCardComponent
							key={event.id}
							event={event}
							registrationView={true}
						/>
					</div>
				</div>
			)}

			<div className="button-wrap mt-4">
				<button
					type="submit"
					className="btn custom-button"
					data-testid="continue button"
					onClick={clickedRegisterNow}
				>
					{localization.register}
				</button>
			</div>
		</Fragment>
	);
};

export default RegistrationTextInfoComponent;

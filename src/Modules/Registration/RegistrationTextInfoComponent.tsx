import * as React from "react";
import { Fragment } from "react";
import TagManager from "react-gtm-module";

import RegistrationHeaderComponent from "./RegistrationHeaderComponent";
import EventCardComponent from "../Events/EventCardComponent";
import BackButtonComponent from "../General/BackButtonComponent";
import { getItemLocalStorage } from "../../Utils/Util";
import localization from "../Localization/LocalizationComponent";
import { Event } from "./types/registration.types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

interface RegistrationTextInfoComponentProps {
	event: Event;
	onRegisterNow: (value: boolean) => void;
}

const RegistrationTextInfoComponent: React.FC<
	RegistrationTextInfoComponentProps
> = ({ event, onRegisterNow }) => {
	const isLoggedInValue = getItemLocalStorage("isLoggedIn");
	const isLoggedIn = isLoggedInValue ? JSON.parse(isLoggedInValue) : false;
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
				<Card className="w-full md:w-1/2 border-none shadow-none p-0">
					<CardContent className="py-6 px-0">
						<div className="day-view">
							<EventCardComponent
								key={event.id}
								event={event as any}
								registrationView={true}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex mt-4">
				<Button
					type="submit"
					variant="custom"
					data-testid="continue button"
					onClick={clickedRegisterNow}
					className="cursor-pointer px-2 bg-highlight text-white min-h-12 uppercase"
				>
					{localization.register}
				</Button>
			</div>
		</Fragment>
	);
};

export default RegistrationTextInfoComponent;

import * as React from "react";
import { Fragment } from "react";
import RegistrationTextComponent from "./RegistrationTextComponent";
import localization from "../Localization/LocalizationComponent";
import { Event } from "./types/registration.types";

interface RegistrationHeaderComponentProps {
	event: Event;
}

const RegistrationHeaderComponent: React.FC<
	RegistrationHeaderComponentProps
> = ({ event }) => {
	return (
		<Fragment>
			<div className="w-full">
				<div className="w-full">
					<div className="text-left text-text-primary">
						<h1 className="text-4xl font-bold mt-5 mb-5 md:text-5xl lg:text-6xl">
							{localization.register}
							<br />
							{localization.save_time}
							<br />
						</h1>
					</div>
				</div>
			</div>
			<RegistrationTextComponent event={event} />
		</Fragment>
	);
};

export default RegistrationHeaderComponent;

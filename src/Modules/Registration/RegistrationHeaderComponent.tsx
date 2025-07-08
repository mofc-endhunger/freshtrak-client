import React, { Fragment } from "react";
import "../../Assets/scss/main.scss";
import RegistrationTextComponent from "./RegistrationTextComponent";
import localization from "../Localization/LocalizationComponent";
import { Event } from "../../types";

interface RegistrationHeaderComponentProps {
	event: Event;
}

const RegistrationHeaderComponent: React.FC<
	RegistrationHeaderComponentProps
> = ({ event }) => {
	return (
		<Fragment>
			<div className="row">
				<div className="col-12">
					<div className="title-wrap">
						<h1 className="big-title mt-5 mb-5 mobile-mb">
							{localization.register}
							<br />
							{localization.save_time}
							<br />
							{localization.stay_safe}
						</h1>
					</div>
				</div>
			</div>
			<RegistrationTextComponent event={event} />
		</Fragment>
	);
};

export default RegistrationHeaderComponent;

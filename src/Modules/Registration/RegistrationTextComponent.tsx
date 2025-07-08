import React, { useState, useEffect } from "react";
import "../../Assets/scss/main.scss";
import localization from "../Localization/LocalizationComponent";
import { Event } from "../../types";

interface RegistrationTextComponentProps {
	event: Event;
}

const RegistrationTextComponent: React.FC<RegistrationTextComponentProps> = ({
	event,
}) => {
	const [isRegRequired, setRegRequired] = useState<string>("");
	const OPTIONAL = "optional";
	const REQUIRED = "required";

	useEffect(() => {
		if (event && event.acceptWalkin) {
			setRegRequired(OPTIONAL);
		} else {
			setRegRequired(REQUIRED);
		}
	}, [event]);

	return (
		<div>
			<div className="content-wrapper page-info-wrap">
				<p>
					<span className="font-weight-bold">
						{localization.advance_registration} {isRegRequired}.
					</span>{" "}
					{localization.by_registration}
				</p>
			</div>
		</div>
	);
};

export default RegistrationTextComponent;

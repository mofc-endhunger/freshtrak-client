import * as React from "react";
import { useState, useEffect } from "react";
import localization from "../Localization/LocalizationComponent";
import { Event } from "./types/registration.types";

interface RegistrationTextComponentProps {
	event: Event;
}

const RegistrationTextComponent: React.FC<RegistrationTextComponentProps> = ({
	event,
}) => {
	const [isRegRequired, setRegRequired] = useState<string>();
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
			<div className="max-w-4xl mx-auto px-4 py-6 text-center">
				<p className="text-lg">
					<span className="font-bold">
						{localization.advance_registration} {isRegRequired}.
					</span>{" "}
					{localization.by_registration}
				</p>
			</div>
		</div>
	);
};

export default RegistrationTextComponent;

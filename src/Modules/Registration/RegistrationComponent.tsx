// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// Component imports
import { HouseholdForm } from "../../components/shared";

// Type imports
import { RegistrationComponentProps } from "./types/registration.types";
import localization from "../Localization/LocalizationComponent";

const RegistrationComponent: React.FC<RegistrationComponentProps> = ({
	user,
	onRegister,
	event,
	disabled,
}) => {
	const navigate = useNavigate();

	return (
		<HouseholdForm
			mode="registration"
			onSubmit={onRegister}
			onCancel={() => {
				navigate(-1);
			}}
			prefilledData={user}
			event={event}
			disabled={disabled}
			title={localization.title_event_registration}
			subtitle={localization.description_complete_registration}
			submitButtonText={localization.button_register}
			cancelButtonText={localization.button_cancel}
		/>
	);
};

export default RegistrationComponent;

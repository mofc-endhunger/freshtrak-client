// React imports
import React from "react";
import { useNavigate } from "react-router-dom";

// Component imports
import { HouseholdForm } from "../../components/shared";

// Type imports
import { RegistrationComponentProps } from "./types/registration.types";

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
			title="Event Registration"
			subtitle="Complete your registration for the upcoming event"
			submitButtonText="Register"
			cancelButtonText="Cancel"
		/>
	);
};

export default RegistrationComponent;

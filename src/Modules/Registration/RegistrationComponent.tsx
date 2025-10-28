// React imports
import React from "react";

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
		return (
		<HouseholdForm
			mode="registration"
			onSubmit={onRegister}
			onCancel={() => {
				// Handle cancel - could navigate back or show confirmation
				console.log("Registration cancelled");
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

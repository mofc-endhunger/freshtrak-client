import React from "react";
const GuestLoginButtonComponent = ({ onGuestLogin, disabled }) => {
	return (
		<button
			type="submit"
			className="btn primary-button ml-1 flex-grow-1"
			onClick={onGuestLogin}
			disabled={disabled}
		>
			{" "}
			Continue AS Guest{" "}
		</button>
	);
};
export default GuestLoginButtonComponent;

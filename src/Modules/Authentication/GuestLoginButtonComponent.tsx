import React from "react";

interface GuestLoginButtonComponentProps {
	onGuestLogin: () => void;
}

const GuestLoginButtonComponent: React.FC<GuestLoginButtonComponentProps> = ({
	onGuestLogin,
}) => {
	return (
		<button
			type="submit"
			className="btn primary-button ml-1 flex-grow-1"
			onClick={onGuestLogin}
		>
			Continue AS Guest
		</button>
	);
};

export default GuestLoginButtonComponent;

import React from "react";
import Modal from "react-bootstrap/Modal";
import TagManager from "react-gtm-module";
import GuestLoginButtonComponent from "./GuestLoginButtonComponent";
import FacebookLoginComponent from "./FacebookLoginComponent";

interface AuthenticationModalProps {
	show: boolean;
	setshow: (show: boolean) => void;
	onLogin: (response?: any) => void;
}

const AuthenticationModalComponent: React.FC<AuthenticationModalProps> = ({
	show,
	setshow,
	onLogin,
}) => {
	const handleClose = (): void => setshow(false);

	const onGuestLogin = (): void => {
		localStorage.setItem("isLoggedIn", "false");
		onLogin();
		TagManager.dataLayer({
			dataLayer: {
				event: "guest-login",
			},
		});
	};

	const onFbLogin = (response: any): void => {
		localStorage.setItem("isLoggedIn", "true");
		onLogin(response);
		TagManager.dataLayer({
			dataLayer: {
				event: "facebook-login",
			},
		});
	};

	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title className={"w-100 text-center"}>Login</Modal.Title>
			</Modal.Header>
			<Modal.Footer>
				<FacebookLoginComponent onFbLogin={onFbLogin} />
				<GuestLoginButtonComponent onGuestLogin={onGuestLogin} />
			</Modal.Footer>
		</Modal>
	);
};

export default AuthenticationModalComponent;

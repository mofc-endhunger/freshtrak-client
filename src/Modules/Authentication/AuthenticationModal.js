import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import TagManager from "react-gtm-module";
import GuestLoginButtonComponent from "./GuestLoginButtonComponent";
import LoadingSpinner from "../General/LoadingSpinner";

const AuthenticationModalComponent = ({ show, setshow, onLogin }) => {
	const [isLoading, setIsLoading] = useState(false);
	const handleClose = () => setshow(false);
	const onGuestLogin = async () => {
		setIsLoading(true);
		try {
			localStorage.setItem("isLoggedIn", false);
			await onLogin();
			TagManager.dataLayer({
				dataLayer: {
					event: "guest-login",
				},
			});
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title className={"w-100 text-center"}>Login</Modal.Title>
			</Modal.Header>
			<Modal.Footer>
				{isLoading ? (
					<div className="w-100 d-flex justify-content-center py-3">
						<LoadingSpinner size="medium" />
					</div>
				) : (
					<GuestLoginButtonComponent
						onGuestLogin={onGuestLogin}
						disabled={isLoading}
					/>
				)}
			</Modal.Footer>
		</Modal>
	);
};

export default AuthenticationModalComponent;

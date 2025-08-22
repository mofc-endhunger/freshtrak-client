import React, { useState } from "react";
import TagManager from "react-gtm-module";
import GuestLoginButtonComponent from "./GuestLoginButtonComponent";
import LoadingSpinner from "../General/LoadingSpinner";
import {
	AuthenticationModalProps,
	GTMEvent,
} from "./types/authentication.types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";

/**
 * AuthenticationModal - Main authentication interface component
 *
 * This component provides a modal-based authentication interface with guest login
 * functionality. It manages loading states, handles guest login flow, and integrates
 * with Google Tag Manager for analytics tracking.
 *
 * @component
 * @param {AuthenticationModalProps} props - Component props
 * @returns {JSX.Element} The authentication modal with guest login functionality
 *
 * @example
 * ```tsx
 * <AuthenticationModal
 *   show={isModalOpen}
 *   setshow={setIsModalOpen}
 *   onLogin={handleLogin}
 * />
 * ```
 */
const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
	show,
	setshow,
	onLogin,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	/**
	 * Handles guest login process
	 */
	const onGuestLogin = async (): Promise<void> => {
		setIsLoading(true);
		try {
			localStorage.setItem("isLoggedIn", "false");

			// Handle both async and sync onLogin functions
			const result = onLogin();
			if (result instanceof Promise) {
				await result;
			}

			// Track guest login event with Google Tag Manager
			const gtmEvent: GTMEvent = {
				event: "guest-login",
			};

			TagManager.dataLayer({
				dataLayer: gtmEvent,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			key={show ? "open" : "closed"}
			open={show}
			onOpenChange={setshow}
		>
			<DialogContent className="sm:max-w-md bg-highlight border-none text-white">
				<DialogHeader className=" border-b border-white">
					<DialogTitle className="text-center w-full py-2">
						Login
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>

				<div className="p-6">
					{isLoading ? (
						<div className="w-full flex justify-center py-3">
							<LoadingSpinner size="medium" />
						</div>
					) : (
						<GuestLoginButtonComponent
							onGuestLogin={onGuestLogin}
							disabled={isLoading}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AuthenticationModal;

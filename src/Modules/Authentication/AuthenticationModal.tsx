import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TagManager from "react-gtm-module";
import SignInFormComponent from "./SignInFormComponent";
import SignUpFormComponent from "./SignUpFormComponent";
import ConfirmSignUpFormComponent from "./ConfirmSignUpFormComponent";
import ResetPasswordFormComponent from "./ResetPasswordFormComponent";
import ConfirmResetPasswordFormComponent from "./ConfirmResetPasswordFormComponent";
import LoadingSpinner from "../General/LoadingSpinner";
import {
	ExtendedAuthenticationModalProps,
	AuthModalTab,
	GTMEvent,
} from "./types/authentication.types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

/**
 * AuthenticationModal - Main authentication interface component
 *
 * This component provides a modal-based authentication interface with signin, signup,
 * and guest login functionality. It manages loading states, handles authentication flow,
 * and integrates with Google Tag Manager for analytics tracking.
 *
 * @component
 * @param {ExtendedAuthenticationModalProps} props - Component props
 * @returns {JSX.Element} The authentication modal with multiple authentication options
 *
 * @example
 * ```tsx
 * <AuthenticationModal
 *   show={isModalOpen}
 *   setshow={setIsModalOpen}
 *   onLogin={handleLogin}
 *   initialTab="signin"
 *   showGuestLogin={true}
 * />
 * ```
 */
const AuthenticationModal: React.FC<ExtendedAuthenticationModalProps> = ({
	show,
	setshow,
	onLogin,
	initialTab = "signin",
	showGuestLogin = true,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [currentTab, setCurrentTab] = useState<AuthModalTab>(initialTab);
	const [pendingEmail, setPendingEmail] = useState<string>("");
	const [resetEmail, setResetEmail] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const navigate = useNavigate();

	/**
	 * Handles guest login process
	 */
	const onGuestLogin = async (): Promise<void> => {
		setCurrentTab("loading");
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
		} catch (error) {
			console.error("Guest login error:", error);
			handleAuthError("Failed to login as guest. Please try again.");
			setCurrentTab("signin"); // Go back to signin tab on error
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handles successful authentication
	 */
	const handleAuthSuccess = (): void => {
		setErrorMessage("");
		setshow(false);
		// Call onLogin callback if provided, otherwise redirect
		if (onLogin) {
			onLogin();
		} else {
			navigate("/");
		}
	};

	/**
	 * Handles authentication errors
	 */
	const handleAuthError = (error: string): void => {
		setErrorMessage(error);
	};

	/**
	 * Handles successful signup - switch to confirmation
	 */
	const handleSignUpSuccess = (email: string): void => {
		setPendingEmail(email);
		setCurrentTab("confirm");
		setErrorMessage("");
	};

	/**
	 * Handles successful password reset initiation
	 */
	const handleResetPasswordSuccess = (email: string): void => {
		setResetEmail(email);
		setCurrentTab("confirmReset");
		setErrorMessage("");
	};

	/**
	 * Handles successful password reset confirmation
	 */
	const handleConfirmResetPasswordSuccess = (): void => {
		setErrorMessage("");
		// Go back to sign-in tab instead of closing modal
		setCurrentTab("signin");
	};

	/**
	 * Handles successful confirmation - close modal and redirect
	 */
	const handleConfirmSuccess = (): void => {
		setErrorMessage("");
		setshow(false);
		// Call onLogin callback if provided, otherwise redirect
		if (onLogin) {
			onLogin();
		} else {
			navigate("/");
		}
	};

	/**
	 * Resets error message when switching tabs
	 */
	const switchTab = (tab: AuthModalTab): void => {
		setCurrentTab(tab);
		setErrorMessage("");
	};

	/**
	 * Gets the modal title based on current tab
	 */
	const getModalTitle = (): string => {
		switch (currentTab) {
			case "signin":
				return "Sign In";
			case "signup":
				return "Create Account";
			case "confirm":
				return "Confirm Account";
			case "reset":
				return "Reset Password";
			case "confirmReset":
				return "Confirm New Password";
			case "loading":
				return "Processing...";
			default:
				return "Authentication";
		}
	};

	return (
		<Dialog
			key={show ? "open" : "closed"}
			open={show}
			onOpenChange={setshow}
		>
			<DialogContent className="sm:max-w-md bg-white border border-gray-200 text-gray-900">
				<DialogTitle className="text-center w-full py-2 text-gray-900 border-b border-gray-200">
					{getModalTitle()}
				</DialogTitle>
				<DialogDescription></DialogDescription>

				<div className="p-6">
					{/* Tab Navigation */}
					{currentTab !== "confirm" && currentTab !== "loading" && (
						<div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
							<Button
								variant={
									currentTab === "signin"
										? "default"
										: "ghost"
								}
								size="sm"
								onClick={() => switchTab("signin")}
								className="flex-1"
							>
								Sign In
							</Button>
							<Button
								variant={
									currentTab === "signup"
										? "default"
										: "ghost"
								}
								size="sm"
								onClick={() => switchTab("signup")}
								className="flex-1"
							>
								Sign Up
							</Button>
						</div>
					)}

					{/* Error Message */}
					{errorMessage && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">
								{errorMessage}
							</p>
						</div>
					)}

					{/* Form Content */}
					{isLoading ? (
						<div className="w-full flex justify-center py-3">
							<LoadingSpinner size="medium" />
						</div>
					) : (
						<>
							{currentTab === "signin" && (
								<SignInFormComponent
									onSuccess={handleAuthSuccess}
									onError={handleAuthError}
									onSwitchToSignUp={() => switchTab("signup")}
									onForgotPassword={() => switchTab("reset")}
								/>
							)}

							{currentTab === "signup" && (
								<SignUpFormComponent
									onSuccess={handleSignUpSuccess}
									onError={handleAuthError}
									onSwitchToSignIn={() => switchTab("signin")}
								/>
							)}

							{currentTab === "confirm" && (
								<ConfirmSignUpFormComponent
									email={pendingEmail}
									onSuccess={handleConfirmSuccess}
									onError={handleAuthError}
									onBackToSignUp={() => switchTab("signup")}
								/>
							)}

							{currentTab === "reset" && (
								<ResetPasswordFormComponent
									onSuccess={handleResetPasswordSuccess}
									onError={handleAuthError}
									onBackToSignIn={() => switchTab("signin")}
								/>
							)}

							{currentTab === "confirmReset" && (
								<ConfirmResetPasswordFormComponent
									email={resetEmail}
									onSuccess={
										handleConfirmResetPasswordSuccess
									}
									onError={handleAuthError}
									onBackToReset={() => switchTab("reset")}
								/>
							)}

							{currentTab === "loading" && (
								<div className="w-full flex flex-col items-center justify-center py-8">
									<LoadingSpinner size="large" />
									<p className="mt-4 text-gray-600 text-center">
										Processing your request...
									</p>
								</div>
							)}
						</>
					)}

					{/* Guest Login Option */}
					{showGuestLogin &&
						currentTab !== "confirm" &&
						currentTab !== "loading" && (
							<div className="mt-6 pt-4 border-t border-gray-200">
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-3">
										Or continue as a guest
									</p>
									<Button
										variant="outline"
										onClick={onGuestLogin}
										className="w-full"
									>
										Continue as Guest
									</Button>
								</div>
							</div>
						)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AuthenticationModal;

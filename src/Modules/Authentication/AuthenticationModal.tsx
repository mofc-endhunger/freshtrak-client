import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";
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
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import localization from "../Localization/LocalizationComponent";
import { useAuth } from "./AuthContext";
import { StorageService } from "../../Utils/StorageService";

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
	const [justConfirmedEmail, setJustConfirmedEmail] =
		useState<boolean>(false);
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();
	const { resendConfirmationCode, isAuthenticated } = useAuth();

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
	 * Only called when sign-in actually succeeds (not for unconfirmed users)
	 * IMPORTANT: onLogin is for guest login only. If user is authenticated via Cognito,
	 * we should NOT call onLogin as it would overwrite Cognito auth with guest auth.
	 */
	const handleAuthSuccess = (): void => {
		// Safety check: Don't proceed if we're on confirmation tab (user needs to verify first)
		if (currentTab === "confirm") {
			console.warn(
				"handleAuthSuccess called while on confirm tab - ignoring to prevent guest login"
			);
			return;
		}

		setErrorMessage("");

		// Check if user is authenticated via Cognito
		// If yes, don't call onLogin (which is for guest login) - just close modal and navigate
		const isCognitoAuthenticated =
			isAuthenticated || StorageService.isLoggedInUser();

		if (isCognitoAuthenticated) {
			setshow(false);

			// Check if we're in registration flow (on registration event details page)
			// If so, navigate to registration form instead of home
			const isRegistrationFlow = location.pathname.includes(
				RENDER_URL.REGISTRATION_EVENT_DETAILS_URL
			);
			if (isRegistrationFlow && params.id) {
				// Navigate to registration form with event date ID
				navigate(`${RENDER_URL.REGISTRATION_FORM_URL}/${params.id}`);
				return;
			}

			// Default: navigate to home
			navigate(RENDER_URL.ROOT_URL);
			return;
		}

		// If not authenticated via Cognito, this shouldn't happen after successful sign-in
		// But if it does, show error instead of falling back to guest
		console.warn(
			"handleAuthSuccess called but user is not authenticated via Cognito - showing error"
		);
		setErrorMessage("Authentication failed. Please try again.");
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
	 * Handles unverified user error - switch to confirmation tab and resend code
	 * IMPORTANT: This does NOT call onLogin - it keeps the modal open for verification
	 */
	const handleUnverifiedUserError = async (email: string): Promise<void> => {
		setPendingEmail(email);
		setCurrentTab("confirm");
		// DO NOT close modal or call onLogin - user needs to verify first

		// Automatically resend confirmation code
		try {
			await resendConfirmationCode(email);
			setErrorMessage(
				"An account with this email already exists but hasn't been verified. We've sent a new confirmation code to your email."
			);
		} catch (error) {
			console.error("Failed to resend confirmation code:", error);
			setErrorMessage(
				"An account with this email already exists but hasn't been verified. Please enter the confirmation code sent to your email, or click 'Resend Code' to receive a new one."
			);
		}
	};

	/**
	 * Handles unconfirmed user error from sign-in - switch to confirmation tab and resend code
	 * IMPORTANT: This does NOT call onLogin - it keeps the modal open for verification
	 */
	const handleUnconfirmedUserError = async (email: string): Promise<void> => {
		setPendingEmail(email);
		setCurrentTab("confirm");
		// DO NOT close modal or call onLogin - user needs to verify first

		// Automatically resend confirmation code
		try {
			await resendConfirmationCode(email);
			setErrorMessage(
				"Your account hasn't been verified yet. We've sent a new confirmation code to your email."
			);
		} catch (error) {
			console.error("Failed to resend confirmation code:", error);
			setErrorMessage(
				"Your account hasn't been verified yet. Please enter the confirmation code sent to your email, or click 'Resend Code' to receive a new one."
			);
		}
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
	 * IMPORTANT: After email confirmation, AuthContext automatically signs the user in via Cognito
	 * We should NOT call onLogin here as it would overwrite Cognito auth with guest auth
	 */
	const handleConfirmSuccess = async (): Promise<void> => {
		setErrorMessage("");

		// Mark this user as a new user who just completed email confirmation
		// This will trigger the household setup offer in HouseholdSignUpWrapper
		if (pendingEmail) {
			const flagData = {
				email: pendingEmail,
				timestamp: Date.now(),
				completed: true,
			};

			// Store a flag to indicate this is a new user sign-up
			localStorage.setItem("new_user_signup", JSON.stringify(flagData));
		}

		// Set flag to prevent onLogin from being called when modal closes
		setJustConfirmedEmail(true);

		setshow(false);

		// Wait a bit for AuthContext to finish signing in the user after confirmation
		// The handleConfirmSignUp in AuthContext is async and signs the user in automatically
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Always navigate to home - never call onLogin after confirmation
		// Even if Cognito auth isn't detected yet, don't call onLogin as it would create guest user
		// The AuthContext should have signed the user in via Cognito after confirmation
		navigate(RENDER_URL.ROOT_URL);
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
				return localization.button_sign_in;
			case "signup":
				return localization.dialog_create_account_title;
			case "confirm":
				return (
					localization.dialog_confirm_account_title ||
					"Confirm Account"
				);
			case "reset":
				return (
					localization.dialog_reset_password_title || "Reset Password"
				);
			case "confirmReset":
				return (
					localization.dialog_confirm_new_password_title ||
					"Confirm New Password"
				);
			case "loading":
				return localization.button_processing;
			default:
				return (
					localization.dialog_authentication_title || "Authentication"
				);
		}
	};

	/**
	 * Handles modal open/close changes
	 * Prevents calling onLogin if user just confirmed email (to avoid guest login)
	 */
	const handleOpenChange = (open: boolean): void => {
		// If closing the modal and user just confirmed email, don't trigger any callbacks
		if (!open && justConfirmedEmail) {
			setJustConfirmedEmail(false);
			setshow(false);
			return;
		}

		// If closing and user is authenticated via Cognito, don't call onLogin
		if (!open && (isAuthenticated || StorageService.isLoggedInUser())) {
			setshow(false);
			return;
		}

		// Normal modal close
		setshow(open);
	};

	return (
		<Dialog
			key={show ? "open" : "closed"}
			open={show}
			onOpenChange={handleOpenChange}
		>
			<DialogContent
				className="sm:max-w-md bg-white border border-gray-200 text-gray-900"
				onPointerDownOutside={(e) => {
					// Prevent accidental closure when on email verification tab
					if (currentTab === "confirm") {
						e.preventDefault();
					}
				}}
				onEscapeKeyDown={(e) => {
					// Prevent accidental closure when on email verification tab
					if (currentTab === "confirm") {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader className="border-b border-gray-200">
					<DialogTitle className="text-center w-full py-2 text-gray-900">
						{getModalTitle()}
					</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>

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
								{localization.button_sign_in}
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
								{localization.button_sign_up}
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
									onUnconfirmedUser={
										handleUnconfirmedUserError
									}
									onSwitchToSignUp={() => switchTab("signup")}
									onForgotPassword={() => switchTab("reset")}
								/>
							)}

							{currentTab === "signup" && (
								<SignUpFormComponent
									onSuccess={handleSignUpSuccess}
									onError={handleAuthError}
									onUnverifiedUserExists={
										handleUnverifiedUserError
									}
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
							<div className="mt-6 pt-4">
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-200"></div>
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-2 bg-white text-gray-500">
											{localization.or}
										</span>
									</div>
								</div>
								<div className="text-center mt-4">
									<Button
										variant="outline"
										onClick={onGuestLogin}
										className="w-full"
									>
										{localization.button_continue_as_guest}
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

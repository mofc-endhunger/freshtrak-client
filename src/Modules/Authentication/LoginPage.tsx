import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TagManager from "react-gtm-module";
import { RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import SignInFormComponent from "./SignInFormComponent";
import SignUpFormComponent from "./SignUpFormComponent";
import ConfirmSignUpFormComponent from "./ConfirmSignUpFormComponent";
import ResetPasswordFormComponent from "./ResetPasswordFormComponent";
import ConfirmResetPasswordFormComponent from "./ConfirmResetPasswordFormComponent";
import LoadingSpinner from "../General/LoadingSpinner";
import { Button } from "../../components/ui/button";
import { AuthModalTab, GTMEvent } from "./types/authentication.types";
import { API_URL } from "../../Utils/Urls";
import { StorageService } from "../../Utils/StorageService";
import localization from "../Localization/LocalizationComponent";
import { useAuth } from "./AuthContext";

/**
 * LoginPage - Full-page login interface with authentication forms
 *
 * This component provides a dedicated login page with inline authentication forms
 * for signin, signup, and guest login functionality. It features responsive design
 * and integrates with AWS Cognito and guest authentication APIs.
 *
 * @component
 * @returns {JSX.Element} The login page with authentication forms
 */
const LoginPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [currentTab, setCurrentTab] = useState<AuthModalTab>("signin");
	const [pendingEmail, setPendingEmail] = useState<string>("");
	const [resetEmail, setResetEmail] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const navigate = useNavigate();
	const { resendConfirmationCode } = useAuth();

	/**
	 * Handles guest login process using API
	 */
	const onGuestLogin = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const { GUEST_USER } = API_URL;

			// Clear Cognito authentication data when logging in as guest
			StorageService.clearAuthData("cognito");

			const resp = await axios.post(GUEST_USER);
			const userProfile = resp.data;
			// Use StorageService to store guest user profile (uses 'freshtrak_user_guest' key)
			StorageService.setItem("freshtrak_user_guest", userProfile);
			// Also store token if available
			if (userProfile.token) {
				StorageService.setUserToken(userProfile.token);
			}

			// Track guest login event with Google Tag Manager
			const gtmEvent: GTMEvent = {
				event: "guest-login",
			};

			TagManager.dataLayer({
				dataLayer: gtmEvent,
			});

			// Redirect to home page after guest login
			navigate(RENDER_URL.ROOT_URL);
		} catch (error) {
			console.error("Guest login error:", error);
			handleAuthError("Failed to login as guest. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handles successful authentication
	 */
	const handleAuthSuccess = (): void => {
		setErrorMessage("");
		// Redirect to home page after successful authentication
		navigate(RENDER_URL.ROOT_URL);
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
	 */
	const handleUnverifiedUserError = async (email: string): Promise<void> => {
		setPendingEmail(email);
		setCurrentTab("confirm");
		
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
	 */
	const handleUnconfirmedUserError = async (email: string): Promise<void> => {
		setPendingEmail(email);
		setCurrentTab("confirm");
		
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
	 * Handles successful confirmation - redirect to home or household setup
	 */
	const handleConfirmSuccess = (): void => {
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

		// Redirect to home page after successful confirmation
		// Note: Household setup will be offered via HouseholdSignUpWrapper
		navigate(RENDER_URL.ROOT_URL);
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
		// Go back to sign-in tab instead of redirecting
		setCurrentTab("signin");
	};

	/**
	 * Resets error message when switching tabs
	 */
	const switchTab = (tab: AuthModalTab): void => {
		setCurrentTab(tab);
		setErrorMessage("");
	};

	/**
	 * Gets the form title based on current tab
	 */
	const getFormTitle = (): string => {
		switch (currentTab) {
			case "signin":
				return "Sign In";
			case "signup":
				return "Create Account";
			case "confirm":
				return "Confirm Account";
			default:
				return "Authentication";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
				{/* title */}
				<h1 className="text-2xl font-bold mb-6 text-center">
					{getFormTitle()}
				</h1>

				{/* Main Card */}
				<div className="bg-white rounded-lg  p-6">
					{/* Tab Navigation */}
					{currentTab !== "confirm" && (
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
									onUnconfirmedUser={handleUnconfirmedUserError}
									onSwitchToSignUp={() => switchTab("signup")}
									onForgotPassword={() => switchTab("reset")}
								/>
							)}

							{currentTab === "signup" && (
								<SignUpFormComponent
									onSuccess={handleSignUpSuccess}
									onError={handleAuthError}
									onUnverifiedUserExists={handleUnverifiedUserError}
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
						</>
					)}

					{/* Guest Login Option */}
					{currentTab !== "confirm" &&
						currentTab !== "reset" &&
						currentTab !== "confirmReset" && (
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
										disabled={isLoading}
										className="w-full"
									>
										{isLoading ? (
											<div className="flex items-center justify-center space-x-2">
												<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
												<span>Processing...</span>
											</div>
										) : (
											"Continue as Guest"
										)}
									</Button>
								</div>
							</div>
						)}
				</div>

				{/* Back to Home Link */}
				<div className="text-center mt-6">
					<Button
						variant="ghost"
						onClick={() => navigate(RENDER_URL.ROOT_URL)}
						className="text-gray-600 hover:text-gray-900"
					>
						← Back to Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;

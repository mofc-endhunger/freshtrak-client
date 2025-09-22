import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TagManager from "react-gtm-module";
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

	/**
	 * Handles guest login process using API
	 */
	const onGuestLogin = async (): Promise<void> => {
		setIsLoading(true);
		try {
			const { GUEST_AUTH, GUEST_USER } = API_URL;

			// Clear Cognito authentication data when logging in as guest
			localStorage.removeItem("cognitoUser");

			// Get guest authentication
			const resp = await axios.post(GUEST_AUTH);
			const { guestId, token, type } = resp.data;

			// Store guest authentication data
			localStorage.setItem("userToken", token);
			localStorage.setItem("guestId", guestId);
			localStorage.setItem("guestType", type);
			localStorage.setItem("isLoggedIn", "true");

			// Fetch user profile
			const userResp = await axios.get(GUEST_USER, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const { id, role } = userResp.data;

			// Store user profile with new structure
			const userProfile = {
				id,
				role,
				guestId,
				type,
			};
			localStorage.setItem("userProfile", JSON.stringify(userProfile));

			// Track guest login event with Google Tag Manager
			const gtmEvent: GTMEvent = {
				event: "guest-login",
			};

			TagManager.dataLayer({
				dataLayer: gtmEvent,
			});

			// Redirect to home page after guest login
			navigate("/");
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
		navigate("/");
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
	 * Handles successful confirmation - redirect to home
	 */
	const handleConfirmSuccess = (): void => {
		setErrorMessage("");
		// Redirect to home page after successful confirmation
		navigate("/");
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
				<div className="bg-white rounded-lg shadow-md p-6">
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
						</>
					)}

					{/* Guest Login Option */}
					{currentTab !== "confirm" &&
						currentTab !== "reset" &&
						currentTab !== "confirmReset" && (
							<div className="mt-6 pt-4 border-t border-gray-200">
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-3">
										Or continue as a guest
									</p>
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
						onClick={() => navigate("/")}
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

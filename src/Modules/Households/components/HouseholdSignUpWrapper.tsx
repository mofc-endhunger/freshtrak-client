/**
 * Household Sign-Up Wrapper Component
 * Integrates household setup with the existing sign-up process
 */

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../Authentication/AuthContext";
import { HouseholdSetupOffer } from "./HouseholdSetupOffer";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";
import { RENDER_URL } from "../../../Utils/Urls";
import localization from "../../Localization/LocalizationComponent";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { StorageService } from "../../../Utils/StorageService";

interface HouseholdSignUpWrapperProps {
	children: React.ReactNode;
	onSignUpSuccess?: (email: string) => void;
	onSignUpError?: (error: string) => void;
}

/**
 * Wrapper component that adds household setup to the sign-up flow
 * Shows household setup offer after successful email confirmation
 */
export const HouseholdSignUpWrapper: React.FC<HouseholdSignUpWrapperProps> = ({
	children,
	onSignUpSuccess,
	onSignUpError,
}) => {
	const { user, isAuthenticated } = useAuth();
	const [showHouseholdOffer, setShowHouseholdOffer] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showWarningDialog, setShowWarningDialog] = useState(false);

	const { offerHouseholdSetup, deferHouseholdSetup, isNewUserSignUp } =
		useHouseholdSignUpIntegration();

	// Memoized API service instance
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Check if we're in registration flow using session storage
	// The event date ID is stored when auth modal opens from registration flow
	const storedEventDateId = StorageService.getRegisteredEventDateID();
	const isRegistrationFlow = !!storedEventDateId;
	const eventDateId = storedEventDateId;

	// Check if we should show household setup offer
	useEffect(() => {
		const checkHouseholdSetup = async () => {
			if (isAuthenticated && user && user.email) {
				// Only show household setup offer for new users who just completed email confirmation
				// This prevents showing the prompt to existing users who are signing in
				const isNewUser = isNewUserSignUp(user.email);

				if (isNewUser) {
					try {
						await offerHouseholdSetup(user.email);
						setShowHouseholdOffer(true);
					} catch (error) {
						console.error("Error offering household setup:", error);
					}
				}
			}
		};

		checkHouseholdSetup();
	}, [isAuthenticated, user, isNewUserSignUp, offerHouseholdSetup]);

	// Handle household setup now
	const handleSetupNow = async () => {
		// If in registration flow, show warning dialog first
		if (isRegistrationFlow) {
			setShowWarningDialog(true);
			return;
		}

		// Normal flow: redirect to setup wizard
		setIsProcessing(true);
		try {
			// Just redirect to setup wizard - no API calls here
			// The POST will happen when user completes the wizard
			window.location.href = "/households/setup";
		} catch (error) {
			console.error("Error redirecting to setup:", error);
			onSignUpError?.("Failed to redirect to setup. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Handle warning dialog confirmation (proceed with household setup)
	const handleWarningConfirm = async () => {
		setShowWarningDialog(false);
		setIsProcessing(true);
		try {
			// Clear stored event date ID since user is leaving registration flow
			if (eventDateId) {
				StorageService.removeItem(
					"freshtrak_session_registered_event_date_id",
					"session"
				);
			}
			// Redirect to setup wizard - user will complete setup and land on account page
			window.location.href = "/households/setup";
		} catch (error) {
			console.error("Error redirecting to setup:", error);
			onSignUpError?.("Failed to redirect to setup. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Handle warning dialog cancellation (fall back to "Set Up Later" behavior)
	const handleWarningCancel = async () => {
		setShowWarningDialog(false);
		// Fall back to "Set Up Later" behavior
		await handleSetupLater();
	};

	// Handle setup later
	const handleSetupLater = async () => {
		setIsProcessing(true);
		try {
			// Create minimal user record with just basic info from Cognito
			const minimalUserData = {
				// Required fields for CreateHouseholdRequest
				primary_first_name: user?.name?.split(" ")[0] || "User",
				primary_last_name:
					user?.name?.split(" ").slice(1).join(" ") || "",
				primary_date_of_birth: "",
				preferred_language: "en",
				address_line_1: "",
				city: "",
				state: "",
				zip_code: "",
				// Additional fields for new API (use undefined for optional fields)
				first_name: user?.name?.split(" ")[0] || "User",
				last_name: user?.name?.split(" ").slice(1).join(" ") || "",
				phone: undefined,
				date_of_birth: undefined,
				permission_to_email: undefined,
				children_in_household: undefined,
			};

			// Create user via POST API call
			const response = await householdsApiService.createHousehold(
				minimalUserData
			);

			// Store user ID and household ID in localStorage
			const householdStorage = {
				userId: response.data.primary_user_id,
				household_id: response.data.id,
			};
			localStorage.setItem("household", JSON.stringify(householdStorage));

			// Defer household setup (set flags)
			await deferHouseholdSetup();
			setShowHouseholdOffer(false);

			// If in registration flow, navigate to registration form (which will show timeslot selection)
			if (isRegistrationFlow && eventDateId) {
				window.location.href = `${RENDER_URL.REGISTRATION_FORM_URL}/${eventDateId}`;
			} else {
				// Normal flow: redirect to dashboard
				window.location.href = "/dashboard";
			}
		} catch (error) {
			console.error("Error creating user (setup later):", error);
			onSignUpError?.("Failed to create user record. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	// If showing household offer, render the offer component with warning dialog
	if (showHouseholdOffer) {
		return (
			<>
				<HouseholdSetupOffer
					onSetupNow={handleSetupNow}
					onSetupLater={handleSetupLater}
					isLoading={isProcessing}
				/>
				{/* Warning dialog for registration flow */}
				<AlertDialog
					open={showWarningDialog}
					onOpenChange={setShowWarningDialog}
				>
					<AlertDialogContent className="bg-white border border-gray-200 text-gray-900">
						<AlertDialogHeader>
							<AlertDialogTitle>
								{localization.household_warning_title}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{localization.household_warning_description}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								onClick={handleWarningCancel}
								disabled={isProcessing}
							>
								{localization.household_warning_cancel}
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleWarningConfirm}
								disabled={isProcessing}
								className="bg-highlight text-white hover:bg-highlight-dark"
							>
								{localization.household_warning_confirm}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	}

	// Otherwise, render the original sign-up form
	return <>{children}</>;
};

/**
 * Hook for managing household sign-up state
 * Provides utilities for checking and managing household setup during sign-up
 */
export const useHouseholdSignUpState = () => {
	const { user, isAuthenticated } = useAuth();
	const {
		getSignUpState,
		shouldShowPrompt,
		hasCompletedSetup,
		getHouseholdId,
	} = useHouseholdSignUpIntegration();

	const signUpState = getSignUpState();
	const needsHouseholdSetup = !hasCompletedSetup() && isAuthenticated;
	const householdId = getHouseholdId();

	return {
		// State
		signUpState,
		needsHouseholdSetup,
		householdId,
		isAuthenticated,
		user,

		// Computed values
		shouldShowPrompt: user?.email ? shouldShowPrompt(user.email) : false,
		hasCompletedSetup: hasCompletedSetup(),

		// Actions
		getSignUpState,
		getHouseholdId,
	};
};

/**
 * Component for showing household completion prompts in dashboard
 * Shows gentle reminders for users who skipped initial setup
 */
export const HouseholdCompletionPrompt: React.FC<{
	onSetup: () => void;
	onDismiss: () => void;
	className?: string;
}> = ({ onSetup, onDismiss, className = "" }) => {
	const { shouldShowPrompt, markPromptShown } =
		useHouseholdSignUpIntegration();
	const { user } = useAuth();

	// Only show if we should prompt
	if (!user?.email || !shouldShowPrompt(user.email)) {
		return null;
	}

	const handleDismiss = () => {
		markPromptShown();
		onDismiss();
	};

	return (
		<div
			className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
						<svg
							className="w-5 h-5 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<h3 className="font-semibold text-blue-900">
							{localization.household_complete_profile_title}
						</h3>
						<p className="text-sm text-blue-700">
							{
								localization.household_complete_profile_description
							}
						</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<button
						onClick={onSetup}
						className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
					>
						{localization.household_setup_now}
					</button>
					<button
						onClick={handleDismiss}
						className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:text-blue-800 transition-colors"
					>
						{localization.household_later}
					</button>
				</div>
			</div>
		</div>
	);
};

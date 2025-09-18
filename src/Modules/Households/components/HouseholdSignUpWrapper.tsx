/**
 * Household Sign-Up Wrapper Component
 * Integrates household setup with the existing sign-up process
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../Authentication/AuthContext";
import { HouseholdSetupOffer } from "./HouseholdSetupOffer";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { CreateHouseholdApiRequest } from "../types/api.types";

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

	const {
		getSignUpState,
		offerHouseholdSetup,
		createHousehold,
		skipHouseholdSetup,
		deferHouseholdSetup,
		isNewUserSignUp,
	} = useHouseholdSignUpIntegration();

	// Check if we should show household setup offer
	useEffect(() => {
		const checkHouseholdSetup = async () => {
			console.log("🔍 Checking household setup:", {
				isAuthenticated,
				userEmail: user?.email,
				userObject: user,
				userKeys: user ? Object.keys(user) : null,
			});

			if (isAuthenticated && user && user.email) {
				// Only show household setup offer for new users who just completed email confirmation
				// This prevents showing the prompt to existing users who are signing in
				const isNewUser = isNewUserSignUp(user.email);
				console.log("🔍 Is new user signup:", isNewUser);

				if (isNewUser) {
					console.log(
						"✅ Showing household setup offer for new user"
					);
					try {
						await offerHouseholdSetup(user.email);
						setShowHouseholdOffer(true);
					} catch (error) {
						console.error("Error offering household setup:", error);
					}
				} else {
					console.log(
						"❌ Not showing household setup offer - not a new user"
					);
				}
			} else {
				console.log("❌ Not authenticated or no user ID");
			}
		};

		checkHouseholdSetup();
	}, [isAuthenticated, user, isNewUserSignUp, offerHouseholdSetup]);

	// Handle household setup now
	const handleSetupNow = async () => {
		setIsProcessing(true);
		try {
			// For now, create a basic household with user info
			// In a real implementation, this would show a household setup form
			const householdData: CreateHouseholdApiRequest = {
				address_line_1: "", // Will be filled by user
				city: "",
				state: "",
				zip_code: "",
				preferred_language: "en", // Default to English
				primary_first_name: user?.name || "",
				primary_last_name: "",
				primary_date_of_birth: "",
			};

			await createHousehold(householdData);
			setShowHouseholdOffer(false);

			// Redirect to household setup form or dashboard
			window.location.href = "/households/setup";
		} catch (error) {
			console.error("Error creating household:", error);
			onSignUpError?.("Failed to create household. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Handle skip household setup
	const handleSkip = async () => {
		setIsProcessing(true);
		try {
			await skipHouseholdSetup();
			setShowHouseholdOffer(false);

			// Redirect to dashboard
			window.location.href = "/dashboard";
		} catch (error) {
			console.error("Error skipping household setup:", error);
			onSignUpError?.(
				"Failed to skip household setup. Please try again."
			);
		} finally {
			setIsProcessing(false);
		}
	};

	// Handle setup later
	const handleSetupLater = async () => {
		setIsProcessing(true);
		try {
			await deferHouseholdSetup();
			setShowHouseholdOffer(false);

			// Redirect to dashboard
			window.location.href = "/dashboard";
		} catch (error) {
			console.error("Error deferring household setup:", error);
			onSignUpError?.(
				"Failed to defer household setup. Please try again."
			);
		} finally {
			setIsProcessing(false);
		}
	};

	// If showing household offer, render the offer component
	if (showHouseholdOffer) {
		return (
			<HouseholdSetupOffer
				onSetupNow={handleSetupNow}
				onSkip={handleSkip}
				onSetupLater={handleSetupLater}
				isLoading={isProcessing}
			/>
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
							Complete Your Profile
						</h3>
						<p className="text-sm text-blue-700">
							Set up your household for personalized services and
							easier event registration.
						</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<button
						onClick={onSetup}
						className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
					>
						Set Up Now
					</button>
					<button
						onClick={handleDismiss}
						className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:text-blue-800 transition-colors"
					>
						Later
					</button>
				</div>
			</div>
		</div>
	);
};

/**
 * Household Profile Integration Component
 * Integrates household management into account profile
 */

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
	Home,
	Users,
	Settings,
	Edit,
	Plus,
	CheckCircle,
	AlertCircle,
	Calendar,
	MapPin,
} from "lucide-react";
import { HouseholdCompletionPrompt } from "./HouseholdCompletionPrompt";
import { HouseholdSetupWizard } from "./HouseholdSetupWizard";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface HouseholdProfileIntegrationProps {
	onNavigateToHousehold?: () => void;
	className?: string;
}

interface HouseholdStatus {
	isComplete: boolean;
	hasHousehold: boolean;
	completionPercentage: number;
	missingFields: string[];
}

export const HouseholdProfileIntegration: React.FC<
	HouseholdProfileIntegrationProps
> = ({ onNavigateToHousehold, className = "" }) => {
	const {
		hasCompletedSetup,
		getHouseholdId,
		getSignUpState,
		shouldShowPrompt,
	} = useHouseholdSignUpIntegration();
	const { user } = useAuth();

	const [showSetupWizard, setShowSetupWizard] = useState(false);
	const [householdStatus, setHouseholdStatus] = useState<HouseholdStatus>({
		isComplete: false,
		hasHousehold: false,
		completionPercentage: 0,
		missingFields: [],
	});

	// Check household status
	useEffect(() => {
		const checkHouseholdStatus = () => {
			const isComplete = hasCompletedSetup();
			const hasHousehold = !!getHouseholdId();
			const signUpState = getSignUpState();

			// Calculate completion percentage based on user choice
			let completionPercentage = 0;
			const missingFields: string[] = [];

			if (signUpState.userChoice === "setup" && isComplete) {
				completionPercentage = 100;
			} else if (signUpState.userChoice === "later") {
				completionPercentage = 25;
				missingFields.push("Household setup");
			} else if (signUpState.userChoice === "skip") {
				completionPercentage = 10;
				missingFields.push(
					"Household setup",
					"Family member information"
				);
			} else {
				completionPercentage = 0;
				missingFields.push("Complete household setup");
			}

			setHouseholdStatus({
				isComplete,
				hasHousehold,
				completionPercentage,
				missingFields,
			});
		};

		checkHouseholdStatus();
	}, [hasCompletedSetup, getHouseholdId, getSignUpState]);

	const handleSetupHousehold = () => {
		setShowSetupWizard(true);
	};

	const handleWizardComplete = (householdId: number) => {
		setShowSetupWizard(false);
		// Refresh status
		window.location.reload();
	};

	const handleWizardCancel = () => {
		setShowSetupWizard(false);
	};

	const handlePromptDismiss = () => {
		// Prompt will be dismissed by the component itself
	};

	const getStatusColor = (percentage: number): string => {
		if (percentage >= 100) return "bg-green-500";
		if (percentage >= 50) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getStatusIcon = (): React.ReactNode => {
		if (householdStatus.isComplete) {
			return <CheckCircle className="w-5 h-5 text-green-600" />;
		} else if (householdStatus.hasHousehold) {
			return <AlertCircle className="w-5 h-5 text-yellow-600" />;
		} else {
			return <AlertCircle className="w-5 h-5 text-red-600" />;
		}
	};

	const getStatusText = (): string => {
		if (householdStatus.isComplete) {
			return "Complete";
		} else if (householdStatus.hasHousehold) {
			return "Incomplete";
		} else {
			return "Not Set Up";
		}
	};

	const getStatusBadgeVariant = ():
		| "default"
		| "secondary"
		| "destructive"
		| "outline" => {
		if (householdStatus.isComplete) return "default";
		if (householdStatus.hasHousehold) return "secondary";
		return "destructive";
	};

	if (showSetupWizard) {
		return (
			<HouseholdSetupWizard
				onComplete={handleWizardComplete}
				onCancel={handleWizardCancel}
			/>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Household Completion Prompt */}
			{user?.email && shouldShowPrompt(user.email) && (
				<HouseholdCompletionPrompt
					onSetup={handleSetupHousehold}
					onDismiss={handlePromptDismiss}
					variant="card"
				/>
			)}

			{/* Household Status Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Home className="w-5 h-5 text-highlight" />
						<span>Household Profile</span>
					</CardTitle>
					<CardDescription>
						Manage your household information and family members
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Status Overview */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center space-x-3">
							{getStatusIcon()}
							<div>
								<h3 className="font-semibold text-gray-900">
									Profile Status: {getStatusText()}
								</h3>
								<p className="text-sm text-gray-600">
									{householdStatus.completionPercentage}%
									Complete
								</p>
							</div>
						</div>
						<Badge variant={getStatusBadgeVariant()}>
							{getStatusText()}
						</Badge>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">
								Completion Progress
							</span>
							<span className="font-medium">
								{householdStatus.completionPercentage}%
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(
									householdStatus.completionPercentage
								)}`}
								style={{
									width: `${householdStatus.completionPercentage}%`,
								}}
							></div>
						</div>
					</div>

					{/* Missing Fields */}
					{householdStatus.missingFields.length > 0 && (
						<div className="space-y-2">
							<h4 className="font-medium text-gray-900">
								Missing Information:
							</h4>
							<ul className="space-y-1">
								{householdStatus.missingFields.map(
									(field, index) => (
										<li
											key={index}
											className="flex items-center space-x-2 text-sm text-gray-600"
										>
											<div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
											<span>{field}</span>
										</li>
									)
								)}
							</ul>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-3">
						{householdStatus.isComplete ? (
							<>
								<Button
									onClick={onNavigateToHousehold}
									className="bg-highlight text-white min-h-12 uppercase min-w-48"
								>
									<Settings className="w-4 h-4 mr-2" />
									Manage Household
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										/* Navigate to household dashboard */
									}}
								>
									<Users className="w-4 h-4 mr-2" />
									View Members
								</Button>
							</>
						) : (
							<>
								<Button
									onClick={handleSetupHousehold}
									className="bg-highlight text-white min-h-12 uppercase min-w-48"
								>
									<Plus className="w-4 h-4 mr-2" />
									Set Up Household
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										/* Navigate to household setup */
									}}
								>
									<Edit className="w-4 h-4 mr-2" />
									Complete Profile
								</Button>
							</>
						)}
					</div>

					{/* Benefits Section */}
					{!householdStatus.isComplete && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="font-semibold text-blue-900 mb-3">
								Complete your household profile to unlock:
							</h4>
							<div className="grid grid-cols-2 gap-3">
								<div className="flex items-center space-x-2">
									<Calendar className="w-4 h-4 text-blue-600" />
									<span className="text-sm text-blue-700">
										Faster event registration
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users className="w-4 h-4 text-blue-600" />
									<span className="text-sm text-blue-700">
										Family member management
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<MapPin className="w-4 h-4 text-blue-600" />
									<span className="text-sm text-blue-700">
										Location-based services
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Settings className="w-4 h-4 text-blue-600" />
									<span className="text-sm text-blue-700">
										Personalized preferences
									</span>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

/**
 * Hook for managing household profile integration
 * Provides utilities for checking profile status and managing household setup
 */
export const useHouseholdProfileIntegration = () => {
	const {
		hasCompletedSetup,
		getHouseholdId,
		getSignUpState,
		shouldShowPrompt,
	} = useHouseholdSignUpIntegration();
	const { user } = useAuth();

	const getProfileStatus = (): HouseholdStatus => {
		const isComplete = hasCompletedSetup();
		const hasHousehold = !!getHouseholdId();
		const signUpState = getSignUpState();

		let completionPercentage = 0;
		const missingFields: string[] = [];

		if (signUpState.userChoice === "setup" && isComplete) {
			completionPercentage = 100;
		} else if (signUpState.userChoice === "later") {
			completionPercentage = 25;
			missingFields.push("Household setup");
		} else if (signUpState.userChoice === "skip") {
			completionPercentage = 10;
			missingFields.push("Household setup", "Family member information");
		} else {
			completionPercentage = 0;
			missingFields.push("Complete household setup");
		}

		return {
			isComplete,
			hasHousehold,
			completionPercentage,
			missingFields,
		};
	};

	const needsHouseholdSetup = (): boolean => {
		return (
			!hasCompletedSetup() && user?.email && shouldShowPrompt(user.email)
		);
	};

	const canManageHousehold = (): boolean => {
		return hasCompletedSetup() && !!getHouseholdId();
	};

	return {
		getProfileStatus,
		needsHouseholdSetup,
		canManageHousehold,
		shouldShowPrompt: user?.email ? shouldShowPrompt(user.email) : false,
	};
};

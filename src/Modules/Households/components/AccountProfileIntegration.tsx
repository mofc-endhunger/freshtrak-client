/**
 * Account Profile Integration Component
 * Integrates household management into the existing account profile
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
	Home,
	Settings,
	Edit,
	Plus,
	CheckCircle,
	AlertCircle,
	Calendar,
	User,
	Clock,
	Bell,
} from "lucide-react";
import { HouseholdCompletionPrompt } from "./HouseholdCompletionPrompt";
import { HouseholdSetupWizard } from "./HouseholdSetupWizard";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface AccountProfileIntegrationProps {
	className?: string;
	showHouseholdSection?: boolean;
	showCompletionPrompts?: boolean;
	onNavigateToHousehold?: () => void;
}

interface ProfileSection {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	completionStatus: "complete" | "incomplete" | "not_started";
	completionPercentage: number;
	missingFields: string[];
	lastUpdated?: string;
}

interface NavigationConfig {
	householdManagementPath: string;
	setupWizardPath: string;
	completionTrackingPath: string;
	profilePath: string;
}

const NAVIGATION_CONFIG: NavigationConfig = {
	householdManagementPath: "/households/manage",
	setupWizardPath: "/households/setup",
	completionTrackingPath: "/profile/completion",
	profilePath: "/profile",
};

export const AccountProfileIntegration: React.FC<
	AccountProfileIntegrationProps
> = ({
	className = "",
	showHouseholdSection = true,
	showCompletionPrompts = true,
	onNavigateToHousehold,
}) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		hasCompletedSetup,
		getHouseholdId,
		getSignUpState,
		shouldShowPrompt,
	} = useHouseholdSignUpIntegration();

	const [showSetupWizard, setShowSetupWizard] = useState(false);
	const [profileSections, setProfileSections] = useState<ProfileSection[]>(
		[]
	);
	const [overallCompletion, setOverallCompletion] = useState(0);

	// Calculate profile completion status
	useEffect(() => {
		const calculateProfileCompletion = () => {
			const signUpState = getSignUpState();
			const isHouseholdComplete = hasCompletedSetup();
			const hasHousehold = !!getHouseholdId();

			// Basic profile information
			const basicProfileComplete = !!(user?.name && user?.email);
			const basicProfilePercentage = basicProfileComplete ? 100 : 50;

			// Household section
			let householdCompletionPercentage = 0;
			let householdStatus: "complete" | "incomplete" | "not_started" =
				"not_started";
			const householdMissingFields: string[] = [];

			if (signUpState.userChoice === "setup" && isHouseholdComplete) {
				householdCompletionPercentage = 100;
				householdStatus = "complete";
			} else if (signUpState.userChoice === "later") {
				householdCompletionPercentage = 25;
				householdStatus = "incomplete";
				householdMissingFields.push("Household setup");
			} else if (signUpState.userChoice === "skip") {
				householdCompletionPercentage = 10;
				householdStatus = "incomplete";
				householdMissingFields.push(
					"Household setup",
					"Family member information"
				);
			} else {
				householdCompletionPercentage = 0;
				householdStatus = "not_started";
				householdMissingFields.push("Complete household setup");
			}

			// Create profile sections
			const sections: ProfileSection[] = [
				{
					id: "basic",
					title: "Basic Information",
					description:
						"Your personal details and contact information",
					icon: <User className="w-5 h-5" />,
					completionStatus: basicProfileComplete
						? "complete"
						: "incomplete",
					completionPercentage: basicProfilePercentage,
					missingFields: basicProfileComplete
						? []
						: ["Name", "Email"],
					lastUpdated: user?.updatedAt || new Date().toISOString(),
				},
				{
					id: "household",
					title: "Household Information",
					description: "Your household details and family members",
					icon: <Home className="w-5 h-5" />,
					completionStatus: householdStatus,
					completionPercentage: householdCompletionPercentage,
					missingFields: householdMissingFields,
					lastUpdated: hasHousehold
						? new Date().toISOString()
						: undefined,
				},
			];

			setProfileSections(sections);

			// Calculate overall completion
			const totalCompletion = sections.reduce(
				(sum, section) => sum + section.completionPercentage,
				0
			);
			const averageCompletion = totalCompletion / sections.length;
			setOverallCompletion(Math.round(averageCompletion));
		};

		calculateProfileCompletion();
	}, [user, hasCompletedSetup, getHouseholdId, getSignUpState]);

	const handleSetupHousehold = () => {
		setShowSetupWizard(true);
	};

	const handleWizardComplete = (householdData: any) => {
		setShowSetupWizard(false);
		// Navigate to household management
		navigate(NAVIGATION_CONFIG.householdManagementPath);
	};

	const handleWizardCancel = () => {
		setShowSetupWizard(false);
	};

	const handleNavigateToHousehold = () => {
		if (onNavigateToHousehold) {
			onNavigateToHousehold();
		} else {
			navigate(NAVIGATION_CONFIG.householdManagementPath);
		}
	};

	const handleNavigateToSetup = () => {
		navigate(NAVIGATION_CONFIG.setupWizardPath);
	};

	const handlePromptDismiss = () => {
		// Prompt will be dismissed by the component itself
	};

	const getStatusColor = (percentage: number): string => {
		if (percentage >= 100) return "bg-green-500";
		if (percentage >= 50) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getStatusIcon = (status: string): React.ReactNode => {
		switch (status) {
			case "complete":
				return <CheckCircle className="w-5 h-5 text-green-600" />;
			case "incomplete":
				return <AlertCircle className="w-5 h-5 text-yellow-600" />;
			default:
				return <AlertCircle className="w-5 h-5 text-red-600" />;
		}
	};

	const getStatusBadgeVariant = (
		status: string
	): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
			case "complete":
				return "default";
			case "incomplete":
				return "secondary";
			default:
				return "destructive";
		}
	};

	const formatLastUpdated = (dateString?: string): string => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		return date.toLocaleDateString();
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
			{/* Overall Profile Completion */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<User className="w-6 h-6 text-highlight" />
						<span>Profile Completion</span>
					</CardTitle>
					<CardDescription>
						Complete your profile to unlock all FreshTrak features
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Overall Progress */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div className="flex items-center space-x-3">
							{getStatusIcon(
								overallCompletion >= 100
									? "complete"
									: overallCompletion >= 50
									? "incomplete"
									: "not_started"
							)}
							<div>
								<h3 className="font-semibold text-gray-900">
									Overall Progress: {overallCompletion}%
								</h3>
								<p className="text-sm text-gray-600">
									{overallCompletion >= 100
										? "Profile Complete"
										: "Profile Incomplete"}
								</p>
							</div>
						</div>
						<Badge
							variant={getStatusBadgeVariant(
								overallCompletion >= 100
									? "complete"
									: overallCompletion >= 50
									? "incomplete"
									: "not_started"
							)}
						>
							{overallCompletion >= 100
								? "Complete"
								: overallCompletion >= 50
								? "Incomplete"
								: "Not Started"}
						</Badge>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">
								Completion Progress
							</span>
							<span className="font-medium">
								{overallCompletion}%
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-3">
							<div
								className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(
									overallCompletion
								)}`}
								style={{ width: `${overallCompletion}%` }}
							></div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Household Completion Prompt */}
			{showCompletionPrompts &&
				user?.email &&
				shouldShowPrompt(user.email) && (
					<HouseholdCompletionPrompt
						onSetup={handleSetupHousehold}
						onDismiss={handlePromptDismiss}
						variant="banner"
					/>
				)}

			{/* Profile Sections */}
			{showHouseholdSection && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Settings className="w-6 h-6 text-highlight" />
							<span>Profile Sections</span>
						</CardTitle>
						<CardDescription>
							Manage different sections of your profile
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{profileSections.map((section, index) => (
							<div key={section.id}>
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-4">
										<div className="flex-shrink-0">
											{section.icon}
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900">
												{section.title}
											</h3>
											<p className="text-sm text-gray-600">
												{section.description}
											</p>
											<div className="flex items-center space-x-4 mt-2">
												<span className="text-sm text-gray-500">
													{
														section.completionPercentage
													}
													% Complete
												</span>
												{section.lastUpdated && (
													<span className="text-sm text-gray-500">
														<Clock className="w-3 h-3 inline mr-1" />
														Updated:{" "}
														{formatLastUpdated(
															section.lastUpdated
														)}
													</span>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-3">
										<Badge
											variant={getStatusBadgeVariant(
												section.completionStatus
											)}
										>
											{section.completionStatus ===
											"complete"
												? "Complete"
												: section.completionStatus ===
												  "incomplete"
												? "Incomplete"
												: "Not Started"}
										</Badge>

										{section.id === "household" ? (
											section.completionStatus ===
											"complete" ? (
												<Button
													onClick={
														handleNavigateToHousehold
													}
													variant="outline"
													size="sm"
													className="flex items-center space-x-1"
												>
													<Settings className="w-4 h-4" />
													<span>Manage</span>
												</Button>
											) : (
												<Button
													onClick={
														handleSetupHousehold
													}
													size="sm"
													className="bg-highlight text-white flex items-center space-x-1"
												>
													<Plus className="w-4 h-4" />
													<span>Set Up</span>
												</Button>
											)
										) : (
											<Button
												onClick={() =>
													navigate(
														NAVIGATION_CONFIG.profilePath
													)
												}
												variant="outline"
												size="sm"
												className="flex items-center space-x-1"
											>
												<Edit className="w-4 h-4" />
												<span>Edit</span>
											</Button>
										)}
									</div>
								</div>

								{/* Missing Fields */}
								{section.missingFields.length > 0 && (
									<div className="mt-2 ml-8">
										<h4 className="text-sm font-medium text-gray-700 mb-2">
											Missing Information:
										</h4>
										<ul className="space-y-1">
											{section.missingFields.map(
												(field, fieldIndex) => (
													<li
														key={fieldIndex}
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

								{index < profileSections.length - 1 && (
									<Separator className="my-4" />
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Bell className="w-5 h-5 text-highlight" />
						<span>Quick Actions</span>
					</CardTitle>
					<CardDescription>
						Common tasks and shortcuts
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<Button
							onClick={handleNavigateToHousehold}
							variant="outline"
							className="flex items-center space-x-2 h-auto p-4"
						>
							<Home className="w-5 h-5" />
							<div className="text-left">
								<div className="font-medium">
									Household Management
								</div>
								<div className="text-sm text-gray-500">
									Manage your household
								</div>
							</div>
						</Button>

						<Button
							onClick={() =>
								navigate(NAVIGATION_CONFIG.profilePath)
							}
							variant="outline"
							className="flex items-center space-x-2 h-auto p-4"
						>
							<User className="w-5 h-5" />
							<div className="text-left">
								<div className="font-medium">Edit Profile</div>
								<div className="text-sm text-gray-500">
									Update your information
								</div>
							</div>
						</Button>

						<Button
							onClick={handleNavigateToSetup}
							variant="outline"
							className="flex items-center space-x-2 h-auto p-4"
						>
							<Plus className="w-5 h-5" />
							<div className="text-left">
								<div className="font-medium">
									Add Family Members
								</div>
								<div className="text-sm text-gray-500">
									Expand your household
								</div>
							</div>
						</Button>

						<Button
							onClick={() => navigate("/events")}
							variant="outline"
							className="flex items-center space-x-2 h-auto p-4"
						>
							<Calendar className="w-5 h-5" />
							<div className="text-left">
								<div className="font-medium">Browse Events</div>
								<div className="text-sm text-gray-500">
									Find local events
								</div>
							</div>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

/**
 * Hook for managing account profile integration
 * Provides utilities for profile completion tracking and navigation
 */
export const useAccountProfileIntegration = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		hasCompletedSetup,
		getHouseholdId,
		getSignUpState,
		shouldShowPrompt,
	} = useHouseholdSignUpIntegration();

	const getProfileCompletion = () => {
		const signUpState = getSignUpState();
		const isHouseholdComplete = hasCompletedSetup();
		const basicProfileComplete = !!(user?.name && user?.email);

		let householdCompletion = 0;
		if (signUpState.userChoice === "setup" && isHouseholdComplete) {
			householdCompletion = 100;
		} else if (signUpState.userChoice === "later") {
			householdCompletion = 25;
		} else if (signUpState.userChoice === "skip") {
			householdCompletion = 10;
		}

		const overallCompletion = Math.round(
			(basicProfileComplete ? 100 : 50 + householdCompletion) / 2
		);

		return {
			overallCompletion,
			basicProfileComplete,
			householdCompletion,
			isHouseholdComplete,
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

	const navigateToHouseholdManagement = () => {
		navigate(NAVIGATION_CONFIG.householdManagementPath);
	};

	const navigateToHouseholdSetup = () => {
		navigate(NAVIGATION_CONFIG.setupWizardPath);
	};

	const navigateToProfile = () => {
		navigate(NAVIGATION_CONFIG.profilePath);
	};

	return {
		getProfileCompletion,
		needsHouseholdSetup,
		canManageHousehold,
		navigateToHouseholdManagement,
		navigateToHouseholdSetup,
		navigateToProfile,
		shouldShowPrompt: user?.email ? shouldShowPrompt(user.email) : false,
		user,
	};
};

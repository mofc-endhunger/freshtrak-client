import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
	User,
	Mail,
	Calendar,
	Home,
	Users,
	Settings,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { useHouseholdSignUpIntegration } from "../Households/services/HouseholdSignUpIntegration";
import { HouseholdCompletionPrompt } from "../Households/components/HouseholdCompletionPrompt";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { LoadingCard } from "../Households/components/LoadingSpinner";
import localization from "../Localization/LocalizationComponent";

/**
 * AccountPage - User account management page
 *
 * This page provides:
 * - User profile information display
 * - Household setup completion prompts
 * - Account settings access
 * - Household management access
 *
 * @component
 * @returns {JSX.Element} The account page component
 */
const AccountPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const { shouldShowPrompt, hasCompletedSetup, markPromptShown } =
		useHouseholdSignUpIntegration();

	const [showHouseholdPrompt, setShowHouseholdPrompt] = useState(false);
	//eslint-disable-next-line
	const [householdData, setHouseholdData] = useState<any>(null);
	const [showFamilyMembersPopup, setShowFamilyMembersPopup] = useState(false);
	//eslint-disable-next-line
	const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
	const [showSkippedSetupPrompt, setShowSkippedSetupPrompt] = useState(false);

	// Initialize API service
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated || !user) {
			navigate("/login");
			return;
		}
	}, [isAuthenticated, user, navigate]);

	// Check if we should show household completion prompt
	useEffect(() => {
		if (
			user?.email &&
			shouldShowPrompt(user.email) &&
			!hasCompletedSetup()
		) {
			setShowHouseholdPrompt(true);
		}
	}, [user?.email, shouldShowPrompt, hasCompletedSetup]);

	// Fetch household data and check for multiple family members
	useEffect(() => {
		const fetchHouseholdData = async () => {
			if (!user?.email) return;

			setIsLoadingHousehold(true);
			try {
				// Step 1: Get user information including household_id
				console.log("📤 GET /users/me - Fetching user information");
				const userInfo = await householdsApiService.getUsersMe();

				if (!userInfo.household_id) {
					console.log("❌ No household_id found in user info");
					return;
				}

				// Step 2: Get household information using household_id
				console.log(
					`📤 GET /households/${userInfo.household_id} - Fetching household information`
				);
				const householdInfo =
					await householdsApiService.getHouseholdByIdNew(
						userInfo.household_id
					);

				setHouseholdData(householdInfo);

				// Check if user has multiple family members (more than 1 member)
				const memberCount = householdInfo?.members?.length || 0;
				if (memberCount > 1) {
					setShowFamilyMembersPopup(true);
				}
			} catch (error) {
				console.error("Error fetching household data:", error);
			} finally {
				setIsLoadingHousehold(false);
			}
		};

		fetchHouseholdData();
		//TODO: check the dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.email]);

	// Check if user skipped setup wizard
	useEffect(() => {
		const skippedSetup = localStorage.getItem("household_signup_state");
		const hasHousehold = localStorage.getItem("household");

		if (
			JSON.parse(skippedSetup || "{}").userChoice === "later" &&
			!JSON.parse(hasHousehold || "{}").household_id
		) {
			setShowSkippedSetupPrompt(true);
		}
	}, [user?.email]);

	/**
	 * Centralized function to navigate to household setup wizard from Account Settings
	 * This ensures consistent behavior and proper cancel redirect
	 */
	const navigateToHouseholdSetup = (step?: string): void => {
		const baseUrl = "/households/setup?from=account";
		const url = step ? `${baseUrl}&step=${step}` : baseUrl;
		navigate(url);
	};

	/**
	 * Handle household setup
	 */
	const handleHouseholdSetup = (): void => {
		setShowHouseholdPrompt(false);
		navigateToHouseholdSetup();
	};

	/**
	 * Handle family members popup actions
	 */
	const handleFamilyMembersNext = (): void => {
		setShowFamilyMembersPopup(false);
		// Navigate to setup wizard for adding family member details
		navigateToHouseholdSetup("family_details");
	};

	const handleFamilyMembersSkip = (): void => {
		setShowFamilyMembersPopup(false);
		// User chose to skip adding family member details
	};

	/**
	 * Handle dismissing household prompt
	 */
	const handlePromptDismiss = (): void => {
		setShowHouseholdPrompt(false);
		markPromptShown();
	};

	/**
	 * Handle household management
	 */
	const handleManageHousehold = (): void => {
		navigate("/households");
	};

	/**
	 * Get user initials for display
	 */
	const getUserInitials = (): string => {
		if (!user) return "U";

		if (user.name && user.name !== user.email) {
			const nameParts = user.name.trim().split(" ");
			if (nameParts.length >= 2) {
				return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
			}
			return nameParts[0][0].toUpperCase();
		}

		if (user.email) {
			const emailParts = user.email.split("@")[0];
			if (emailParts.length >= 2) {
				return emailParts.substring(0, 2).toUpperCase();
			}
			return emailParts[0].toUpperCase();
		}

		return "U";
	};

	const getAccountCreationDate = (): string => {
		if (!user?.accountCreatedDate) {
			return "Not available";
		}

		try {
			const date = new Date(user.accountCreatedDate);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch (error) {
			console.warn("Error formatting account creation date:", error);
			return "Invalid date";
		}
	};

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="mb-4 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>

					<h1 className="text-3xl font-bold text-gray-900">
						Account Settings
					</h1>
					{householdData?.name && (
						<h2 className="text-xl font-semibold text-highlight mt-2">
							{householdData.name}
						</h2>
					)}
					<p className="text-gray-600 mt-2">
						Manage your account information and household details
					</p>
				</div>

				{/* Household Completion Prompt */}
				{showHouseholdPrompt && (
					<div className="mb-8">
						<HouseholdCompletionPrompt
							onSetup={handleHouseholdSetup}
							onDismiss={handlePromptDismiss}
							variant="card"
						/>
					</div>
				)}

				{/* Skipped Setup Prompt */}
				{showSkippedSetupPrompt && (
					<div className="mb-8">
						<Card className="border-orange-200 bg-orange-50">
							<CardContent className="p-6">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<AlertCircle className="h-6 w-6 text-orange-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-medium text-orange-900 mb-2">
											Complete Your Household Setup
										</h3>
										<p className="text-orange-700 mb-4">
											You skipped the household setup
											earlier. Complete it now to get
											personalized services and easier
											event registration.
										</p>
										<div className="flex space-x-3">
											<Button
												onClick={() => {
													setShowSkippedSetupPrompt(
														false
													);
													navigateToHouseholdSetup();
												}}
												className="bg-orange-600 hover:bg-orange-700 text-white"
											>
												Set Up Household
											</Button>
											<Button
												onClick={() =>
													setShowSkippedSetupPrompt(
														false
													)
												}
												variant="ghost"
												className="text-orange-700 hover:text-orange-900"
											>
												Maybe Later
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Family Members Popup */}
				{showFamilyMembersPopup && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-8 max-w-md mx-4">
							<div className="text-center">
								<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="w-8 h-8 text-green-600" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									Awesome!
								</h3>
								<p className="text-gray-600 mb-6">
									We've noticed you've added several family
									members to your household. Would you like to
									add more detailed information to their
									profiles?
								</p>
								<p className="text-sm text-gray-500 mb-6">
									The following information is required by law
									in the State of Ohio to receive service, but
									it will also help us get to know you better.
								</p>
								<div className="flex flex-col space-y-3">
									<Button
										onClick={handleFamilyMembersNext}
										className="w-full bg-green-600 hover:bg-green-700 text-white"
									>
										Next
									</Button>
									<Button
										onClick={handleFamilyMembersSkip}
										variant="ghost"
										className="w-full text-gray-600 hover:text-gray-900"
									>
										Skip
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				<LoadingCard
					isLoading={isLoadingHousehold}
					operation={localization.account_loading_message}
					className="w-full"
				>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Profile Information */}
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<User className="mr-2 h-5 w-5" />
										Profile Information
									</CardTitle>
									<CardDescription>
										Your personal account details
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* User Avatar and Basic Info */}
									<div className="flex items-center space-x-4">
										<div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xl">
											{getUserInitials()}
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900">
												{user.name &&
												user.name !== user.email
													? user.name
													: "User"}
											</h3>
											<p className="text-gray-600">
												{user.email}
											</p>
											<Badge
												variant="secondary"
												className="mt-1"
											>
												Member since{" "}
												{getAccountCreationDate()}
											</Badge>
										</div>
									</div>

									<Separator />

									{/* Account Details */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-4">
											<div className="flex items-center space-x-3">
												<Mail className="h-5 w-5 text-gray-400" />
												<div>
													<p className="text-sm font-medium text-gray-900">
														Email
													</p>
													<p className="text-sm text-gray-600">
														{user.email}
													</p>
												</div>
											</div>

											<div className="flex items-center space-x-3">
												<Calendar className="h-5 w-5 text-gray-400" />
												<div>
													<p className="text-sm font-medium text-gray-900">
														Account Created
													</p>
													<p className="text-sm text-gray-600">
														{getAccountCreationDate()}
													</p>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<div className="flex items-center space-x-3">
												<Home className="h-5 w-5 text-gray-400" />
												<div>
													<p className="text-sm font-medium text-gray-900">
														Account Status
													</p>
													<Badge
														variant="default"
														className="mt-1"
													>
														<CheckCircle className="mr-1 h-3 w-3" />
														Active
													</Badge>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions */}
						<div className="space-y-6">
							{/* Household Management */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Users className="mr-2 h-5 w-5" />
										Household
									</CardTitle>
									<CardDescription>
										Manage your household information
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{hasCompletedSetup() ? (
										<>
											<div className="flex items-center space-x-2 text-green-600">
												<CheckCircle className="h-4 w-4" />
												<span className="text-sm font-medium">
													Household Setup Complete
												</span>
											</div>
											<Button
												onClick={handleManageHousehold}
												className="w-full"
												variant="outline"
											>
												Manage Household
											</Button>
										</>
									) : (
										<>
											<div className="flex items-center space-x-2 text-amber-600">
												<AlertCircle className="h-4 w-4" />
												<span className="text-sm font-medium">
													Setup Required
												</span>
											</div>
											<Button
												onClick={handleHouseholdSetup}
												className="w-full"
											>
												Set Up Household
											</Button>
										</>
									)}
								</CardContent>
							</Card>

							{/* Account Settings */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Settings className="mr-2 h-5 w-5" />
										Settings
									</CardTitle>
									<CardDescription>
										Account preferences and settings
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										variant="outline"
										className="w-full"
										disabled
									>
										Change Password
									</Button>
									<Button
										variant="outline"
										className="w-full"
										disabled
									>
										Notification Settings
									</Button>
									<Button
										variant="outline"
										className="w-full"
										disabled
									>
										Privacy Settings
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</LoadingCard>
			</div>
		</div>
	);
};

export default AccountPage;

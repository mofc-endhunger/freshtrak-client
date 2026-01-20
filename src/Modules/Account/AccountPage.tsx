import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { AuthGuard } from "../Households/components/AuthGuard";
import { RENDER_URL } from "../../Utils/Urls";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "../../components/ui/tabs";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { HouseholdCompletionPrompt } from "../Households/components/HouseholdCompletionPrompt";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import {
	createUserRecordSingleAttempt,
	isNotFoundError,
} from "../../Utils/UserRecordHelper";
import { StorageService } from "../../Utils/StorageService";
import { LoadingCard } from "../Households/components/LoadingSpinner";
import { UsersMeResponse } from "../Households/types/api.types";
import localization from "../Localization/LocalizationComponent";
import {
	YourReservations,
	PastEventsSection,
} from "../Reservations/components";
import { AccountInfoSection, HouseholdMembersSection } from "./components";

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
	const { user } = useAuth();

	const [showHouseholdPrompt, setShowHouseholdPrompt] = useState(false);
	const [householdData, setHouseholdData] = useState<UsersMeResponse | null>(
		null
	);
	const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
	const [showSkippedSetupPrompt, setShowSkippedSetupPrompt] = useState(false);

	// Initialize API service
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Fetch household data and check for multiple family members
	useEffect(() => {
		const fetchHouseholdData = async () => {
			if (!user?.email) return;

			setIsLoadingHousehold(true);
			try {
				// Get complete household information from /users/me endpoint
				const userInfo = await householdsApiService.getUsersMe();
				setHouseholdData(userInfo);

				// Save household_id to localStorage for later use
				if (userInfo?.id) {
					StorageService.setItem(
						"householdId",
						userInfo.id.toString()
					);
				}

				// Check if household data is incomplete (minimal data suggests setup was skipped)
				const hasMinimalData =
					!userInfo?.address_line_1 ||
					!userInfo?.city ||
					!userInfo?.state ||
					!userInfo?.zip_code;

				if (hasMinimalData) {
					setShowSkippedSetupPrompt(true);
				}
			} catch (error: any) {
				console.warn(
					"AccountPage: Error fetching household data:",
					error
				);

				// Check if this is a "User not found" / 404 error
				if (isNotFoundError(error)) {
					const result = await createUserRecordSingleAttempt(
						householdsApiService,
						user?.name
					);

					if (result.success) {
						// Try fetching again after creation
						try {
							const userInfo =
								await householdsApiService.getUsersMe();
							setHouseholdData(userInfo);

							if (userInfo?.id) {
								StorageService.setItem(
									"householdId",
									userInfo.id.toString()
								);
							}

							// Show setup prompt since this is a recovered user
							setShowSkippedSetupPrompt(true);
							setIsLoadingHousehold(false);
							return;
						} catch (retryError) {
							console.error(
								"Failed to fetch user data after fallback creation:",
								retryError
							);
						}
					}
				}

				// If API call fails and recovery didn't work, show household setup prompt
				setShowHouseholdPrompt(true);
			} finally {
				setIsLoadingHousehold(false);
			}
		};

		fetchHouseholdData();
	}, [user?.email, user?.name, householdsApiService]);

	/**
	 * Navigate to household setup wizard (full page)
	 */
	const navigateToHouseholdSetup = (): void => {
		navigate(`${RENDER_URL.HOUSEHOLD_SETUP_URL}?from=account`);
	};

	/**
	 * Handle household setup
	 */
	const handleHouseholdSetup = (): void => {
		setShowHouseholdPrompt(false);
		navigateToHouseholdSetup();
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

	return (
		<AuthGuard>
			<div className="min-h-screen bg-white py-8">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<Button
								variant="ghost"
								onClick={() => navigate(RENDER_URL.ROOT_URL)}
								className="text-gray-600 hover:text-gray-900"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								{localization.button_back_to_home}
							</Button>
						</div>

						{/* Profile Header Section */}
						<div className="flex flex-col items-center py-8">
							{/* Avatar */}
							<div className="relative">
								<div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xl">
									{getUserInitials()}
								</div>
							</div>

							{/* User Name */}
							<h1 className="font-noto-sans font-bold text-2xl leading-[35px] tracking-normal text-center text-gray-900 mt-4">
								{householdData?.members &&
								householdData.members.length > 0
									? `${householdData.members[0].first_name} ${householdData.members[0].last_name}`
									: user?.name || user?.email}
							</h1>

							{/* Member Type */}
							<p className="font-noto-sans font-normal text-base leading-[22px] tracking-normal text-center text-gray-500 mt-1">
								{householdData?.members &&
								householdData.members.length > 0 &&
								householdData.members[0]
									.is_head_of_household === 1
									? localization.text_head_of_household ||
									  "Head of Household"
									: "Household Member"}
							</p>
						</div>
					</div>

					{/* Tabs Navigation */}
					<Tabs defaultValue="summary" className="w-full">
						<TabsList>
							<TabsTrigger value="summary">
								{localization.tab_summary}
							</TabsTrigger>
							<TabsTrigger value="account">
								{localization.tab_account}
							</TabsTrigger>
						</TabsList>

						{/* Summary Tab Content */}
						<TabsContent value="summary" className="mt-6">
							{/* Upcoming Reservations */}
							<YourReservations />

							{/* Past Events / History */}
							<PastEventsSection />
						</TabsContent>

						{/* Account Tab Content */}
						<TabsContent value="account" className="mt-6">
							{/* Household Completion Prompt */}
							{showHouseholdPrompt && (
								<div className="mb-8">
									<HouseholdCompletionPrompt
										onSetup={handleHouseholdSetup}
										onDismiss={() =>
											setShowHouseholdPrompt(false)
										}
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
														{
															localization.title_complete_household_setup
														}
													</h3>
													<p className="text-orange-700 mb-4">
														{
															localization.description_skipped_setup_prompt
														}
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
															{localization.button_set_up_household ||
																"Set Up Household"}
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
															{
																localization.button_maybe_later
															}
														</Button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							<LoadingCard
								isLoading={isLoadingHousehold}
								operation={localization.account_loading_message}
								className="w-full"
							>
								{/* Two Column Layout */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									{/* Left Column - Your Information */}
									<AccountInfoSection
										householdData={householdData}
									/>

									{/* Right Column - Household Members */}
									<HouseholdMembersSection
										householdData={householdData}
									/>
								</div>
							</LoadingCard>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</AuthGuard>
	);
};

export default AccountPage;

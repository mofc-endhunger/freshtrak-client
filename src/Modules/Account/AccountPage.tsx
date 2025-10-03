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
	ArrowLeft,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { HouseholdCompletionPrompt } from "../Households/components/HouseholdCompletionPrompt";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { LoadingCard } from "../Households/components/LoadingSpinner";
import { UsersMeResponse } from "../Households/types/api.types";
import { calculateAge } from "../Households/utils/householdUtils";
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

	const [showHouseholdPrompt, setShowHouseholdPrompt] = useState(false);
	const [householdData, setHouseholdData] = useState<UsersMeResponse | null>(
		null
	);
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
					localStorage.setItem("householdId", userInfo.id.toString());
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
			} catch (error) {
				console.error("Error fetching household data:", error);
				// If API call fails, assume user needs household setup
				setShowHouseholdPrompt(true);
			} finally {
				setIsLoadingHousehold(false);
			}
		};

		fetchHouseholdData();
	}, [user?.email, householdsApiService]);

	/**
	 * Navigate to household setup wizard (full page)
	 * This is for users who need to complete or update their household setup
	 */
	const navigateToHouseholdSetup = (): void => {
		navigate("/households/setup?from=account");
	};

	/**
	 * Navigate to household setup wizard for updating household
	 * This is for users who already have a household and want to update it
	 */
	const navigateToHouseholdDashboard = (): void => {
		navigate("/households/setup?from=account");
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
					<div className="flex items-center justify-between mb-4">
						<Button
							variant="ghost"
							onClick={() => navigate("/")}
							className="text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Button>
					</div>

					<h1 className="text-3xl font-bold text-gray-900">
						Account Settings
					</h1>
					{householdData?.members &&
						householdData.members.length > 0 && (
							<h2 className="text-xl font-semibold text-highlight mt-2">
								{householdData.members[0].first_name}{" "}
								{householdData.members[0].last_name}
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
							onDismiss={() => setShowHouseholdPrompt(false)}
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

				<LoadingCard
					isLoading={isLoadingHousehold}
					operation={localization.account_loading_message}
					className="w-full"
				>
					<div className="grid grid-cols-1 gap-8">
						{/* Profile Information */}
						<div className="space-y-8">
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
												{householdData?.members &&
													householdData.members
														.length > 0 && (
														<>
															{
																householdData
																	.members[0]
																	.first_name
															}{" "}
															{
																householdData
																	.members[0]
																	.last_name
															}
														</>
													)}
											</h3>
											<p className="text-gray-600">
												{householdData?.email}
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
														{householdData?.email}
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

							{/* Address Information */}
							{householdData && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Home className="mr-2 h-5 w-5" />
											Address Information
										</CardTitle>
										<CardDescription>
											Your household address and contact
											details
										</CardDescription>
									</CardHeader>
									<CardContent>
										{householdData.address_line_1 ||
										householdData.city ||
										householdData.state ||
										householdData.zip_code ||
										householdData.phone ||
										householdData.email ? (
											<div className="space-y-2">
												{householdData.address_line_1 && (
													<div className="flex items-center">
														<span className="text-sm font-medium text-gray-700 w-24">
															Address:
														</span>
														<span className="text-sm text-gray-900">
															{
																householdData.address_line_1
															}
															{householdData.address_line_2 &&
																`, ${householdData.address_line_2}`}
														</span>
													</div>
												)}
												{(householdData.city ||
													householdData.state ||
													householdData.zip_code) && (
													<div className="flex items-center">
														<span className="text-sm font-medium text-gray-700 w-24">
															Location:
														</span>
														<span className="text-sm text-gray-900">
															{[
																householdData.city,
																householdData.state,
																householdData.zip_code,
															]
																.filter(Boolean)
																.join(", ")}
														</span>
													</div>
												)}
												{householdData.phone && (
													<div className="flex items-center">
														<span className="text-sm font-medium text-gray-700 w-24">
															Phone:
														</span>
														<span className="text-sm text-gray-900">
															{
																householdData.phone
															}
														</span>
													</div>
												)}
												{householdData.email && (
													<div className="flex items-center">
														<span className="text-sm font-medium text-gray-700 w-24">
															Email:
														</span>
														<span className="text-sm text-gray-900">
															{
																householdData.email
															}
														</span>
													</div>
												)}
											</div>
										) : (
											<div className="text-center py-4">
												<AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
												<p className="text-sm text-gray-500 mb-3">
													No address information
													available
												</p>
												<Button
													onClick={() =>
														navigateToHouseholdSetup()
													}
													variant="outline"
													size="sm"
												>
													<Home className="mr-2 h-4 w-4" />
													Add Address Information
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{/* Household Members */}
							{householdData?.members &&
								householdData.members.length > 0 && (
									<Card>
										<CardHeader>
											<div className="flex items-center justify-between">
												<div>
													<CardTitle className="flex items-center">
														<Users className="mr-2 h-5 w-5" />
														Household Members
													</CardTitle>
													<CardDescription>
														Family members in your
														household
													</CardDescription>
												</div>
												<Button
													onClick={() =>
														navigateToHouseholdDashboard()
													}
													variant="outline"
													size="sm"
												>
													<Home className="mr-2 h-4 w-4" />
													Update Household
												</Button>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											{householdData.members
												.sort((a: any, b: any) => {
													// Sort head of household first
													if (
														a.is_head_of_household ===
															1 &&
														b.is_head_of_household !==
															1
													)
														return -1;
													if (
														a.is_head_of_household !==
															1 &&
														b.is_head_of_household ===
															1
													)
														return 1;
													return 0;
												})
												.map(
													(
														member: any,
														index: number
													) => (
														<Card
															key={member.id}
															className={`${
																member.is_head_of_household ===
																1
																	? "border-l-4 border-l-blue-500"
																	: ""
															}`}
														>
															<CardContent>
																<div className="space-y-3">
																	{/* Member Name and Status */}
																	<div className="flex items-center justify-between">
																		<div>
																			<h4 className="font-semibold text-gray-900">
																				{
																					member.first_name
																				}
																				{member.middle_name &&
																					` ${member.middle_name}`}
																				{` ${member.last_name}`}
																				{member.suffix &&
																					` ${member.suffix}`}
																				{member.is_head_of_household ===
																					1 && (
																					<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
																						Head
																						of
																						Household
																					</span>
																				)}
																			</h4>
																			{member.status ===
																				"inactive" && (
																				<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
																					Inactive
																				</span>
																			)}
																		</div>
																	</div>

																	{/* Member Details */}
																	<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
																		{member.date_of_birth &&
																			member.date_of_birth !==
																				"1900-01-01" && (
																				<div className="flex items-center">
																					<span className="text-gray-600 w-20">
																						Age:
																					</span>
																					<span className="text-gray-900">
																						{
																							calculateAge(
																								member.date_of_birth
																							)
																								.years
																						}
																					</span>
																				</div>
																			)}
																		{member.gender && (
																			<div className="flex items-center">
																				<span className="text-gray-600 w-20">
																					Gender:
																				</span>
																				<span className="text-gray-900 capitalize">
																					{
																						member.gender
																					}
																				</span>
																			</div>
																		)}
																		{member.phone && (
																			<div className="flex items-center">
																				<span className="text-gray-600 w-20">
																					Phone:
																				</span>
																				<span className="text-gray-900">
																					{
																						member.phone
																					}
																				</span>
																			</div>
																		)}
																		{member.email && (
																			<div className="flex items-center">
																				<span className="text-gray-600 w-20">
																					Email:
																				</span>
																				<span className="text-gray-900">
																					{
																						member.email
																					}
																				</span>
																			</div>
																		)}
																		{member.preferred_language && (
																			<div className="flex items-center">
																				<span className="text-gray-600 w-20">
																					Language:
																				</span>
																				<span className="text-gray-900 capitalize">
																					{
																						member.preferred_language
																					}
																				</span>
																			</div>
																		)}
																		{member.is_freshtrak_user && (
																			<div className="flex items-center">
																				<span className="text-gray-600 w-20">
																					Status:
																				</span>
																				<span className="text-green-600 font-medium">
																					FreshTrak
																					User
																				</span>
																			</div>
																		)}
																	</div>

																	{/* Notes */}
																	{member.notes && (
																		<div className="text-sm">
																			<span className="text-gray-600">
																				Notes:{" "}
																			</span>
																			<span className="text-gray-900">
																				{
																					member.notes
																				}
																			</span>
																		</div>
																	)}
																</div>
															</CardContent>
														</Card>
													)
												)}
										</CardContent>
									</Card>
								)}
						</div>
					</div>
				</LoadingCard>
			</div>
		</div>
	);
};

export default AccountPage;

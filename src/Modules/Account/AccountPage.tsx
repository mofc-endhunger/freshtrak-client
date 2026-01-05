import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { AuthGuard } from "../Households/components/AuthGuard";
import { RENDER_URL } from "../../Utils/Urls";
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
	MapPin,
	Phone,
	Globe,
} from "lucide-react";
import { HouseholdCompletionPrompt } from "../Households/components/HouseholdCompletionPrompt";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import {
	createUserRecordSingleAttempt,
	isNotFoundError,
} from "../../Utils/UserRecordHelper";
import { StorageService } from "../../Utils/StorageService";
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
	const { user } = useAuth();

	const [showHouseholdPrompt, setShowHouseholdPrompt] = useState(false);
	const [householdData, setHouseholdData] = useState<UsersMeResponse | null>(
		null
	);
	const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
	const [showSkippedSetupPrompt, setShowSkippedSetupPrompt] = useState(false);

	// Initialize API service
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// AuthGuard handles authentication, no need for manual redirect

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
					StorageService.setItem("householdId", userInfo.id.toString());
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
				// This means user exists in Cognito but not in backend - try to create
				if (isNotFoundError(error)) {
					console.log(
						"User not found in backend, attempting fallback creation..."
					);
					const result = await createUserRecordSingleAttempt(
						householdsApiService,
						user?.name,
						user?.email
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
	 * This is for users who need to complete or update their household setup
	 */
	const navigateToHouseholdSetup = (): void => {
		navigate(`${RENDER_URL.HOUSEHOLD_SETUP_URL}?from=account`);
	};

	/**
	 * Navigate to household setup wizard for updating household
	 * This is for users who already have a household and want to update it
	 */
	const navigateToHouseholdDashboard = (): void => {
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

	const getAccountCreationDate = (): string => {
		if (!user?.accountCreatedDate) {
			return localization.text_not_available || "Not available";
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
			return localization.text_invalid_date || "Invalid date";
		}
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

						<h1 className="text-3xl font-bold text-gray-900">
							{localization.title_account_settings}
						</h1>
						{householdData?.members &&
							householdData.members.length > 0 && (
								<h2 className="text-xl font-semibold text-highlight mt-2">
									{householdData.members[0].first_name}{" "}
									{householdData.members[0].last_name}
								</h2>
							)}
						<p className="text-gray-600 mt-2">
							{localization.description_manage_account_household}
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
						<div className="grid grid-cols-1 gap-8">
							{/* Profile Information */}
							<div className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<User className="mr-2 h-5 w-5" />
											{
												localization.title_profile_information
											}
										</CardTitle>
										<CardDescription>
											{
												localization.description_personal_account_details
											}
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
													{
														localization.text_member_since
													}{" "}
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
															{
																localization.label_email
															}
														</p>
														<p className="text-sm text-gray-600">
															{
																householdData?.email
															}
														</p>
													</div>
												</div>

												<div className="flex items-center space-x-3">
													<Calendar className="h-5 w-5 text-gray-400" />
													<div>
														<p className="text-sm font-medium text-gray-900">
															{
																localization.label_account_created
															}
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
															{localization.label_account_status ||
																"Account Status"}
														</p>
														<Badge
															variant="default"
															className="mt-1"
														>
															<CheckCircle className="mr-1 h-3 w-3" />
															{
																localization.status_active
															}
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
												{localization.header_address_information ||
													"Address Information"}
											</CardTitle>
											<CardDescription>
												{localization.description_household_address_contact ||
													"Your household address and contact details"}
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-6">
											{householdData.address_line_1 ||
											householdData.city ||
											householdData.state ||
											householdData.zip_code ||
											householdData.phone ||
											householdData.email ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													{householdData.address_line_1 && (
														<div className="flex items-center space-x-3">
															<MapPin className="h-5 w-5 text-gray-400" />
															<div>
																<p className="text-sm font-medium text-gray-900">
																	{localization.label_address_colon ||
																		localization.label_address +
																			":"}
																</p>
																<p className="text-sm text-gray-600">
																	{
																		householdData.address_line_1
																	}
																	{householdData.address_line_2 &&
																		`, ${householdData.address_line_2}`}
																</p>
															</div>
														</div>
													)}
													{(householdData.city ||
														householdData.state ||
														householdData.zip_code) && (
														<div className="flex items-center space-x-3">
															<MapPin className="h-5 w-5 text-gray-400" />
															<div>
																<p className="text-sm font-medium text-gray-900">
																	{localization.label_location ||
																		"Location:"}
																</p>
																<p className="text-sm text-gray-600">
																	{[
																		householdData.city,
																		householdData.state,
																		householdData.zip_code,
																	]
																		.filter(
																			Boolean
																		)
																		.join(
																			", "
																		)}
																</p>
															</div>
														</div>
													)}
													{householdData.phone && (
														<div className="flex items-center space-x-3">
															<Phone className="h-5 w-5 text-gray-400" />
															<div>
																<p className="text-sm font-medium text-gray-900">
																	{localization.label_phone_colon ||
																		localization.label_phone_number +
																			":"}
																</p>
																<p className="text-sm text-gray-600">
																	{
																		householdData.phone
																	}
																</p>
															</div>
														</div>
													)}
													{householdData.email && (
														<div className="flex items-center space-x-3">
															<Mail className="h-5 w-5 text-gray-400" />
															<div>
																<p className="text-sm font-medium text-gray-900">
																	{localization.label_email_colon ||
																		localization.label_email +
																			":"}
																</p>
																<p className="text-sm text-gray-600">
																	{
																		householdData.email
																	}
																</p>
															</div>
														</div>
													)}
												</div>
											) : (
												<div className="text-center py-4">
													<AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
													<p className="text-sm text-gray-500 mb-3">
														{localization.text_no_address_information_available ||
															"No address information available"}
													</p>
													<Button
														onClick={() =>
															navigateToHouseholdSetup()
														}
														variant="outline"
														size="sm"
													>
														<Home className="mr-2 h-4 w-4" />
														{localization.button_add_address_information ||
															"Add Address Information"}
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
												<CardTitle className="flex items-center">
													<Users className="mr-2 h-5 w-5" />
													{localization.title_household_members ||
														"Household Members"}
												</CardTitle>
												<CardDescription>
													{localization.description_family_members_household ||
														"Family members in your household"}
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-6">
												<div className="flex justify-center md:justify-end mb-4">
													<Button
														onClick={() =>
															navigateToHouseholdDashboard()
														}
														variant="outline"
														size="sm"
													>
														<Home className="mr-2 h-4 w-4" />
														{localization.button_update_household ||
															"Update Household"}
													</Button>
												</div>
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
																<CardContent className="space-y-6">
																	{/* Member Name and Status */}
																	<div className="flex items-center justify-between">
																		<div className="flex items-center flex-col md:flex-row">
																			<h4 className="text-lg font-semibold text-gray-900">
																				{
																					member.first_name
																				}
																				{member.middle_name &&
																					` ${member.middle_name}`}
																				{` ${member.last_name}`}
																				{member.suffix &&
																					` ${member.suffix}`}
																			</h4>
																			{member.is_head_of_household ===
																				1 && (
																				<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
																					{localization.text_head_of_household ||
																						"Head of Household"}
																				</span>
																			)}
																			{member.status ===
																				"inactive" && (
																				<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">
																					{
																						localization.status_inactive
																					}
																				</span>
																			)}
																		</div>
																	</div>

																	<Separator />

																	{/* Member Details */}
																	<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
																		{member.date_of_birth &&
																			member.date_of_birth !==
																				"1900-01-01" && (
																				<div className="flex items-center space-x-3">
																					<Calendar className="h-5 w-5 text-gray-400" />
																					<div>
																						<p className="text-sm font-medium text-gray-900">
																							{localization.label_age ||
																								"Age:"}
																						</p>
																						<p className="text-sm text-gray-600">
																							{
																								calculateAge(
																									member.date_of_birth
																								)
																									.years
																							}
																						</p>
																					</div>
																				</div>
																			)}
																		{member.gender && (
																			<div className="flex items-center space-x-3">
																				<User className="h-5 w-5 text-gray-400" />
																				<div>
																					<p className="text-sm font-medium text-gray-900">
																						{localization.label_gender_colon ||
																							localization.label_gender +
																								":"}
																					</p>
																					<p className="text-sm text-gray-600 capitalize">
																						{
																							member.gender
																						}
																					</p>
																				</div>
																			</div>
																		)}
																		{member.phone && (
																			<div className="flex items-center space-x-3">
																				<Phone className="h-5 w-5 text-gray-400" />
																				<div>
																					<p className="text-sm font-medium text-gray-900">
																						{localization.label_phone_colon ||
																							localization.label_phone_number +
																								":"}
																					</p>
																					<p className="text-sm text-gray-600">
																						{
																							member.phone
																						}
																					</p>
																				</div>
																			</div>
																		)}
																		{member.email && (
																			<div className="flex items-center space-x-3">
																				<Mail className="h-5 w-5 text-gray-400" />
																				<div>
																					<p className="text-sm font-medium text-gray-900">
																						{localization.label_email_colon ||
																							localization.label_email +
																								":"}
																					</p>
																					<p className="text-sm text-gray-600">
																						{
																							member.email
																						}
																					</p>
																				</div>
																			</div>
																		)}
																		{member.preferred_language && (
																			<div className="flex items-center space-x-3">
																				<Globe className="h-5 w-5 text-gray-400" />
																				<div>
																					<p className="text-sm font-medium text-gray-900">
																						{localization.label_language_colon ||
																							localization.label_language +
																								":"}
																					</p>
																					<p className="text-sm text-gray-600 capitalize">
																						{
																							member.preferred_language
																						}
																					</p>
																				</div>
																			</div>
																		)}
																		{member.is_freshtrak_user && (
																			<div className="flex items-center space-x-3">
																				<CheckCircle className="h-5 w-5 text-gray-400" />
																				<div>
																					<p className="text-sm font-medium text-gray-900">
																						{localization.label_status_colon ||
																							"Status:"}
																					</p>
																					<p className="text-sm text-green-600 font-medium">
																						{localization.text_freshtrak_user ||
																							"FreshTrak User"}
																					</p>
																				</div>
																			</div>
																		)}
																	</div>

																	{/* Notes */}
																	{member.notes && (
																		<div className="text-sm">
																			<span className="text-gray-600">
																				{localization.label_notes_colon ||
																					localization.label_notes +
																						": "}
																			</span>
																			<span className="text-gray-900">
																				{
																					member.notes
																				}
																			</span>
																		</div>
																	)}
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
		</AuthGuard>
	);
};

export default AccountPage;

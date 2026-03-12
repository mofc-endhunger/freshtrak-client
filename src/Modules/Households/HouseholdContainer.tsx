/**
 * HouseholdContainer - Dashboard component for household management
 *
 * This component provides the main dashboard interface for household management including:
 * - Household dashboard with overview and statistics
 * - Member management and household information display
 * - Integration with authentication and API services
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { RENDER_URL } from "../../Utils/Urls";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import HouseholdRegistrationComponent from "./components/HouseholdRegistrationComponent";
import { Button } from "../../components/ui/button";
import { getGenderId } from "./utils/householdUtils";
import { getLanguageOptionByCode, getLanguageOptionById } from "../Localization/languageOptions";
import { setLanguage } from "../Localization/localizationUtils";
import { setCurrentLanguage } from "../../Store/languageSlice";
import { useDispatch } from "react-redux";
import { storeHouseholdToLocalStorage } from "../../Utils/UserRecordHelper";
import { StorageService } from "../../Utils/StorageService";
import LoadingSpinner from "../General/LoadingSpinner";

interface HouseholdContainerProps {
	className?: string;
}

export const HouseholdContainer: React.FC<HouseholdContainerProps> = ({
	className = "",
}) => {
	const { user, isAuthenticated } = useAuth();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showSetupWizard, setShowSetupWizard] = useState(false);

	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Load household data and handle setup wizard
	useEffect(() => {
		const loadHouseholdData = async () => {
			if (!isAuthenticated || !user) {
				setIsLoading(false);
				return;
			}

			// Check if this is the setup route
			const isSetupRoute =
				window.location.pathname === RENDER_URL.HOUSEHOLD_SETUP_URL;
			if (isSetupRoute) {
				// Check if user came from account page (update existing) or initial setup (create new)
				const fromAccount = searchParams.get("from") === "account";

				if (fromAccount) {
					// User came from account page, show setup wizard for updates
					setShowSetupWizard(true);
					setIsLoading(false);
					return;
				} else {
					// User came from email confirmation, need to create household first
					try {
						// Create initial household with basic info
						const initialHouseholdData = {
							primary_first_name: user.name?.split(" ")[0] || "",
							primary_last_name:
								user.name?.split(" ").slice(1).join(" ") || "",
							primary_email: user.email || "",
							address_line_1: "",
							address_line_2: "",
							city: "",
							state: "",
							zip_code: "",
							primary_date_of_birth: "",
							permission_to_email: true,
							language_id: 1, // English id in backend language table
							adult_count: 0,
							child_count: 0,
							senior_count: 0,
						};

						const response =
							await householdsApiService.createHousehold(
								initialHouseholdData
							);

						// Store household data using centralized helper
						storeHouseholdToLocalStorage(response);

						// Now show setup wizard for additional details
						setShowSetupWizard(true);
					} catch (error: any) {
						console.error(
							"Error creating initial household:",
							error
						);
						setError(error.message || "Failed to create household");
					} finally {
						setIsLoading(false);
					}
					return;
				}
			}

			// Not on setup route; no dashboard to show, redirect will happen
			setIsLoading(false);
		};

		loadHouseholdData();
	}, [isAuthenticated, user, householdsApiService, searchParams]);

	// Handle setup completion
	const handleSetupComplete = async (registrationData: any) => {
		try {
			setIsLoading(true);
			setError(null);

			// Always update existing household (household was created when setup wizard was shown)
			const currentHouseholdData =
				await householdsApiService.getUsersMe();

			// Update only the fields that were changed, keeping the rest from current data
			// Exclude updated_at, language_id, preferred_language (API expects language_id only, not code)
			const { updated_at, language_id: _currentLangId, preferred_language: _omitLangCode, ...currentDataWithoutTimestamp } =
				currentHouseholdData;
			const langCode = registrationData.preferred_language || currentHouseholdData.preferred_language || "en";
			const languageOption = getLanguageOptionByCode(langCode);
			const languageId = languageOption?.id ?? (_currentLangId !== undefined && _currentLangId !== null ? _currentLangId : undefined);
			const updateData = {
				...currentDataWithoutTimestamp,
				address_line_1: registrationData.address_line_1 || null,
				address_line_2: registrationData.address_line_2 || null,
				city: registrationData.city || null,
				state: registrationData.state || null,
				zip_code: registrationData.zip_code || null,
				phone: registrationData.phone || null,
				email: registrationData.email || null,
				...(languageId !== undefined && { language_id: languageId }),
				// Contact preferences
				permission_to_text: registrationData.permission_to_text ?? null,
				permission_to_email:
					registrationData.permission_to_email ?? null,
				members: (() => {
					// Start with existing members from /users/me
					const existingMembers = currentHouseholdData.members || [];
					const deletedIds =
						registrationData.deleted_member_ids || [];

					// Filter out deleted members - backend will deactivate omitted members
					const updatedMembers = existingMembers
						.filter((member: any) => {
							const memberId = member.id;
							const isDeleted =
								deletedIds.includes(memberId) ||
								deletedIds.includes(Number(memberId)) ||
								deletedIds.includes(String(memberId));
							return !isDeleted;
						})
						.map((member: any) => ({
							...member,
							gender_id: member.gender_id
								? Number(member.gender_id)
								: null,
							suffix_id: member.suffix_id
								? Number(member.suffix_id)
								: null,
							is_active: 1,
						}));

					if (updatedMembers.length > 0) {
						// Convert registration gender to gender_id if provided
						let genderId: number | null = null;
						if (registrationData.gender) {
							// Normalize gender format for getGenderId
							const normalizeGender = (
								gender: string
							):
								| "male"
								| "female"
								| "other"
								| "prefer_not_to_say" => {
								const normalized = gender.toLowerCase().trim();
								if (normalized === "male") return "male";
								if (normalized === "female") return "female";
								if (normalized === "other") return "other";
								if (
									normalized === "prefer not to say" ||
									normalized === "prefer_not_to_say"
								)
									return "prefer_not_to_say";
								return "prefer_not_to_say";
							};
							const normalizedGender = normalizeGender(
								registrationData.gender
							);
							genderId = getGenderId(normalizedGender);
						}

						// Convert suffix string from form to suffix_id for API
						const suffixToId: Record<string, number> = {
							Jr: 1,
							Sr: 2,
							II: 3,
							III: 4,
							IV: 5,
							V: 6,
						};
						const suffixId = registrationData.suffix
							? suffixToId[registrationData.suffix] ?? null
							: updatedMembers[0].suffix_id
							? Number(updatedMembers[0].suffix_id)
							: null;

						// Update primary member details
						updatedMembers[0] = {
							...updatedMembers[0],
							first_name:
								registrationData.first_name ||
								updatedMembers[0].first_name,
							last_name:
								registrationData.last_name ||
								updatedMembers[0].last_name,
							middle_name:
								registrationData.middle_name ||
								updatedMembers[0].middle_name,
							date_of_birth:
								registrationData.date_of_birth ||
								updatedMembers[0].date_of_birth,
							gender_id:
								genderId !== null
									? genderId
									: updatedMembers[0].gender_id
									? Number(updatedMembers[0].gender_id)
									: null,
							suffix_id: suffixId,
						};
					}

					// Process family members from setup wizard
					// Separate existing members (have ID) from new members (no ID or negative ID)
					const familyMembers = registrationData.family_members || [];

					// Update existing members in updatedMembers array
					familyMembers.forEach((member: any) => {
						// Check if this is an existing member (has positive ID)
						if (member.id && member.id > 0) {
							// Find and update the existing member
							const existingIndex = updatedMembers.findIndex(
								(m: any) => m.id === member.id
							);
							if (existingIndex !== -1) {
								updatedMembers[existingIndex] = {
									...updatedMembers[existingIndex],
									first_name: member.first_name,
									middle_name: member.middle_name || null,
									last_name: member.last_name,
									date_of_birth: member.date_of_birth,
									gender_id: member.gender_id
										? Number(member.gender_id)
										: updatedMembers[existingIndex]
												.gender_id,
									suffix_id: member.suffix_id || null,
								};
							}
						}
					});

					// Add only truly new members (no ID or negative ID)
					const newMembers = familyMembers.filter(
						(member: any) => !member.id || member.id < 0
					);
					const formattedNewMembers = newMembers.map(
						(member: any) => ({
							id: null, // New members get null ID
							household_id: currentHouseholdData.id,
							user_id: null, // New members don't have user_id
							number: null,
							first_name: member.first_name,
							middle_name: member.middle_name || null,
							last_name: member.last_name,
							date_of_birth: member.date_of_birth,
							is_head_of_household: 0,
							is_active: 1,
							added_by: currentHouseholdData.added_by.toString(),
							gender_id: member.gender_id
								? Number(member.gender_id)
								: null,
							suffix_id: member.suffix_id || null,
						})
					);

					return [...updatedMembers, ...formattedNewMembers];
				})(),
				counts: (() => {
					// Use provided counts if available, otherwise calculate from step 3 data
					if (registrationData.household_counts) {
						return registrationData.household_counts;
					}

					// Calculate counts from step 3 data as fallback
					const familyMembers = registrationData.family_members || [];
					// Count only truly new members (no ID or negative ID)
					const newMembersCount = familyMembers.filter(
						(member: any) => !member.id || member.id < 0
					).length;
					const existingMembersCount = (
						currentHouseholdData.members || []
					).length;

					return {
						seniors:
							Number(registrationData.seniors_in_household) || 0,
						adults:
							Number(registrationData.adults_in_household) || 0,
						children:
							Number(registrationData.children_in_household) || 0,
						total: existingMembersCount + newMembersCount,
					};
				})(),
			};

			await householdsApiService.updateHousehold(
				currentHouseholdData.added_by,
				updateData
			);

			// Sync site language with the selected preference
			const savedLangCode = getLanguageOptionById(languageId ?? 0)?.code ?? "en";
			dispatch(setCurrentLanguage(savedLangCode));
			setLanguage(savedLangCode);

			// Set household completion status flag after successful PATCH
			const currentSignUpState = StorageService.getHouseholdSignUpState();
			StorageService.setHouseholdSignUpState({
				hasOfferedSetup: currentSignUpState?.hasOfferedSetup ?? true,
				userChoice: "setup",
				completionStatus: "completed",
				householdId: currentHouseholdData.id,
				lastPromptDate: new Date(),
				isNewUser: false,
				userId: user?.email || null,
			});

			// Redirect back to account page
			navigate(RENDER_URL.ACCOUNT_URL);
		} catch (error: any) {
			console.error("Error updating household:", error);
			setError(error.message || "Failed to update household");
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading state - maintain consistent layout to prevent footer overlap
	// pb-40 accounts for the fixed footer height (~160px)
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-red-600 mb-4">
							Error
						</h2>
						<p className="text-gray-600 mb-4">{error}</p>
						<Button
							onClick={() => window.location.reload()}
							className="w-full"
						>
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Show setup wizard
	if (showSetupWizard) {
		return (
			<HouseholdRegistrationComponent
				onComplete={handleSetupComplete}
				onCancel={() => {
					setShowSetupWizard(false);
					// If user came from Account Settings, redirect back there
					if (searchParams.get("from") === "account") {
						navigate(RENDER_URL.ACCOUNT_URL);
					} else {
						navigate(RENDER_URL.ROOT_URL);
					}
				}}
			/>
		);
	}

	// Dashboard URL is not used; redirect to Account
	return <Navigate to={RENDER_URL.ACCOUNT_URL} replace />;
};

export default HouseholdContainer;

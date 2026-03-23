/**
 * HouseholdRegistrationComponent - Adapted registration flow for household setup
 *
 * This component now uses the unified HouseholdForm component for consistency.
 */

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../Authentication/AuthContext";

// Component imports
import { HouseholdForm } from "../../../components/shared";
import LoadingSpinner from "../../General/LoadingSpinner";

// Service imports
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";

// Type imports
import { RegistrationFormData } from "../../Registration/types/registration.types";
import { ApiHouseholdMember } from "../types/api.types";
import {
	getGenderFromId,
	getSuffixFromId,
	getAdditionalMemberCounts,
} from "../utils/householdUtils";
import {
	getLanguageCodes,
	getLanguageOptionById,
} from "../../Localization/languageOptions";
import localization from "../../Localization/LocalizationComponent";

interface HouseholdRegistrationComponentProps {
	onComplete: (data: RegistrationFormData) => Promise<void>;
	onCancel: () => void;
}

const HouseholdRegistrationComponent: React.FC<
	HouseholdRegistrationComponentProps
> = ({ onComplete, onCancel }) => {
	const { user: authUser } = useAuth();

	// Memoized API service instance
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Component state
	const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
	const [prefilledData, setPrefilledData] = useState<
		Partial<RegistrationFormData>
	>({});
	const [currentHouseholdMembers, setCurrentHouseholdMembers] = useState<
		ApiHouseholdMember[]
	>([]);
	const [deletedMemberIds, setDeletedMemberIds] = useState<number[]>([]);

	// Utility function to convert date from yyyy-mm-dd to mm/dd/yyyy
	const convertDateFormat = (dateString: string): string => {
		if (!dateString || dateString === "1900-01-01") {
			return "";
		}

		try {
			const [year, month, day] = dateString.split("-").map(Number);
			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				return "";
			}

			if (
				year < 1900 ||
				year > 2100 ||
				month < 1 ||
				month > 12 ||
				day < 1 ||
				day > 31
			) {
				return "";
			}

			const monthStr = String(month).padStart(2, "0");
			const dayStr = String(day).padStart(2, "0");
			const yearStr = String(year);

			return `${monthStr}/${dayStr}/${yearStr}`;
		} catch (error) {
			return "";
		}
	};

	// Pre-populate form with primary member data from /users/me
	useEffect(() => {
		const fetchUserData = async () => {
			setIsLoadingUserData(true);
			try {
				const userData = await householdsApiService.getUsersMe();

				// Pre-populate primary member data if available
				if (
					userData &&
					userData.members &&
					userData.members.length > 0
				) {
					setCurrentHouseholdMembers(userData.members);
					const primaryMember = userData.members[0];

					// Convert gender_id to form value (lowercase format expected by form)
					const getGenderForForm = (
						genderId: number | null,
					): string => {
						if (!genderId) return "";
						const gender = getGenderFromId(genderId);
						if (!gender) return "";
						const genderMap: Record<string, string> = {
							male: "male",
							female: "female",
							other: "other",
							prefer_not_to_say: "not_specify",
						};
						return genderMap[gender] || "";
					};

					// Compute additional-member counts (excludes HOH from the correct age bucket)
					const additionalCounts = getAdditionalMemberCounts(
						userData.counts || {},
						primaryMember.date_of_birth,
					);

					const preferredLang =
						(userData.preferred_language &&
						getLanguageCodes().includes(userData.preferred_language)
							? userData.preferred_language
							: null) ??
						(typeof userData.language_id === "number"
							? getLanguageOptionById(userData.language_id)?.code
							: undefined) ??
						"en";
					setPrefilledData({
						first_name: primaryMember.first_name || "",
						last_name: primaryMember.last_name || "",
						middle_name: primaryMember.middle_name || "",
						suffix: getSuffixFromId(primaryMember.suffix_id),
						date_of_birth: convertDateFormat(
							primaryMember.date_of_birth || "",
						),
						gender: getGenderForForm(
							primaryMember.gender_id || null,
						),
						preferred_language: preferredLang,
						phone: userData.phone || "",
						email: userData.email || "",
						address_line_1: userData.address_line_1 || "",
						address_line_2: userData.address_line_2 || "",
						city: userData.city || "",
						state: userData.state || "",
						zip_code: userData.zip_code || "",
						// Contact preferences
						permission_to_text:
							userData.permission_to_text ?? false,
						permission_to_email:
							userData.permission_to_email ?? false,
						seniors_in_household: additionalCounts.seniors,
						adults_in_household: additionalCounts.adults,
						children_in_household: additionalCounts.children,
					});
				} else {
					// No members found - set empty prefilled data
					console.error("No members found in user data");
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
				// Still allow the form to proceed even if API fails
			} finally {
				// Always set loading to false to prevent infinite spinner
				setIsLoadingUserData(false);
			}
		};

		fetchUserData();
	}, [householdsApiService]);

	// Pre-populate with auth user data if available
	useEffect(() => {
		if (authUser) {
			const nameParts = authUser.name?.split(" ") || [];
			setPrefilledData((prev) => ({
				...prev,
				first_name: nameParts[0] || "",
				last_name: nameParts.slice(1).join(" ") || "",
				email: authUser.email || "",
				permission_to_email: true,
			}));
		}
	}, [authUser]);

	// Handle member deletion
	const handleDeleteMember = (memberId: number): void => {
		setDeletedMemberIds((prev) => [...prev, memberId]);
	};

	// Loading state
	if (isLoadingUserData) {
		return <LoadingSpinner />;
	}

	return (
		<HouseholdForm
			mode="householdSetup"
			onSubmit={onComplete}
			onCancel={onCancel}
			prefilledData={prefilledData}
			title={localization.title_set_up_household}
			subtitle={localization.subtitle_complete_household_profile}
			submitButtonText={localization.button_complete_setup}
			cancelButtonText={localization.button_cancel}
			currentHouseholdMembers={currentHouseholdMembers}
			onDeleteMember={handleDeleteMember}
			deletedMemberIds={deletedMemberIds}
		/>
	);
};

export default HouseholdRegistrationComponent;

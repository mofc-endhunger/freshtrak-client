/**
 * HouseholdRegistrationComponent - Adapted registration flow for household setup
 *
 * This component reuses the existing registration flow components but adapts them
 * for household setup instead of event registration.
 */

import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Authentication/AuthContext";

// Component imports from existing registration flow
import PrimaryInfoFormComponent from "../../Family/PrimaryInfoFormComponent";
import AddressComponent from "../../Family/AddressComponent";
import ContactInformationComponent from "../../Family/ContactInformationComponent";
import MemberCountFormComponent from "../../Family/MemberCountFormComponent";
import FamilyMemberDetailsStep from "./FamilyMemberDetailsStep";
import LoadingSpinner from "../../General/LoadingSpinner";
import { Button } from "../../../components/ui/button";
import { getGenderId } from "../utils/householdUtils";
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";
import { ApiHouseholdMember } from "../types/api.types";

// Utility imports
import { formatDateForServer } from "../../../Utils/DateFormat";
import localization from "../../Localization/LocalizationComponent";

// Type imports
import {
	RegistrationFormData,
	HouseholdCounts,
} from "../../Registration/types/registration.types";
import { HouseholdMember } from "../types/household.types";

interface HouseholdRegistrationComponentProps {
	onComplete: (data: RegistrationFormData) => void;
	onCancel: () => void;
}

const HouseholdRegistrationComponent: React.FC<
	HouseholdRegistrationComponentProps
> = ({ onComplete, onCancel }) => {
	const { user: authUser } = useAuth();
	const {
		register,
		trigger,
		handleSubmit,
		formState: { errors },
		getValues,
		watch,
		setValue,
	} = useForm<RegistrationFormData>({ mode: "onChange" });

	// Memoized API service instance
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Create a wrapper function for watch to match child component expectations
	const watchField = watch;
	const [formStep, setFormStep] = useState<number>(0);
	const [formValues, setFormValues] = useState<Partial<RegistrationFormData>>(
		{}
	);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [familyMembers, setFamilyMembers] = useState<HouseholdMember[]>([]);
	const [householdCounts, setHouseholdCounts] =
		useState<HouseholdCounts | null>(null);
	const [hasAdditionalMembers, setHasAdditionalMembers] =
		useState<boolean>(false);
	const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);
	const [deletedMemberIds, setDeletedMemberIds] = useState<number[]>([]);
	const [currentHouseholdMembers, setCurrentHouseholdMembers] = useState<
		ApiHouseholdMember[]
	>([]);

	// Utility function to convert date from yyyy-mm-dd to mm/dd/yyyy
	const convertDateFormat = (dateString: string): string => {
		if (!dateString || dateString === "1900-01-01") {
			return "";
		}

		try {
			// Parse date components directly to avoid timezone issues
			const [year, month, day] = dateString.split("-").map(Number);
			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				return "";
			}

			// Validate date components
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
			try {
				const userData = await householdsApiService.getUsersMe();

				// Pre-populate primary member data
				if (userData.members && userData.members.length > 0) {
					setCurrentHouseholdMembers(userData.members);
					const primaryMember = userData.members[0];
					setValue("first_name", primaryMember.first_name || "");
					setValue("last_name", primaryMember.last_name || "");
					setValue("middle_name", primaryMember.middle_name || "");
					setValue(
						"date_of_birth",
						convertDateFormat(primaryMember.date_of_birth || "")
					);
					setValue("phone", userData.phone || "");
					setValue("email", userData.email || "");
					setValue("address_line_1", userData.address_line_1 || "");
					setValue("address_line_2", userData.address_line_2 || "");
					setValue("city", userData.city || "");
					setValue("state", userData.state || "");
					setValue("zip_code", userData.zip_code || "");
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
			} finally {
				setIsLoadingUserData(false);
			}
		};

		fetchUserData();
	}, [setValue, householdsApiService]);

	useEffect(() => {
		// Pre-populate form with auth user data if available
		if (authUser) {
			const nameParts = authUser.name?.split(" ") || [];
			setValue("first_name", nameParts[0] || "");
			setValue("last_name", nameParts.slice(1).join(" ") || "");
			setValue("email", authUser.email || "");
			setValue("permission_to_email", true);
		}
	}, [authUser, setValue]);

	// Handle member deletion
	const handleDeleteMember = (memberId: number): void => {
		setDeletedMemberIds(prev => [...prev, memberId]);
	};

	// Get filtered members (excluding deleted ones)
	const getFilteredMembers = (): ApiHouseholdMember[] => {
		return currentHouseholdMembers.filter(
			member => !deletedMemberIds.includes(member.id)
		);
	};

	const continueHandler = (values: Partial<RegistrationFormData>): void => {
		setFormValues({ ...formValues, ...values });

		// Check if we're moving from step 2 (member count) and user has additional family members
		if (formStep === 2) {
			const seniorCount = values.seniors_in_household || 0;
			const adultCount = values.adults_in_household || 0;
			const childCount = values.children_in_household || 0;

			const hasAdditionalMembers =
				seniorCount > 0 || adultCount > 0 || childCount > 0;
			setHasAdditionalMembers(hasAdditionalMembers);

			if (hasAdditionalMembers) {
				// User has additional family members, add family member details step
				setFormStep(4); // Skip to step 4 (family member details)
				return;
			} else {
				// No additional members, go to contact information (step 3)
				setFormStep(3);
				return;
			}
		}

		// Handle step 3 (contact information) - go to step 5 (final step)
		if (formStep === 3) {
			setFormStep(5);
			return;
		}

		// Default behavior for other steps
		setFormStep(formStep + 1);
	};

	const previousHandler = (): void => {
		// Handle navigation from family member details step (step 4)
		if (formStep === 4) {
			// Go back to member count step (step 2)
			setFormStep(2);
			return;
		}

		// Handle navigation from contact information step (step 5)
		if (formStep === 5) {
			// If we have additional members, go back to family member details (step 4)
			// Otherwise go back to member count step (step 2)
			if (hasAdditionalMembers) {
				setFormStep(4);
			} else {
				setFormStep(2);
			}
			return;
		}

		// Default behavior for other steps
		setFormStep(formStep - 1);
	};

	const handleFamilyMembersComplete = (
		members: HouseholdMember[],
		counts: HouseholdCounts
	): void => {
		setFamilyMembers(members);
		setHouseholdCounts(counts);
		setFormStep(5); // Move to contact information step
	};

	const handleFamilyMembersSkip = (counts: HouseholdCounts): void => {
		setHouseholdCounts(counts);
		setFormStep(5); // Move to contact information step
	};

	const previousButton = (): JSX.Element => {
		return (
			<Button
				type="button"
				onClick={previousHandler}
				variant="highlight"
				data-testid="previous button"
			>
				Previous
			</Button>
		);
	};

	const cancelButton = (): JSX.Element => {
		return (
			<Button
				type="button"
				variant="highlightOutline"
				onClick={onCancel}
				// className="text-gray-600 hover:text-gray-900"
			>
				Cancel
			</Button>
		);
	};

	const onSubmit = async (data: RegistrationFormData): Promise<void> => {
		setIsSubmitting(true);
		try {
			// Format date for server
			if (data.date_of_birth) {
				data.date_of_birth = formatDateForServer(data.date_of_birth);
			}

			// Add family members and counts to the data
			if (familyMembers.length > 0) {
				data.family_members = familyMembers.map(member => ({
					first_name: member.first_name,
					last_name: member.last_name,
					middle_name: member.middle_name,
					gender_id: getGenderId(
						member.gender || "prefer_not_to_say"
					),
					date_of_birth: member.date_of_birth || "",
					suffix_id: member.suffix
						? getSuffixId(member.suffix)
						: undefined,
				}));
			}

			if (householdCounts) {
				data.household_counts = householdCounts;
			}

			// Add deleted member IDs
			data.deleted_member_ids = deletedMemberIds;

			// Call the completion handler with the collected data
			onComplete(data);
		} catch (error) {
			console.error("Error submitting household registration:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getSuffixId = (suffix: string): number => {
		const suffixMap: { [key: string]: number } = {
			"Jr.": 1,
			"Sr.": 2,
			II: 3,
			III: 4,
			IV: 5,
		};
		return suffixMap[suffix] || 0;
	};

	const renderFormStep = (): JSX.Element => {
		switch (formStep) {
			case 0:
				return (
					<PrimaryInfoFormComponent
						register={register}
						errors={errors}
						watch={watchField}
						continueHandler={continueHandler}
						getValues={getValues}
						trigger={trigger}
						setValue={setValue}
						isHouseholdSetup
					/>
				);
			case 1:
				return (
					<AddressComponent
						register={register}
						errors={errors}
						watch={watchField}
						setValue={setValue}
					/>
				);
			case 2:
				return (
					<div className="space-y-6">
						{/* Current Household Members */}
						{currentHouseholdMembers.length > 1 && (
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Current Household Members
								</h3>
								<div className="space-y-2">
									{getFilteredMembers().map(
										(member, index) => (
											<div
												key={member.id}
												className="flex items-center justify-between bg-white p-3 rounded border"
											>
												<div className="flex items-center space-x-3">
													<div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
														{index + 1}
													</div>
													<div>
														<p className="font-medium text-gray-900">
															{member.first_name}{" "}
															{member.last_name}
															{member.is_head_of_household ===
																1 && (
																<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
																	Head of
																	Household
																</span>
															)}
														</p>
														{member.date_of_birth &&
															member.date_of_birth !==
																"1900-01-01" && (
																<p className="text-sm text-gray-600">
																	Born:{" "}
																	{new Date(
																		member.date_of_birth
																	).toLocaleDateString()}
																</p>
															)}
													</div>
												</div>
												{member.is_head_of_household !==
													1 && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															handleDeleteMember(
																member.id
															)
														}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														Remove
													</Button>
												)}
											</div>
										)
									)}
								</div>
							</div>
						)}

						{/* Member Count Form */}
						<MemberCountFormComponent
							register={register}
							errors={errors}
							watch={watchField}
							setValue={setValue}
							event={{}}
						/>
					</div>
				);
			case 3:
				return (
					<ContactInformationComponent
						register={register}
						errors={errors}
						watch={watchField}
						setValue={setValue}
						getValues={getValues}
					/>
				);
			case 4:
				// Generate mock members based on counts for the FamilyMemberCompletionForm
				const mockMembers: HouseholdMember[] = [];
				let memberId = 1;

				// Add children
				for (
					let i = 0;
					i < (formValues.children_in_household || 0);
					i++
				) {
					mockMembers.push({
						id: memberId++,
						household_id: 0,
						is_primary: false,
						first_name: "",
						last_name: "",
						middle_name: "",
						suffix: "",
						gender: undefined,
						race: undefined,
						ethnicity: undefined,
						phone: "",
						email: "",
						address_line_1: "",
						address_line_2: "",
						city: "",
						state: "",
						zip_code: "",
						date_of_birth: "",
						status: "active",
						is_freshtrak_user: false,
						preferred_language: "en",
						notes: "",
						is_active: true,
						head_of_household: false,
					});
				}

				// Add adults
				for (
					let i = 0;
					i < (formValues.adults_in_household || 0);
					i++
				) {
					mockMembers.push({
						id: memberId++,
						household_id: 0,
						is_primary: false,
						first_name: "",
						last_name: "",
						middle_name: "",
						suffix: "",
						gender: undefined,
						race: undefined,
						ethnicity: undefined,
						phone: "",
						email: "",
						address_line_1: "",
						address_line_2: "",
						city: "",
						state: "",
						zip_code: "",
						date_of_birth: "",
						status: "active",
						is_freshtrak_user: false,
						preferred_language: "en",
						notes: "",
						is_active: true,
						head_of_household: false,
					});
				}

				// Add seniors
				for (
					let i = 0;
					i < (formValues.seniors_in_household || 0);
					i++
				) {
					mockMembers.push({
						id: memberId++,
						household_id: 0,
						is_primary: false,
						first_name: "",
						last_name: "",
						middle_name: "",
						suffix: "",
						gender: undefined,
						race: undefined,
						ethnicity: undefined,
						phone: "",
						email: "",
						address_line_1: "",
						address_line_2: "",
						city: "",
						state: "",
						zip_code: "",
						date_of_birth: "",
						status: "active",
						is_freshtrak_user: false,
						preferred_language: "en",
						notes: "",
						is_active: true,
						head_of_household: false,
					});
				}

				// Create original counts from step 3 data
				const originalCounts = {
					seniors: Number(formValues.seniors_in_household) || 0,
					adults: Number(formValues.adults_in_household) || 0,
					children: Number(formValues.children_in_household) || 0,
					total:
						Number(formValues.seniors_in_household) ||
						0 + Number(formValues.adults_in_household) ||
						0 + Number(formValues.children_in_household) ||
						0,
				};

				return (
					<FamilyMemberDetailsStep
						members={mockMembers}
						householdId={0} // Temporary ID
						originalCounts={originalCounts}
						onComplete={(membersData, counts) => {
							handleFamilyMembersComplete(membersData, counts);
						}}
						onSkip={counts => {
							handleFamilyMembersSkip(counts);
						}}
						onCancel={previousHandler}
					/>
				);
			case 5:
				return (
					<ContactInformationComponent
						register={register}
						errors={errors}
						watch={watchField}
						setValue={setValue}
						getValues={getValues}
					/>
				);
			default:
				return <div>Invalid step</div>;
		}
	};

	if (isSubmitting || isLoadingUserData) {
		return <LoadingSpinner />;
	}

	return (
		<Fragment>
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-center mb-4">
							{localization.register_who_are_you ||
								"Set Up Your Household"}
						</h1>
						<p className="text-center text-gray-600">
							{localization.home_header_component ||
								"Complete your household profile to get personalized services"}
						</p>
					</div>

					{/* Custom Progress Timeline */}
					<div className="mb-8">
						<div className="flex justify-center items-center space-x-2 py-4">
							{(() => {
								const steps = [
									"Your Details",
									"Your Address Details",
									"Your Family Details",
									"Contact Information",
								];

								// Add family member details step if there are additional members
								if (hasAdditionalMembers) {
									steps.splice(3, 0, "Family Member Details");
								}

								return steps.map((step, index) => (
									<div
										key={index}
										className="flex items-center"
									>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
												index <= formStep
													? "bg-blue-600 text-white"
													: "bg-gray-200 text-gray-500"
											}`}
										>
											{index + 1}
										</div>
										<span
											className={`ml-2 text-sm font-medium ${
												index <= formStep
													? "text-blue-600"
													: "text-gray-400"
											}`}
										>
											{step}
										</span>
										{index < steps.length - 1 && (
											<div
												className={`w-8 h-0.5 mx-2 ${
													index < formStep
														? "bg-blue-600"
														: "bg-gray-200"
												}`}
											/>
										)}
									</div>
								));
							})()}
						</div>
					</div>

					{/* Form */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							{renderFormStep()}

							{/* Navigation buttons - Previous, Continue/Complete, and Cancel */}
							<div className="flex justify-between mt-8">
								<div>
									{formStep > 0 &&
										formStep !== 4 &&
										previousButton()}
								</div>
								<div className="flex space-x-4">
									{cancelButton()}
									{formStep < 5 && formStep !== 4 && (
										<Button
											type="button"
											onClick={() => {
												const currentValues =
													getValues();
												continueHandler(currentValues);
											}}
											variant="highlight"
											data-testid="continue-button"
										>
											Continue
										</Button>
									)}
									{formStep === 5 && (
										<Button
											type="submit"
											disabled={isSubmitting}
											variant="highlight"
											data-testid="complete-setup-button"
										>
											{isSubmitting
												? "Creating..."
												: "Complete Setup"}
										</Button>
									)}
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default HouseholdRegistrationComponent;

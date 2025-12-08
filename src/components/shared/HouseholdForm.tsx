/**
 * HouseholdForm - Unified component for both registration and household setup
 *
 * This component consolidates the logic from RegistrationComponent and HouseholdRegistrationComponent
 * into a single, reusable component that handles both registration and household setup flows.
 */

import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";

// Component imports
import PrimaryInfoFormComponent from "../../Modules/Family/PrimaryInfoFormComponent";
import AddressComponent from "../../Modules/Family/AddressComponent";
import ContactInformationComponent from "../../Modules/Family/ContactInformationComponent";
import MemberCountFormComponent from "../../Modules/Family/MemberCountFormComponent";
import EventSlotsModalComponent from "../../Modules/Family/EventSlotsModalComponent";
import BackButtonComponent from "../../Modules/General/BackButtonComponent";
import LoadingSpinner from "../../Modules/General/LoadingSpinner";
import FamilyMemberDetailsStep from "../../Modules/Households/components/FamilyMemberDetailsStep";
import { Button } from "../ui/button";

// Utility imports
import { formatDateForServer } from "../../Utils/DateFormat";
import { getGenderId } from "../../Modules/Households/utils/householdUtils";

// Type imports
import {
	RegistrationFormData,
	HouseholdCounts,
} from "../../Modules/Registration/types/registration.types";
import { HouseholdMember } from "../../Modules/Households/types/household.types";
import {
	HouseholdFormProps,
	HouseholdFormState,
	HouseholdFormStep,
	getRegistrationModeConfig,
	getHouseholdSetupModeConfig,
	DEFAULT_FORM_STATE,
	FormModeConfig,
} from "./types/household-form.types";
import localization from "../../Modules/Localization/LocalizationComponent";

const HouseholdForm: React.FC<HouseholdFormProps> = ({
	mode,
	onSubmit,
	onCancel,
	prefilledData = {},
	event = {},
	disabled = false,
	title,
	subtitle,
	submitButtonText,
	cancelButtonText,
	currentHouseholdMembers = [],
	onDeleteMember,
	deletedMemberIds = [],
	className = "",
	"data-testid": testId = "household-form",
}) => {
	// Get mode configuration
	const modeConfig: FormModeConfig = useMemo(() => {
		return mode === "registration"
			? getRegistrationModeConfig()
			: getHouseholdSetupModeConfig();
	}, [mode]);

	// Form setup
	const {
		register,
		trigger,
		handleSubmit,
		formState: { errors },
		getValues,
		watch,
		reset,
		setValue,
	} = useForm<RegistrationFormData>({ mode: "onChange" });

	// Create a wrapper function for watch to match child component expectations
	const watchField = watch;

	// Component state
	const [state, setState] = useState<HouseholdFormState>({
		...DEFAULT_FORM_STATE,
		isLoadingUserData: false, // Parent component handles loading state
	});

	// Utility function to convert date to MM / DD / YYYY format
	// Handles both yyyy-mm-dd and mm/dd/yyyy input formats
	const convertDateFormat = (dateString: string): string => {
		if (!dateString || dateString === "1900-01-01") {
			return "";
		}

		try {
			let year: number, month: number, day: number;

			// Check if date is in yyyy-mm-dd format
			if (
				dateString.includes("-") &&
				dateString.split("-").length === 3
			) {
				[year, month, day] = dateString.split("-").map(Number);
			}
			// Check if date is already in mm/dd/yyyy or mm / dd / yyyy format
			else if (dateString.includes("/")) {
				const parts = dateString.split("/").map((part) => part.trim());
				if (parts.length === 3) {
					// Determine format: if first part is > 12, it's yyyy/mm/dd, else mm/dd/yyyy
					if (parseInt(parts[0]) > 12) {
						// yyyy/mm/dd format
						year = parseInt(parts[0]);
						month = parseInt(parts[1]);
						day = parseInt(parts[2]);
					} else {
						// mm/dd/yyyy format
						month = parseInt(parts[0]);
						day = parseInt(parts[1]);
						year = parseInt(parts[2]);
					}
				} else {
					return "";
				}
			} else {
				return "";
			}

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

			// Return in MM / DD / YYYY format (with spaces around slashes)
			return `${monthStr} / ${dayStr} / ${yearStr}`;
		} catch (error) {
			return "";
		}
	};

	// Pre-populate form with prefilled data
	useEffect(() => {
		if (prefilledData && Object.keys(prefilledData).length > 0) {
			const safeData = prefilledData as Partial<RegistrationFormData>;
			const {
				first_name = "",
				middle_name = "",
				last_name = "",
				suffix = "",
				date_of_birth = "",
				gender = "",
				address_line_1 = "",
				address_line_2 = "",
				city = "",
				state = "",
				zip_code = "",
				phone = "",
				permission_to_text = false,
				email = "",
				permission_to_email = false,
				seniors_in_household = 0,
				adults_in_household = 0,
				children_in_household = 0,
			} = safeData;

			reset({
				first_name,
				middle_name,
				last_name,
				suffix,
				date_of_birth: date_of_birth
					? convertDateFormat(date_of_birth)
					: "",
				gender,
				address_line_1,
				address_line_2,
				city,
				state,
				zip_code,
				phone,
				permission_to_text,
				email,
				permission_to_email,
				seniors_in_household,
				adults_in_household,
				children_in_household,
			});
		}
	}, [prefilledData, reset]);

	// Handle member deletion
	const handleDeleteMember = (memberId: number): void => {
		if (onDeleteMember) {
			onDeleteMember(memberId);
		}
	};

	// Get filtered members (excluding deleted ones)
	const getFilteredMembers = () => {
		return currentHouseholdMembers.filter(
			(member: any) => !deletedMemberIds.includes(member.id)
		);
	};

	// Step navigation handlers
	const continueHandler = (values: Partial<RegistrationFormData>): void => {
		setState((prev) => ({
			...prev,
			formValues: { ...prev.formValues, ...values },
		}));

		// Handle different step flows based on mode
		if (mode === "registration") {
			// Registration mode: simple linear flow
			setState((prev) => ({ ...prev, formStep: prev.formStep + 1 }));
		} else {
			// Household setup mode: complex flow with conditional steps
			if (state.formStep === HouseholdFormStep.MEMBER_COUNT) {
				const seniorCount = values.seniors_in_household || 0;
				const adultCount = values.adults_in_household || 0;
				const childCount = values.children_in_household || 0;

				const hasAdditionalMembers =
					seniorCount > 0 || adultCount > 0 || childCount > 0;
				setState((prev) => ({ ...prev, hasAdditionalMembers }));

				if (hasAdditionalMembers) {
					setState((prev) => ({
						...prev,
						formStep: HouseholdFormStep.FAMILY_MEMBER_DETAILS,
					}));
					return;
				} else {
					setState((prev) => ({
						...prev,
						formStep: HouseholdFormStep.CONTACT,
					}));
					return;
				}
			}

			// CONTACT step is the final step in household setup, no need to advance further
			// (The navigation buttons will handle submission at this step)

			// Default behavior for other steps
			setState((prev) => ({ ...prev, formStep: prev.formStep + 1 }));
		}
	};

	const previousHandler = (): void => {
		if (mode === "householdSetup") {
			// Handle navigation from family member details step
			if (state.formStep === HouseholdFormStep.FAMILY_MEMBER_DETAILS) {
				setState((prev) => ({
					...prev,
					formStep: HouseholdFormStep.MEMBER_COUNT,
				}));
				return;
			}

			// Handle navigation from contact information step
			if (state.formStep === HouseholdFormStep.CONTACT) {
				if (state.hasAdditionalMembers) {
					setState((prev) => ({
						...prev,
						formStep: HouseholdFormStep.FAMILY_MEMBER_DETAILS,
					}));
				} else {
					setState((prev) => ({
						...prev,
						formStep: HouseholdFormStep.MEMBER_COUNT,
					}));
				}
				return;
			}
		}

		// Default behavior for other steps
		setState((prev) => ({ ...prev, formStep: prev.formStep - 1 }));
	};

	const handleFamilyMembersComplete = (
		members: HouseholdMember[],
		counts: HouseholdCounts
	): void => {
		setState((prev) => ({
			...prev,
			familyMembers: members,
			householdCounts: counts,
			formStep: HouseholdFormStep.CONTACT,
		}));
	};

	const handleFamilyMembersSkip = (counts: HouseholdCounts): void => {
		setState((prev) => ({
			...prev,
			householdCounts: counts,
			formStep: HouseholdFormStep.CONTACT,
		}));
	};

	// Slot change handler for registration mode
	const handleSlotChange = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	): void => {
		setState((prev) => ({ ...prev, selectedSlotId: e.target.value }));
	};

	// Validation handler for registration mode step 1
	const validateStep1 = async (): Promise<void> => {
		const validatePhone: boolean = !watch("no_phone_number");
		const validateEmail: boolean = !watch("no_email");
		const field_array: (keyof RegistrationFormData)[] = [
			"address_line_1",
			"city",
		];
		if (validatePhone) {
			field_array.push("phone");
		}
		if (validateEmail) {
			field_array.push("email");
		}
		const res: boolean = await trigger(field_array);
		if (res) {
			const values: RegistrationFormData = getValues();
			setState((prev) => ({
				...prev,
				formValues: { ...prev.formValues, ...values },
			}));
			setState((prev) => ({ ...prev, formStep: prev.formStep + 1 }));
		}
	};

	// Form submission handler
	const handleFormSubmit = async (
		data: RegistrationFormData
	): Promise<void> => {
		setState((prev) => ({ ...prev, isSubmitting: true }));
		try {
			// Get all current form values
			const allFormValues = getValues();
			data = { ...state.formValues, ...allFormValues };

			// Add mode-specific data
			if (mode === "registration") {
				data["identification_code"] =
					prefilledData?.["identification_code"] || "";
				data["date_of_birth"] = formatDateForServer(
					data["date_of_birth"]
				);
				data = sanitizeInput(data);
			} else {
				// Household setup mode
				if (data.date_of_birth) {
					data.date_of_birth = formatDateForServer(
						data.date_of_birth
					);
				}

				// Add family members and counts
				if (state.familyMembers.length > 0) {
					data.family_members = state.familyMembers.map((member) => ({
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

				if (state.householdCounts) {
					data.household_counts = state.householdCounts;
				}

				data.deleted_member_ids = deletedMemberIds;
			}

			await onSubmit(data);
		} catch (error) {
			console.warn("Form submission error:", error);
		} finally {
			setState((prev) => ({ ...prev, isSubmitting: false }));
		}
	};

	// Utility functions
	const sanitizeInput = (
		data: RegistrationFormData
	): RegistrationFormData => {
		const keys: (keyof RegistrationFormData)[] = [
			"first_name",
			"middle_name",
			"last_name",
			"date_of_birth",
			"gender",
			"address_line_1",
			"address_line_2",
			"city",
			"state",
			"zip_code",
		];
		keys.forEach((key) => {
			if (data[key] !== undefined) {
				(data as any)[key] = sanitizeString(data[key]);
			}
		});
		return data;
	};

	const sanitizeString = (input: any): string => {
		let modifiedInput = (input ?? "").toString().trim();
		modifiedInput = modifiedInput.replace(/\s\s+/g, " ");
		modifiedInput = modifiedInput.replace(/[^A-Za-z0-9 \-_.@'`]/g, "");
		return modifiedInput;
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

	// Button components
	const PreviousButton = (): JSX.Element => (
		<Button
			type="button"
			onClick={previousHandler}
			variant="highlight"
			className="w-full sm:w-auto sm:min-w-48"
			data-testid="previous button"
		>
			{localization.button_previous}
		</Button>
	);

	const CancelButton = (): JSX.Element => (
		<Button
			type="button"
			variant="highlightOutline"
			onClick={onCancel}
			className="w-full sm:w-auto sm:min-w-48"
		>
			{cancelButtonText || modeConfig.cancelButtonText}
		</Button>
	);

	// Progress indicator component
	const ProgressIndicator = (): JSX.Element => {
		const steps = modeConfig.steps
			.filter((step) => step.isVisible)
			.map((step) => step.title);

		// Add family member details step if there are additional members in household mode
		if (
			mode === "householdSetup" &&
			state.hasAdditionalMembers &&
			!steps.includes(localization.title_family_member_details)
		) {
			steps.splice(3, 0, localization.title_family_member_details);
		}

		const currentStepIndex = state.formStep;
		const totalSteps = steps.length;
		const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

		// Helper function to get abbreviated step title for mobile
		const getAbbreviatedTitle = (title: string): string => {
			const abbreviations: Record<string, string> = {
				"Your Details": "Details",
				"Your Address Details": "Address",
				"Your Family Details": "Family",
				"Contact Information": "Contact",
				"Family Member Details": "Members",
			};
			return abbreviations[title] || title;
		};

		return (
			<div className="mb-8">
				{/* Step X of Y indicator */}
				<div className="text-center mb-4">
					<span className="text-sm font-medium text-gray-600">
						Step {currentStepIndex + 1} of {totalSteps}
					</span>
				</div>

				{/* Progress bar */}
				<div className="mb-6">
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${progressPercentage}%` }}
							role="progressbar"
							aria-valuenow={currentStepIndex + 1}
							aria-valuemin={1}
							aria-valuemax={totalSteps}
							aria-label={`Step ${
								currentStepIndex + 1
							} of ${totalSteps}`}
						/>
					</div>
				</div>

				{/* Step indicators - Vertical on mobile, horizontal on desktop */}
				<div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 py-4">
					{steps.map((step, index) => {
						const isActive = index === currentStepIndex;
						const isCompleted = index < currentStepIndex;

						return (
							<div
								key={index}
								className="flex items-center w-full sm:w-auto"
							>
								{/* Step circle and label - Mobile: full width, Desktop: inline */}
								<div className="flex items-center flex-1 sm:flex-initial">
									<div
										className={`min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ${
											isActive
												? "bg-blue-600 text-white ring-4 ring-blue-200 scale-110"
												: isCompleted
												? "bg-blue-600 text-white"
												: "bg-gray-200 text-gray-500"
										}`}
										role="status"
										aria-current={
											isActive ? "step" : undefined
										}
										aria-label={`Step ${
											index + 1
										}: ${step}`}
									>
										{index + 1}
									</div>
									<span
										className={`ml-3 sm:ml-2 text-sm sm:text-sm font-medium flex-1 sm:flex-initial ${
											isActive
												? "text-blue-600 font-semibold"
												: isCompleted
												? "text-blue-600"
												: "text-gray-400"
										}`}
									>
										{/* Show abbreviated on mobile, full on desktop */}
										<span className="sm:hidden">
											{getAbbreviatedTitle(step)}
										</span>
										<span className="hidden sm:inline">
											{step}
										</span>
									</span>
								</div>

								{/* Connector line - Hidden on mobile, shown on desktop */}
								{index < steps.length - 1 && (
									<div
										className={`hidden sm:block w-8 h-0.5 mx-2 transition-colors duration-200 ${
											isCompleted
												? "bg-blue-600"
												: "bg-gray-200"
										}`}
										aria-hidden="true"
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// Render form step based on current step and mode
	const renderFormStep = (): JSX.Element => {
		switch (state.formStep) {
			case HouseholdFormStep.PRIMARY_INFO:
				return (
					<PrimaryInfoFormComponent
						register={register}
						errors={errors}
						watch={watchField}
						continueHandler={continueHandler}
						getValues={getValues}
						trigger={trigger}
						setValue={setValue}
						isHouseholdSetup={mode === "householdSetup"}
					/>
				);

			case HouseholdFormStep.ADDRESS:
				if (mode === "registration") {
					return (
						<Fragment>
							<AddressComponent
								register={register}
								errors={errors}
								watch={watchField}
								setValue={setValue}
							/>
							<ContactInformationComponent
								register={register}
								getValues={getValues}
								errors={errors}
								watch={watchField}
								setValue={setValue}
							/>
							<div className="flex flex-col sm:flex-row gap-4 sm:gap-0 mt-8">
								<PreviousButton />
								<Button
									type="button"
									onClick={validateStep1}
									variant="highlight"
									className="w-full sm:w-auto sm:ml-5 sm:min-w-48"
									data-testid="continue button"
								>
									{localization.button_continue}
								</Button>
							</div>
						</Fragment>
					);
				} else {
					return (
						<AddressComponent
							register={register}
							errors={errors}
							watch={watchField}
							setValue={setValue}
						/>
					);
				}

			case HouseholdFormStep.MEMBER_COUNT:
				if (mode === "householdSetup") {
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
											(member: any, index: number) => (
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
																{
																	member.first_name
																}{" "}
																{
																	member.last_name
																}
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
															{
																localization.button_delete
															}
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
								event={event}
							/>
						</div>
					);
				} else {
					return (
						<MemberCountFormComponent
							register={register}
							event={event}
							watch={watchField}
							setValue={setValue}
							errors={errors}
						/>
					);
				}

			case HouseholdFormStep.CONTACT:
				return (
					<ContactInformationComponent
						register={register}
						errors={errors}
						watch={watchField}
						setValue={setValue}
						getValues={getValues}
					/>
				);

			case HouseholdFormStep.FAMILY_MEMBER_DETAILS:
				// Generate mock members based on counts
				const mockMembers: HouseholdMember[] = [];
				let memberId = 1;

				// Add children
				for (
					let i = 0;
					i < (state.formValues.children_in_household || 0);
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
					i < (state.formValues.adults_in_household || 0);
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
					i < (state.formValues.seniors_in_household || 0);
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

				const originalCounts = {
					seniors: Number(state.formValues.seniors_in_household) || 0,
					adults: Number(state.formValues.adults_in_household) || 0,
					children:
						Number(state.formValues.children_in_household) || 0,
					total:
						(Number(state.formValues.seniors_in_household) || 0) +
						(Number(state.formValues.adults_in_household) || 0) +
						(Number(state.formValues.children_in_household) || 0),
				};

				return (
					<FamilyMemberDetailsStep
						members={mockMembers}
						householdId={0}
						originalCounts={originalCounts}
						onComplete={handleFamilyMembersComplete}
						onSkip={handleFamilyMembersSkip}
						onCancel={previousHandler}
					/>
				);

			default:
				return <div>Invalid step: {state.formStep}</div>;
		}
	};

	// Loading state
	if (state.isSubmitting) {
		return <LoadingSpinner size="large" className="m-auto h-screen" />;
	}

	// Determine if this is the final step
	const isFinalStep =
		mode === "registration"
			? state.formStep === HouseholdFormStep.MEMBER_COUNT
			: state.formStep === HouseholdFormStep.CONTACT; // CONTACT is the final step in household setup

	return (
		<Fragment>
			<div
				className={`container mx-auto px-4 py-8 ${className}`}
				data-testid={testId}
			>
				<div className="max-w-4xl mx-auto my-12">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-center mb-4">
							{title || modeConfig.title}
						</h1>
						<p className="text-center text-gray-600">
							{subtitle || modeConfig.subtitle}
						</p>
					</div>

					{/* Back button for registration mode */}
					{mode === "registration" && state.formStep === 0 && (
						<div className="w-full flex justify-start mb-4">
							<BackButtonComponent />
						</div>
					)}

					{/* Progress Indicator */}
					<ProgressIndicator />

					{/* Event Slots Modal for registration mode */}
					{mode === "registration" && (
						<EventSlotsModalComponent
							event={event}
							selectedSlotId={state.selectedSlotId}
							onSlotChange={handleSlotChange}
						/>
					)}

					{/* Form */}
					<div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
						<form onSubmit={handleSubmit(handleFormSubmit)}>
							{renderFormStep()}

							{/* Navigation buttons - show in household setup mode OR registration mode final step */}
							{(mode === "householdSetup" || isFinalStep) && (
								<div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 mt-8">
									<div className="w-full sm:w-auto">
										{state.formStep > 0 &&
											state.formStep !==
												HouseholdFormStep.FAMILY_MEMBER_DETAILS && (
												<PreviousButton />
											)}
									</div>
									<div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto">
										{mode === "householdSetup" && (
											<CancelButton />
										)}
										{!isFinalStep &&
											state.formStep !==
												HouseholdFormStep.FAMILY_MEMBER_DETAILS && (
												<Button
													type="button"
													onClick={() => {
														const currentValues =
															getValues();
														continueHandler(
															currentValues
														);
													}}
													variant="highlight"
													className="w-full sm:w-auto sm:min-w-48"
													data-testid="continue-button"
												>
													{
														localization.button_continue
													}
												</Button>
											)}
										{isFinalStep && (
											<Button
												type="submit"
												disabled={
													disabled ||
													state.isSubmitting
												}
												variant="highlight"
												className="w-full sm:w-auto sm:min-w-48"
												data-testid="submit-button"
											>
												{state.isSubmitting
													? mode === "registration"
														? localization.button_registering
														: localization.button_creating
													: submitButtonText ||
													  modeConfig.submitButtonText}
											</Button>
										)}
									</div>
								</div>
							)}
						</form>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default HouseholdForm;

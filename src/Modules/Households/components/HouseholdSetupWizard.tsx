/**
 * Household Setup Wizard Component
 * Multi-step wizard for creating and configuring household information
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
	validateDobNative,
	getDateInputConstraints,
} from "../../Family/utils/dateValidation";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import {
	CheckCircle,
	Home,
	Users,
	MapPin,
	Globe,
	ArrowLeft,
	ArrowRight,
	User,
} from "lucide-react";
import { CreateHouseholdApiRequest } from "../types/api.types";
import { useAuth } from "../../Authentication/AuthContext";
import localization from "../../Localization/LocalizationComponent";

interface HouseholdSetupWizardProps {
	onComplete: (householdData: CreateHouseholdApiRequest) => void;
	onCancel: () => void;
	initialData?: Partial<CreateHouseholdApiRequest>;
}

interface WizardStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	completed: boolean;
}

const getWizardSteps = (): WizardStep[] => [
	{
		id: "address",
		title: localization.wizard_step_address_title,
		description: localization.wizard_step_address_description,
		icon: <MapPin className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "household_size",
		title: localization.wizard_step_household_size_title,
		description: localization.wizard_step_household_size_description,
		icon: <Users className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "personal_info",
		title: localization.wizard_step_personal_info_title,
		description: localization.wizard_step_personal_info_description,
		icon: <User className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "demographics",
		title: localization.wizard_step_demographics_title,
		description: localization.wizard_step_demographics_description,
		icon: <Globe className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "contact",
		title: localization.wizard_step_contact_title,
		description: localization.wizard_step_contact_description,
		icon: <CheckCircle className="w-5 h-5" />,
		completed: false,
	},
];

export const HouseholdSetupWizard: React.FC<HouseholdSetupWizardProps> = ({
	onComplete,
	onCancel,
	initialData,
}) => {
	const { user } = useAuth();
	const [searchParams] = useSearchParams();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateHouseholdApiRequest>({
		defaultValues: {
			address_line_1: initialData?.address_line_1 || "",
			address_line_2: initialData?.address_line_2 || "",
			city: initialData?.city || "",
			state: initialData?.state || "",
			zip_code: initialData?.zip_code || "",
			preferred_language: initialData?.preferred_language || "en",
			primary_first_name:
				initialData?.primary_first_name || user?.name || "",
			primary_last_name: initialData?.primary_last_name || "",
			primary_phone: initialData?.primary_phone || "",
			primary_email: initialData?.primary_email || user?.email || "",
			primary_date_of_birth: initialData?.primary_date_of_birth || "",
			// Household size fields
			adult_count: initialData?.adult_count || 1,
			child_count: initialData?.child_count || 0,
			senior_count: initialData?.senior_count || 0,
			// Demographics fields
			primary_gender: initialData?.primary_gender || "",
			primary_race: initialData?.primary_race || "",
			primary_ethnicity: initialData?.primary_ethnicity || "",
		},
		mode: "onChange",
	});

	const watchedValues = watch();

	// Date validation constraints (memoized for performance)
	const dateConstraints = useMemo(() => getDateInputConstraints(), []);

	// Compute step completion status on each render instead of storing in state
	const steps = useMemo(() => {
		return getWizardSteps().map(step => {
			let completed = false;

			switch (step.id) {
				case "address":
					completed = !!(
						watchedValues.address_line_1 &&
						watchedValues.city &&
						watchedValues.state &&
						watchedValues.zip_code
					);
					break;
				case "household_size":
					completed = !!(
						watchedValues.adult_count !== undefined &&
						watchedValues.child_count !== undefined &&
						watchedValues.senior_count !== undefined
					);
					break;
				case "personal_info":
					completed = !!(
						watchedValues.primary_first_name &&
						watchedValues.primary_last_name &&
						watchedValues.primary_date_of_birth
					);
					break;
				case "demographics":
					completed = !!watchedValues.preferred_language;
					break;
				case "contact":
					completed = !!(
						watchedValues.primary_phone &&
						watchedValues.primary_email
					);
					break;
			}

			return { ...step, completed };
		});
	}, [watchedValues]);

	// Handle URL parameters for step navigation
	useEffect(() => {
		const stepParam = searchParams.get("step");
		if (stepParam === "family_details") {
			// Start from family details step (step 3 - demographics)
			setCurrentStep(3);
		}
	}, [searchParams]);

	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const onSubmit = async (data: CreateHouseholdApiRequest) => {
		setIsSubmitting(true);
		try {
			// Pass the household data to the parent component
			// The parent will handle the API call
			onComplete(data);
		} catch (error) {
			console.error("Error preparing household data:", error);
			// Handle error - could show toast notification
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStepContent = () => {
		const currentStepData = steps[currentStep];

		switch (currentStepData.id) {
			case "address":
				return (
					<div className="space-y-4">
						<div>
							<Label htmlFor="address_line_1">
								{localization.label_street_address_required}
							</Label>
							<Input
								id="address_line_1"
								{...register("address_line_1", {
									required: localization.error_street_address_required,
								})}
								placeholder={localization.placeholder_street_address_example}
							/>
							{errors.address_line_1 && (
								<p className="text-sm text-red-600 mt-1">
									{errors.address_line_1.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="address_line_2">
								{localization.label_apartment_suite_optional}
							</Label>
							<Input
								id="address_line_2"
								{...register("address_line_2")}
								placeholder={localization.placeholder_apartment_example}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="city">{localization.label_city_required}</Label>
								<Input
									id="city"
									{...register("city", {
										required: localization.error_city_required,
									})}
									placeholder={localization.placeholder_city_example}
								/>
								{errors.city && (
									<p className="text-sm text-red-600 mt-1">
										{errors.city.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="state">{localization.label_state_required}</Label>
								<Input
									id="state"
									{...register("state", {
										required: localization.error_state_required,
									})}
									placeholder={localization.placeholder_state_code}
								/>
								{errors.state && (
									<p className="text-sm text-red-600 mt-1">
										{errors.state.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="zip_code">{localization.label_zip_code_required}</Label>
							<Input
								id="zip_code"
								{...register("zip_code", {
									required: localization.error_zip_code_required,
								})}
								placeholder={localization.placeholder_enter_zip_code}
							/>
							{errors.zip_code && (
								<p className="text-sm text-red-600 mt-1">
									{errors.zip_code.message}
								</p>
							)}
						</div>
					</div>
				);

			case "household_size":
				return (
					<div className="space-y-6">
						<div className="text-center">
							<p className="text-gray-600 mb-6">
								{localization.description_household_size_question}
							</p>
						</div>

						<div className="grid grid-cols-3 gap-6">
							<div className="text-center">
								<Label
									htmlFor="adult_count"
									className="text-lg font-medium"
								>
									{localization.label_adults_18_64}
								</Label>
								<Input
									id="adult_count"
									type="number"
									min="0"
									max="20"
									{...register("adult_count", {
										required: localization.error_adult_count_required,
										min: {
											value: 0,
											message: localization.error_must_be_zero_or_more,
										},
									})}
									className="text-center text-2xl font-bold mt-2"
								/>
								{errors.adult_count && (
									<p className="text-sm text-red-600 mt-1">
										{errors.adult_count.message}
									</p>
								)}
							</div>

							<div className="text-center">
								<Label
									htmlFor="child_count"
									className="text-lg font-medium"
								>
									{localization.label_children_0_17}
								</Label>
								<Input
									id="child_count"
									type="number"
									min="0"
									max="20"
									{...register("child_count", {
										required: localization.error_child_count_required,
										min: {
											value: 0,
											message: localization.error_must_be_zero_or_more,
										},
									})}
									className="text-center text-2xl font-bold mt-2"
								/>
								{errors.child_count && (
									<p className="text-sm text-red-600 mt-1">
										{errors.child_count.message}
									</p>
								)}
							</div>

							<div className="text-center">
								<Label
									htmlFor="senior_count"
									className="text-lg font-medium"
								>
									{localization.label_seniors_65}
								</Label>
								<Input
									id="senior_count"
									type="number"
									min="0"
									max="20"
									{...register("senior_count", {
										required: localization.error_senior_count_required,
										min: {
											value: 0,
											message: localization.error_must_be_zero_or_more,
										},
									})}
									className="text-center text-2xl font-bold mt-2"
								/>
								{errors.senior_count && (
									<p className="text-sm text-red-600 mt-1">
										{errors.senior_count.message}
									</p>
								)}
							</div>
						</div>

						<div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
							<p className="text-sm text-blue-800">
								<strong>{localization.label_total_household_size}</strong>{" "}
								{(Number(watchedValues.adult_count) || 0) +
									(Number(watchedValues.child_count) || 0) +
									(Number(watchedValues.senior_count) || 0) +
									1}{" "}
								{localization.label_people_including_yourself}
							</p>
						</div>
					</div>
				);

			case "personal_info":
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<p className="text-gray-600">
								{localization.header_tell_us_about_yourself}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="primary_first_name">
									{localization.label_first_name_required}
								</Label>
								<Input
									id="primary_first_name"
									{...register("primary_first_name", {
										required: localization.error_first_name_required,
									})}
									placeholder={localization.placeholder_first_name_example}
								/>
								{errors.primary_first_name && (
									<p className="text-sm text-red-600 mt-1">
										{errors.primary_first_name.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="primary_last_name">
									{localization.label_last_name_required}
								</Label>
								<Input
									id="primary_last_name"
									{...register("primary_last_name", {
										required: localization.error_last_name_required,
									})}
									placeholder={localization.placeholder_last_name_example}
								/>
								{errors.primary_last_name && (
									<p className="text-sm text-red-600 mt-1">
										{errors.primary_last_name.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="primary_date_of_birth">
								{localization.label_date_of_birth_required}
							</Label>
							<Input
								id="primary_date_of_birth"
								type="date"
								max={dateConstraints.today}
								min={dateConstraints.minDate}
								{...register("primary_date_of_birth", {
									required: localization.error_date_of_birth_required,
									validate: validateDobNative,
								})}
							/>
							{errors.primary_date_of_birth && (
								<p className="text-sm text-red-600 mt-1">
									{errors.primary_date_of_birth.message}
								</p>
							)}
						</div>
					</div>
				);

			case "demographics":
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<p className="text-gray-600">
								{localization.header_additional_demographic_info}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="primary_gender">{localization.label_gender}</Label>
								<Select
									value={watchedValues.primary_gender}
									onValueChange={value =>
										setValue("primary_gender", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={localization.placeholder_select_gender} />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-300">
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="male"
										>
											{localization.option_gender_male}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="female"
										>
											{localization.option_gender_female}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="other"
										>
											{localization.option_gender_other}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="prefer_not_to_say"
										>
											{localization.option_gender_prefer_not_to_say}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="primary_race">{localization.label_race}</Label>
								<Select
									value={watchedValues.primary_race}
									onValueChange={value =>
										setValue("primary_race", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder={localization.placeholder_select_race} />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-300">
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="american_indian"
										>
											{localization.option_race_american_indian}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="asian"
										>
											{localization.option_race_asian}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="black"
										>
											{localization.option_race_black}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="hispanic"
										>
											{localization.option_race_hispanic}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="native_hawaiian"
										>
											{localization.option_race_native_hawaiian}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="white"
										>
											{localization.option_race_white}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="other"
										>
											{localization.option_race_other}
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="prefer_not_to_say"
										>
											{localization.option_race_prefer_not_to_say}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="primary_ethnicity">{localization.label_ethnicity}</Label>
							<Select
								value={watchedValues.primary_ethnicity}
								onValueChange={value =>
									setValue("primary_ethnicity", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={localization.placeholder_select_ethnicity} />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-300">
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="hispanic"
									>
										{localization.option_ethnicity_hispanic}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="non_hispanic"
									>
										{localization.option_ethnicity_non_hispanic}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="prefer_not_to_say"
									>
										{localization.option_ethnicity_prefer_not_to_say}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="preferred_language">
								{localization.label_preferred_language_required}
							</Label>
							<Select
								value={watchedValues.preferred_language}
								onValueChange={value =>
									setValue("preferred_language", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={localization.placeholder_select_language} />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-300">
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="en"
									>
										{localization.option_language_english}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="es"
									>
										{localization.option_language_spanish}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="fr"
									>
										{localization.option_language_french}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="de"
									>
										{localization.option_language_german}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="it"
									>
										{localization.option_language_italian}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="pt"
									>
										{localization.option_language_portuguese}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="zh"
									>
										{localization.option_language_chinese}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ja"
									>
										{localization.option_language_japanese}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ko"
									>
										{localization.option_language_korean}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ar"
									>
										{localization.option_language_arabic}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="hi"
									>
										{localization.option_language_hindi}
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="other"
									>
										{localization.option_language_other}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				);

			case "contact":
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<p className="text-gray-600">{localization.header_contact_information}</p>
						</div>

						<div>
							<Label htmlFor="primary_email">
								{localization.label_email_address_required}
							</Label>
							<Input
								id="primary_email"
								type="email"
								{...register("primary_email", {
									required: localization.error_email_required,
								})}
								placeholder={localization.placeholder_email_example}
							/>
							{errors.primary_email && (
								<p className="text-sm text-red-600 mt-1">
									{errors.primary_email.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="primary_phone">
								{localization.label_phone_number_required}
							</Label>
							<Input
								id="primary_phone"
								type="tel"
								{...register("primary_phone", {
									required: localization.error_phone_number_required,
								})}
								placeholder={localization.placeholder_phone_example}
							/>
							{errors.primary_phone && (
								<p className="text-sm text-red-600 mt-1">
									{errors.primary_phone.message}
								</p>
							)}
						</div>
					</div>
				);

			case "review":
				return (
					<div className="space-y-6">
						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-gray-900 mb-3">
								{localization.header_address_information}
							</h3>
							<div className="text-sm text-gray-700">
								<p>{watchedValues.address_line_1}</p>
								{watchedValues.address_line_2 && (
									<p>{watchedValues.address_line_2}</p>
								)}
								<p>
									{watchedValues.city}, {watchedValues.state}{" "}
									{watchedValues.zip_code}
								</p>
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-gray-900 mb-3">
								{localization.header_primary_contact}
							</h3>
							<div className="text-sm text-gray-700">
								<p>
									{watchedValues.primary_first_name}{" "}
									{watchedValues.primary_last_name}
								</p>
								{watchedValues.primary_email && (
									<p>{watchedValues.primary_email}</p>
								)}
								{watchedValues.primary_phone && (
									<p>{watchedValues.primary_phone}</p>
								)}
								<p>
									{localization.label_born} {watchedValues.primary_date_of_birth}
								</p>
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-gray-900 mb-3">
								{localization.header_preferences}
							</h3>
							<div className="text-sm text-gray-700">
								<p>
									{localization.label_language} {watchedValues.preferred_language}
								</p>
								{watchedValues.notes && (
									<p>{localization.label_notes_colon} {watchedValues.notes}</p>
								)}
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	const canProceed = () => {
		const currentStepData = steps[currentStep];
		return currentStepData.completed;
	};

	const isLastStep = currentStep === steps.length - 1;

	return (
		<div className="max-w-4xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Home className="w-6 h-6 text-highlight" />
						<span>{localization.title_set_up_household}</span>
					</CardTitle>
					<CardDescription>
						{localization.subtitle_complete_household_profile}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							{steps.map((step, index) => (
								<div
									key={step.id}
									className="flex items-center"
								>
									<div
										className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
											index <= currentStep
												? "bg-highlight border-highlight text-white"
												: "bg-white border-gray-300 text-gray-400"
										}`}
									>
										{step.completed ? (
											<CheckCircle className="w-5 h-5" />
										) : (
											<span className="text-sm font-medium">
												{index + 1}
											</span>
										)}
									</div>
									{index < steps.length - 1 && (
										<div
											className={`w-16 h-0.5 mx-2 ${
												index < currentStep
													? "bg-highlight"
													: "bg-gray-300"
											}`}
										/>
									)}
								</div>
							))}
						</div>

						<div className="mt-4">
							<h3 className="font-semibold text-gray-900">
								{steps[currentStep].title}
							</h3>
							<p className="text-sm text-gray-600">
								{steps[currentStep].description}
							</p>
						</div>
					</div>

					{/* Step Content */}
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="mb-8">{renderStepContent()}</div>

						{/* Navigation Buttons */}
						<div className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={prevStep}
								disabled={currentStep === 0}
								className="flex items-center space-x-2"
							>
								<ArrowLeft className="w-4 h-4" />
								<span>{localization.button_previous}</span>
							</Button>

							<div className="flex space-x-2">
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
								>
									{localization.button_cancel}
								</Button>

								{isLastStep ? (
									<Button
										type="submit"
										disabled={!canProceed() || isSubmitting}
										className="bg-highlight text-white min-h-12 uppercase min-w-48"
									>
										{isSubmitting
											? localization.button_creating
											: localization.button_create_household}
									</Button>
								) : (
									<Button
										type="button"
										onClick={nextStep}
										disabled={!canProceed()}
										className="flex items-center space-x-2"
									>
										<span>{localization.button_next}</span>
										<ArrowRight className="w-4 h-4" />
									</Button>
								)}
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

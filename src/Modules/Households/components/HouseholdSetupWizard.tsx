/**
 * Household Setup Wizard Component
 * Multi-step wizard for creating and configuring household information
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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

const WIZARD_STEPS: WizardStep[] = [
	{
		id: "address",
		title: "Where do you live?",
		description: "Enter your household address",
		icon: <MapPin className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "household_size",
		title: "How many people live in this household?",
		description: "Not including yourself",
		icon: <Users className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "personal_info",
		title: "Tell us about you",
		description: "First and last name, middle name, suffix",
		icon: <User className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "demographics",
		title: "Demographics",
		description: "Date of birth, race, and other information",
		icon: <Globe className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "contact",
		title: "Contact Information",
		description: "Your contact information",
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

	// Compute step completion status on each render instead of storing in state
	const steps = useMemo(() => {
		return WIZARD_STEPS.map(step => {
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
								Street Address *
							</Label>
							<Input
								id="address_line_1"
								{...register("address_line_1", {
									required: "Street address is required",
								})}
								placeholder="123 Main Street"
							/>
							{errors.address_line_1 && (
								<p className="text-sm text-red-600 mt-1">
									{errors.address_line_1.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="address_line_2">
								Apartment, Suite, etc. (Optional)
							</Label>
							<Input
								id="address_line_2"
								{...register("address_line_2")}
								placeholder="Apt 4B"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									{...register("city", {
										required: "City is required",
									})}
									placeholder="New York"
								/>
								{errors.city && (
									<p className="text-sm text-red-600 mt-1">
										{errors.city.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="state">State *</Label>
								<Input
									id="state"
									{...register("state", {
										required: "State is required",
									})}
									placeholder="NY"
								/>
								{errors.state && (
									<p className="text-sm text-red-600 mt-1">
										{errors.state.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="zip_code">ZIP Code *</Label>
							<Input
								id="zip_code"
								{...register("zip_code", {
									required: "ZIP code is required",
								})}
								placeholder="10001"
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
								How many people live in this household? (Not
								including yourself)
							</p>
						</div>

						<div className="grid grid-cols-3 gap-6">
							<div className="text-center">
								<Label
									htmlFor="adult_count"
									className="text-lg font-medium"
								>
									Adults (18-64)
								</Label>
								<Input
									id="adult_count"
									type="number"
									min="0"
									max="20"
									{...register("adult_count", {
										required: "Adult count is required",
										min: {
											value: 0,
											message: "Must be 0 or more",
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
									Children (0-17)
								</Label>
								<Input
									id="child_count"
									type="number"
									min="0"
									max="20"
									{...register("child_count", {
										required: "Child count is required",
										min: {
											value: 0,
											message: "Must be 0 or more",
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
									Seniors (65+)
								</Label>
								<Input
									id="senior_count"
									type="number"
									min="0"
									max="20"
									{...register("senior_count", {
										required: "Senior count is required",
										min: {
											value: 0,
											message: "Must be 0 or more",
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
								<strong>Total Household Size:</strong>{" "}
								{(Number(watchedValues.adult_count) || 0) +
									(Number(watchedValues.child_count) || 0) +
									(Number(watchedValues.senior_count) || 0) +
									1}{" "}
								people (including yourself)
							</p>
						</div>
					</div>
				);

			case "personal_info":
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<p className="text-gray-600">
								Tell us about yourself
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="primary_first_name">
									First Name *
								</Label>
								<Input
									id="primary_first_name"
									{...register("primary_first_name", {
										required: "First name is required",
									})}
									placeholder="John"
								/>
								{errors.primary_first_name && (
									<p className="text-sm text-red-600 mt-1">
										{errors.primary_first_name.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="primary_last_name">
									Last Name *
								</Label>
								<Input
									id="primary_last_name"
									{...register("primary_last_name", {
										required: "Last name is required",
									})}
									placeholder="Doe"
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
								Date of Birth *
							</Label>
							<Input
								id="primary_date_of_birth"
								type="date"
								{...register("primary_date_of_birth", {
									required: "Date of birth is required",
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
								Additional demographic information
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="primary_gender">Gender</Label>
								<Select
									value={watchedValues.primary_gender}
									onValueChange={value =>
										setValue("primary_gender", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-300">
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="male"
										>
											Male
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="female"
										>
											Female
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="other"
										>
											Other
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="prefer_not_to_say"
										>
											Prefer not to say
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="primary_race">Race</Label>
								<Select
									value={watchedValues.primary_race}
									onValueChange={value =>
										setValue("primary_race", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select race" />
									</SelectTrigger>
									<SelectContent className="bg-white border border-gray-300">
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="american_indian"
										>
											American Indian or Alaska Native
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="asian"
										>
											Asian
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="black"
										>
											Black or African American
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="hispanic"
										>
											Hispanic or Latino
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="native_hawaiian"
										>
											Native Hawaiian or Other Pacific
											Islander
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="white"
										>
											White
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="other"
										>
											Other
										</SelectItem>
										<SelectItem
											className="hover:bg-gray-500 hover:text-white"
											value="prefer_not_to_say"
										>
											Prefer not to say
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="primary_ethnicity">Ethnicity</Label>
							<Select
								value={watchedValues.primary_ethnicity}
								onValueChange={value =>
									setValue("primary_ethnicity", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select ethnicity" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-300">
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="hispanic"
									>
										Hispanic or Latino
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="non_hispanic"
									>
										Not Hispanic or Latino
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="prefer_not_to_say"
									>
										Prefer not to say
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="preferred_language">
								Preferred Language *
							</Label>
							<Select
								value={watchedValues.preferred_language}
								onValueChange={value =>
									setValue("preferred_language", value)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select language" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-300">
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="en"
									>
										English
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="es"
									>
										Spanish
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="fr"
									>
										French
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="de"
									>
										German
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="it"
									>
										Italian
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="pt"
									>
										Portuguese
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="zh"
									>
										Chinese
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ja"
									>
										Japanese
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ko"
									>
										Korean
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="ar"
									>
										Arabic
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="hi"
									>
										Hindi
									</SelectItem>
									<SelectItem
										className="hover:bg-gray-500 hover:text-white"
										value="other"
									>
										Other
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
							<p className="text-gray-600">Contact information</p>
						</div>

						<div>
							<Label htmlFor="primary_email">
								Email Address *
							</Label>
							<Input
								id="primary_email"
								type="email"
								{...register("primary_email", {
									required: "Email is required",
								})}
								placeholder="john@example.com"
							/>
							{errors.primary_email && (
								<p className="text-sm text-red-600 mt-1">
									{errors.primary_email.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="primary_phone">
								Phone Number *
							</Label>
							<Input
								id="primary_phone"
								type="tel"
								{...register("primary_phone", {
									required: "Phone number is required",
								})}
								placeholder="(555) 123-4567"
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
								Address Information
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
								Primary Contact
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
									Born: {watchedValues.primary_date_of_birth}
								</p>
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg p-4">
							<h3 className="font-semibold text-gray-900 mb-3">
								Preferences
							</h3>
							<div className="text-sm text-gray-700">
								<p>
									Language: {watchedValues.preferred_language}
								</p>
								{watchedValues.notes && (
									<p>Notes: {watchedValues.notes}</p>
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
						<span>Set Up Your Household</span>
					</CardTitle>
					<CardDescription>
						Complete your household profile to get personalized
						services and easier event registration.
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
								<span>Previous</span>
							</Button>

							<div className="flex space-x-2">
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
								>
									Cancel
								</Button>

								{isLastStep ? (
									<Button
										type="submit"
										disabled={!canProceed() || isSubmitting}
										className="bg-highlight text-white min-h-12 uppercase min-w-48"
									>
										{isSubmitting
											? "Creating..."
											: "Create Household"}
									</Button>
								) : (
									<Button
										type="button"
										onClick={nextStep}
										disabled={!canProceed()}
										className="flex items-center space-x-2"
									>
										<span>Next</span>
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

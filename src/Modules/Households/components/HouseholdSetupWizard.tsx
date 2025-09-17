/**
 * Household Setup Wizard Component
 * Multi-step wizard for creating and configuring household information
 */

import React, { useState, useEffect } from "react";
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
import { Textarea } from "../../../components/ui/textarea";
import {
	CheckCircle,
	Home,
	Users,
	MapPin,
	Globe,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
import { CreateHouseholdApiRequest } from "../types/api.types";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface HouseholdSetupWizardProps {
	onComplete: (householdId: number) => void;
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
		title: "Address Information",
		description: "Enter your household address",
		icon: <MapPin className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "primary",
		title: "Primary Contact",
		description: "Your contact information",
		icon: <Users className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "preferences",
		title: "Preferences",
		description: "Language and communication preferences",
		icon: <Globe className="w-5 h-5" />,
		completed: false,
	},
	{
		id: "review",
		title: "Review & Create",
		description: "Review your information and create household",
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
	const { createHousehold } = useHouseholdSignUpIntegration();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [steps, setSteps] = useState(WIZARD_STEPS);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
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
		},
		mode: "onChange",
	});

	const watchedValues = watch();

	// Update step completion status
	useEffect(() => {
		const updatedSteps = steps.map((step, index) => {
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
				case "primary":
					completed = !!(
						watchedValues.primary_first_name &&
						watchedValues.primary_last_name &&
						watchedValues.primary_date_of_birth
					);
					break;
				case "preferences":
					completed = !!watchedValues.preferred_language;
					break;
				case "review":
					completed = isValid;
					break;
			}

			return { ...step, completed };
		});

		setSteps(updatedSteps);
	}, [watchedValues, isValid, steps]);

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
			const response = await createHousehold(data);
			onComplete(response.data.id);
		} catch (error) {
			console.error("Error creating household:", error);
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

			case "primary":
				return (
					<div className="space-y-4">
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
							<Label htmlFor="primary_email">Email Address</Label>
							<Input
								id="primary_email"
								type="email"
								{...register("primary_email")}
								placeholder="john@example.com"
							/>
						</div>

						<div>
							<Label htmlFor="primary_phone">Phone Number</Label>
							<Input
								id="primary_phone"
								type="tel"
								{...register("primary_phone")}
								placeholder="(555) 123-4567"
							/>
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

			case "preferences":
				return (
					<div className="space-y-4">
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
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="es">Spanish</SelectItem>
									<SelectItem value="fr">French</SelectItem>
									<SelectItem value="de">German</SelectItem>
									<SelectItem value="it">Italian</SelectItem>
									<SelectItem value="pt">
										Portuguese
									</SelectItem>
									<SelectItem value="zh">Chinese</SelectItem>
									<SelectItem value="ja">Japanese</SelectItem>
									<SelectItem value="ko">Korean</SelectItem>
									<SelectItem value="ar">Arabic</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="notes">
								Additional Notes (Optional)
							</Label>
							<Textarea
								id="notes"
								{...register("notes")}
								placeholder="Any additional information about your household..."
								rows={3}
							/>
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

/**
 * HouseholdRegistrationComponent - Adapted registration flow for household setup
 *
 * This component reuses the existing registration flow components but adapts them
 * for household setup instead of event registration.
 */

import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Authentication/AuthContext";

// Component imports from existing registration flow
import PrimaryInfoFormComponent from "../../Family/PrimaryInfoFormComponent";
import AddressComponent from "../../Family/AddressComponent";
import ContactInformationComponent from "../../Family/ContactInformationComponent";
import MemberCountFormComponent from "../../Family/MemberCountFormComponent";
import LoadingSpinner from "../../General/LoadingSpinner";
import { Button } from "../../../components/ui/button";

// Utility imports
import { formatDateForServer } from "../../../Utils/DateFormat";
import localization from "../../Localization/LocalizationComponent";

// Third-party library imports
import "@one-platform/opc-timeline";

// Type imports
import { RegistrationFormData } from "../../Registration/types/registration.types";

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

	// Create a wrapper function for watch to match child component expectations
	const watchField = watch;
	const [formStep, setFormStep] = useState<number>(0);
	const [formValues, setFormValues] = useState<Partial<RegistrationFormData>>(
		{}
	);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const configureTimeLine = (): void => {
		const timeline = document.querySelector("#timeline") as HTMLElement & {
			steps?: string[];
		};
		if (timeline) {
			timeline.steps = [
				"Your Details",
				"Your Address Details",
				"Your Family Details",
				"Contact Information",
			];
		}
	};

	useEffect(() => {
		configureTimeLine();

		// Pre-populate form with auth user data if available
		if (authUser) {
			const nameParts = authUser.name?.split(" ") || [];
			setValue("first_name", nameParts[0] || "");
			setValue("last_name", nameParts.slice(1).join(" ") || "");
			setValue("email", authUser.email || "");
			setValue("permission_to_email", true);
		}
	}, [authUser, setValue]);

	const continueHandler = (values: Partial<RegistrationFormData>): void => {
		setFormValues({ ...formValues, ...values });
		setFormStep(formStep + 1);
	};

	const previousHandler = (): void => {
		setFormStep(formStep - 1);
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

			// Call the completion handler with the collected data
			onComplete(data);
		} catch (error) {
			console.error("Error submitting household registration:", error);
		} finally {
			setIsSubmitting(false);
		}
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
					<MemberCountFormComponent
						register={register}
						errors={errors}
						watch={watchField}
						setValue={setValue}
						event={{}}
					/>
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
			default:
				return <div>Invalid step</div>;
		}
	};

	if (isSubmitting) {
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

					{/* Timeline */}
					<div className="mb-8">
						<opc-timeline id="timeline"></opc-timeline>
					</div>

					{/* Form */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							{renderFormStep()}

							{/* Navigation buttons - Previous, Continue/Complete, and Cancel */}
							<div className="flex justify-between mt-8">
								<div>{formStep > 0 && previousButton()}</div>
								<div className="flex space-x-4">
									{cancelButton()}
									{formStep < 3 && (
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
									{formStep === 3 && (
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

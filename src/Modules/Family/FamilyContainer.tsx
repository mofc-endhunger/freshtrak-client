import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { selectEvent } from "../../Store/Events/eventSlice";
import RegistrationHeaderComponent from "../Registration/RegistrationHeaderComponent";
import RegistrationTextComponent from "../Registration/RegistrationTextComponent";
import AddressComponent from "./AddressComponent";
import MemberCountFormComponent from "./MemberCountFormComponent";
import ContactInformationComponent from "./ContactInformationComponent";
import PrimaryInfoFormComponent from "./PrimaryInfoFormComponent";

// Component props interface
interface FamilyContainerProps {
	className?: string;
	"data-testid"?: string;
}

const FamilyContainer: React.FC<FamilyContainerProps> = ({
	className = "",
	"data-testid": testId = "family-container",
}) => {
	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		watch,
		trigger,
		formState: { errors, isValid, isSubmitting },
	} = useForm({
		mode: "onChange",
	});

	const event = useSelector(selectEvent);

	// Form submission handler
	const onSubmit = async (data: any) => {
		try {
			// Form data submitted successfully
			// Form submission logic will be implemented here
			// await submitFamilyRegistration(data);
		} catch (error) {
			// Error handling for form submission
		}
	};

	return (
		<Fragment>
			<div
				className={`min-h-screen bg-gray-50 ${className}`}
				data-testid={testId}
			>
				<section className="container mx-auto px-4 py-8 max-w-4xl">
					{/* Header Section */}
					<div className="mb-8">
						<RegistrationHeaderComponent event={event} />
					</div>

					{/* Registration Form Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200">
						<div className="p-6 space-y-6">
							{/* Event Information */}
							<RegistrationTextComponent event={event} />

							{/* Family Registration Form */}
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-8"
								data-testid="family-registration-form"
							>
								{/* Primary Information Section */}
								<div className="space-y-6">
									<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
										Primary Information
									</h2>
									<PrimaryInfoFormComponent
										register={register}
										errors={errors}
										setValue={setValue}
										watch={watch}
										getValues={getValues}
										trigger={trigger}
									/>
								</div>

								{/* Address Section */}
								<div className="space-y-6">
									<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
										Address Information
									</h2>
									<AddressComponent
										register={register}
										errors={errors}
										watch={watch}
										setValue={setValue}
									/>
								</div>

								{/* Contact Information Section */}
								<div className="space-y-6">
									<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
										Contact Information
									</h2>
									<ContactInformationComponent
										register={register}
										errors={errors}
										getValues={getValues}
										watch={watch}
										setValue={setValue}
									/>
								</div>

								{/* Member Count Section */}
								<div className="space-y-6">
									<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
										Family Members
									</h2>
									<MemberCountFormComponent
										register={register}
										event={event}
										watch={watch}
										setValue={setValue}
										errors={errors}
									/>
								</div>

								{/* Submit Button Section */}
								<div className="flex justify-end pt-6 border-t border-gray-200">
									<button
										type="submit"
										disabled={!isValid || isSubmitting}
										className={`
                      px-6 py-3 text-base font-medium text-white bg-indigo-600 
                      border border-transparent rounded-md shadow-sm 
                      hover:bg-indigo-700 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-indigo-500 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                      ${isSubmitting ? "animate-pulse" : ""}
                    `}
										data-testid="continue-button"
									>
										{isSubmitting ? (
											<span className="flex items-center">
												<svg
													className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													/>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
												Processing...
											</span>
										) : (
											"Continue"
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</section>
			</div>
		</Fragment>
	);
};

export default FamilyContainer;

// React and third-party imports
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";

// Component imports
import PrimaryInfoFormComponent from "../Family/PrimaryInfoFormComponent";
import AddressComponent from "../Family/AddressComponent";
import ContactInformationComponent from "../Family/ContactInformationComponent";
import MemberCountFormComponent from "../Family/MemberCountFormComponent";
import EventSlotsModalComponent from "../Family/EventSlotsModalComponent";
import BackButtonComponent from "../General/BackButtonComponent";
import LoadingSpinner from "../General/LoadingSpinner";
import { Button } from "../../components/ui/button";

// Utility imports
import { formatDateForServer } from "../../Utils/DateFormat";
import localization from "../Localization/LocalizationComponent";

// Third-party library imports
import "@one-platform/opc-timeline";

// Type imports
import {
	RegistrationComponentProps,
	RegistrationFormData,
} from "./types/registration.types";

const RegistrationComponent: React.FC<RegistrationComponentProps> = ({
	user,
	onRegister,
	event,
	disabled,
}) => {
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
	const [formStep, setFormStep] = useState<number>(0);
	const [formValues, setFormValues] = useState<Partial<RegistrationFormData>>(
		{}
	);
	const [selectedSlotId, setSelectedSlotId] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const handleSlotChange = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	): void => {
		setSelectedSlotId(e.target.value);
	};
	const configureTimeLine = (): void => {
		const timeline = document.querySelector("#timeline") as HTMLElement & {
			steps?: string[];
		};
		if (timeline) {
			timeline.steps = [
				"Your Details",
				"Your Address Details",
				"Your Family Details",
			];
			// timeline.addEventListener("opc-timeline-step:click", timelineClickHandler)
		}
	};

	// const timelineClickHandler = (event) =>{
	//   setFormStep(event.detail.data.index)
	// }
	useEffect(() => {
		configureTimeLine();
	}, []);

	const continueHandler = (values: Partial<RegistrationFormData>): void => {
		// const res = await triggerValidation(["first_name","last_name"])
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

	const test = async (
		event: React.MouseEvent<HTMLButtonElement>
	): Promise<void> => {
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
			setFormValues({ ...formValues, ...values });
			setFormStep(formStep + 1);
		}
	};

	// Track if we've already reset the form for this user to prevent infinite loops
	const lastResetUserRef = useRef<string | null>(null);

	useEffect(() => {
		// Create a stable identifier for the user to prevent unnecessary resets
		const userIdentifier = user ? JSON.stringify(user) : "empty";

		// Only reset if the user data has actually changed
		if (lastResetUserRef.current !== userIdentifier) {
			const safeUser =
				user && typeof user === "object"
					? user
					: ({} as Partial<RegistrationFormData>);
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
			} = safeUser;

			reset({
				first_name,
				middle_name,
				last_name,
				suffix,
				date_of_birth,
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

			// Update the ref to track that we've reset for this user
			lastResetUserRef.current = userIdentifier;
		}
	}, [user, reset]);
	const onSubmit = async (data: RegistrationFormData): Promise<void> => {
		setIsSubmitting(true);
		try {
			// Get all current form values including household member counts from the final step
			const allFormValues = getValues();
			// Merge with current form values taking precedence over previous step values
			data = { ...formValues, ...allFormValues };
			data["identification_code"] = user?.["identification_code"] || "";
			data["date_of_birth"] = formatDateForServer(data["date_of_birth"]);
			data = sanatizeInput(data);
			await onRegister(data);
		} catch (error) {
			console.error("Registration error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const sanatizeInput = (
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
		keys.forEach(key => {
			if (data[key] !== undefined) {
				(data as any)[key] = santizeString(data[key]);
			}
		});
		return data;
	};

	const santizeString = (input: any): string => {
		let modifiedInput = (input ?? "").toString().trim();
		modifiedInput = modifiedInput.replace(/\s\s+/g, " ");
		modifiedInput = modifiedInput.replace(/[^A-Za-z0-9 \-_.@'`]/g, "");
		return modifiedInput;
	};

	const submitHandlerFocus = (e: React.FormEvent<HTMLFormElement>): void => {
		handleSubmit(onSubmit)(e);
		setTimeout(
			() => window.scrollBy({ top: -100, behavior: "smooth" }),
			200
		);
	};

	return (
		<Fragment>
			<div className="mx-auto px-24 py-24">
				{/* Back button in its own row, aligned left */}
				{formStep === 0 && (
					<div className="w-full flex justify-start mb-4">
						<BackButtonComponent />
					</div>
				)}

				{/* Timeline in its own row with 100% width */}
				<div className="w-full my-6 mx-auto">
					{/* @ts-ignore */}
					<opc-timeline id="timeline" current-step-index={formStep}>
						<div slot="form-timeline"></div>
						{/* @ts-ignore */}
					</opc-timeline>
				</div>
				<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 max-w-md mx-auto my-5">
					<div className="max-w-4xl mx-auto">
						<div className="max-w-6xl mx-auto px-4">
							<EventSlotsModalComponent
								event={event}
								selectedSlotId={selectedSlotId}
								onSlotChange={handleSlotChange}
							/>
							<form onSubmit={submitHandlerFocus}>
								{formStep === 0 && (
									<PrimaryInfoFormComponent
										register={register}
										trigger={trigger}
										continueHandler={continueHandler}
										getValues={getValues}
										errors={errors}
										setValue={setValue}
										watch={watch}
									/>
								)}
								{formStep === 1 && (
									<Fragment>
										{" "}
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
										<div className="flex">
											{previousButton()}
											<Button
												type="button"
												onClick={test}
												variant="highlight"
												className="ml-5"
												data-testid="continue button"
											>
												Continue
											</Button>
										</div>
									</Fragment>
								)}
								{formStep === 2 && (
									<>
										{" "}
										<MemberCountFormComponent
											register={register}
											event={event}
											watch={watch}
											setValue={setValue}
											errors={errors}
										/>
										{isSubmitting ? (
											<div className="flex justify-center mt-4">
												<LoadingSpinner size="medium" />
											</div>
										) : (
											<div className="flex justify-between mt-4 gap-4">
												{/* Previous button */}
												{previousButton()}

												{/* Submit button */}
												<Button
													type="submit"
													variant="highlight"
													disabled={
														disabled || isSubmitting
													}
													data-testid="continue button"
												>
													{
														localization.registartion_register
													}
												</Button>
											</div>
										)}{" "}
									</>
								)}
							</form>
						</div>
					</div>
				</section>
			</div>
		</Fragment>
	);
};

export default RegistrationComponent;

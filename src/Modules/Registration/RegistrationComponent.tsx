import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PrimaryInfoFormComponent from "../Family/PrimaryInfoFormComponent";
import AddressComponent from "../Family/AddressComponent";
import ContactInformationComponent from "../Family/ContactInformationComponent";
import MemberCountFormComponent from "../Family/MemberCountFormComponent";
import EventSlotsModalComponent from "../Family/EventSlotsModalComponent";
import { formatDateForServer } from "../../Utils/DateFormat";
import BackButtonComponent from "../General/BackButtonComponent";
import localization from "../Localization/LocalizationComponent";
import "@one-platform/opc-timeline";
import "../../Assets/scss/main.scss";

interface User {
	identification_code: string;
	first_name?: string;
	middle_name?: string;
	last_name?: string;
	suffix?: string;
	date_of_birth?: string;
	gender?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	phone?: string;
	permission_to_text?: boolean;
	email?: string;
	permission_to_email?: boolean;
	seniors_in_household?: number;
	adults_in_household?: number;
	children_in_household?: number;
	license_plate?: string;
}

interface Event {
	id: string;
	name: string;
	// Add other event properties as needed
}

interface RegistrationComponentProps {
	user: User;
	onRegister: (data: any) => void;
	event: Event;
	disabled?: boolean;
}

interface FormData {
	first_name?: string;
	middle_name?: string;
	last_name?: string;
	suffix?: string;
	date_of_birth?: string;
	gender?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	phone?: string;
	permission_to_text?: boolean;
	email?: string;
	permission_to_email?: boolean;
	seniors_in_household?: number;
	adults_in_household?: number;
	children_in_household?: number;
	license_plate?: string;
	no_phone_number?: boolean;
	no_email?: boolean;
}

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
	} = useForm<FormData>({ mode: "onChange" });
	const [formStep, setFormStep] = useState<number>(0);
	const [formValues, setFormValues] = useState<Partial<FormData>>({});

	const configureTimeLine = (): void => {
		const timeline = document.querySelector("#timeline") as any;
		if (timeline) {
			timeline.steps = [
				"Your Details",
				"Your Address Details",
				"Your Family Details",
			];
		}
	};

	useEffect(() => {
		configureTimeLine();
	}, []);

	const continueHandler = (values: Partial<FormData>): void => {
		setFormValues({ ...formValues, ...values });
		setFormStep(formStep + 1);
	};

	const previousHandler = (): void => {
		setFormStep(formStep - 1);
	};

	const previousButton = (): React.JSX.Element => {
		return (
			<button
				type="button"
				onClick={previousHandler}
				className="btn custom-button"
				data-testid="previous button"
			>
				Previous
			</button>
		);
	};

	const test = async (): Promise<void> => {
		const validatePhone = !watch("no_phone_number");
		const validateEmail = !watch("no_email");
		const field_array: (keyof FormData)[] = ["address_line_1", "city"];

		if (validatePhone) {
			field_array.push("phone");
		}
		if (validateEmail) {
			field_array.push("email");
		}

		const res = await trigger(field_array);
		if (res) {
			const values = getValues();
			setFormValues({ ...formValues, ...values });
			setFormStep(formStep + 1);
		}
	};

	useEffect(() => {
		const {
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
			license_plate,
		} = user || {};

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
			license_plate,
		});
	}, [user, reset]);

	const onSubmit = (data: FormData): void => {
		const submitData = { ...data, ...formValues };
		(submitData as any)["identification_code"] = (user as any)[
			"identification_code"
		];
		submitData["date_of_birth"] = formatDateForServer(
			data["date_of_birth"] || ""
		);
		const sanitizedData = sanitizeInput(submitData);
		onRegister(sanitizedData);
	};

	const sanitizeInput = (data: any): any => {
		const keys: string[] = [
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
			data[key] = sanitizeString(data[key]);
		});
		return data;
	};

	const sanitizeString = (input: string): string => {
		let modifiedInput = input.trim();
		modifiedInput = modifiedInput.replace(/\s\s+/g, " ");
		modifiedInput = modifiedInput.replace(/[^A-Za-z0-9 \-_.@'`]/g, "");
		return modifiedInput;
	};

	const submitHandlerFocus = (e: React.FormEvent): void => {
		handleSubmit(onSubmit)(e);
		setTimeout(
			() => window.scrollBy({ top: -100, behavior: "smooth" }),
			200
		);
	};

	return (
		<Fragment>
			<div className="mt-4">
				<section className="container pt-100 pb-100 register-confirmation">
					{formStep === 0 && <BackButtonComponent />}
					{React.createElement(
						"opc-timeline",
						{
							id: "timeline",
							"current-step-index": formStep,
						},
						React.createElement("div", { slot: "form-timeline" })
					)}
					<div className="registration-form">
						<div className="content-wrapper">
							<EventSlotsModalComponent event={event as any} />
							<form onSubmit={submitHandlerFocus}>
								{formStep === 0 && (
									<PrimaryInfoFormComponent
										register={register}
										triggerValidation={trigger}
										continueHandler={continueHandler}
										getValues={getValues}
										errors={errors}
										setValue={setValue}
										watch={watch}
									/>
								)}
								{formStep === 1 && (
									<Fragment>
										<AddressComponent
											register={register}
											errors={errors}
											watch={watch}
											setValue={setValue}
										/>
										<ContactInformationComponent
											register={register}
											getValues={getValues}
											errors={errors}
											watch={watch}
											setValue={setValue}
										/>
										<div className="d-flex">
											{previousButton()}
											<button
												type="button"
												onClick={test}
												style={{ marginLeft: 20 }}
												className="btn custom-button"
												data-testid="continue button"
											>
												Continue
											</button>
										</div>
									</Fragment>
								)}
								{formStep === 2 && (
									<>
										<MemberCountFormComponent
											register={register}
											event={event}
											watch={watch}
											setValue={setValue}
										/>
										<div className="button-wrap mt-4">
											<button
												type="submit"
												className="btn custom-button"
												disabled={disabled}
												data-testid="continue button"
											>
												Continue
											</button>
										</div>
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

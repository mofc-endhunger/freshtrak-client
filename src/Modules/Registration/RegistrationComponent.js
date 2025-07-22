import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PrimaryInfoFormComponent from "../Family/PrimaryInfoFormComponent";
import AddressComponent from "../Family/AddressComponent";
import ContactInformationComponent from "../Family/ContactInformationComponent";
import MemberCountFormComponent from "../Family/MemberCountFormComponent";
import EventSlotsModalComponent from "../Family/EventSlotsModalComponent";
import { formatDateForServer } from "../../Utils/DateFormat";
import BackButtonComponent from "../General/BackButtonComponent";
import LoadingSpinner from "../General/LoadingSpinner";
import localization from "../Localization/LocalizationComponent";
import "@one-platform/opc-timeline";

const RegistrationComponent = ({ user, onRegister, event, disabled }) => {
	const {
		register,
		trigger,
		handleSubmit,
		errors,
		getValues,
		watch,
		reset,
		setValue,
	} = useForm({ mode: "onChange" });
	const [formStep, setFormStep] = useState(0);
	const [formValues, setFormValues] = useState({});
	const [selectedSlotId, setSelectedSlotId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const handleSlotChange = e => {
		setSelectedSlotId(e.target.value);
	};
	const configureTimeLine = () => {
		const timeline = document.querySelector("#timeline");
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

	const continueHandler = values => {
		// const res = await triggerValidation(["first_name","last_name"])
		setFormValues({ ...formValues, ...values });
		setFormStep(formStep + 1);
	};

	const previousHandler = () => {
		setFormStep(formStep - 1);
	};

	const previousButton = () => {
		return (
			<button
				type="button"
				onClick={previousHandler}
				className="btn custom-button"
				data-testid="previous button"
			>
				{" "}
				Previous
			</button>
		);
	};

	const test = async event => {
		const validatePhone = !watch("no_phone_number");
		const validateEmail = !watch("no_email");
		const field_array = ["address_line_1", "city"];
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
		const safeUser = user && typeof user === "object" ? user : {};
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
			license_plate = "",
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
			license_plate,
		});
	}, [user, reset]);
	const onSubmit = async data => {
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

	const sanatizeInput = data => {
		const keys = [
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
			data[key] = santizeString(data[key]);
		});
		return data;
	};

	const santizeString = input => {
		let modifiedInput = (input ?? "").toString().trim();
		modifiedInput = modifiedInput.replace(/\s\s+/g, " ");
		modifiedInput = modifiedInput.replace(/[^A-Za-z0-9 \-_.@'`]/g, "");
		return modifiedInput;
	};

	const submitHandlerFocus = e => {
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
					<opc-timeline id="timeline" current-step-index={formStep}>
						<div slot="form-timeline"></div>
					</opc-timeline>
					<div className="registration-form">
						<div className="content-wrapper">
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
												{" "}
												Continue
											</button>
										</div>
									</Fragment>
								)}
								{formStep === 2 && (
									<>
										{" "}
										<MemberCountFormComponent
											register={register}
											trigger={trigger}
											continueHandler={continueHandler}
											event={event}
											errors={errors}
											watch={watch}
											setValue={setValue}
										/>
										<div className="button-wrap mt-4">
											{isSubmitting ? (
												<div className="d-flex justify-content-center">
													<LoadingSpinner size="medium" />
												</div>
											) : (
												<button
													type="submit"
													className="btn custom-button"
													disabled={
														disabled || isSubmitting
													}
													data-testid="continue button"
												>
													{
														localization.registartion_register
													}
												</button>
											)}
										</div>{" "}
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

import React, { Fragment } from "react";
import PhoneInputComponent from "./PhoneInputComponent";
import localization from "../Localization/LocalizationComponent";

const ContactInformationComponent = ({
	register,
	errors = {},
	getValues,
	setValue,
	watch = () => "",
}) => {
	const showPhonePermissions = !watch("no_phone_number");
	const showEmailPermissions = !watch("no_email");
	const phone = watch("phone") || "";
	const email = watch("email") || "";

	const phoneFieldName = "phone";

	return (
		<Fragment>
			<h2>{localization.register_how_to_contact}</h2>
			{showPhonePermissions && (
				<div className="form-group">
					<label htmlFor="phone">{localization.phone_number}</label>
					<PhoneInputComponent
						type="text"
						className={`form-control ${errors.phone && "invalid"}`}
						name={phoneFieldName}
						placeholder="(xxx) xxx-xxxx"
						id="phone"
						value={phone}
						onChange={e => {
							setValue("phone", e);
						}}
					/>
					{errors.phone && (
						<span className="text-danger">
							This field is required. If you have no phone check
							"No Phone Available".
						</span>
					)}
				</div>
			)}
			{phone === "" && (
				<div className="form-check">
					<input
						type="checkbox"
						className="form-check-input"
						name="no_phone_number"
						id="no_phone_number"
						value=""
						{...register("no_phone_number")}
					/>
					<label
						htmlFor="no_phone_number"
						className="form-check-label"
					>
						{localization.no_phone}
					</label>
				</div>
			)}
		</Fragment>
	);
};

export default ContactInformationComponent;

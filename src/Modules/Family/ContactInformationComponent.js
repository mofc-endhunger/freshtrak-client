import React, { forwardRef, Fragment } from "react";
import PhoneInputComponent from "./PhoneInputComponent";
import localization from "../Localization/LocalizationComponent";

const ContactInformationComponent = forwardRef(
	({ register, errors, getValues, setValue, watch }, ref) => {
		const showPhonePermissions = !watch("no_phone_number");
		const showEmailPermissions = !watch("no_email");
		const phone = watch("phone") || "";
		const email = watch("email") || "";

		return (
			<Fragment>
				<h2>{localization.register_how_to_contact}</h2>
				{showPhonePermissions && (
					<div className="form-group">
						<label htmlFor="phone">
							{localization.phone_number}
						</label>
						<PhoneInputComponent
							type="text"
							className={`form-control ${
								errors.phone && "invalid"
							}`}
							name="phone"
							placeholder="(xxx) xxx-xxxx"
							id="phone"
							value={phone}
							onChange={e => {
								setValue("phone", e);
							}}
							register={register}
						/>
						{errors.phone && (
							<span className="text-danger">
								This field is required. If you have no phone
								check "No Phone Available".
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
				{showPhonePermissions && (
					<div className="form-check" data-testid="no phone error">
						<input
							type="checkbox"
							className="form-check-input"
							name="permission_to_text"
							id="permission_to_text"
							value=""
							{...register("permission_to_text")}
						/>
						<label
							htmlFor="permission_to_text"
							className="form-check-label"
						>
							<small data-testid="phone permission">
								{localization.phone_contact_you}
							</small>
						</label>
					</div>
				)}
				{showEmailPermissions && (
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							className={`form-control ${
								errors.email && "invalid"
							}`}
							name="email"
							id="email"
							autoComplete="off"
							value={email}
							onChange={e => setValue("email", e.target.value)}
							{...register("email", {
								validate: value => {
									const { no_email: noEmail } = getValues();
									return value.length > 0 || noEmail;
								},
							})}
						/>
						<small className="text-muted">
							No Email?{" "}
							<a
								href="https://support.google.com/mail/answer/56256"
								target="_blank"
								rel="noopener noreferrer"
							>
								Get one free from Google.
							</a>
						</small>
						<br />
						{errors.email && (
							<span
								className="text-danger"
								data-testid="no email error"
							>
								This field is required. If you have no email
								check "No Email Available".
							</span>
						)}
					</div>
				)}
				{email === "" && (
					<div className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							name="no_email"
							id="no_email"
							value=""
							{...register("no_email")}
						/>
						<label htmlFor="no_email" className="form-check-label">
							{localization.no_email}
						</label>
					</div>
				)}
				{showEmailPermissions && (
					<div className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							name="permission_to_email"
							id="permission_to_email"
							value=""
							{...register("permission_to_email")}
						/>
						<label
							htmlFor="permission_to_email"
							className="form-check-label"
						>
							<small data-testid="email permission">
								{localization.email_contact_you}
							</small>
						</label>
					</div>
				)}
			</Fragment>
		);
	}
);

export default ContactInformationComponent;

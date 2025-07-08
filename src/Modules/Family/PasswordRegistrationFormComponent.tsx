import React, { Fragment, forwardRef } from "react";
import {
	UseFormRegister,
	FieldErrors,
	UseFormGetValues,
} from "react-hook-form";

interface FormData {
	email?: string;
	password?: string;
	password_confirm?: string;
	[key: string]: any;
}

interface PasswordInfoFormComponentProps {
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	getValues: UseFormGetValues<FormData>;
}

const PasswordInfoFormComponent = forwardRef<
	HTMLDivElement,
	PasswordInfoFormComponentProps
>(({ register, errors, getValues }, ref) => (
	<Fragment>
		<h2>Create Frestrak Account</h2>
		<small>
			Input a password to create a Frestrak account and easily register
			with one click in the future
		</small>

		<div className="form-group">
			<label htmlFor="email">Email</label>
			<input
				type="email"
				className="form-control"
				id="email"
				autoComplete="off"
				{...register("email", { required: true })}
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
				<span className="text-danger">This field is required</span>
			)}
		</div>

		<div className="form-group">
			<label htmlFor="password">Password</label>
			<input
				type="password"
				className="form-control"
				id="password"
				autoComplete="new-password"
				{...register("password", { required: true })}
			/>
			{errors.password && (
				<span className="text-danger">This field is required</span>
			)}
		</div>
		<div className="form-group">
			<label htmlFor="password_confirm">Confirm Password</label>
			<input
				type="password"
				className="form-control"
				id="password_confirm"
				autoComplete="new-password"
				{...register("password_confirm", {
					required: "Please confirm password",
					validate: {
						matchesPassword: (value: string | undefined) => {
							const { password } = getValues();
							return (
								password === value || "Passwords should match!"
							);
						},
					},
				})}
			/>
			{errors.password_confirm && (
				<span className="text-danger">
					{errors.password_confirm.message}
				</span>
			)}
		</div>
	</Fragment>
));

export default PasswordInfoFormComponent;

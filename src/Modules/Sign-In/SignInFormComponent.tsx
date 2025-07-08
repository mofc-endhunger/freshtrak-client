import React, { Fragment } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface SignInFormData {
	email: string;
	password: string;
}

interface SignInFormComponentProps {
	register: UseFormRegister<SignInFormData>;
	errors: FieldErrors<SignInFormData>;
}

const SignInFormComponent: React.FC<SignInFormComponentProps> = ({
	register,
	errors,
}) => (
	<Fragment>
		<div className="form-group">
			<label htmlFor="email">Email</label>
			<input
				type="email"
				className="form-control"
				{...register("email", { required: true })}
				id="email"
				autoComplete="section-login email"
			/>
			{errors.email && (
				<span className="text-danger">Your email is required</span>
			)}
		</div>
		<div className="form-group">
			<label htmlFor="password">Password</label>
			<input
				type="password"
				className="form-control"
				{...register("password", { required: true })}
				id="password"
				autoComplete="section-login password"
			/>
			{errors.password && (
				<span className="text-danger">Your Password is required</span>
			)}
		</div>
	</Fragment>
);

export default SignInFormComponent;

import React, { forwardRef } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import localization from "../Localization/LocalizationComponent";

interface PasswordRegistrationFormProps {
	register: any; // react-hook-form register function
	errors: any; // react-hook-form errors object
	getValues: any; // react-hook-form getValues function
}

const PasswordRegistrationFormComponent = forwardRef<
	HTMLDivElement,
	PasswordRegistrationFormProps
>(({ register, errors, getValues }, ref) => (
	<div ref={ref} className="space-y-6">
		<div className="text-center md:text-left">
			<h2 className="text-2xl font-bold text-gray-900 mb-2">
				Create FreshTrak Account
			</h2>
			<p className="text-sm text-gray-600 max-w-md mx-auto md:mx-0">
				Input a password to create a FreshTrak account and easily
				register with one click in the future
			</p>
		</div>

		<div className="space-y-4">
			<div className="space-y-2">
				<Label
					htmlFor="email"
					className="text-sm font-medium text-gray-700"
				>
					Email Address
				</Label>
				<Input
					type="email"
					id="email"
					autoComplete="off"
					{...register("email", { required: "Email is required" })}
					className={cn(
						"w-full",
						errors?.email &&
							"border-red-500 focus:border-red-500 focus:ring-red-500"
					)}
					placeholder={localization.placeholder_enter_email}
				/>
				<p className="text-sm text-gray-500">
					No Email?{" "}
					<a
						href="https://support.google.com/mail/answer/56256"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 underline"
					>
						Get one free from Google.
					</a>
				</p>
				{errors?.email && (
					<span className="text-sm text-red-600">
						{errors.email.message || "This field is required"}
					</span>
				)}
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="password"
					className="text-sm font-medium text-gray-700"
				>
					Password
				</Label>
				<Input
					type="password"
					id="password"
					autoComplete="new-password"
					{...register("password", {
						required: "Password is required",
					})}
					className={cn(
						"w-full",
						errors?.password &&
							"border-red-500 focus:border-red-500 focus:ring-red-500"
					)}
					placeholder={localization.placeholder_enter_password}
				/>
				{errors?.password && (
					<span className="text-sm text-red-600">
						{errors.password.message || "This field is required"}
					</span>
				)}
			</div>

			<div className="space-y-2">
				<Label
					htmlFor="password_confirm"
					className="text-sm font-medium text-gray-700"
				>
					Confirm Password
				</Label>
				<Input
					type="password"
					id="password_confirm"
					autoComplete="new-password"
					{...register("password_confirm", {
						required: "Please confirm password",
						validate: {
							matchesPassword: (value: string) => {
								const { password } = getValues();
								return (
									password === value ||
									"Passwords should match!"
								);
							},
						},
					})}
					className={cn(
						"w-full",
						errors?.password_confirm &&
							"border-red-500 focus:border-red-500 focus:ring-red-500"
					)}
					placeholder={localization.placeholder_confirm_password}
				/>
				{errors?.password_confirm && (
					<span className="text-sm text-red-600">
						{errors.password_confirm.message}
					</span>
				)}
			</div>
		</div>
	</div>
));

PasswordRegistrationFormComponent.displayName =
	"PasswordRegistrationFormComponent";

export default PasswordRegistrationFormComponent;

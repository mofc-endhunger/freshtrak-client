import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
import { SignInFormData } from "./types/authentication.types";
import localization from "../Localization/LocalizationComponent";

// Validation schema for signin form - using function to access localization
const getSignInSchema = () => z.object({
	email: z.string().email(localization.error_please_enter_valid_email),
	password: z.string().min(1, { message: localization.error_password_required }),
});

interface SignInFormComponentProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
	onUnconfirmedUser?: (email: string) => Promise<void>;
	onSwitchToSignUp?: () => void;
	onForgotPassword?: () => void;
}

/**
 * SignInFormComponent - Form component for user authentication
 *
 * This component provides a signin form with email and password fields.
 * It includes validation, error handling, and integrates with AWS Cognito.
 *
 * @component
 * @param {SignInFormComponentProps} props - Component props
 * @returns {JSX.Element} The signin form component
 */
const SignInFormComponent: React.FC<SignInFormComponentProps> = ({
	onSuccess,
	onError,
	onUnconfirmedUser,
	onSwitchToSignUp,
	onForgotPassword,
}) => {
	const { signIn, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<SignInFormData>({
		resolver: zodResolver(getSignInSchema()),
	});

	const onSubmit = async (data: SignInFormData): Promise<void> => {
		try {
			setIsSubmitting(true);
			await signIn(data.email, data.password);
			reset();
			onSuccess?.();
		} catch (error: any) {
			console.error("Signin error details:", {
				name: error.name,
				code: error.code,
				message: error.message,
				isUnconfirmedUser: error.isUnconfirmedUser,
				fullError: error,
			});

			const errorMessage = error.message || "Failed to sign in";

			// Check if error indicates unconfirmed user
			// Check multiple error properties to catch all possible formats
			const isUnconfirmedUserError =
				error.isUnconfirmedUser === true ||
				error.name === "UserNotConfirmedException" ||
				error.code === "UserNotConfirmedException" ||
				errorMessage.includes("UserNotConfirmedException") ||
				errorMessage.includes("User is not confirmed") ||
				errorMessage
					.toLowerCase()
					.includes("user needs to be confirmed") ||
				errorMessage.toLowerCase().includes("not confirmed");

			if (isUnconfirmedUserError && onUnconfirmedUser) {
				// Handle unconfirmed user scenario - switch to confirmation tab
				await onUnconfirmedUser(data.email);
			} else {
				// Handle other errors normally
				onError?.(errorMessage);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">{localization.label_email}</Label>
				<Input
					id="email"
					type="email"
					placeholder={localization.placeholder_enter_email_simple}
					{...register("email")}
					className={errors.email ? "border-red-500" : ""}
				/>
				{errors.email && (
					<p className="text-sm text-red-500">
						{errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">{localization.label_password}</Label>
				<Input
					id="password"
					type="password"
					placeholder={localization.placeholder_enter_password}
					{...register("password")}
					className={errors.password ? "border-red-500" : ""}
				/>
				{errors.password && (
					<p className="text-sm text-red-500">
						{errors.password.message}
					</p>
				)}
			</div>

		{onForgotPassword && (
			<div className="text-right">
				<Button
					type="button"
					variant="link"
					onClick={onForgotPassword}
				>
					{localization.button_forgot_password}
				</Button>
			</div>
		)}

			<div className="space-y-3">
				<Button
					type="submit"
					className="w-full bg-primary text-white min-h-12 uppercase"
					disabled={isSubmitting || isLoading}
				>
					{isSubmitting || isLoading ? (
						<div className="flex items-center justify-center space-x-2">
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>{localization.button_signing_in}</span>
						</div>
					) : (
						localization.button_sign_in
					)}
				</Button>

			{onSwitchToSignUp && (
				<div className="text-center">
					<p className="text-sm text-gray-600">
						{localization.description_dont_have_account}{" "}
						<Button
							type="button"
							variant="link"
							onClick={onSwitchToSignUp}
							className="h-auto p-0 font-medium"
						>
							{localization.button_sign_up}
						</Button>
					</p>
				</div>
			)}
			</div>
		</form>
	);
};

export default SignInFormComponent;

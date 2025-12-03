import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
import { SignUpFormData } from "./types/authentication.types";
import localization from "../Localization/LocalizationComponent";

// Validation schema for signup form
const signUpSchema = z
	.object({
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		name: z.string().min(1, "Name is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

interface SignUpFormComponentProps {
	onSuccess?: (email: string) => void;
	onError?: (error: string) => void;
	onUnverifiedUserExists?: (email: string) => Promise<void>;
	onSwitchToSignIn?: () => void;
}

/**
 * SignUpFormComponent - Form component for user registration
 *
 * This component provides a signup form with email, password, and name fields.
 * It includes validation, error handling, and integrates with AWS Cognito.
 *
 * @component
 * @param {SignUpFormComponentProps} props - Component props
 * @returns {JSX.Element} The signup form component
 */
const SignUpFormComponent: React.FC<SignUpFormComponentProps> = ({
	onSuccess,
	onError,
	onUnverifiedUserExists,
	onSwitchToSignIn,
}) => {
	const { signUp, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpFormData): Promise<void> => {
		try {
			setIsSubmitting(true);
			await signUp(data.email, data.password, data.name);
			reset();
			onSuccess?.(data.email);
		} catch (error: any) {
			console.error("Signup error:", error);
			console.error("Signup error details:", {
				name: error.name,
				code: error.code,
				message: error.message,
				isUnverifiedUser: error.isUnverifiedUser,
				fullError: error,
			});

			const errorMessage = error.message || "Failed to create account";

			// Check if error indicates unverified user exists
			// Check multiple error properties to catch all possible formats
			const isUnverifiedUserError =
				error.isUnverifiedUser === true ||
				error.name === "UsernameExistsException" ||
				error.name === "AliasExistsException" ||
				error.code === "UsernameExistsException" ||
				error.code === "AliasExistsException" ||
				errorMessage.includes("UsernameExistsException") ||
				errorMessage.includes("AliasExistsException") ||
				errorMessage.includes(
					"An account with the given email already exists"
				) ||
				errorMessage.includes("User already exists") ||
				errorMessage.toLowerCase().includes("username exists") ||
				errorMessage.toLowerCase().includes("email already exists") ||
				errorMessage.toLowerCase().includes("alias exists");

			if (isUnverifiedUserError && onUnverifiedUserExists) {
				// Handle unverified user scenario - switch to confirmation tab
				await onUnverifiedUserExists(data.email);
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
				<Label htmlFor="name">{localization.label_name}</Label>
				<Input
					id="name"
					type="text"
					placeholder={localization.placeholder_enter_name}
					{...register("name")}
					className={errors.name ? "border-red-500" : ""}
				/>
				{errors.name && (
					<p className="text-sm text-red-500">
						{errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">{localization.label_email}</Label>
				<Input
					id="email"
					type="email"
					placeholder={localization.placeholder_enter_email}
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

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">
					{localization.label_confirm_password}
				</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder={localization.placeholder_confirm_password}
					{...register("confirmPassword")}
					className={errors.confirmPassword ? "border-red-500" : ""}
				/>
				{errors.confirmPassword && (
					<p className="text-sm text-red-500">
						{errors.confirmPassword.message}
					</p>
				)}
			</div>

			<div className="space-y-3">
				<Button
					type="submit"
					className="w-full bg-primary text-white min-h-12 uppercase"
					disabled={isSubmitting || isLoading}
				>
					{isSubmitting || isLoading ? (
						<div className="flex items-center justify-center space-x-2">
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>{localization.button_creating}...</span>
						</div>
					) : (
						localization.button_create_account
					)}
				</Button>

				{onSwitchToSignIn && (
					<div className="text-center">
						<p className="text-sm text-gray-600">
							{localization.description_already_have_account}{" "}
							<button
								type="button"
								onClick={onSwitchToSignIn}
								className="text-primary hover:underline font-medium"
							>
								{localization.button_sign_in || "Sign In"}
							</button>
						</p>
					</div>
				)}
			</div>
		</form>
	);
};

export default SignUpFormComponent;

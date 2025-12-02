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
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

interface SignUpFormComponentProps {
	onSuccess?: (email: string) => void;
	onError?: (error: string) => void;
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
			onError?.(error.message || "Failed to create account");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Enter your name"
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
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="Enter your email"
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
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					placeholder="Enter your password"
					{...register("password")}
					className={errors.password ? "border-red-500" : ""}
				/>
				<p className="text-xs text-gray-600 mt-1">
					{localization.password_complexity_requirements}
				</p>
				{errors.password && (
					<p className="text-sm text-red-500">
						{errors.password.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="Confirm your password"
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
							<span>Creating Account...</span>
						</div>
					) : (
						"Create Account"
					)}
				</Button>

				{onSwitchToSignIn && (
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<button
								type="button"
								onClick={onSwitchToSignIn}
								className="text-primary hover:underline font-medium"
							>
								Sign In
							</button>
						</p>
					</div>
				)}
			</div>
		</form>
	);
};

export default SignUpFormComponent;

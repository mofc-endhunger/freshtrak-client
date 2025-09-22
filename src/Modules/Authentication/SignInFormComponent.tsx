import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
import { SignInFormData } from "./types/authentication.types";

// Validation schema for signin form
const signInSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(1, { message: "Password is required" }),
});

interface SignInFormComponentProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
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
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInFormData): Promise<void> => {
		try {
			setIsSubmitting(true);
			await signIn(data.email, data.password);
			reset();
			onSuccess?.();
		} catch (error: any) {
			console.error("Signin error:", error);
			onError?.(error.message || "Failed to sign in");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
				{errors.password && (
					<p className="text-sm text-red-500">
						{errors.password.message}
					</p>
				)}
			</div>

			{onForgotPassword && (
				<div className="text-right">
					<button
						type="button"
						onClick={onForgotPassword}
						className="text-sm text-primary hover:underline"
					>
						Forgot Password?
					</button>
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
							<span>Signing In...</span>
						</div>
					) : (
						"Sign In"
					)}
				</Button>

				{onSwitchToSignUp && (
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{" "}
							<button
								type="button"
								onClick={onSwitchToSignUp}
								className="text-primary hover:underline font-medium"
							>
								Sign Up
							</button>
						</p>
					</div>
				)}
			</div>
		</form>
	);
};

export default SignInFormComponent;

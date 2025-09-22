import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
import { ConfirmSignUpFormData } from "./types/authentication.types";

// Validation schema for confirmation form
const confirmSignUpSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	code: z.string().min(6, "Confirmation code must be at least 6 characters"),
});

interface ConfirmSignUpFormComponentProps {
	email?: string;
	onSuccess?: () => void;
	onError?: (error: string) => void;
	onResendCode?: () => void;
	onBackToSignUp?: () => void;
}

/**
 * ConfirmSignUpFormComponent - Form component for email verification
 *
 * This component provides a form for users to enter their confirmation code
 * after signing up. It includes validation and error handling.
 *
 * @component
 * @param {ConfirmSignUpFormComponentProps} props - Component props
 * @returns {JSX.Element} The confirmation form component
 */
const ConfirmSignUpFormComponent: React.FC<ConfirmSignUpFormComponentProps> = ({
	email = "",
	onSuccess,
	onError,
	onResendCode,
	onBackToSignUp,
}) => {
	const { confirmSignUp, resendConfirmationCode, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ConfirmSignUpFormData>({
		resolver: zodResolver(confirmSignUpSchema),
		defaultValues: {
			email,
		},
	});

	const onSubmit = async (data: ConfirmSignUpFormData): Promise<void> => {
		try {
			setIsSubmitting(true);
			await confirmSignUp(data.email, data.code);
			reset();
			onSuccess?.();
		} catch (error: any) {
			console.error("Confirmation error:", error);
			onError?.(error.message || "Failed to confirm account");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendCode = async (): Promise<void> => {
		try {
			setIsResending(true);
			const emailValue =
				(document.getElementById("email") as HTMLInputElement)?.value ||
				email;
			await resendConfirmationCode(emailValue);
			onResendCode?.();
		} catch (error: any) {
			console.error("Resend code error:", error);
			onError?.(error.message || "Failed to resend confirmation code");
		} finally {
			setIsResending(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="text-center mb-4">
				<p className="text-sm text-gray-600">
					We've sent a confirmation code to your email address. Please
					enter it below.
				</p>
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
				<Label htmlFor="code">Confirmation Code</Label>
				<Input
					id="code"
					type="text"
					placeholder="Enter confirmation code"
					{...register("code")}
					className={errors.code ? "border-red-500" : ""}
				/>
				{errors.code && (
					<p className="text-sm text-red-500">
						{errors.code.message}
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
							<span>Confirming...</span>
						</div>
					) : (
						"Confirm Account"
					)}
				</Button>

				<div className="flex flex-col space-y-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleResendCode}
						disabled={isResending || isLoading}
						className="w-full"
					>
						{isResending ? (
							<div className="flex items-center justify-center space-x-2">
								<div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
								<span>Resending...</span>
							</div>
						) : (
							"Resend Code"
						)}
					</Button>

					{onBackToSignUp && (
						<Button
							type="button"
							variant="ghost"
							onClick={onBackToSignUp}
							className="w-full"
						>
							Back to Sign Up
						</Button>
					)}
				</div>
			</div>
		</form>
	);
};

export default ConfirmSignUpFormComponent;

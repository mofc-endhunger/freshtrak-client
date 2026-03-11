import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
// Form data interface (without email since it's passed as prop)
interface ConfirmResetPasswordFormFields {
	code: string;
	newPassword: string;
	confirmPassword: string;
}

// Validation schema for confirm reset password form
const confirmResetPasswordSchema = z
	.object({
		code: z.string().min(1, { message: "Confirmation code is required" }),
		newPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" }),
		confirmPassword: z
			.string()
			.min(1, { message: "Please confirm your password" }),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

interface ConfirmResetPasswordFormComponentProps {
	email: string;
	onSuccess?: () => void;
	onError?: (error: string) => void;
	onBackToReset?: () => void;
}

/**
 * ConfirmResetPasswordFormComponent - Form component for confirming password reset
 *
 * This component provides a form for users to enter the confirmation code
 * and new password to complete the password reset process.
 *
 * @component
 * @param {ConfirmResetPasswordFormComponentProps} props - Component props
 * @returns {JSX.Element} The confirm reset password form component
 */
const ConfirmResetPasswordFormComponent: React.FC<
	ConfirmResetPasswordFormComponentProps
> = ({ email, onSuccess, onError, onBackToReset }) => {
	const { confirmResetPassword, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ConfirmResetPasswordFormFields>({
		resolver: zodResolver(confirmResetPasswordSchema),
	});

	const onSubmit = async (
		data: ConfirmResetPasswordFormFields
	): Promise<void> => {
		try {
			setIsSubmitting(true);
			await confirmResetPassword(email, data.code, data.newPassword);
			reset();
			onSuccess?.();
		} catch (error: any) {
			console.error("Confirm reset password error:", error);
			onError?.(error.message || "Failed to confirm password reset");
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
					value={email}
					disabled
					className="bg-gray-100"
				/>
				<p className="text-sm text-gray-600">
					We sent a confirmation code to this email address
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="code">Confirmation Code</Label>
				<Input
					id="code"
					type="text"
					placeholder="Enter the code from your email"
					{...register("code")}
					className={errors.code ? "border-red-500" : ""}
				/>
				{errors.code && (
					<p className="text-sm text-red-500">
						{errors.code.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="newPassword">New Password</Label>
				<Input
					id="newPassword"
					type="password"
					placeholder="Enter your new password"
					{...register("newPassword")}
					className={errors.newPassword ? "border-red-500" : ""}
				/>
				{errors.newPassword && (
					<p className="text-sm text-red-500">
						{errors.newPassword.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm New Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="Confirm your new password"
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
							<span>Resetting Password...</span>
						</div>
					) : (
						"Reset Password"
					)}
				</Button>

			{onBackToReset && (
				<div className="text-center">
					<p className="text-sm text-gray-600">
						Didn't receive the code?{" "}
						<Button
							type="button"
							variant="link"
							onClick={onBackToReset}
							className="text-primary hover:underline font-medium p-0 h-auto"
						>
							Resend Code
						</Button>
					</p>
				</div>
			)}
			</div>
		</form>
	);
};

export default ConfirmResetPasswordFormComponent;

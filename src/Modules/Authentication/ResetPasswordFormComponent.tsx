import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "./AuthContext";
import { ResetPasswordFormData } from "./types/authentication.types";
import localization from "../Localization/LocalizationComponent";

// Validation schema for reset password form
const resetPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

interface ResetPasswordFormComponentProps {
	onSuccess?: (email: string) => void;
	onError?: (error: string) => void;
	onBackToSignIn?: () => void;
}

/**
 * ResetPasswordFormComponent - Form component for initiating password reset
 *
 * This component provides a form for users to enter their email address
 * to initiate a password reset process. It integrates with AWS Cognito.
 *
 * @component
 * @param {ResetPasswordFormComponentProps} props - Component props
 * @returns {JSX.Element} The reset password form component
 */
const ResetPasswordFormComponent: React.FC<ResetPasswordFormComponentProps> = ({
	onSuccess,
	onError,
	onBackToSignIn,
}) => {
	const { resetPassword, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
		try {
			setIsSubmitting(true);
			await resetPassword(data.email);
			reset();
			onSuccess?.(data.email);
		} catch (error: any) {
			console.error("Reset password error:", error);
			onError?.(error.message || "Failed to reset password");
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

			<div className="space-y-3">
				<Button
					type="submit"
					className="w-full bg-primary text-white min-h-12 uppercase"
					disabled={isSubmitting || isLoading}
				>
					{isSubmitting || isLoading ? (
						<div className="flex items-center justify-center space-x-2">
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>{localization.button_processing}...</span>
						</div>
					) : (
						localization.button_reset_password
					)}
				</Button>

			{onBackToSignIn && (
				<div className="text-center">
					<p className="text-sm text-gray-600">
						{localization.description_remember_password}{" "}
						<Button
							type="button"
							variant="link"
							onClick={onBackToSignIn}
							className="text-primary hover:underline font-medium p-0 h-auto"
						>
							{localization.button_sign_in || "Sign In"}
						</Button>
					</p>
				</div>
			)}
			</div>
		</form>
	);
};

export default ResetPasswordFormComponent;

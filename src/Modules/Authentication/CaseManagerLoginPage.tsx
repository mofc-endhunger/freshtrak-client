import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RENDER_URL } from "../../Utils/Urls";
import { StorageService } from "../../Utils/StorageService";
import { useAuth } from "./AuthContext";
import localization from "../Localization/LocalizationComponent";
import { HomeIcon } from "lucide-react";

const getSchema = () =>
	z.object({
		email: z.string().email(localization.error_please_enter_valid_email),
		password: z
			.string()
			.min(1, { message: localization.error_password_required }),
	});

interface FormData {
	email: string;
	password: string;
}

function decodeTokenPayload(token: string): Record<string, any> | null {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;
		return JSON.parse(atob(parts[1]));
	} catch {
		return null;
	}
}

const CaseManagerLoginPage: React.FC = () => {
	const navigate = useNavigate();
	const { signIn, signOut, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getSchema()),
	});

	const onSubmit = async (data: FormData): Promise<void> => {
		setErrorMessage("");
		setIsSubmitting(true);

		try {
			await signIn(data.email, data.password);

		const session = await fetchAuthSession();
		// Use the ID token: it contains the email claim and cognito:groups, unlike the access token
		const accessToken = session.tokens?.idToken?.toString();

			if (!accessToken) {
				await signOut();
				setErrorMessage(localization.cm_login_error_generic);
				return;
			}

			const payload = decodeTokenPayload(accessToken);
			const groups: string[] = payload?.["cognito:groups"] ?? [];

			if (!groups.includes("case_managers")) {
				await signOut();
				setErrorMessage(localization.cm_login_unauthorized);
				return;
			}

			StorageService.setUserRole("case_manager");
			navigate(RENDER_URL.ROOT_URL);
		} catch (error: any) {
			try {
				await signOut();
			} catch {
				// ignore sign-out errors during cleanup
			}
			setErrorMessage(
				error?.message || localization.cm_login_error_generic,
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-bold mb-2 text-center">
					{localization.cm_login_title}
				</h1>
				<p className="text-sm text-gray-500 text-center mb-6">
					{localization.cm_login_subtitle}
				</p>

				{errorMessage && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
						<p className="text-sm text-red-600">{errorMessage}</p>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="cm-email">
							{localization.cm_login_email_label}
						</Label>
						<Input
							id="cm-email"
							type="email"
							placeholder={localization.cm_login_email_label}
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
						<Label htmlFor="cm-password">
							{localization.cm_login_password_label}
						</Label>
						<Input
							id="cm-password"
							type="password"
							placeholder={localization.cm_login_password_label}
							{...register("password")}
							className={errors.password ? "border-red-500" : ""}
						/>
						{errors.password && (
							<p className="text-sm text-red-500">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full bg-primary text-white min-h-12 uppercase"
						disabled={isSubmitting || isLoading}
					>
						{isSubmitting || isLoading ? (
							<div className="flex items-center justify-center space-x-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span>{localization.cm_login_button}...</span>
							</div>
						) : (
							localization.cm_login_button
						)}
					</Button>
				</form>

				<div className="flex flex-col gap-2 text-center mt-6">
					<Button
						variant="ghost"
						onClick={() => navigate(RENDER_URL.LOGIN_URL)}
						className="text-gray-600 hover:text-gray-900"
					>
						← {localization.button_back || "Back"}
					</Button>
					<Button
						variant="ghost"
						onClick={() => navigate(RENDER_URL.ROOT_URL)}
						className="text-gray-600 hover:text-gray-900"
					>
						{/* Home icon */}
						<HomeIcon className="w-4 h-4" />
						{localization.button_back_to_home || "Back to Home"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CaseManagerLoginPage;

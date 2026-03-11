import React from "react";
import {
	UseFormRegister,
	UseFormWatch,
	UseFormSetValue,
	FieldErrors,
} from "react-hook-form";
import PhoneInputComponent from "./PhoneInputComponent";
import localization from "../Localization/LocalizationComponent";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

// Component props interface
interface ContactInformationComponentProps {
	register: UseFormRegister<any>;
	errors?: FieldErrors<any>;
	getValues?: () => any;
	setValue: UseFormSetValue<any>;
	watch: UseFormWatch<any>;
	className?: string;
	"data-testid"?: string;
}

const ContactInformationComponent: React.FC<
	ContactInformationComponentProps
> = ({
	register,
	errors = {},
	getValues,
	setValue,
	watch,
	className = "",
	"data-testid": testId = "contact-information-component",
}) => {
	const showPhonePermissions = !watch("no_phone_number");
	const showEmailPermissions = !watch("no_email");
	const phone = watch("phone") || "";
	const email = watch("email") || "";

	const phoneFieldName = "phone";

	return (
		<div className={`space-y-6 ${className}`} data-testid={testId}>
			<h2 className="text-lg font-semibold text-gray-900">
				{localization.register_how_to_contact}
			</h2>

		{/* Phone Number Section */}
		{showPhonePermissions && (
			<div className="space-y-2">
				<Label
					htmlFor="phone"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.phone_number}
					<span className="text-red-500 ml-1">*</span>
				</Label>
					<PhoneInputComponent
						type="text"
						className={`
							w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-indigo-500 focus:border-indigo-500
							${errors.phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
						`}
						name={phoneFieldName}
						placeholder="(xxx) xxx-xxxx"
						id="phone"
						value={phone}
						onChange={(e: string) => {
							setValue("phone", e);
						}}
					/>
					{/* Hidden input for phone validation */}
					<input
						type="hidden"
						{...register("phone", {
							required: !watch("no_phone_number")
								? "Phone number is required"
								: false,
						})}
					/>
					{errors.phone && (
						<span
							className="text-sm text-red-600"
							data-testid="phone-error"
						>
							This field is required. If you have no phone check
							"No Phone Available".
						</span>
					)}
				</div>
			)}

		{/* No Phone Checkbox */}
		{phone === "" && (
			<div className="flex items-center space-x-2">
				<Checkbox
					id="no_phone_number"
					{...register("no_phone_number")}
				/>
				<Label
					htmlFor="no_phone_number"
					className="text-sm text-gray-700"
				>
					{localization.no_phone}
				</Label>
			</div>
		)}

		{/* Phone Permission Checkbox */}
		{showPhonePermissions && (
			<div className="flex items-center space-x-2">
				<Checkbox
					id="permission_to_text"
					{...register("permission_to_text")}
				/>
				<Label
					htmlFor="permission_to_text"
					className="text-sm text-gray-700"
				>
					<span data-testid="phone permission">
						{localization.phone_contact_you}
					</span>
				</Label>
			</div>
		)}

		{/* Email Section */}
		{showEmailPermissions && (
			<div className="space-y-2">
				<Label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.label_email}
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Input
					type="email"
					id="email"
					autoComplete="off"
					data-testid="email-input"
					className={
						errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
					}
					{...register("email", {
						required: !watch("no_email")
							? "Email is required"
							: false,
					})}
				/>
				<div className="text-sm text-gray-500">
					No Email?{" "}
					<a
						href="https://support.google.com/mail/answer/56256"
						target="_blank"
						rel="noopener noreferrer"
						className="text-indigo-600 hover:text-indigo-500 underline"
					>
						Get one free from Google.
					</a>
				</div>
				{errors.email && (
					<span
						className="text-sm text-red-600"
						data-testid="email-error"
					>
						This field is required
					</span>
				)}
			</div>
		)}

		{/* No Email Checkbox */}
		{email === "" && (
			<div className="flex items-center space-x-2">
				<Checkbox
					id="no_email"
					{...register("no_email")}
				/>
				<Label htmlFor="no_email" className="text-sm text-gray-700">
					{localization.no_email}
				</Label>
			</div>
		)}

		{/* Email Permission Checkbox */}
		{showEmailPermissions && (
			<div className="flex items-center space-x-2">
				<Checkbox
					id="permission_to_email"
					{...register("permission_to_email")}
				/>
				<Label
					htmlFor="permission_to_email"
					className="text-sm text-gray-700"
				>
					<span data-testid="email permission">
						{localization.email_contact_you}
					</span>
				</Label>
			</div>
		)}
		</div>
	);
};

export default ContactInformationComponent;

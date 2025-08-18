import React, { Fragment } from "react";
import {
	UseFormRegister,
	UseFormWatch,
	UseFormSetValue,
	FieldErrors,
} from "react-hook-form";
import PhoneInputComponent from "./PhoneInputComponent";
import localization from "../Localization/LocalizationComponent";

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

// Contact information data interface
interface ContactInformationData {
	phone: string;
	email: string;
	no_phone_number: boolean;
	no_email: boolean;
	permission_to_text: boolean;
	permission_to_email: boolean;
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
					<label
						htmlFor="phone"
						className="block text-sm font-medium text-gray-700"
					>
						{localization.phone_number}
						<span className="text-red-500 ml-1">*</span>
					</label>
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
					<input
						type="checkbox"
						className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 
									border-gray-300 rounded"
						id="no_phone_number"
						{...register("no_phone_number")}
					/>
					<label
						htmlFor="no_phone_number"
						className="text-sm text-gray-700"
					>
						{localization.no_phone}
					</label>
				</div>
			)}

			{/* Phone Permission Checkbox */}
			{showPhonePermissions && (
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 
									border-gray-300 rounded"
						id="permission_to_text"
						{...register("permission_to_text")}
					/>
					<label
						htmlFor="permission_to_text"
						className="text-sm text-gray-700"
					>
						<span data-testid="phone permission">
							{localization.phone_contact_you}
						</span>
					</label>
				</div>
			)}

			{/* Email Section */}
			{showEmailPermissions && (
				<div className="space-y-2">
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700"
					>
						Email
						<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						type="email"
						className={`
							w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
							placeholder-gray-400 focus:outline-none focus:ring-2
							focus:ring-indigo-500 focus:border-indigo-500
							${errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
						`}
						id="email"
						autoComplete="off"
						data-testid="email-input"
						{...register("email")}
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
					<input
						type="checkbox"
						className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 
									border-gray-300 rounded"
						id="no_email"
						{...register("no_email")}
					/>
					<label htmlFor="no_email" className="text-sm text-gray-700">
						{localization.no_email}
					</label>
				</div>
			)}

			{/* Email Permission Checkbox */}
			{showEmailPermissions && (
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 
									border-gray-300 rounded"
						id="permission_to_email"
						{...register("permission_to_email")}
					/>
					<label
						htmlFor="permission_to_email"
						className="text-sm text-gray-700"
					>
						<span data-testid="email permission">
							{localization.email_contact_you}
						</span>
					</label>
				</div>
			)}
		</div>
	);
};

export default ContactInformationComponent;

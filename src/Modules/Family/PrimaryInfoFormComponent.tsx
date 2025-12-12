import React from "react";
import {
	UseFormRegister,
	UseFormWatch,
	UseFormSetValue,
	UseFormGetValues,
	UseFormTrigger,
	FieldErrors,
} from "react-hook-form";
import localization from "../Localization/LocalizationComponent";
import { Button } from "../../components/ui/button";
import { validateDobText, formatDateInput } from "./utils/dateValidation";

// Component props interface
interface PrimaryInfoFormComponentProps {
	register: UseFormRegister<any>;
	watch: UseFormWatch<any>;
	setValue: UseFormSetValue<any>;
	getValues: UseFormGetValues<any>;
	trigger: UseFormTrigger<any>;
	errors: FieldErrors<any>;
	continueHandler?: (values: any) => void;
	className?: string;
	"data-testid"?: string;
	isHouseholdSetup?: boolean;
}

const PrimaryInfoFormComponent: React.FC<PrimaryInfoFormComponentProps> = ({
	register,
	watch,
	setValue,
	getValues,
	trigger,
	errors,
	continueHandler,
	className = "",
	"data-testid": testId = "primary-info-form-component",
	isHouseholdSetup = false,
}) => {
	const date_of_birth = watch("date_of_birth") || "";

	// Date of birth input handler - formats as user types
	const handleChangeDob = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedValue = formatDateInput(e.target.value);
		setValue("date_of_birth", formattedValue);
	};

	// Continue button handler
	const handleContinue = async () => {
		const values = getValues();
		const result = await trigger([
			"first_name",
			"last_name",
			"date_of_birth",
			"gender",
		]);
		if (result && continueHandler) {
			continueHandler(values);
		}
	};

	return (
		<div className={`space-y-6 ${className}`} data-testid={testId}>
			<h2 className="text-lg font-semibold text-highlight">
				{localization.register_who_are_you}
			</h2>

			{/* First Name Field */}
			<div className="space-y-2">
				<label
					htmlFor="first_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization?.first_name}
					<span className="text-red-500 ml-1">*</span>
				</label>
				<input
					type="text"
					className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:border-indigo-500 
            ${
				errors?.first_name
					? "border-red-500 focus:ring-red-500 focus:border-red-500"
					: ""
			}
          `}
					id="first_name"
					data-testid="first-name-input"
					{...register("first_name", { required: true })}
				/>
				{errors?.first_name && (
					<span
						className="text-sm text-red-600"
						data-testid="first-name-error"
					>
						{localization.error_first_name_required}
					</span>
				)}
			</div>

			{/* Middle Name Field */}
			<div className="space-y-2">
				<label
					htmlFor="middle_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.middle_name}
				</label>
				<input
					type="text"
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-indigo-500 focus:border-indigo-500"
					id="middle_name"
					data-testid="middle-name-input"
					{...register("middle_name")}
				/>
			</div>

			{/* Last Name Field */}
			<div className="space-y-2">
				<label
					htmlFor="last_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization?.last_name}
					<span className="text-red-500 ml-1">*</span>
				</label>
				<input
					type="text"
					className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:border-indigo-500 
            ${
				errors?.last_name
					? "border-red-500 focus:ring-red-500 focus:border-red-500"
					: ""
			}
          `}
					id="last_name"
					data-testid="last-name-input"
					{...register("last_name", { required: true })}
				/>
				{errors?.last_name && (
					<span
						className="text-sm text-red-600"
						data-testid="last-name-error"
					>
						{localization.error_last_name_required}
					</span>
				)}
			</div>

			{/* Suffix Field */}
			<div className="space-y-2">
				<label
					htmlFor="suffix"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.suffix}
				</label>
				<select
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					id="suffix"
					data-testid="suffix-select"
					{...register("suffix")}
				>
					<option value="">{localization.option_suffix_none}</option>
					<option value="Jr">{localization.option_suffix_jr}</option>
					<option value="Sr">{localization.option_suffix_sr}</option>
					<option value="II">{localization.option_suffix_ii}</option>
					<option value="III">{localization.option_suffix_iii}</option>
					<option value="IV">{localization.option_suffix_iv}</option>
					<option value="V">{localization.option_suffix_v}</option>
				</select>
			</div>

			{/* Date of Birth Field */}
			<div className="space-y-2">
				<label
					htmlFor="date_of_birth"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.dob}
					<span className="text-red-500 ml-1">*</span>
				</label>
				<input
					type="text"
					className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-indigo-500 focus:border-indigo-500 
            ${
				errors?.date_of_birth
					? "border-red-500 focus:ring-red-500 focus:border-red-500"
					: ""
			}
          `}
					id="date_of_birth"
					value={date_of_birth}
					placeholder={localization.placeholder_date_format}
					data-testid="date-of-birth-input"
					{...register("date_of_birth", {
						validate: validateDobText,
						onChange: handleChangeDob,
					})}
				/>
				{errors?.date_of_birth && (
					<span
						className="text-sm text-red-600"
						data-testid="date-of-birth-error"
					>
						{String(
							errors.date_of_birth?.message ||
								localization.error_please_enter_valid_date
						)}
					</span>
				)}
			</div>

			{/* Gender Field */}
			<div className="space-y-2">
				<label
					htmlFor="gender"
					className="block text-sm font-medium text-gray-700"
				>
					{localization?.gender}
					<span className="text-red-500 ml-1">*</span>
				</label>
				<select
					className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
            ${
				errors?.gender
					? "border-red-500 focus:ring-red-500 focus:border-red-500"
					: ""
			}
          `}
					id="gender"
					data-testid="gender-select"
					{...register("gender", { required: true })}
				>
					<option value=""></option>
					<option value="male">{localization.option_gender_male}</option>
					<option value="female">{localization.option_gender_female}</option>
					<option value="other">{localization.option_gender_other}</option>
					<option value="not_specify">
						{localization.option_gender_prefer_not_to_say}
					</option>
				</select>
				{errors?.gender && (
					<span
						className="text-sm text-red-600"
						data-testid="gender-error"
					>
						{localization.error_field_required}
					</span>
				)}
			</div>

			{/* Continue Button */}
			{!isHouseholdSetup && (
				<div className="flex justify-start pt-4">
					<Button
						type="button"
						onClick={handleContinue}
						variant="highlight"
						data-testid="continue-button"
					>
						{localization.button_continue}
					</Button>
				</div>
			)}
		</div>
	);
};

export default PrimaryInfoFormComponent;

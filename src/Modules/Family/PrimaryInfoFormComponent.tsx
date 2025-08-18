import React from "react";
import {
	UseFormRegister,
	UseFormWatch,
	UseFormSetValue,
	UseFormGetValues,
	UseFormTrigger,
	FieldErrors,
} from "react-hook-form";
import moment from "moment";
import localization from "../Localization/LocalizationComponent";

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
}

// Form data interface
interface PrimaryInfoFormData {
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	date_of_birth?: string;
	gender?: string;
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
}) => {
	const date_of_birth = watch("date_of_birth") || "";

	// Date validation utility function
	const checkValue = (str: string, max: number): string => {
		if (str.charAt(0) !== "0" || str === "00") {
			const num = parseInt(str);
			if (isNaN(num) || num <= 0 || num > max) return "1";
			const result =
				num > parseInt(max.toString().charAt(0)) &&
				num.toString().length === 1
					? "0" + num
					: num.toString();
			return result;
		}
		return str;
	};

	// Date of birth input handler
	const handleChangeDob = (e: React.ChangeEvent<HTMLInputElement>) => {
		let input = e.target.value;
		if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);

		const values = input.split("/").map(v => v.replace(/\D/g, ""));

		if (values[0]) values[0] = checkValue(values[0], 12);
		if (values[1]) values[1] = checkValue(values[1], 31);

		const output = values.map((v, i) => {
			return v.length === 2 && i < 2 ? v + " / " : v;
		});

		const value = output.join("").substr(0, 14);
		setValue("date_of_birth", value);
	};

	// Date of birth validation
	const isValidDob = (value: string): boolean => {
		const maxAgeDate = moment().subtract(123, "years");
		const enteredDate = moment(value, "MM / DD / YYYY");
		return enteredDate.isAfter(maxAgeDate);
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
			<h2 className="text-lg font-semibold text-gray-900">
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
						This field is required
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
						This field is required
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
					<option value=""></option>
					<option value="Jr">Jr</option>
					<option value="Sr">Sr</option>
					<option value="II">II</option>
					<option value="III">III</option>
					<option value="IV">IV</option>
					<option value="V">V</option>
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
					placeholder="MM / DD / YYYY"
					data-testid="date-of-birth-input"
					{...register("date_of_birth", {
						validate: (value: string) =>
							isValidDob(value) ||
							"Please enter a valid date of birth.",
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
								"Please enter a valid date of birth."
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
					<option value="male">{localization?.male}</option>
					<option value="female">{localization?.female}</option>
					<option value="other">{localization?.other}</option>
					<option value="not_specify">
						{localization?.not_to_say}
					</option>
				</select>
				{errors?.gender && (
					<span
						className="text-sm text-red-600"
						data-testid="gender-error"
					>
						This field is required
					</span>
				)}
			</div>

			{/* Continue Button */}
			<div className="flex justify-end pt-4">
				<button
					type="button"
					onClick={handleContinue}
					className="px-6 py-3 text-base font-medium text-white bg-indigo-600 
                   border border-transparent rounded-md shadow-sm 
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-indigo-500 
                   transition-colors duration-200"
					data-testid="continue-button"
				>
					Continue
				</button>
			</div>
		</div>
	);
};

export default PrimaryInfoFormComponent;

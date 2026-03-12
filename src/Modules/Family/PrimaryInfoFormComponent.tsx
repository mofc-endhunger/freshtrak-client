import React, { useState, useEffect } from "react";
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
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { validateDobText, formatDateInput } from "./utils/dateValidation";
import { getTranslatedLanguageOptions } from "../Localization/languageOptions";

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

const GENDER_OPTIONS: { value: string; label: () => string }[] = [
	{ value: "male", label: () => localization.option_gender_male },
	{ value: "female", label: () => localization.option_gender_female },
	{ value: "other", label: () => localization.option_gender_other },
	{
		value: "not_specify",
		label: () => localization.option_gender_prefer_not_to_say,
	},
];

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

	// Track Select field values via watch subscription instead of inline watch(),
	// because inline watch() doesn't reliably reflect values set by reset()
	// for fields that aren't connected to a native DOM input via register().
	const [genderValue, setGenderValue] = useState(() => getValues("gender") || "");
	const [preferredLanguageValue, setPreferredLanguageValue] = useState(
		() => getValues("preferred_language") || ""
	);
	const [suffixValue, setSuffixValue] = useState(() => getValues("suffix") || "");

	useEffect(() => {
		const subscription = watch((formValues) => {
			setGenderValue(formValues.gender || "");
			setPreferredLanguageValue(formValues.preferred_language || "");
			setSuffixValue(formValues.suffix || "");
		});
		return () => subscription.unsubscribe();
	}, [watch]);

	const handleChangeDob = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedValue = formatDateInput(e.target.value);
		setValue("date_of_birth", formattedValue);
	};

	const handleContinue = async () => {
		const currentGender = getValues("gender") || "";
		const currentLang = getValues("preferred_language") || "";

		const result = await trigger([
			"first_name",
			"last_name",
			"date_of_birth",
		]);
		if (!result || !currentGender) return;
		if (isHouseholdSetup && !currentLang) return;

		if (continueHandler) {
			continueHandler(getValues());
		}
	};

	const handleGenderChange = (val: string) => {
		setValue("gender", val, { shouldValidate: true });
		setGenderValue(val);
	};

	const handleLanguageChange = (val: string) => {
		setValue("preferred_language", val, { shouldValidate: true });
		setPreferredLanguageValue(val);
	};

	const handleSuffixChange = (val: string) => {
		setValue("suffix", val);
		setSuffixValue(val);
	};

	const translatedLanguageOptions = getTranslatedLanguageOptions();
	const getGenderLabel = (val: string) =>
		GENDER_OPTIONS.find((o) => o.value === val)?.label();
	const getLanguageLabel = (val: string) =>
		translatedLanguageOptions.find((o) => o.code === val)?.text;

	return (
		<div className={`space-y-6 ${className}`} data-testid={testId}>
			<h2 className="text-lg font-semibold text-highlight">
				{localization.register_who_are_you}
			</h2>

			{/* First Name Field */}
			<div className="space-y-2">
				<Label
					htmlFor="first_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization?.first_name}
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Input
					type="text"
					id="first_name"
					data-testid="first-name-input"
					className={
						errors?.first_name
							? "border-red-500 focus:ring-red-500 focus:border-red-500"
							: ""
					}
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
				<Label
					htmlFor="middle_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.middle_name}
				</Label>
				<Input
					type="text"
					id="middle_name"
					data-testid="middle-name-input"
					{...register("middle_name")}
				/>
			</div>

			{/* Last Name Field */}
			<div className="space-y-2">
				<Label
					htmlFor="last_name"
					className="block text-sm font-medium text-gray-700"
				>
					{localization?.last_name}
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Input
					type="text"
					id="last_name"
					data-testid="last-name-input"
					className={
						errors?.last_name
							? "border-red-500 focus:ring-red-500 focus:border-red-500"
							: ""
					}
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
				<Label
					htmlFor="suffix"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.suffix}
				</Label>
				<Select
					value={suffixValue}
					onValueChange={handleSuffixChange}
				>
					<SelectTrigger id="suffix">
						<SelectValue placeholder={localization.option_suffix_none}>
							{suffixValue || undefined}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Jr">
							{localization.option_suffix_jr}
						</SelectItem>
						<SelectItem value="Sr">
							{localization.option_suffix_sr}
						</SelectItem>
						<SelectItem value="II">
							{localization.option_suffix_ii}
						</SelectItem>
						<SelectItem value="III">
							{localization.option_suffix_iii}
						</SelectItem>
						<SelectItem value="IV">
							{localization.option_suffix_iv}
						</SelectItem>
						<SelectItem value="V">
							{localization.option_suffix_v}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Date of Birth Field */}
			<div className="space-y-2">
				<Label
					htmlFor="date_of_birth"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.dob}
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Input
					type="text"
					id="date_of_birth"
					value={date_of_birth}
					placeholder={localization.placeholder_date_format}
					data-testid="date-of-birth-input"
					className={
						errors?.date_of_birth
							? "border-red-500 focus:ring-red-500 focus:border-red-500"
							: ""
					}
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
				<Label
					htmlFor="gender"
					className="block text-sm font-medium text-gray-700"
				>
					{localization.gender}
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Select
					value={genderValue}
					onValueChange={handleGenderChange}
				>
					<SelectTrigger id="gender">
						<SelectValue placeholder="Select Gender">
							{getGenderLabel(genderValue) || undefined}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{GENDER_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{!genderValue && errors?.gender && (
					<span
						className="text-sm text-red-600"
						data-testid="gender-error"
					>
						{localization.error_field_required}
					</span>
				)}
			</div>

			{/* Preferred Language (household setup only) */}
			{isHouseholdSetup && (
				<div className="space-y-2">
					<Label
						htmlFor="preferred_language"
						className="block text-sm font-medium text-gray-700"
					>
						{localization.label_preferred_language ||
							"Preferred language"}
						<span className="text-red-500 ml-1">*</span>
					</Label>
					<Select
						value={preferredLanguageValue}
						onValueChange={handleLanguageChange}
					>
						<SelectTrigger id="preferred_language">
							<SelectValue placeholder="Select Language">
								{getLanguageLabel(preferredLanguageValue) ||
									undefined}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{translatedLanguageOptions.map((opt) => (
								<SelectItem key={opt.id} value={opt.code}>
									{opt.text}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{!preferredLanguageValue &&
						errors?.preferred_language && (
							<span
								className="text-sm text-red-600"
								data-testid="preferred-language-error"
							>
								{localization.error_please_select_valid_language ||
									"Please select a language"}
							</span>
						)}
				</div>
			)}

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

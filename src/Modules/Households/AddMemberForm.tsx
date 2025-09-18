/**
 * Add Member Form Component
 * Form for adding new household members
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
	User,
	Plus,
	Phone,
	Mail,
	MapPin,
	Save,
	X,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { CreateMemberApiRequest } from "./types/api.types";
import {
	MemberGender,
	MemberRace,
	MemberEthnicity,
} from "./types/household.types";

interface AddMemberFormProps {
	householdId: number;
	onSave: (memberData: CreateMemberApiRequest) => Promise<void>;
	onCancel?: () => void;
	onSuccess?: (memberId: number) => void;
	className?: string;
}

interface FormData {
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	date_of_birth: string;
	gender?: string;
	race?: string;
	ethnicity?: string;
	phone?: string;
	email?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	status: "active" | "inactive";
	is_freshtrak_user: boolean;
	preferred_contact_method?: "phone" | "email" | "both";
	use_household_address?: boolean;
	notes?: string;
}

const GENDER_OPTIONS = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
	{ value: "non-binary", label: "Non-binary" },
	{ value: "other", label: "Other" },
	{ value: "prefer-not-to-say", label: "Prefer not to say" },
];

const RACE_OPTIONS = [
	{ value: "american-indian", label: "American Indian or Alaska Native" },
	{ value: "asian", label: "Asian" },
	{ value: "black", label: "Black or African American" },
	{
		value: "native-hawaiian",
		label: "Native Hawaiian or Other Pacific Islander",
	},
	{ value: "white", label: "White" },
	{ value: "other", label: "Other" },
	{ value: "prefer-not-to-say", label: "Prefer not to say" },
];

const ETHNICITY_OPTIONS = [
	{ value: "hispanic", label: "Hispanic or Latino" },
	{ value: "not-hispanic", label: "Not Hispanic or Latino" },
	{ value: "prefer-not-to-say", label: "Prefer not to say" },
];

const US_STATES = [
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
];

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
	householdId,
	onSave,
	onCancel,
	onSuccess,
	className = "",
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm<FormData>({
		defaultValues: {
			status: "active",
			is_freshtrak_user: false,
		},
		mode: "onChange",
	});

	const watchedValues = watch();

	const calculateAge = (dateOfBirth: string): number => {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	};

	const formatPhoneNumber = (value: string): string => {
		const cleaned = value.replace(/\D/g, "");
		if (cleaned.length >= 6) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(
				3,
				6
			)}-${cleaned.slice(6, 10)}`;
		} else if (cleaned.length >= 3) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
		}
		return cleaned;
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setValue("phone", formatted);
	};

	const onSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);
			setSubmitError(null);

			// Prepare API request data
			const requestData: CreateMemberApiRequest = {
				first_name: data.first_name,
				middle_name: data.middle_name || undefined,
				last_name: data.last_name,
				suffix: data.suffix || undefined,
				date_of_birth: data.date_of_birth,
				gender: (data.gender as MemberGender) || undefined,
				race: (data.race as MemberRace) || undefined,
				ethnicity: (data.ethnicity as MemberEthnicity) || undefined,
				phone: data.phone || undefined,
				email: data.email || undefined,
				address_line_1: data.address_line_1 || undefined,
				address_line_2: data.address_line_2 || undefined,
				city: data.city || undefined,
				state: data.state || undefined,
				zip_code: data.zip_code || undefined,
				status: data.status,
				is_freshtrak_user: data.is_freshtrak_user,
				notes: data.notes || undefined,
			};

			// Use the onSave prop to handle the API call
			await onSave(requestData);

			// Success
			onSuccess?.(0); // We don't have the member ID from the parent component
		} catch (err) {
			console.error("Error creating member:", err);
			setSubmitError(
				err instanceof Error
					? err.message
					: "Failed to create member. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getAgeGroup = (age: number): string => {
		if (age < 18) return "Child";
		if (age >= 60) return "Senior";
		return "Adult";
	};

	const getAgeGroupColor = (age: number): string => {
		if (age < 18) return "bg-blue-100 text-blue-800 border-blue-200";
		if (age >= 60) return "bg-orange-100 text-orange-800 border-orange-200";
		return "bg-green-100 text-green-800 border-green-200";
	};

	const currentAge = watchedValues.date_of_birth
		? calculateAge(watchedValues.date_of_birth)
		: 0;

	return (
		<Card className={`max-w-4xl mx-auto ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Plus className="w-6 h-6 text-highlight" />
					<span>Add New Member</span>
				</CardTitle>
				<CardDescription>
					Add a new member to your household
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
							<User className="w-5 h-5 text-highlight" />
							<span>Personal Information</span>
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="first_name">First Name *</Label>
								<Input
									id="first_name"
									{...register("first_name", {
										required: "First name is required",
										minLength: {
											value: 2,
											message:
												"First name must be at least 2 characters",
										},
									})}
									placeholder="John"
								/>
								{errors.first_name && (
									<p className="text-sm text-red-600 mt-1">
										{errors.first_name.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="middle_name">Middle Name</Label>
								<Input
									id="middle_name"
									{...register("middle_name")}
									placeholder="Michael"
								/>
							</div>

							<div>
								<Label htmlFor="last_name">Last Name *</Label>
								<Input
									id="last_name"
									{...register("last_name", {
										required: "Last name is required",
										minLength: {
											value: 2,
											message:
												"Last name must be at least 2 characters",
										},
									})}
									placeholder="Doe"
								/>
								{errors.last_name && (
									<p className="text-sm text-red-600 mt-1">
										{errors.last_name.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="suffix">Suffix</Label>
								<Input
									id="suffix"
									{...register("suffix")}
									placeholder="Jr., Sr., III"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="date_of_birth">
									Date of Birth *
								</Label>
								<Input
									id="date_of_birth"
									type="date"
									{...register("date_of_birth", {
										required: "Date of birth is required",
										validate: value => {
											const age = calculateAge(value);
											if (age < 0)
												return "Date of birth cannot be in the future";
											if (age > 120)
												return "Please enter a valid date of birth";
											return true;
										},
									})}
								/>
								{errors.date_of_birth && (
									<p className="text-sm text-red-600 mt-1">
										{errors.date_of_birth.message}
									</p>
								)}
								{currentAge > 0 && (
									<div className="mt-2">
										<Badge
											className={getAgeGroupColor(
												currentAge
											)}
										>
											{currentAge} years old -{" "}
											{getAgeGroup(currentAge)}
										</Badge>
									</div>
								)}
							</div>

							<div>
								<Label htmlFor="gender">Gender</Label>
								<Select
									value={watchedValues.gender || ""}
									onValueChange={value =>
										setValue("gender", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										{GENDER_OPTIONS.map(option => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="race">Race</Label>
								<Select
									value={watchedValues.race || ""}
									onValueChange={value =>
										setValue("race", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select race" />
									</SelectTrigger>
									<SelectContent>
										{RACE_OPTIONS.map(option => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="ethnicity">Ethnicity</Label>
								<Select
									value={watchedValues.ethnicity || ""}
									onValueChange={value =>
										setValue("ethnicity", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select ethnicity" />
									</SelectTrigger>
									<SelectContent>
										{ETHNICITY_OPTIONS.map(option => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Contact Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
							<Phone className="w-5 h-5 text-highlight" />
							<span>Contact Information</span>
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									{...register("phone", {
										pattern: {
											value: /^\(\d{3}\) \d{3}-\d{4}$/,
											message:
												"Please enter a valid phone number",
										},
									})}
									onChange={handlePhoneChange}
									placeholder="(555) 123-4567"
								/>
								{errors.phone && (
									<p className="text-sm text-red-600 mt-1">
										{errors.phone.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									{...register("email", {
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message:
												"Please enter a valid email address",
										},
									})}
									placeholder="john@example.com"
								/>
								{errors.email && (
									<p className="text-sm text-red-600 mt-1">
										{errors.email.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="preferred_contact_method">
								Preferred Contact Method
							</Label>
							<Select
								value={
									watch("preferred_contact_method") || "both"
								}
								onValueChange={value =>
									setValue(
										"preferred_contact_method",
										value as any
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select contact method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="both">
										<div className="flex items-center space-x-2">
											<User className="w-4 h-4" />
											<span>Phone & Email</span>
										</div>
									</SelectItem>
									<SelectItem value="phone">
										<div className="flex items-center space-x-2">
											<Phone className="w-4 h-4" />
											<span>Phone Only</span>
										</div>
									</SelectItem>
									<SelectItem value="email">
										<div className="flex items-center space-x-2">
											<Mail className="w-4 h-4" />
											<span>Email Only</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Address Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
							<MapPin className="w-5 h-5 text-highlight" />
							<span>Address Information (Optional)</span>
						</h3>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="use_household_address"
								checked={
									watch("use_household_address") || false
								}
								onCheckedChange={checked =>
									setValue("use_household_address", !!checked)
								}
							/>
							<Label htmlFor="use_household_address">
								Use household address
							</Label>
						</div>

						{!watch("use_household_address") && (
							<div className="space-y-4">
								<div>
									<Label htmlFor="address_line_1">
										Street Address
									</Label>
									<Input
										id="address_line_1"
										{...register("address_line_1")}
										placeholder="123 Main Street"
									/>
								</div>

								<div>
									<Label htmlFor="address_line_2">
										Apartment, Suite, etc.
									</Label>
									<Input
										id="address_line_2"
										{...register("address_line_2")}
										placeholder="Apt 4B"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label htmlFor="city">City</Label>
										<Input
											id="city"
											{...register("city")}
											placeholder="New York"
										/>
									</div>

									<div>
										<Label htmlFor="state">State</Label>
										<Select
											value={watchedValues.state || ""}
											onValueChange={value =>
												setValue("state", value)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select state" />
											</SelectTrigger>
											<SelectContent>
												{US_STATES.map(state => (
													<SelectItem
														key={state}
														value={state}
													>
														{state}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="zip_code">
											ZIP Code
										</Label>
										<Input
											id="zip_code"
											{...register("zip_code", {
												pattern: {
													value: /^\d{5}(-\d{4})?$/,
													message:
														"Please enter a valid ZIP code",
												},
											})}
											placeholder="10001"
										/>
										{errors.zip_code && (
											<p className="text-sm text-red-600 mt-1">
												{errors.zip_code.message}
											</p>
										)}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Status and Settings */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
							<CheckCircle className="w-5 h-5 text-highlight" />
							<span>Status and Settings</span>
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="status">Status</Label>
								<Select
									value={watchedValues.status}
									onValueChange={value =>
										setValue(
											"status",
											value as "active" | "inactive"
										)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">
											Active
										</SelectItem>
										<SelectItem value="inactive">
											Inactive
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="is_freshtrak_user"
									{...register("is_freshtrak_user")}
									className="rounded border-gray-300"
								/>
								<Label htmlFor="is_freshtrak_user">
									This person is a FreshTrak user
								</Label>
							</div>
						</div>

						<div>
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								{...register("notes")}
								placeholder="Any additional information about this member..."
								rows={3}
							/>
						</div>
					</div>

					{/* Error Display */}
					{submitError && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-center space-x-2">
								<AlertCircle className="w-5 h-5 text-red-600" />
								<p className="text-red-800">{submitError}</p>
							</div>
						</div>
					)}

					{/* Form Actions */}
					<div className="flex justify-end space-x-3 pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							<X className="w-4 h-4 mr-2" />
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!isValid || isSubmitting}
							className="bg-highlight text-white hover:bg-highlight-dark"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Creating...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Create Member
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

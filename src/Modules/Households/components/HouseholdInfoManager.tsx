/**
 * Household Information Manager Component
 * Manages household address, language preference, and notes editing
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
	Home,
	MapPin,
	Globe,
	FileText,
	Save,
	Edit3,
	AlertCircle,
} from "lucide-react";
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";
import { Household, LanguagePreference } from "../types/household.types";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";

// Form validation schema
const householdInfoSchema = z.object({
	address_line_1: z.string().min(1, "Address is required"),
	address_line_2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	zip_code: z.string().min(5, "ZIP code must be at least 5 characters"),
	preferred_language: z
		.string()
		.refine(
			val =>
				[
					"en",
					"es",
					"fr",
					"de",
					"it",
					"pt",
					"zh",
					"ja",
					"ko",
					"ar",
				].includes(val),
			{ message: "Please select a valid language" }
		),
	notes: z.string().optional(),
});

type HouseholdInfoFormData = z.infer<typeof householdInfoSchema>;

interface HouseholdInfoManagerProps {
	household: Household;
	onUpdate?: (updatedHousehold: Household) => void;
	onCancel?: () => void;
	className?: string;
}

export const HouseholdInfoManager: React.FC<HouseholdInfoManagerProps> = ({
	household,
	onUpdate,
	onCancel,
	className = "",
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const householdsApiService = new HouseholdsApiService();
	const { getHouseholdId } = useHouseholdSignUpIntegration();

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
		reset,
		watch,
		setValue,
	} = useForm<HouseholdInfoFormData>({
		resolver: zodResolver(householdInfoSchema),
		defaultValues: {
			address_line_1: household.address_line_1,
			address_line_2: household.address_line_2 || "",
			city: household.city,
			state: household.state,
			zip_code: household.zip_code,
			preferred_language:
				household.preferred_language as LanguagePreference,
			notes: household.notes || "",
		},
	});

	// Watch for form changes
	const watchedValues = watch();
	useEffect(() => {
		setHasUnsavedChanges(isDirty);
	}, [isDirty]);

	// Language options
	const languageOptions = [
		{ value: "en", label: "English" },
		{ value: "es", label: "Español" },
		{ value: "fr", label: "Français" },
		{ value: "de", label: "Deutsch" },
		{ value: "it", label: "Italiano" },
		{ value: "pt", label: "Português" },
		{ value: "zh", label: "中文" },
		{ value: "ja", label: "日本語" },
		{ value: "ko", label: "한국어" },
		{ value: "ar", label: "العربية" },
	];

	const handleEdit = () => {
		setIsEditing(true);
		setError(null);
	};

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			setShowConfirmDialog(true);
		} else {
			reset();
			setIsEditing(false);
			setError(null);
			onCancel?.();
		}
	};

	const handleConfirmCancel = () => {
		reset();
		setIsEditing(false);
		setError(null);
		setShowConfirmDialog(false);
		onCancel?.();
	};

	const onSubmit = async (data: HouseholdInfoFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const householdId = getHouseholdId();
			if (!householdId) {
				throw new Error("Household ID not found");
			}

			// Prepare update data
			const updateData = {
				address_line_1: data.address_line_1,
				address_line_2: data.address_line_2 || undefined,
				city: data.city,
				state: data.state,
				zip_code: data.zip_code,
				preferred_language: data.preferred_language,
				notes: data.notes || undefined,
			};

			// Optimistic update
			// const optimisticHousehold = {
			// 	...household,
			// 	...updateData,
			// 	updated_at: new Date().toISOString(),
			// };

			// Update via API
			const response = await householdsApiService.updateHousehold(
				householdId,
				updateData
			);

			// Success - update local state
			setIsEditing(false);
			setHasUnsavedChanges(false);
			onUpdate?.(response.data);

			// Show success feedback
			setTimeout(() => {
				// Could add a toast notification here
			}, 100);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to update household information"
			);
			// Rollback optimistic update
			reset();
		} finally {
			setIsLoading(false);
		}
	};

	const renderViewMode = () => (
		<div className="space-y-6">
			{/* Address Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<MapPin className="w-5 h-5 text-highlight" />
						<span>Address Information</span>
					</CardTitle>
					<CardDescription>
						Primary household address for deliveries and services
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<Label className="text-sm font-medium text-gray-600">
							Address
						</Label>
						<p className="text-gray-900">
							{household.address_line_1}
							{household.address_line_2 && (
								<span>
									<br />
									{household.address_line_2}
								</span>
							)}
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label className="text-sm font-medium text-gray-600">
								City
							</Label>
							<p className="text-gray-900">{household.city}</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-gray-600">
								State
							</Label>
							<p className="text-gray-900">{household.state}</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-gray-600">
								ZIP Code
							</Label>
							<p className="text-gray-900">
								{household.zip_code}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Language Preference */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Globe className="w-5 h-5 text-highlight" />
						<span>Language Preference</span>
					</CardTitle>
					<CardDescription>
						Preferred language for communications and services
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<Label className="text-sm font-medium text-gray-600">
							Preferred Language
						</Label>
						<p className="text-gray-900">
							{languageOptions.find(
								opt =>
									opt.value === household.preferred_language
							)?.label || household.preferred_language}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Notes */}
			{household.notes && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<FileText className="w-5 h-5 text-highlight" />
							<span>Household Notes</span>
						</CardTitle>
						<CardDescription>
							Additional information about the household
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-gray-900 whitespace-pre-wrap">
							{household.notes}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3">
				<Button
					onClick={handleEdit}
					variant="outline"
					className="flex items-center space-x-2"
				>
					<Edit3 className="w-4 h-4" />
					<span>Edit Information</span>
				</Button>
			</div>
		</div>
	);

	const renderEditMode = () => (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Address Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<MapPin className="w-5 h-5 text-highlight" />
						<span>Address Information</span>
					</CardTitle>
					<CardDescription>
						Update the primary household address
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="address_line_1">Address Line 1 *</Label>
						<Input
							id="address_line_1"
							{...register("address_line_1")}
							className={
								errors.address_line_1 ? "border-red-500" : ""
							}
						/>
						{errors.address_line_1 && (
							<p className="text-sm text-red-600 mt-1">
								{errors.address_line_1.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor="address_line_2">Address Line 2</Label>
						<Input
							id="address_line_2"
							{...register("address_line_2")}
							placeholder="Apartment, suite, unit, etc."
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="city">City *</Label>
							<Input
								id="city"
								{...register("city")}
								className={errors.city ? "border-red-500" : ""}
							/>
							{errors.city && (
								<p className="text-sm text-red-600 mt-1">
									{errors.city.message}
								</p>
							)}
						</div>
						<div>
							<Label htmlFor="state">State *</Label>
							<Input
								id="state"
								{...register("state")}
								className={errors.state ? "border-red-500" : ""}
							/>
							{errors.state && (
								<p className="text-sm text-red-600 mt-1">
									{errors.state.message}
								</p>
							)}
						</div>
						<div>
							<Label htmlFor="zip_code">ZIP Code *</Label>
							<Input
								id="zip_code"
								{...register("zip_code")}
								className={
									errors.zip_code ? "border-red-500" : ""
								}
							/>
							{errors.zip_code && (
								<p className="text-sm text-red-600 mt-1">
									{errors.zip_code.message}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Language Preference */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Globe className="w-5 h-5 text-highlight" />
						<span>Language Preference</span>
					</CardTitle>
					<CardDescription>
						Select the preferred language for communications
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<Label htmlFor="preferred_language">
							Preferred Language *
						</Label>
						<Select
							value={watchedValues.preferred_language}
							onValueChange={value =>
								setValue(
									"preferred_language",
									value as LanguagePreference
								)
							}
						>
							<SelectTrigger
								className={
									errors.preferred_language
										? "border-red-500"
										: ""
								}
							>
								<SelectValue placeholder="Select a language" />
							</SelectTrigger>
							<SelectContent>
								{languageOptions.map(option => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.preferred_language && (
							<p className="text-sm text-red-600 mt-1">
								{errors.preferred_language.message}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Notes */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<FileText className="w-5 h-5 text-highlight" />
						<span>Household Notes</span>
					</CardTitle>
					<CardDescription>
						Add any additional information about the household
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							{...register("notes")}
							placeholder="Enter any additional household information..."
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center space-x-2 text-red-600">
							<AlertCircle className="w-5 h-5" />
							<span className="font-medium">Error</span>
						</div>
						<p className="text-red-600 mt-2">{error}</p>
					</CardContent>
				</Card>
			)}

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3">
				<Button
					type="button"
					onClick={handleCancel}
					variant="outline"
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isLoading || !isDirty}
					className="bg-highlight text-white hover:bg-highlight-dark"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
							Saving...
						</>
					) : (
						<>
							<Save className="w-4 h-4 mr-2" />
							Save Changes
						</>
					)}
				</Button>
			</div>
		</form>
	);

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
						<Home className="w-6 h-6 text-highlight" />
						<span>Household Information</span>
					</h2>
					<p className="text-gray-600 mt-1">
						Manage your household address, language preferences, and
						notes
					</p>
				</div>
			</div>

			{/* Content */}
			{isEditing ? renderEditMode() : renderViewMode()}

			{/* Confirmation Dialog */}
			<AlertDialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard Changes?</AlertDialogTitle>
						<AlertDialogDescription>
							You have unsaved changes. Are you sure you want to
							discard them? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setShowConfirmDialog(false)}
						>
							Keep Editing
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmCancel}
							className="bg-red-600 hover:bg-red-700"
						>
							Discard Changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

/**
 * Language Preference Manager Component
 * Manages language preferences for households and individual members
 */

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import { Globe, Users, User, CheckCircle } from "lucide-react";
import { HouseholdMember, Household } from "../types/household.types";
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";
import localization from "../../Localization/LocalizationComponent";

interface LanguagePreferenceManagerProps {
	household: Household;
	members: HouseholdMember[];
	onUpdate: (data: LanguagePreferenceData) => Promise<void>;
	onCancel?: () => void;
	className?: string;
	mode?: "view" | "edit";
}

interface LanguagePreferenceData {
	household_preferred_language: string;
	member_language_overrides: Record<number, string>;
	use_household_language_for_all: boolean;
	fallback_language: string;
}

interface LanguageOption {
	code: string;
	name: string;
	nativeName: string;
	flag: string;
}

const getSupportedLanguages = (): LanguageOption[] => [
	{ code: "en", name: localization.option_language_english, nativeName: localization.option_language_english, flag: "🇺🇸" },
	{ code: "es", name: localization.option_language_spanish, nativeName: localization.option_language_spanish, flag: "🇪🇸" },
	{ code: "fr", name: localization.option_language_french, nativeName: localization.option_language_french, flag: "🇫🇷" },
	{ code: "de", name: localization.option_language_german, nativeName: localization.option_language_german, flag: "🇩🇪" },
	{ code: "it", name: localization.option_language_italian, nativeName: localization.option_language_italian, flag: "🇮🇹" },
	{ code: "pt", name: localization.option_language_portuguese, nativeName: localization.option_language_portuguese, flag: "🇵🇹" },
	{ code: "zh", name: localization.option_language_chinese, nativeName: localization.option_language_chinese, flag: "🇨🇳" },
	{ code: "ja", name: localization.option_language_japanese, nativeName: localization.option_language_japanese, flag: "🇯🇵" },
	{ code: "ko", name: localization.option_language_korean, nativeName: localization.option_language_korean, flag: "🇰🇷" },
	{ code: "ar", name: localization.option_language_arabic, nativeName: localization.option_language_arabic, flag: "🇸🇦" },
	{ code: "hi", name: localization.option_language_hindi, nativeName: localization.option_language_hindi, flag: "🇮🇳" },
	{ code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

export const LanguagePreferenceManager: React.FC<
	LanguagePreferenceManagerProps
> = ({
	household,
	members,
	onUpdate,
	onCancel,
	className = "",
	mode = "edit",
}) => {
	const [isEditing, setIsEditing] = useState(mode === "edit");
	const [isLoading, setIsLoading] = useState(false);
	const [validation, setValidation] = useState({
		household: true,
		members: true,
	});

	const {
		handleSubmit,
		setValue,
		watch,
		formState: { isDirty },
		reset,
	} = useForm<LanguagePreferenceData>({
		defaultValues: {
			household_preferred_language: household.preferred_language || "en",
			member_language_overrides: {},
			use_household_language_for_all: true,
			fallback_language: "en",
		},
	});

	const watchedValues = watch();

	// Initialize member language overrides
	useEffect(() => {
		const overrides: Record<number, string> = {};
		members.forEach(member => {
			// In a real implementation, this would come from member data
			// For now, we'll use household language as default
			overrides[member.id] = household.preferred_language || "en";
		});
		setValue("member_language_overrides", overrides);
	}, [members, household.preferred_language, setValue]);

	// Validate language preferences
	useEffect(() => {
		const householdValid = !!watchedValues.household_preferred_language;
		const membersValid =
			watchedValues.use_household_language_for_all ||
			Object.values(watchedValues.member_language_overrides || {}).every(
				lang => !!lang
			);

		setValidation({
			household: householdValid,
			members: membersValid,
		});
	}, [watchedValues]);

	const onSubmit = async (data: LanguagePreferenceData) => {
		setIsLoading(true);
		try {
			await onUpdate(data);
			setIsEditing(false);
		} catch (error) {
			console.error("Error updating language preferences:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		reset();
		setIsEditing(false);
		onCancel?.();
	};

	const getLanguageInfo = (code: string): LanguageOption => {
		const languages = getSupportedLanguages();
		return (
			languages.find(lang => lang.code === code) ||
			languages[0]
		);
	};

	const updateMemberLanguage = (memberId: number, languageCode: string) => {
		const currentOverrides = watchedValues.member_language_overrides || {};
		setValue(
			"member_language_overrides",
			{
				...currentOverrides,
				[memberId]: languageCode,
			},
			{ shouldDirty: true }
		);
	};

	const renderViewMode = () => (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Globe className="w-5 h-5 text-highlight" />
					<span>{localization.header_language_preferences}</span>
				</CardTitle>
				<CardDescription>
					{localization.subtitle_preferred_language_comm}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Household Language */}
				<div className="space-y-4">
					<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
						<Users className="w-4 h-4" />
						<span>{localization.label_household_language}</span>
					</h4>

					<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
						<span className="text-2xl">
							{
								getLanguageInfo(
									watchedValues.household_preferred_language
								).flag
							}
						</span>
						<div>
							<div className="font-medium text-gray-900">
								{
									getLanguageInfo(
										watchedValues.household_preferred_language
									).name
								}
							</div>
							<div className="text-sm text-gray-600">
								{
									getLanguageInfo(
										watchedValues.household_preferred_language
									).nativeName
								}
							</div>
						</div>
						{validation.household && (
							<CheckCircle className="w-4 h-4 text-green-500" />
						)}
					</div>
				</div>

				{/* Member Languages */}
				<div className="space-y-4">
					<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
						<User className="w-4 h-4" />
						<span>{localization.label_member_language_settings}</span>
					</h4>

					{watchedValues.use_household_language_for_all ? (
						<div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
							<CheckCircle className="w-4 h-4 text-blue-500" />
							<span className="text-sm text-blue-700">
								{localization.description_fallback_language}
							</span>
						</div>
					) : (
						<div className="space-y-3">
							{members.map(member => {
								const memberLang =
									watchedValues.member_language_overrides?.[
										member.id
									] ||
									watchedValues.household_preferred_language;
								const langInfo = getLanguageInfo(memberLang);

								return (
									<div
										key={member.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex items-center space-x-3">
											<span className="text-lg">
												{langInfo.flag}
											</span>
											<div>
												<div className="font-medium text-gray-900">
													{member.first_name}{" "}
													{member.last_name}
												</div>
												<div className="text-sm text-gray-600">
													{langInfo.name} (
													{langInfo.nativeName})
												</div>
											</div>
										</div>
										<Badge className="bg-green-100 text-green-800 border-green-200">
											{langInfo.code.toUpperCase()}
										</Badge>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Fallback Language */}
				<div className="space-y-2">
					<h4 className="font-semibold text-gray-900">
						{localization.label_fallback_language}
					</h4>
					<div className="flex items-center space-x-2">
						<span className="text-lg">
							{
								getLanguageInfo(watchedValues.fallback_language)
									.flag
							}
						</span>
						<span className="text-sm text-gray-600">
							{
								getLanguageInfo(watchedValues.fallback_language)
									.name
							}
						</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end space-x-2">
					<Button
						onClick={() => setIsEditing(true)}
						variant="outline"
						size="sm"
					>
						{localization.header_edit_language_preferences}
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	const renderEditMode = () => (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Globe className="w-5 h-5 text-highlight" />
					<span>{localization.header_edit_language_preferences}</span>
				</CardTitle>
				<CardDescription>
					{localization.subtitle_select_language_comm}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Household Language */}
					<div className="space-y-4">
						<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
							<Users className="w-4 h-4" />
							<span>{localization.label_household_language}</span>
						</h4>

						<div>
							<Label htmlFor="household_preferred_language">
								{localization.label_preferred_language}
							</Label>
							<Select
								value={
									watchedValues.household_preferred_language
								}
								onValueChange={value =>
									setValue(
										"household_preferred_language",
										value,
										{ shouldDirty: true }
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder={localization.placeholder_select_household_language} />
								</SelectTrigger>
								<SelectContent>
									{getSupportedLanguages().map(language => (
										<SelectItem
											key={language.code}
											value={language.code}
										>
											<div className="flex items-center space-x-2">
												<span className="text-lg">
													{language.flag}
												</span>
												<div>
													<div className="font-medium">
														{language.name}
													</div>
													<div className="text-sm text-gray-500">
														{language.nativeName}
													</div>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Member Language Settings */}
					<div className="space-y-4">
						<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
							<User className="w-4 h-4" />
							<span>{localization.label_member_language_settings}</span>
						</h4>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="use_household_language_for_all"
								checked={
									watchedValues.use_household_language_for_all
								}
								onCheckedChange={checked =>
									setValue(
										"use_household_language_for_all",
										!!checked,
										{ shouldDirty: true }
									)
								}
							/>
							<Label htmlFor="use_household_language_for_all">
								{localization.description_fallback_language}
							</Label>
						</div>

						{!watchedValues.use_household_language_for_all && (
							<div className="space-y-3">
								<h5 className="font-medium text-gray-700">
									{localization.label_household_members}
								</h5>
								{members.map(member => {
									const memberLang =
										watchedValues
											.member_language_overrides?.[
											member.id
										] ||
										watchedValues.household_preferred_language;

									return (
										<div
											key={member.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div className="flex items-center space-x-3">
												<span className="font-medium text-gray-900">
													{member.first_name}{" "}
													{member.last_name}
												</span>
											</div>
											<Select
												value={memberLang}
												onValueChange={value =>
													updateMemberLanguage(
														member.id,
														value
													)
												}
											>
												<SelectTrigger className="w-48">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{getSupportedLanguages().map(
														language => (
															<SelectItem
																key={
																	language.code
																}
																value={
																	language.code
																}
															>
																<div className="flex items-center space-x-2">
																	<span className="text-sm">
																		{
																			language.flag
																		}
																	</span>
																	<span className="text-sm">
																		{
																			language.name
																		}
																	</span>
																</div>
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Fallback Language */}
					<div>
						<Label htmlFor="fallback_language">
							{localization.label_fallback_language}
						</Label>
						<Select
							value={watchedValues.fallback_language}
							onValueChange={value =>
								setValue("fallback_language", value, {
									shouldDirty: true,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={localization.placeholder_select_fallback_language} />
							</SelectTrigger>
							<SelectContent>
								{getSupportedLanguages().map(language => (
									<SelectItem
										key={language.code}
										value={language.code}
									>
										<div className="flex items-center space-x-2">
											<span className="text-lg">
												{language.flag}
											</span>
											<div>
												<div className="font-medium">
													{language.name}
												</div>
												<div className="text-sm text-gray-500">
													{language.nativeName}
												</div>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-sm text-gray-600 mt-1">
							{localization.description_fallback_language}
						</p>
					</div>

					{/* Actions */}
					<div className="flex justify-end space-x-2">
						<Button
							type="button"
							onClick={handleCancel}
							variant="outline"
							disabled={isLoading}
						>
							{localization.button_cancel}
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !isDirty}
							className="bg-highlight text-white hover:bg-highlight-dark"
						>
							{isLoading ? localization.button_saving : localization.button_save_preferences}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);

	return isEditing ? renderEditMode() : renderViewMode();
};

/**
 * Hook for managing language preference operations
 */
export const useLanguagePreferenceManager = () => {
	const [isLoading, setIsLoading] = useState(false);

	// Memoized API service instance
	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	const updateLanguagePreferences = async (
		householdId: number,
		data: LanguagePreferenceData
	): Promise<void> => {
		setIsLoading(true);
		try {
			// Get current household data from /users/me to ensure we have complete object
			const currentHouseholdData =
				await householdsApiService.getUsersMe();

			// Update household language preference - merge current data with language updates
			// Exclude updated_at from the request
			const { updated_at, ...currentDataWithoutTimestamp } =
				currentHouseholdData;
			await householdsApiService.updateHousehold(householdId, {
				...currentDataWithoutTimestamp,
			});

			// Update individual member language preferences if not using household language
			if (!data.use_household_language_for_all) {
				// NOTE: Individual member language preferences are not supported by the current API
				// This feature requires backend API support for per-member language settings
				throw new Error(
					"Individual member language preferences are not supported by the current API. Use household language setting instead."
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const validateLanguagePreferences = (
		data: LanguagePreferenceData
	): boolean => {
		return !!(
			data.household_preferred_language &&
			data.fallback_language &&
			(data.use_household_language_for_all ||
				Object.values(data.member_language_overrides || {}).every(
					lang => !!lang
				))
		);
	};

	const getLanguageDisplayInfo = (code: string) => {
		const languages = getSupportedLanguages();
		const language = languages.find(lang => lang.code === code);
		return language || languages[0];
	};

	return {
		updateLanguagePreferences,
		validateLanguagePreferences,
		getLanguageDisplayInfo,
		isLoading,
	};
};

/**
 * Family Member Details Step Component
 * Form for collecting individual family member information
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { HouseholdMember } from "../types/household.types";
import { HouseholdCounts } from "../../Registration/types/registration.types";
import { getGenderFromId } from "../utils/householdUtils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import localization from "../../Localization/LocalizationComponent";

interface FamilyMemberDetailsStepProps {
	members: HouseholdMember[];
	householdId: number;
	originalCounts: HouseholdCounts; // Add original counts from step 3
	onComplete: (
		membersData: HouseholdMember[],
		counts: HouseholdCounts
	) => void;
	onSkip: (counts: HouseholdCounts) => void;
	onCancel: () => void;
}

interface MemberFormData {
	first_name: string;
	last_name: string;
	middle_name?: string;
	gender_id: number; // 1 for male, 2 for female, 3 for other, 4 for prefer_not_to_say
	date_of_birth: string;
	suffix_id?: number;
}

const FamilyMemberDetailsStep: React.FC<FamilyMemberDetailsStepProps> = ({
	members,
	householdId,
	originalCounts,
	onComplete,
	onSkip,
	onCancel,
}) => {
	const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
	const [membersData, setMembersData] = useState<MemberFormData[]>([]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<MemberFormData>({
		defaultValues: {
			first_name: "",
			last_name: "",
			middle_name: "",
			gender_id: 1,
			date_of_birth: "",
			suffix_id: undefined,
		},
	});

	// Initialize members data array
	useEffect(() => {
		const initialMembers: MemberFormData[] = Array(members.length)
			.fill(null)
			.map(() => ({
				first_name: "",
				last_name: "",
				middle_name: "",
				gender_id: 1,
				date_of_birth: "",
				suffix_id: undefined,
			}));
		setMembersData(initialMembers);
	}, [members.length]);

	// Update form when current member index changes
	useEffect(() => {
		if (membersData[currentMemberIndex]) {
			const member = membersData[currentMemberIndex];
			setValue("first_name", member.first_name);
			setValue("last_name", member.last_name);
			setValue("middle_name", member.middle_name || "");
			setValue("gender_id", member.gender_id);
			setValue("date_of_birth", member.date_of_birth);
			setValue("suffix_id", member.suffix_id || undefined);
		}
	}, [currentMemberIndex, membersData, setValue]);

	const onSubmit = (
		data: MemberFormData,
		event?: React.BaseSyntheticEvent
	) => {
		// Prevent default form submission behavior
		if (event) {
			event.preventDefault();
		}

		// Update the current member data
		const updatedMembers = [...membersData];
		updatedMembers[currentMemberIndex] = data;
		setMembersData(updatedMembers);

		// Move to next member or complete
		if (currentMemberIndex < members.length - 1) {
			setCurrentMemberIndex(currentMemberIndex + 1);
			reset();
		} else {
			// All members completed, convert to HouseholdMember format
			const completedMembers: HouseholdMember[] = updatedMembers.map(
				(member, index) => ({
					...members[index],
					first_name: member.first_name,
					last_name: member.last_name,
					middle_name: member.middle_name,
					gender: getGenderFromId(member.gender_id),
					date_of_birth: member.date_of_birth,
					suffix: member.suffix_id
						? getSuffixText(member.suffix_id)
						: "",
				})
			);

			const counts: HouseholdCounts = {
				seniors: originalCounts.seniors,
				adults: originalCounts.adults,
				children: originalCounts.children,
				total: originalCounts.total,
			};

			onComplete(completedMembers, counts);
		}
	};

	const handleSkip = () => {
		const counts: HouseholdCounts = {
			seniors: originalCounts.seniors,
			adults: originalCounts.adults,
			children: originalCounts.children,
			total: originalCounts.total,
		};
		onSkip(counts);
	};

	const getMemberTypeLabel = (index: number): string => {
		// This is a simplified version - you might want to determine based on age or other criteria
		return `${localization.title_family_member_details} ${index + 1}`;
	};

	const getSuffixText = (suffixId: number): string => {
		const suffixes: Record<number, string> = {
			1: localization.option_suffix_jr,
			2: localization.option_suffix_sr,
			3: localization.option_suffix_ii,
			4: localization.option_suffix_iii,
			5: localization.option_suffix_iv,
		};
		return suffixes[suffixId] || "";
	};

	const getSuffixOptions = () => [
		{ value: 1, label: localization.option_suffix_jr },
		{ value: 2, label: localization.option_suffix_sr },
		{ value: 3, label: localization.option_suffix_ii },
		{ value: 4, label: localization.option_suffix_iii },
		{ value: 5, label: localization.option_suffix_iv },
	];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">
					{localization.description_noticed_family_members}
				</h3>
				<p className="text-gray-600 mb-6">
					{localization.description_provide_details_family_member} (
					{currentMemberIndex + 1} {localization.text_of}{" "}
					{members.length})
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-medium text-gray-900">
						{getMemberTypeLabel(currentMemberIndex)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit(onSubmit)();
						}}
						className="space-y-4"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* First Name */}
							<div className="space-y-2">
								<Label htmlFor="first_name">
									{localization.label_first_name_required}
								</Label>
								<Input
									id="first_name"
									type="text"
									placeholder={
										localization.placeholder_enter_first_name
									}
									{...register("first_name", {
										required:
											localization.error_first_name_required,
									})}
								/>
								{errors.first_name && (
									<p className="text-red-500 text-sm">
										{errors.first_name.message}
									</p>
								)}
							</div>

							{/* Last Name */}
							<div className="space-y-2">
								<Label htmlFor="last_name">
									{localization.label_last_name_required}
								</Label>
								<Input
									id="last_name"
									type="text"
									placeholder={
										localization.placeholder_enter_last_name
									}
									{...register("last_name", {
										required:
											localization.error_last_name_required,
									})}
								/>
								{errors.last_name && (
									<p className="text-red-500 text-sm">
										{errors.last_name.message}
									</p>
								)}
							</div>

							{/* Middle Name */}
							<div className="space-y-2">
								<Label htmlFor="middle_name">
									{localization.middle_name}
								</Label>
								<Input
									id="middle_name"
									type="text"
									placeholder={
										localization.placeholder_enter_middle_name_optional
									}
									{...register("middle_name")}
								/>
							</div>

							{/* Gender */}
							<div className="space-y-2">
								<Label htmlFor="gender_id">
									{localization.label_gender_required}
								</Label>
								<Select
									value={
										watch("gender_id")?.toString() || "1"
									}
									onValueChange={(value: string) =>
										setValue("gender_id", parseInt(value))
									}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												localization.placeholder_select_gender
											}
										/>
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="1">
											{localization.option_gender_male}
										</SelectItem>
										<SelectItem value="2">
											{localization.option_gender_female}
										</SelectItem>
										<SelectItem value="3">
											{localization.option_gender_other}
										</SelectItem>
										<SelectItem value="4">
											{
												localization.option_gender_prefer_not_to_say
											}
										</SelectItem>
									</SelectContent>
								</Select>
								{errors.gender_id && (
									<p className="text-red-500 text-sm">
										{errors.gender_id.message}
									</p>
								)}
							</div>

							{/* Date of Birth */}
							<div className="space-y-2">
								<Label htmlFor="date_of_birth">
									{localization.label_date_of_birth_required}
								</Label>
								<Input
									id="date_of_birth"
									type="date"
									{...register("date_of_birth", {
										required:
											localization.error_date_of_birth_required,
									})}
								/>
								{errors.date_of_birth && (
									<p className="text-red-500 text-sm">
										{errors.date_of_birth.message}
									</p>
								)}
							</div>

							{/* Suffix */}
							<div className="space-y-2">
								<Label htmlFor="suffix_id">
									{localization.label_suffix_optional}
								</Label>
								<Select
									value={
										watch("suffix_id")?.toString() || "none"
									}
									onValueChange={(value: string) =>
										setValue(
											"suffix_id",
											value === "none"
												? undefined
												: parseInt(value)
										)
									}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												localization.placeholder_select_suffix
											}
										/>
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="none">
											{localization.option_suffix_none}
										</SelectItem>
										{getSuffixOptions().map((option) => (
											<SelectItem
												key={option.value}
												value={option.value.toString()}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Navigation */}
						<div className="flex justify-between pt-6 border-t">
							<Button
								type="button"
								variant="highlight"
								onClick={onCancel}
							>
								{localization.button_previous}
							</Button>

							<div className="flex space-x-3">
								<Button
									type="button"
									variant="highlightOutline"
									onClick={handleSkip}
								>
									{localization.button_skip_step}
								</Button>

								<Button
									type="button"
									variant="highlight"
									onClick={() => handleSubmit(onSubmit)()}
								>
									{currentMemberIndex < members.length - 1
										? localization.button_next_member
										: localization.button_next}
								</Button>
							</div>
						</div>
					</form>

					{/* Progress indicator */}
					<div className="flex justify-center space-x-2 mt-6">
						{Array.from({ length: members.length }, (_, index) => (
							<div
								key={index}
								className={`w-3 h-3 rounded-full ${
									index <= currentMemberIndex
										? "bg-highlight"
										: "bg-gray-300"
								}`}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default FamilyMemberDetailsStep;

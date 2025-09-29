/**
 * Family Member Completion Form Component
 * Form for completing family member details when multiple members are detected
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { ArrowLeft, ArrowRight, Users, User, X } from "lucide-react";
import { HouseholdMember } from "../types/household.types";

interface FamilyMemberCompletionFormProps {
	members: HouseholdMember[];
	householdId: number;
	onComplete: (membersData: any[]) => void;
	onSkip: () => void;
	onCancel: () => void;
}

interface MemberFormData {
	[memberId: string]: {
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
	};
}

export const FamilyMemberCompletionForm: React.FC<
	FamilyMemberCompletionFormProps
> = ({ members, householdId, onComplete, onSkip, onCancel }) => {
	const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<MemberFormData>();

	const currentMember = members[currentMemberIndex];
	const isLastMember = currentMemberIndex === members.length - 1;
	const isFirstMember = currentMemberIndex === 0;

	// Initialize form data for current member
	useEffect(() => {
		if (currentMember) {
			setValue(
				`${currentMember.id}.first_name`,
				currentMember.first_name || ""
			);
			setValue(
				`${currentMember.id}.middle_name`,
				currentMember.middle_name || ""
			);
			setValue(
				`${currentMember.id}.last_name`,
				currentMember.last_name || ""
			);
			setValue(`${currentMember.id}.suffix`, currentMember.suffix || "");
			setValue(
				`${currentMember.id}.date_of_birth`,
				currentMember.date_of_birth || ""
			);
			setValue(`${currentMember.id}.phone`, currentMember.phone || "");
			setValue(`${currentMember.id}.email`, currentMember.email || "");
		}
	}, [currentMember, setValue]);

	const handlePrevious = () => {
		if (!isFirstMember) {
			setCurrentMemberIndex(prev => prev - 1);
		}
	};

	const onSubmit = async (data: MemberFormData) => {
		setIsSubmitting(true);
		try {
			// Collect all members data locally
			const membersData = members.map(member => {
				const memberData = data[member.id];
				if (memberData) {
					return {
						id: member.id,
						household_id: householdId,
						is_primary: member.is_primary || false,
						first_name: memberData.first_name,
						middle_name: memberData.middle_name || null,
						last_name: memberData.last_name,
						suffix: memberData.suffix || null,
						date_of_birth: memberData.date_of_birth || "1900-01-01",
						head_of_household: member.head_of_household || false,
						is_active: member.is_active || true,
						status: member.status || "active",
						is_freshtrak_user: member.is_freshtrak_user || false,
						gender: memberData.gender || null,
						race: memberData.race || null,
						ethnicity: memberData.ethnicity || null,
						phone: memberData.phone || null,
						email: memberData.email || null,
						created_at:
							member.created_at || new Date().toISOString(),
						updated_at: new Date().toISOString(),
					};
				}
				return member; // Return original member if no form data
			});

			// Pass collected data to parent
			onComplete(membersData);
		} catch (error) {
			console.error("Error collecting family members data:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getMemberTitle = (member: HouseholdMember, index: number) => {
		if (member.head_of_household) {
			return "Head of Household";
		}
		return `Family Member ${index + 1}`;
	};

	const getMemberIcon = (member: HouseholdMember) => {
		if (member.head_of_household) {
			return <User className="w-6 h-6 text-blue-600" />;
		}
		return <Users className="w-6 h-6 text-green-600" />;
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							{getMemberIcon(currentMember)}
							<div>
								<CardTitle className="text-xl">
									{getMemberTitle(
										currentMember,
										currentMemberIndex
									)}
								</CardTitle>
								<CardDescription>
									Complete details for{" "}
									{currentMember.first_name}{" "}
									{currentMember.last_name}
								</CardDescription>
							</div>
						</div>
						<Button
							onClick={onCancel}
							variant="ghost"
							size="sm"
							className="text-gray-600 hover:text-gray-800"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* Basic Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label
									htmlFor={`${currentMember.id}.first_name`}
								>
									First Name
								</Label>
								<Input
									{...register(
										`${currentMember.id}.first_name`,
										{ required: "First name is required" }
									)}
									id={`${currentMember.id}.first_name`}
									placeholder="Enter first name"
								/>
								{errors[currentMember.id]?.first_name && (
									<p className="text-red-500 text-sm mt-1">
										{
											errors[currentMember.id]?.first_name
												?.message
										}
									</p>
								)}
							</div>

							<div>
								<Label
									htmlFor={`${currentMember.id}.middle_name`}
								>
									Middle Name
								</Label>
								<Input
									{...register(
										`${currentMember.id}.middle_name`
									)}
									id={`${currentMember.id}.middle_name`}
									placeholder="Enter middle name (optional)"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label
									htmlFor={`${currentMember.id}.last_name`}
								>
									Last Name
								</Label>
								<Input
									{...register(
										`${currentMember.id}.last_name`,
										{ required: "Last name is required" }
									)}
									id={`${currentMember.id}.last_name`}
									placeholder="Enter last name"
								/>
								{errors[currentMember.id]?.last_name && (
									<p className="text-red-500 text-sm mt-1">
										{
											errors[currentMember.id]?.last_name
												?.message
										}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor={`${currentMember.id}.suffix`}>
									Suffix
								</Label>
								<Input
									{...register(`${currentMember.id}.suffix`)}
									id={`${currentMember.id}.suffix`}
									placeholder="Jr., Sr., III, etc. (optional)"
								/>
							</div>
						</div>

						{/* Date of Birth */}
						<div>
							<Label
								htmlFor={`${currentMember.id}.date_of_birth`}
							>
								Date of Birth
							</Label>
							<Input
								{...register(
									`${currentMember.id}.date_of_birth`
								)}
								id={`${currentMember.id}.date_of_birth`}
								type="date"
							/>
						</div>

						{/* Demographics */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor={`${currentMember.id}.gender`}>
									Gender
								</Label>
								<Select
									onValueChange={value =>
										setValue(
											`${currentMember.id}.gender`,
											value
										)
									}
								>
									<SelectTrigger className="bg-white border border-gray-300">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="male">
											Male
										</SelectItem>
										<SelectItem value="female">
											Female
										</SelectItem>
										<SelectItem value="other">
											Other
										</SelectItem>
										<SelectItem value="prefer_not_to_say">
											Prefer not to say
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor={`${currentMember.id}.race`}>
									Race
								</Label>
								<Select
									onValueChange={value =>
										setValue(
											`${currentMember.id}.race`,
											value
										)
									}
								>
									<SelectTrigger className="bg-white border border-gray-300">
										<SelectValue placeholder="Select race" />
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="american_indian">
											American Indian or Alaska Native
										</SelectItem>
										<SelectItem value="asian">
											Asian
										</SelectItem>
										<SelectItem value="black">
											Black or African American
										</SelectItem>
										<SelectItem value="native_hawaiian">
											Native Hawaiian or Other Pacific
											Islander
										</SelectItem>
										<SelectItem value="white">
											White
										</SelectItem>
										<SelectItem value="other">
											Other
										</SelectItem>
										<SelectItem value="prefer_not_to_say">
											Prefer not to say
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label
									htmlFor={`${currentMember.id}.ethnicity`}
								>
									Ethnicity
								</Label>
								<Select
									onValueChange={value =>
										setValue(
											`${currentMember.id}.ethnicity`,
											value
										)
									}
								>
									<SelectTrigger className="bg-white border border-gray-300">
										<SelectValue placeholder="Select ethnicity" />
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="hispanic">
											Hispanic or Latino
										</SelectItem>
										<SelectItem value="not_hispanic">
											Not Hispanic or Latino
										</SelectItem>
										<SelectItem value="prefer_not_to_say">
											Prefer not to say
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Contact Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor={`${currentMember.id}.phone`}>
									Phone Number
								</Label>
								<Input
									{...register(`${currentMember.id}.phone`)}
									id={`${currentMember.id}.phone`}
									type="tel"
									placeholder="Enter phone number"
								/>
							</div>

							<div>
								<Label htmlFor={`${currentMember.id}.email`}>
									Email Address
								</Label>
								<Input
									{...register(`${currentMember.id}.email`)}
									id={`${currentMember.id}.email`}
									type="email"
									placeholder="Enter email address"
								/>
							</div>
						</div>

						{/* Navigation */}
						<div className="flex justify-between items-center pt-6 border-t">
							<div>
								{!isFirstMember && (
									<Button
										type="button"
										onClick={handlePrevious}
										variant="outline"
										className="flex items-center space-x-2"
									>
										<ArrowLeft className="w-4 h-4" />
										<span>Previous</span>
									</Button>
								)}
							</div>

							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={onSkip}
									variant="ghost"
									className="text-gray-600 hover:text-gray-900"
								>
									Skip All
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
								>
									<span>
										{isLastMember
											? isSubmitting
												? "Saving..."
												: "Complete"
											: "Next"}
									</span>
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						</div>

						{/* Progress Indicator */}
						<div className="flex justify-center space-x-2 pt-4">
							{members.map((_, index) => (
								<div
									key={index}
									className={`w-3 h-3 rounded-full ${
										index === currentMemberIndex
											? "bg-blue-600"
											: index < currentMemberIndex
											? "bg-green-500"
											: "bg-gray-300"
									}`}
								/>
							))}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default FamilyMemberCompletionForm;

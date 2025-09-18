/**
 * Member Card Component
 * Reusable component for displaying household member information
 */

import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
	User,
	Edit,
	Mail,
	Phone,
	Calendar,
	MapPin,
	MoreVertical,
	CheckCircle,
	AlertCircle,
	Clock,
} from "lucide-react";
import { HouseholdMember } from "./types/household.types";
import {
	calculateAge,
	formatDateOfBirth,
	formatPhoneNumber,
} from "./utils/householdUtils";
import { MemberStatusManager } from "./components/MemberStatusManager";

interface MemberCardProps {
	member: HouseholdMember;
	householdId: number;
	onEdit?: (member: HouseholdMember) => void;
	onViewDetails?: (member: HouseholdMember) => void;
	onStatusChange?: (member: HouseholdMember) => void;
	onError?: (error: string) => void;
	className?: string;
	variant?: "default" | "compact" | "detailed";
	showActions?: boolean;
	showStatusManagement?: boolean;
}

interface MemberStatus {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
	icon: React.ReactNode;
	color: string;
}

interface AgeGroup {
	label: string;
	color: string;
	icon: React.ReactNode;
}

export const MemberCard: React.FC<MemberCardProps> = ({
	member,
	householdId,
	onEdit,
	onViewDetails,
	onStatusChange,
	onError,
	className = "",
	variant = "default",
	showActions = true,
	showStatusManagement = true,
}) => {
	const getAgeGroup = (age: number): AgeGroup => {
		if (age < 18) {
			return {
				label: "Child",
				color: "bg-blue-100 text-blue-800 border-blue-200",
				icon: <Calendar className="w-3 h-3" />,
			};
		} else if (age >= 60) {
			return {
				label: "Senior",
				color: "bg-orange-100 text-orange-800 border-orange-200",
				icon: <Clock className="w-3 h-3" />,
			};
		} else {
			return {
				label: "Adult",
				color: "bg-green-100 text-green-800 border-green-200",
				icon: <CheckCircle className="w-3 h-3" />,
			};
		}
	};

	const getMemberStatus = (status: string): MemberStatus => {
		switch (status) {
			case "active":
				return {
					label: "Active",
					variant: "default",
					icon: <CheckCircle className="w-3 h-3" />,
					color: "bg-green-100 text-green-800 border-green-200",
				};
			case "inactive":
				return {
					label: "Inactive",
					variant: "secondary",
					icon: <AlertCircle className="w-3 h-3" />,
					color: "bg-gray-100 text-gray-800 border-gray-200",
				};
			default:
				return {
					label: "Unknown",
					variant: "outline",
					icon: <AlertCircle className="w-3 h-3" />,
					color: "bg-yellow-100 text-yellow-800 border-yellow-200",
				};
		}
	};

	const generateInitials = (firstName: string, lastName: string): string => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const getFullName = (): string => {
		const parts = [
			member.first_name,
			member.middle_name,
			member.last_name,
			member.suffix,
		].filter(Boolean);
		return parts.join(" ");
	};

	const ageCalculation = calculateAge(member.date_of_birth);
	const age = ageCalculation.years;
	const ageGroup = getAgeGroup(age);
	const memberStatus = getMemberStatus(member.status);
	const initials = generateInitials(member.first_name, member.last_name);

	const renderCompactVariant = () => (
		<Card className={`hover:shadow-md transition-shadow ${className}`}>
			<CardContent className="p-4">
				<div className="flex items-center space-x-3">
					{/* Avatar */}
					<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
						{initials}
					</div>

					{/* Member Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2 mb-1">
							<h3 className="font-semibold text-gray-900 truncate">
								{getFullName()}
							</h3>
							{member.is_freshtrak_user && (
								<Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
									FreshTrak User
								</Badge>
							)}
						</div>
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<Badge className={`text-xs ${ageGroup.color}`}>
								<div className="flex items-center space-x-1">
									{ageGroup.icon}
									<span>{ageGroup.label}</span>
								</div>
							</Badge>
							<span>•</span>
							<span>{age} years old</span>
						</div>
					</div>

					{/* Actions */}
					{showActions && (
						<div className="flex flex-col space-y-1">
							{/* Status Management */}
							{showStatusManagement && (
								<MemberStatusManager
									member={member}
									householdId={householdId}
									onStatusChange={onStatusChange}
									onError={onError}
									variant="dropdown"
								/>
							)}

							{/* Action Buttons */}
							<div className="flex space-x-1">
								<Button
									onClick={() => onEdit?.(member)}
									variant="outline"
									size="sm"
									className="h-8 w-8 p-0"
								>
									<Edit className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	const renderDetailedVariant = () => (
		<Card className={`hover:shadow-md transition-shadow ${className}`}>
			<CardContent className="p-6">
				<div className="flex items-start space-x-4">
					{/* Avatar */}
					<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
						{initials}
					</div>

					{/* Member Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2 mb-2">
							<h3 className="text-lg font-semibold text-gray-900">
								{getFullName()}
							</h3>
							{member.is_freshtrak_user && (
								<Badge className="bg-green-100 text-green-800 border-green-200">
									FreshTrak User
								</Badge>
							)}
						</div>

						<div className="flex items-center space-x-3 mb-3">
							<Badge className={`text-xs ${ageGroup.color}`}>
								<div className="flex items-center space-x-1">
									{ageGroup.icon}
									<span>{ageGroup.label}</span>
								</div>
							</Badge>
							<Badge className={`text-xs ${memberStatus.color}`}>
								<div className="flex items-center space-x-1">
									{memberStatus.icon}
									<span>{memberStatus.label}</span>
								</div>
							</Badge>
							<span className="text-sm text-gray-600">
								{age} years old
							</span>
						</div>

						{/* Contact Information */}
						<div className="space-y-2 text-sm text-gray-600">
							{member.email && (
								<div className="flex items-center space-x-2">
									<Mail className="w-4 h-4 text-gray-400" />
									<span>{member.email}</span>
								</div>
							)}
							{member.phone && (
								<div className="flex items-center space-x-2">
									<Phone className="w-4 h-4 text-gray-400" />
									<span>
										{formatPhoneNumber(member.phone)}
									</span>
								</div>
							)}
							<div className="flex items-center space-x-2">
								<Calendar className="w-4 h-4 text-gray-400" />
								<span>
									Born:{" "}
									{formatDateOfBirth(member.date_of_birth)}
								</span>
							</div>
							{member.address_line_1 && (
								<div className="flex items-center space-x-2">
									<MapPin className="w-4 h-4 text-gray-400" />
									<span>
										{[
											member.address_line_1,
											member.address_line_2,
											member.city,
											member.state,
											member.zip_code,
										]
											.filter(Boolean)
											.join(", ")}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Actions */}
					{showActions && (
						<div className="flex flex-col space-y-2">
							{/* Status Management */}
							{showStatusManagement && (
								<MemberStatusManager
									member={member}
									householdId={householdId}
									onStatusChange={onStatusChange}
									onError={onError}
									variant="dropdown"
								/>
							)}

							{/* Action Buttons */}
							<div className="flex space-x-2">
								<Button
									onClick={() => onEdit?.(member)}
									variant="outline"
									size="sm"
								>
									<Edit className="w-4 h-4 mr-2" />
									Edit
								</Button>
								<Button
									onClick={() => onViewDetails?.(member)}
									variant="outline"
									size="sm"
								>
									<MoreVertical className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	const renderDefaultVariant = () => (
		<Card className={`hover:shadow-md transition-shadow ${className}`}>
			<CardContent className="p-4">
				<div className="flex items-center space-x-4">
					{/* Avatar */}
					<div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
						{initials}
					</div>

					{/* Member Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2 mb-1">
							<h3 className="font-semibold text-gray-900 truncate">
								{getFullName()}
							</h3>
							{member.is_freshtrak_user && (
								<Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
									FreshTrak User
								</Badge>
							)}
						</div>
						<div className="flex items-center space-x-2 mb-2">
							<Badge className={`text-xs ${ageGroup.color}`}>
								<div className="flex items-center space-x-1">
									{ageGroup.icon}
									<span>{ageGroup.label}</span>
								</div>
							</Badge>
							<Badge className={`text-xs ${memberStatus.color}`}>
								<div className="flex items-center space-x-1">
									{memberStatus.icon}
									<span>{memberStatus.label}</span>
								</div>
							</Badge>
						</div>
						<div className="text-sm text-gray-600">
							<span>{age} years old</span>
							{member.email && (
								<>
									<span> • </span>
									<span>{member.email}</span>
								</>
							)}
						</div>
					</div>

					{/* Actions */}
					{showActions && (
						<div className="flex space-x-1">
							<Button
								onClick={() => onEdit?.(member)}
								variant="outline"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<Edit className="w-4 h-4" />
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	switch (variant) {
		case "compact":
			return renderCompactVariant();
		case "detailed":
			return renderDetailedVariant();
		default:
			return renderDefaultVariant();
	}
};

/**
 * Hook for managing member card interactions
 * Provides utilities for member operations
 */
export const useMemberCard = () => {
	const handleEditMember = (member: HouseholdMember) => {
		// Navigate to edit member form or open edit modal
		console.log("Edit member:", member);
	};

	const handleViewMemberDetails = (member: HouseholdMember) => {
		// Navigate to member details page or open details modal
		console.log("View member details:", member);
	};

	const handleDeleteMember = (member: HouseholdMember) => {
		// Show confirmation dialog and delete member
		console.log("Delete member:", member);
	};

	return {
		handleEditMember,
		handleViewMemberDetails,
		handleDeleteMember,
	};
};

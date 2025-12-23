/**
 * MemberCard Component
 *
 * Displays a household member with their name, category (Senior/Adult/Child),
 * FreshTrak User badge (if applicable), and avatar with initials.
 */

import React from "react";
import { Badge } from "../../../components/ui/badge";
import {
	getMemberCategory,
	getMemberCategoryLabel,
	getMemberInitials,
} from "../utils/memberUtils";
import localization from "../../Localization/LocalizationComponent";

interface MemberCardProps {
	firstName: string;
	lastName: string;
	middleName?: string | null;
	suffix?: string | null;
	dateOfBirth: string;
	isFreshTrakUser?: boolean;
	className?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
	firstName,
	lastName,
	middleName,
	suffix,
	dateOfBirth,
	isFreshTrakUser = false,
	className = "",
}) => {
	const category = getMemberCategory(dateOfBirth);
	const categoryLabel = getMemberCategoryLabel(category);
	const initials = getMemberInitials(firstName, lastName);

	// Build full name
	const fullName = [firstName, middleName, lastName, suffix]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
		>
			<div className="flex justify-between items-start">
				{/* Left side - Member info */}
				<div className="flex-1 min-w-0">
					<h4 className="font-noto-sans font-semibold text-base text-gray-900 truncate">
						{fullName}
					</h4>
					<p className="font-noto-sans text-sm text-gray-500 mt-1">
						{categoryLabel}
					</p>
					{isFreshTrakUser && (
						<Badge className="bg-primary text-white text-xs mt-2">
							{localization.badge_freshtrak_user ||
								"FreshTrak User"}
						</Badge>
					)}
				</div>

				{/* Right side - Avatar */}
				<div className="flex-shrink-0 ml-4">
					<div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
						<span className="font-noto-sans font-semibold text-sm text-orange-800">
							{initials}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MemberCard;

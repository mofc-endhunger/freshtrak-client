/**
 * HouseholdMembersSection Component
 *
 * Right column of the Account tab displaying "Household Members"
 * Shows all household members except the head of household.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import MemberCard from "./MemberCard";
import { UsersMeResponse } from "../../Households/types/api.types";
import { RENDER_URL } from "../../../Utils/Urls";
import localization from "../../Localization/LocalizationComponent";
import { getSuffixFromId } from "../../Households/utils/householdUtils";

interface HouseholdMembersSectionProps {
	householdData: UsersMeResponse | null;
}

const HouseholdMembersSection: React.FC<HouseholdMembersSectionProps> = ({
	householdData,
}) => {
	const navigate = useNavigate();

	// Filter out head of household - show only other members
	const otherMembers =
		householdData?.members?.filter(
			(member: any) => member.is_head_of_household !== 1,
		) || [];

	// Navigate to household setup
	const handleUpdateHousehold = () => {
		navigate(`${RENDER_URL.HOUSEHOLD_SETUP_URL}?from=account`);
	};

	return (
		<div className="space-y-4">
			{/* Section Header */}
			<h2 className="font-noto-sans font-semibold text-lg text-gray-900">
				{localization.title_household_members || "Household Members"}
			</h2>

			{/* Member Cards */}
			{otherMembers.length > 0 ? (
				<div className="space-y-3">
					{otherMembers.map((member: any) => (
						<MemberCard
							key={member.id}
							firstName={member.first_name}
							lastName={member.last_name}
							middleName={member.middle_name}
							suffix={getSuffixFromId(member.suffix_id)}
							dateOfBirth={member.date_of_birth}
							isFreshTrakUser={member.is_freshtrak_user}
						/>
					))}
				</div>
			) : (
				<div className="bg-gray-50 rounded-lg p-6 text-center">
					<p className="font-noto-sans text-sm text-gray-500">
						{localization.text_no_other_members ||
							"No other household members added."}
					</p>
				</div>
			)}

			{/* Update Household Link */}
			<div className="text-center pt-2">
				<Button
					variant="link"
					onClick={handleUpdateHousehold}
					className="font-noto-sans text-sm text-highlight underline hover:text-highlight/80"
				>
					{localization.link_update_household || "Update Household"}
				</Button>
			</div>
		</div>
	);
};

export default HouseholdMembersSection;

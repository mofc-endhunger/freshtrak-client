import React, { useState } from "react";
import EligibilityModalComponent from "./EligibilityModalComponent";
import {
	HouseHoldEligibilityComponentProps,
	ParsedBodyData,
} from "./types/eligibility.types";
import localization from "../Localization/LocalizationComponent";
import { Button } from "../../components/ui/button";

/**
 * HouseHoldEligibilityComponent - Component for displaying household eligibility information
 *
 * This component provides a link to view eligibility guidelines in a modal.
 * It parses JSON data from the body prop to extract column, row, and addon information.
 *
 * @component
 * @param {HouseHoldEligibilityComponentProps} props - Component props
 * @returns {JSX.Element} The household eligibility component
 */
const HouseHoldEligibilityComponent: React.FC<
	HouseHoldEligibilityComponentProps
> = ({ header = "", body = "", footer = "" }) => {
	const [showEligibilityModal, setShowEligibilityModal] =
		useState<boolean>(false);
	let columnData: string[] = [];
	let rowsData: (string | number)[][] = [];
	let addOnData: string = "";

	if (body) {
		try {
			const parsed: ParsedBodyData = JSON.parse(body);
			columnData =
				parsed.columns && Array.isArray(parsed.columns)
					? parsed.columns
					: [];
			rowsData =
				parsed.rows && Array.isArray(parsed.rows) ? parsed.rows : [];
			addOnData = parsed.addon ? parsed.addon : "";
		} catch (error) {
			console.error("Error parsing body JSON:", error);
			columnData = [];
			rowsData = [];
			addOnData = "";
		}
	}

	return (
		<div className="flex items-center mt-2">
			<div className="w-full">
				<div className="flex items-center">
					<span className="font-bold ml-2 text-gray-900">
						{localization.eligibility_view_requirements_text}
					</span>
					<Button
						variant="link"
						onClick={() => setShowEligibilityModal(true)}
						className="p-0 h-auto ml-2 font-bold"
					>
						{localization.eligibility_view_guidelines_button}
					</Button>
				</div>
			</div>
			<EligibilityModalComponent
				show={showEligibilityModal}
				close={() => setShowEligibilityModal(false)}
				columnData={columnData}
				rowsData={rowsData}
				addOnData={addOnData}
				header={header || ""}
				footer={footer || ""}
			/>
		</div>
	);
};

export default HouseHoldEligibilityComponent;

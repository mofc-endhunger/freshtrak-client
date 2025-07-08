import React, { useState } from "react";
import EligibilityModalComponent from "./EligibilityModalComponent";

interface HouseHoldEligibilityComponentProps {
	header?: string;
	body?: string;
	footer?: string;
}

interface EligibilityData {
	columns?: any[];
	rows?: any[];
	addon?: string;
}

const HouseHoldEligibilityComponent: React.FC<
	HouseHoldEligibilityComponentProps
> = ({ header, body, footer }) => {
	const [showEligibilityModal, setShowEligibilityModal] =
		useState<boolean>(false);
	let columnData: any[] = [];
	let rowsData: any[] = [];
	let addOnData: string = "";

	if (body) {
		try {
			const { columns, rows, addon }: EligibilityData = JSON.parse(body);
			columnData = columns && Array.isArray(columns) ? columns : [];
			rowsData = rows && Array.isArray(rows) ? rows : [];
			addOnData = addon ? addon : "";
		} catch (error) {
			console.error("Error parsing eligibility data:", error);
		}
	}

	return (
		<div className="row align-items-center mt-2">
			<div className="col-lg-12 col-sm-10">
				<div className="d-flex align-items-center">
					<span className="font-weight-bold ml-2">
						To view eligibility requirements for our programs click
						here:
					</span>
					<span className="font-weight-bold ml-2">
						<a
							href="#"
							className="link"
							rel="noopener noreferrer"
							onClick={e => {
								e.preventDefault();
								setShowEligibilityModal(true);
							}}
						>
							View Eligibility Guidelines
						</a>
					</span>
				</div>
			</div>
			<EligibilityModalComponent
				show={showEligibilityModal}
				close={() => setShowEligibilityModal(false)}
				columnData={columnData}
				rowsData={rowsData}
				addOnData={addOnData}
				header={header}
				footer={footer}
			/>
		</div>
	);
};

export default HouseHoldEligibilityComponent;

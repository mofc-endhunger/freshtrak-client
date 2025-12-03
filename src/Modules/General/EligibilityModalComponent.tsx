import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "../../components/ui/dialog";
import { Slider } from "../../components/ui/slider";
import { EligibilityModalComponentProps } from "./types/eligibility.types";
import localization from "../Localization/LocalizationComponent";

/**
 * EligibilityModalComponent - Modal component for displaying eligibility requirements
 *
 * This component displays a modal with a slider to select household size and
 * shows corresponding income eligibility information in a table format.
 *
 * @component
 * @param {EligibilityModalComponentProps} props - Component props
 * @returns {JSX.Element} The eligibility modal component
 */
const EligibilityModalComponent: React.FC<EligibilityModalComponentProps> = ({
	show,
	close,
	columnData,
	rowsData,
	addOnData,
	header,
	footer,
}) => {
	const [slideValue, setSlideValue] = useState<number>(4);
	const rowItem =
		rowsData.length >= slideValue - 1 ? rowsData[slideValue - 1] : [];

	const handleValueChange = (value: number[]) => {
		setSlideValue(value[0]);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			close();
		}
	};

	return (
		<Dialog open={show} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg bg-white">
				<DialogHeader>
					<DialogTitle>{header}</DialogTitle>
					<DialogDescription className="sr-only">
						{localization.eligibility_dialog_description}
					</DialogDescription>
				</DialogHeader>
				<div className="mb-5">
					<span className="text-base font-medium text-gray-900 block mb-3">
						{localization.eligibility_member_size}
					</span>
					<div className="mt-3 px-2">
						<Slider
							value={[slideValue]}
							min={1}
							max={rowsData.length}
							step={1}
							onValueChange={handleValueChange}
							className="w-full"
						/>
						<div className="flex justify-between mt-2 text-sm text-gray-600">
							<span>1</span>
							<span>{rowsData.length}</span>
						</div>
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="bg-gray-100">
								{columnData.map((item, i) => (
									<th
										key={i}
										scope="col"
										className="px-4 py-3 text-left text-sm font-medium text-gray-700"
									>
										{item}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr>
								{rowItem.map((row, j) => (
									<td
										key={j}
										className="px-4 py-3 text-sm text-gray-900"
									>
										{row}
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
				<div className="mt-4">
					<span className="text-sm text-gray-600">
						{localization.eligibility_note_prefix} {addOnData}
					</span>
				</div>
				<DialogFooter className="justify-start mt-4">
					<span className="text-sm text-gray-600">{footer}</span>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EligibilityModalComponent;

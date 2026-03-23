/**
 * AssessmentConfirmation Component
 *
 * Success screen displayed after assessment submission.
 * Shows "What's Next?" messaging with personalized program recommendation info.
 */

import React from "react";
import {
	Dialog,
	DialogContent,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { CheckCircle } from "lucide-react";
import localization from "../../Localization/LocalizationComponent";

interface AssessmentConfirmationProps {
	isOpen: boolean;
	onClose: () => void;
}

const AssessmentConfirmation: React.FC<AssessmentConfirmationProps> = ({
	isOpen,
	onClose,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[320px] sm:max-w-[320px] overflow-hidden border-0 shadow-xl rounded-lg"
				showCloseButton={false}
			>
				<div className="bg-text-primary text-white p-6 min-h-[400px] flex flex-col items-center relative rounded-lg">
					{/* Logo/Brand */}
					<div className="mt-8 mb-6">
						<h1 className="text-2xl font-bold tracking-wide">
							FreshTrak
						</h1>
					</div>

					{/* Success Icon */}
					<div className="mb-6">
						<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
							<CheckCircle className="w-10 h-10 text-white" />
						</div>
					</div>

					{/* What's Next Message */}
					<div className="text-center space-y-4 flex-1">
						<h2
							className="text-xl font-bold"
							data-testid="assessment-confirmation-title"
						>
							{localization.assessment_whats_next ||
								"What's Next?"}
						</h2>
						<p className="text-white/90 text-sm leading-relaxed max-w-[250px]">
							{localization.assessment_confirmation_message ||
								"We will use the information collected today to recommend personalized programs that you qualify for."}
						</p>
						<p className="text-white/80 text-xs leading-relaxed max-w-[250px]">
							{localization.assessment_confirmation_supporting ||
								"We will also periodically ask you to fill out other, more detailed, assessments."}
						</p>
					</div>

					{/* Close Button */}
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="mt-6 w-full max-w-[200px] bg-white text-gray-dark hover:bg-gray-100 border-white font-semibold rounded-md"
						data-testid="assessment-confirmation-close"
					>
						{localization.assessment_close || "Close"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AssessmentConfirmation;

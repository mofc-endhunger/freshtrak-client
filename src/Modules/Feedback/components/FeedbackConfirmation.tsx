/**
 * FeedbackConfirmation Component
 *
 * Success/thank you screen displayed after feedback submission.
 * Features a full green background with FreshTrak branding.
 */

import React from "react";
import {
	Dialog,
	DialogContent,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { CheckCircle } from "lucide-react";
import localization from "../../Localization/LocalizationComponent";

interface FeedbackConfirmationProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback to close the confirmation */
	onClose: () => void;
}

const FeedbackConfirmation: React.FC<FeedbackConfirmationProps> = ({
	isOpen,
	onClose,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[320px] sm:max-w-[320px] overflow-hidden border-0 shadow-xl rounded-lg"
				showCloseButton={false}
			>
				{/* Full Green Background Content */}
				<div className="bg-text-primary text-white p-6 min-h-[400px] flex flex-col items-center relative rounded-lg">

					{/* Logo/Brand */}
					<div className="mt-8 mb-6">
						<h1 className="text-2xl font-bold tracking-wide">FreshTrak</h1>
					</div>

					{/* Success Icon */}
					<div className="mb-6">
						<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
							<CheckCircle className="w-10 h-10 text-white" />
						</div>
					</div>

					{/* Thank You Message */}
					<div className="text-center space-y-4 flex-1">
						<h2 className="text-xl font-bold">
							{localization.feedback_thank_you_title ||
								"Thank You For Providing Feedback!"}
						</h2>
						<p className="text-white/90 text-sm leading-relaxed max-w-[250px]">
							{localization.feedback_thank_you_message ||
								"With your help, we can improve your experience and better serve our community."}
						</p>
					</div>

					{/* Close Button */}
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="mt-6 w-full max-w-[200px] bg-white text-gray-dark hover:bg-gray-100 border-white font-semibold rounded-md"
					>
						{localization.feedback_close || "Close"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default FeedbackConfirmation;

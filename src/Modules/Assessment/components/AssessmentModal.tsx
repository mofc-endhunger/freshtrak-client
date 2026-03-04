/**
 * AssessmentModal Component
 *
 * Modal dialog for collecting assessment survey responses.
 * Renders questions one section at a time with Next/Skip navigation.
 * Reuses QuestionnaireRenderer and QuestionRenderer from the Feedback module.
 */

import React, { useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import QuestionnaireRenderer from "../../Feedback/components/QuestionnaireRenderer";
import { useAssessment } from "../context";
import { cn } from "../../../lib/utils";
import localization from "../../Localization/LocalizationComponent";

interface AssessmentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const LoadingContent: React.FC = () => (
	<div className="flex items-center justify-center p-8">
		<Loader2 className="w-8 h-8 animate-spin text-text-primary" />
	</div>
);

const ErrorContent: React.FC<{ error: string; onRetry: () => void }> = ({
	error,
	onRetry,
}) => (
	<div className="p-5 text-center space-y-4">
		<p className="text-red-600">{error}</p>
		<Button onClick={onRetry} variant="outline">
			{localization.button_try_again || "Try Again"}
		</Button>
	</div>
);

const AlreadySubmittedContent: React.FC<{ onClose: () => void }> = ({
	onClose,
}) => (
	<div className="p-5 space-y-4">
		<div className="text-center">
			<p className="text-gray-700 mb-4">
				{localization.assessment_already_submitted ||
					"You have already completed this assessment."}
			</p>
		</div>
		<Button
			onClick={onClose}
			className="w-full bg-text-primary hover:bg-text-primary/90"
		>
			{localization.assessment_close || "Close"}
		</Button>
	</div>
);

const AssessmentFormContent: React.FC = () => {
	const {
		sections,
		formState,
		modalState,
		currentSectionIndex,
		totalSections,
		error,
		setQuestionResponse,
		submitAssessment,
		goToNextSection,
		skipSection,
	} = useAssessment();

	const isSubmitting = modalState === "submitting";
	const isLastSection = currentSectionIndex >= totalSections - 1;
	const currentSection = sections[currentSectionIndex];
	const currentQuestions = currentSection?.questions ?? [];

	const handleNext = useCallback(async () => {
		if (isLastSection) {
			await submitAssessment();
		} else {
			goToNextSection();
		}
	}, [isLastSection, submitAssessment, goToNextSection]);

	const handleSkip = useCallback(() => {
		if (isLastSection) {
			submitAssessment();
		} else {
			skipSection();
		}
	}, [isLastSection, submitAssessment, skipSection]);

	return (
		<div className="p-5 space-y-5 bg-white" data-testid="assessment-form">
			{/* Section title */}
			{currentSection?.title && (
				<h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
					{currentSection.title}
				</h3>
			)}

			{/* Section progress indicator */}
			{totalSections > 1 && (
				<div className="flex items-center gap-2">
					{Array.from({ length: totalSections }, (_, i) => (
						<div
							key={i}
							className={cn(
								"h-1.5 flex-1 rounded-full transition-colors",
								i <= currentSectionIndex
									? "bg-text-primary"
									: "bg-gray-200",
							)}
						/>
					))}
				</div>
			)}

			{/* Questions */}
			{currentQuestions.length > 0 && (
				<QuestionnaireRenderer
					questions={currentQuestions}
					responses={formState.responses}
					onResponseChange={setQuestionResponse}
				/>
			)}

			{error && (
				<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
					{error}
				</div>
			)}

			{/* Navigation buttons */}
			<div className="flex flex-col gap-2">
				<Button
					type="button"
					onClick={handleNext}
					disabled={isSubmitting}
					className={cn(
						"w-full min-h-12 text-base font-semibold rounded-md",
						"bg-text-primary hover:bg-text-primary/90 text-white",
					)}
					data-testid="assessment-next-btn"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							{localization.assessment_submitting ||
								"Submitting..."}
						</>
					) : isLastSection ? (
						(localization.assessment_submit || "Submit")
					) : (
						(localization.assessment_next || "Next")
					)}
				</Button>

				{!isSubmitting && (
					<Button
						type="button"
						variant="ghost"
						onClick={handleSkip}
						className="w-full text-gray-500 hover:text-gray-700"
						data-testid="assessment-skip-btn"
					>
						{localization.assessment_skip || "Skip"}
					</Button>
				)}
			</div>
		</div>
	);
};

const AssessmentModal: React.FC<AssessmentModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { surveyTitle, modalState, error, reload } = useAssessment();

	const handleClose = () => onClose();

	const renderContent = () => {
		switch (modalState) {
			case "loading":
				return <LoadingContent />;
			case "error":
				return (
					<ErrorContent
						error={
							error ||
							localization.assessment_error_generic ||
							"An error occurred"
						}
						onRetry={reload}
					/>
				);
			case "no_survey_found":
				return (
					<div className="p-5 text-center space-y-4">
						<p className="text-gray-700">
							{localization.assessment_no_questions ||
								"No questions available for this assessment."}
						</p>
						<Button
							onClick={handleClose}
							className="w-full bg-text-primary hover:bg-text-primary/90"
						>
							{localization.assessment_close || "Close"}
						</Button>
					</div>
				);
			case "already_submitted":
				return <AlreadySubmittedContent onClose={handleClose} />;
			case "form":
			case "submitting":
				return <AssessmentFormContent />;
			case "confirmation":
				return null;
			default:
				return null;
		}
	};

	const title =
		surveyTitle || localization.assessment_title || "Enrollment Assessment";
	const description =
		localization.assessment_description ||
		"Please complete the following assessment so we can recommend personalized programs for you.";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent
				className="p-0 gap-0 max-w-[360px] sm:max-w-[360px] max-h-[90vh] flex flex-col overflow-hidden bg-white border-0 shadow-xl"
				showCloseButton={true}
			>
				<DialogHeader className="flex-shrink-0 bg-text-primary px-4 py-3 text-white relative rounded-t-lg">
					<DialogTitle className="text-base font-semibold text-white pr-8">
						{title}
						<div className="py-3">
							<h2 className="text-lg font-bold text-white mb-1">
								{title}
							</h2>
							<DialogDescription className="text-sm text-white/90 leading-relaxed font-normal">
								{description}
							</DialogDescription>
						</div>
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 min-h-0 overflow-y-auto">
					{renderContent()}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AssessmentModal;

/**
 * DynamicFormRenderer Component
 *
 * Renders a dynamic feedback form based on configuration from the API.
 * Maps over questions ordered by displayOrder and renders QuestionRenderer
 * for each question.
 *
 * This component replaces the hardcoded form sections in FeedbackModal
 * and allows for flexible, database-driven form configurations.
 */

import React, { useCallback } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { cn } from "../../../lib/utils";
import {
	FeedbackForm,
	FeedbackQuestionResponseDraft,
	DynamicFormRendererProps,
} from "../types";

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
	form,
	responses,
	onResponseChange,
	className,
}) => {
	/**
	 * Handle response change for a specific question
	 */
	const handleResponseChange = useCallback(
		(questionId: number, response: FeedbackQuestionResponseDraft) => {
			onResponseChange(questionId, response);
		},
		[onResponseChange]
	);

	/**
	 * Get response for a question (or create empty default)
	 */
	const getResponse = (questionId: number): FeedbackQuestionResponseDraft => {
		return (
			responses.get(questionId) || {
				questionId,
				starRating: undefined,
				commentText: undefined,
				selectedTagIds: [],
			}
		);
	};

	// Sort questions by displayOrder
	const sortedQuestions = [...form.questions]
		.filter((q) => q.isActive)
		.sort((a, b) => a.displayOrder - b.displayOrder);

	if (sortedQuestions.length === 0) {
		return (
			<div className="text-center text-gray-500 py-4">
				No questions configured for this form.
			</div>
		);
	}

	return (
		<div
			className={cn("space-y-5", className)}
			data-testid="dynamic-form-renderer"
		>
			{sortedQuestions.map((question) => (
				<QuestionRenderer
					key={question.id}
					question={question}
					response={getResponse(question.id)}
					onResponseChange={(response) =>
						handleResponseChange(question.id, response)
					}
				/>
			))}
		</div>
	);
};

export default DynamicFormRenderer;

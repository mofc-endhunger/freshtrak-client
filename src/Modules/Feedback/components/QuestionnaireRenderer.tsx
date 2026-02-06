/**
 * QuestionnaireRenderer Component
 *
 * Renders all questions from a questionnaire configuration.
 * Each question is rendered using QuestionRenderer.
 */

import React, { useCallback } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { cn } from "../../../lib/utils";
import { QuestionnaireRendererProps } from "../types";

const QuestionnaireRenderer: React.FC<QuestionnaireRendererProps> = ({
	questions,
	responses,
	onResponseChange,
	className,
}) => {
	/**
	 * Handle response change for a specific question
	 */
	const handleResponseChange = useCallback(
		(questionId: number, scaleValue: number) => {
			onResponseChange(questionId, scaleValue);
		},
		[onResponseChange]
	);

	/**
	 * Get current value for a question
	 */
	const getQuestionValue = (questionId: number): number | undefined => {
		return responses.get(questionId)?.scaleValue;
	};

	// Sort questions by order
	const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

	if (sortedQuestions.length === 0) {
		return null;
	}

	return (
		<div
			className={cn("space-y-4", className)}
			data-testid="questionnaire-renderer"
		>
			{sortedQuestions.map((question) => (
				<QuestionRenderer
					key={question.id}
					question={question}
					value={getQuestionValue(question.id)}
					onChange={(value) => handleResponseChange(question.id, value)}
				/>
			))}
		</div>
	);
};

export default QuestionnaireRenderer;

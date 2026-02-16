/**
 * QuestionnaireRenderer Component
 *
 * Renders all questions from a questionnaire configuration.
 * Each question is rendered using QuestionRenderer.
 */

import React, { useCallback } from "react";
import QuestionRenderer from "./QuestionRenderer";
import { cn } from "../../../lib/utils";
import { QuestionnaireRendererProps, QuestionResponsePayload } from "../types";

const QuestionnaireRenderer: React.FC<QuestionnaireRendererProps> = ({
	questions,
	responses,
	onResponseChange,
	className,
}) => {
	const handleResponseChange = useCallback(
		(questionId: number, payload: QuestionResponsePayload) => {
			onResponseChange(questionId, payload);
		},
		[onResponseChange]
	);

	const getQuestionValue = (questionId: number): number | undefined => {
		return responses.get(questionId)?.scale_value;
	};

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
					onChange={(payload) => handleResponseChange(question.id, payload)}
				/>
			))}
		</div>
	);
};

export default QuestionnaireRenderer;

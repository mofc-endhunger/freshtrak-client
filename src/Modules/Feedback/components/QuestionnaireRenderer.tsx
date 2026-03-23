/**
 * QuestionnaireRenderer Component
 *
 * Renders all questions from the survey, sorted by order.
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
		[onResponseChange],
	);

	const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

	if (sortedQuestions.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-4", className)} data-testid="questionnaire-renderer">
			{sortedQuestions.map((question) => {
				const draft = responses.get(question.id);
				return (
					<QuestionRenderer
						key={question.id}
						question={question}
						answerValue={draft?.answer_value}
						onChange={(payload) => handleResponseChange(question.id, payload)}
					/>
				);
			})}
		</div>
	);
};

export default QuestionnaireRenderer;

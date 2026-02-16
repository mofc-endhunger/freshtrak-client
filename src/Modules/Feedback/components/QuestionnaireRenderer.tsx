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

	const draftFor = (questionId: number) => responses.get(questionId);

	const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

	if (sortedQuestions.length === 0) {
		return null;
	}

	return (
		<div
			className={cn("space-y-4", className)}
			data-testid="questionnaire-renderer"
		>
			{sortedQuestions.map((question) => {
				const draft = draftFor(question.id);
				return (
					<QuestionRenderer
						key={question.id}
						question={question}
						value={draft?.scale_value}
						answerValue={draft?.answer_value}
						onChange={(payload) => handleResponseChange(question.id, payload)}
					/>
				);
			})}
		</div>
	);
};

export default QuestionnaireRenderer;

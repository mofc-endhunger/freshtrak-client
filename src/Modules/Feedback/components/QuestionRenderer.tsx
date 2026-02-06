/**
 * QuestionRenderer Component
 *
 * Renders a single questionnaire question based on its type.
 * Currently supports: scale_1_5 (star rating)
 * Future: radio, checkbox, short_text (Survey Engine Phase 2)
 */

import React, { useCallback } from "react";
import { StarRating } from "../../../components/ui/star-rating";
import { cn } from "../../../lib/utils";
import { QuestionRendererProps } from "../types";

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	value,
	onChange,
	className,
}) => {
	/**
	 * Handle rating change
	 */
	const handleRatingChange = useCallback(
		(rating: number) => {
			onChange(rating);
		},
		[onChange]
	);

	/**
	 * Render question based on type
	 */
	const renderQuestionInput = () => {
		switch (question.type) {
			case "scale_1_5":
				return (
					<StarRating
						value={value || 0}
						onChange={handleRatingChange}
						size="md"
						className="justify-start"
						data-testid={`question-rating-${question.id}`}
					/>
				);

			// Future Survey Engine types
			case "radio":
			case "checkbox":
			case "short_text":
				// Placeholder for Phase 2
				return (
					<div className="text-sm text-gray-500 italic">
						Question type "{question.type}" not yet supported
					</div>
				);

			default:
				return (
					<div className="text-sm text-red-500">
						Unknown question type: {question.type}
					</div>
				);
		}
	};

	return (
		<div
			className={cn("space-y-2", className)}
			data-testid={`question-${question.id}`}
		>
			{/* Question Prompt */}
			<p className="text-sm font-medium text-gray-700">
				{question.prompt}
				{question.required && (
					<span className="text-red-500 ml-1" aria-label="required">
						*
					</span>
				)}
			</p>

			{/* Question Input */}
			{renderQuestionInput()}
		</div>
	);
};

export default QuestionRenderer;

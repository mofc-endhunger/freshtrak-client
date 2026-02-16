/**
 * QuestionRenderer Component
 *
 * Renders a single questionnaire question. Backend (feedback-ui-integration.md) uses
 * scale_1_5 with optional options (id, value, label, order) for labels.
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
	const scaleValue = typeof value === "number" ? value : 0;

	const handleRatingChange = useCallback(
		(rating: number) => onChange({ scaleValue: rating }),
		[onChange]
	);

	return (
		<div
			className={cn("space-y-2", className)}
			data-testid={`question-${question.id}`}
		>
			<p className="text-sm font-medium text-gray-700">
				{question.prompt}
				{question.required && (
					<span className="text-red-500 ml-1" aria-label="required">
						*
					</span>
				)}
			</p>
			<StarRating
				value={scaleValue}
				onChange={handleRatingChange}
				size="md"
				className="justify-start"
				data-testid={`question-rating-${question.id}`}
			/>
			{question.options && question.options.length > 0 && (
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
					{[...question.options]
						.sort((a, b) => a.order - b.order)
						.map((opt) => (
							<span key={opt.id}>
								{opt.value}: {opt.label}
							</span>
						))}
				</div>
			)}
		</div>
	);
};

export default QuestionRenderer;

/**
 * QuestionRenderer Component
 *
 * Renders a single feedback question with conditional sections:
 * - Star rating (if starQuestion exists)
 * - Tags (if tagPrompt exists)
 * - Comment textarea (if commentPlaceholder exists)
 *
 * Each section is optional and renders based on the question configuration.
 */

import React, { useCallback } from "react";
import { StarRating } from "../../../components/ui/star-rating";
import { Textarea } from "../../../components/ui/textarea";
import DynamicTags from "./DynamicTags";
import { cn } from "../../../lib/utils";
import {
	FeedbackFormQuestion,
	FeedbackQuestionResponseDraft,
	QuestionRendererProps,
} from "../types";

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
	question,
	response,
	onResponseChange,
	className,
}) => {
	/**
	 * Handle star rating change
	 */
	const handleStarChange = useCallback(
		(rating: number) => {
			onResponseChange({
				...response,
				starRating: rating,
			});
		},
		[response, onResponseChange]
	);

	/**
	 * Handle tag selection change
	 */
	const handleTagsChange = useCallback(
		(tagIds: number[]) => {
			onResponseChange({
				...response,
				selectedTagIds: tagIds,
			});
		},
		[response, onResponseChange]
	);

	/**
	 * Handle comment text change
	 */
	const handleCommentChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			onResponseChange({
				...response,
				commentText: e.target.value,
			});
		},
		[response, onResponseChange]
	);

	const hasStarSection = !!question.starQuestion;
	const hasTagsSection = !!question.tagPrompt && question.tags.length > 0;
	const hasCommentSection = !!question.commentPlaceholder;

	return (
		<div
			className={cn("space-y-4", className)}
			data-testid={`question-${question.id}`}
		>
			{/* Star Rating Section */}
			{hasStarSection && (
				<div data-testid={`question-${question.id}-star`}>
					<p className="text-sm font-semibold text-gray-800 mb-3">
						{question.starQuestion}
					</p>
					<StarRating
						value={response.starRating || 0}
						onChange={handleStarChange}
						size="lg"
						className="justify-start"
						data-testid={`star-rating-${question.id}`}
					/>
				</div>
			)}

			{/* Tags Section */}
			{hasTagsSection && (
				<div data-testid={`question-${question.id}-tags`}>
					<p className="text-sm font-semibold text-gray-800 mb-3">
						{question.tagPrompt}
					</p>
					<DynamicTags
						tags={question.tags}
						selectedTagIds={response.selectedTagIds}
						onChange={handleTagsChange}
						multiSelect={question.isTagMultiSelect}
						data-testid={`tags-${question.id}`}
					/>
				</div>
			)}

			{/* Comment Section */}
			{hasCommentSection && (
				<div data-testid={`question-${question.id}-comment`}>
					<Textarea
						placeholder={question.commentPlaceholder}
						value={response.commentText || ""}
						onChange={handleCommentChange}
						className="min-h-[100px] resize-none border-gray-300 focus:border-text-primary focus:ring-text-primary bg-white"
						maxLength={1000}
						data-testid={`comment-${question.id}`}
					/>
				</div>
			)}
		</div>
	);
};

export default QuestionRenderer;

/**
 * DynamicTags Component
 *
 * A tag/chip selection component that renders dynamic tags from API.
 * Supports both single-select and multi-select modes.
 *
 * This replaces the hardcoded ExperienceTags component for the new
 * dynamic form system while maintaining the same styling.
 */

import React, { useCallback } from "react";
import { cn } from "../../../lib/utils";
import { FeedbackFormQuestionTag, DynamicTagsProps } from "../types";

const DynamicTags: React.FC<DynamicTagsProps & { "data-testid"?: string }> = ({
	tags,
	selectedTagIds,
	onChange,
	multiSelect = true,
	className,
	"data-testid": testId = "dynamic-tags",
}) => {
	/**
	 * Handle tag click
	 */
	const handleTagClick = useCallback(
		(tagId: number) => {
			if (multiSelect) {
				// Multi-select: toggle tag
				if (selectedTagIds.includes(tagId)) {
					onChange(selectedTagIds.filter((id) => id !== tagId));
				} else {
					onChange([...selectedTagIds, tagId]);
				}
			} else {
				// Single-select: replace selection
				if (selectedTagIds.includes(tagId)) {
					// Deselect if already selected
					onChange([]);
				} else {
					onChange([tagId]);
				}
			}
		},
		[multiSelect, selectedTagIds, onChange]
	);

	/**
	 * Handle keyboard navigation
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, tagId: number) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleTagClick(tagId);
			}
		},
		[handleTagClick]
	);

	// Sort tags by displayOrder
	const sortedTags = [...tags].sort((a, b) => a.displayOrder - b.displayOrder);

	return (
		<div
			className={cn("flex flex-wrap gap-2", className)}
			data-testid={testId}
			role="group"
			aria-label={multiSelect ? "Select tags" : "Select a tag"}
		>
			{sortedTags.map((tag) => {
				const isSelected = selectedTagIds.includes(tag.id);

				return (
					<button
						key={tag.id}
						type="button"
						onClick={() => handleTagClick(tag.id)}
						onKeyDown={(e) => handleKeyDown(e, tag.id)}
						className={cn(
							"px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
							"border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary",
							isSelected
								? "bg-secondary text-white border-secondary"
								: "bg-transparent text-secondary border-gray-300 hover:border-secondary"
						)}
						role={multiSelect ? "checkbox" : "radio"}
						aria-checked={isSelected}
						data-testid={`tag-${tag.id}`}
					>
						{tag.tagText}
					</button>
				);
			})}
		</div>
	);
};

export default DynamicTags;

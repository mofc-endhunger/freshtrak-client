/**
 * ExperienceTags Component
 *
 * A tag/chip selection component for users to indicate
 * their experience at a food bank visit.
 */

import React from "react";
import { cn } from "../../../lib/utils";
import { ExperienceTag, EXPERIENCE_TAGS } from "../types";
import localization from "../../Localization/LocalizationComponent";

interface ExperienceTagsProps {
	/** Currently selected tags */
	selectedTags: ExperienceTag[];
	/** Callback when tags change */
	onChange: (tags: ExperienceTag[]) => void;
	/** Additional CSS classes */
	className?: string;
	/** Test ID for testing */
	"data-testid"?: string;
}

/**
 * Get localized label for an experience tag
 */
const getTagLabel = (tag: ExperienceTag): string => {
	const labels: Record<ExperienceTag, string> = {
		kind_volunteers:
			localization.feedback_tag_kind_volunteers || "Kind Volunteers",
		good_service: localization.feedback_tag_good_service || "Good Service",
		clean_space: localization.feedback_tag_clean_space || "Clean Space",
		quality_food: localization.feedback_tag_quality_food || "Quality Food",
		efficient_shoppers:
			localization.feedback_tag_efficient_shoppers || "Efficient Shoppers",
	};
	return labels[tag];
};

const ExperienceTags: React.FC<ExperienceTagsProps> = ({
	selectedTags,
	onChange,
	className,
	"data-testid": testId = "experience-tags",
}) => {
	const handleTagClick = (tag: ExperienceTag) => {
		if (selectedTags.includes(tag)) {
			// Remove tag if already selected
			onChange(selectedTags.filter((t) => t !== tag));
		} else {
			// Add tag if not selected
			onChange([...selectedTags, tag]);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent, tag: ExperienceTag) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleTagClick(tag);
		}
	};

	return (
		<div
			className={cn("flex flex-wrap gap-2", className)}
			data-testid={testId}
			role="group"
			aria-label="Experience tags"
		>
			{EXPERIENCE_TAGS.map((tag) => {
				const isSelected = selectedTags.includes(tag);

				return (
					<button
						key={tag}
						type="button"
						onClick={() => handleTagClick(tag)}
						onKeyDown={(e) => handleKeyDown(e, tag)}
						className={cn(
							"px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150",
							"border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary",
							isSelected
								? "bg-text-primary text-white border-text-primary"
								: "bg-white text-gray-700 border-gray-300 hover:border-text-primary hover:text-text-primary"
						)}
						role="checkbox"
						aria-checked={isSelected}
						data-testid={`tag-${tag}`}
					>
						{getTagLabel(tag)}
					</button>
				);
			})}
		</div>
	);
};

export default ExperienceTags;

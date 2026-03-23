/**
 * StarRating Component
 *
 * A reusable star rating component for collecting user ratings.
 * Supports interactive selection and read-only display modes.
 */

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface StarRatingProps {
	/** Current rating value (0-5) */
	value: number;
	/** Callback when rating changes */
	onChange?: (rating: number) => void;
	/** Whether the rating is read-only */
	readOnly?: boolean;
	/** Size of stars */
	size?: "sm" | "md" | "lg";
	/** Additional CSS classes */
	className?: string;
	/** Test ID for testing */
	"data-testid"?: string;
}

const sizeClasses = {
	sm: "w-5 h-5",
	md: "w-7 h-7",
	lg: "w-9 h-9",
};

const StarRating: React.FC<StarRatingProps> = ({
	value,
	onChange,
	readOnly = false,
	size = "md",
	className,
	"data-testid": testId = "star-rating",
}) => {
	const [hoverValue, setHoverValue] = React.useState<number>(0);

	const handleClick = (rating: number) => {
		if (!readOnly && onChange) {
			onChange(rating);
		}
	};

	const handleMouseEnter = (rating: number) => {
		if (!readOnly) {
			setHoverValue(rating);
		}
	};

	const handleMouseLeave = () => {
		if (!readOnly) {
			setHoverValue(0);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
		if (readOnly) return;

		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onChange?.(rating);
		} else if (e.key === "ArrowRight" && rating < 5) {
			e.preventDefault();
			onChange?.(rating + 1);
		} else if (e.key === "ArrowLeft" && rating > 1) {
			e.preventDefault();
			onChange?.(rating - 1);
		}
	};

	const displayValue = hoverValue > 0 ? hoverValue : value;

	return (
		<div
			className={cn("flex items-center gap-1", className)}
			data-testid={testId}
			role="radiogroup"
			aria-label="Star rating"
		>
			{[1, 2, 3, 4, 5].map((rating) => {
				const isFilled = rating <= displayValue;
				const isActive = rating <= value;

				return (
					<button
						key={rating}
						type="button"
						onClick={() => handleClick(rating)}
						onMouseEnter={() => handleMouseEnter(rating)}
						onMouseLeave={handleMouseLeave}
						onKeyDown={(e) => handleKeyDown(e, rating)}
						disabled={readOnly}
						className={cn(
							"transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 rounded-sm",
							!readOnly && "cursor-pointer hover:scale-110 transition-transform",
							readOnly && "cursor-default"
						)}
						role="radio"
						aria-checked={isActive}
						aria-label={`${rating} star${rating !== 1 ? "s" : ""}`}
						tabIndex={readOnly ? -1 : isActive || (value === 0 && rating === 1) ? 0 : -1}
						data-testid={`star-${rating}`}
					>
						<Star
							className={cn(
								sizeClasses[size],
								isFilled
									? "fill-yellow-400 text-yellow-400"
									: "fill-transparent text-gray-300"
							)}
						/>
					</button>
				);
			})}
		</div>
	);
};

export { StarRating };
export type { StarRatingProps };

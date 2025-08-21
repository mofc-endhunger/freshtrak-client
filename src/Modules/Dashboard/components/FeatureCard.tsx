import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";

/**
 * Props interface for FeatureCard component
 */
interface FeatureCardProps {
	/** The title/heading for the feature card */
	title: string;
	/** The descriptive content for the feature card */
	content: string;
	/** The URL/path to the icon image */
	imageUrl: string;
	/** Optional CSS class names for additional styling */
	className?: string;
}

/**
 * FeatureCard - A modern, accessible card component for displaying feature information
 *
 * This component uses shadcn/ui Card components to create consistent, accessible
 * feature cards with icons, titles, and descriptions. It's designed to replace
 * the legacy BoxComponent with improved accessibility and design consistency.
 *
 * @component
 * @param {FeatureCardProps} props - Component props
 * @returns {JSX.Element} A styled feature card with icon, title, and content
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   title="Stay Up to Date"
 *   content="Coming soon... Make a FreshTrak account to stay up to date on local food access events."
 *   imageUrl={calendarIcon}
 *   className="custom-styling"
 * />
 * ```
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
	title,
	content,
	imageUrl,
	className = "",
}) => {
	return (
		<Card className={`h-full ${className}`}>
			<CardHeader className="text-center pb-4">
				<div className="flex justify-center mb-3">
					<img
						alt={title}
						src={imageUrl}
						className="w-16 h-16 object-contain"
					/>
				</div>
				<CardTitle className="text-lg font-semibold text-text-primary">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="text-center">
				<p className="text-sm text-muted-foreground leading-relaxed">
					{content}
				</p>
			</CardContent>
		</Card>
	);
};

export default FeatureCard;

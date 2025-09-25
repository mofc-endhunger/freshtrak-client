import React from "react";

const LoadingSpinner = ({
	size = "medium",
	color = "primary",
	className = "",
	"data-testid": dataTestId = "loading-spinner",
}) => {
	// Size mapping to Tailwind classes
	const sizeClasses = {
		small: "w-8 h-8",
		medium: "w-12 h-12",
		large: "w-20 h-20",
		xl: "w-32 h-32 md:w-20 md:h-20",
	};

	// Color mapping to Tailwind classes
	const colorClasses = {
		primary:
			"border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30",
		secondary:
			"border-t-secondary border-r-secondary/30 border-b-secondary/30 border-l-secondary/30",
		white: "border-t-white border-r-white/30 border-b-white/30 border-l-white/30",
	};

	// Border width mapping
	const borderWidthClasses = {
		small: "border-2",
		medium: "border-3",
		large: "border-4",
		xl: "border-5 md:border-4",
	};

	return (
		<div
			className={`flex justify-center items-center w-full h-full min-h-25 ${className}`}
			data-testid={dataTestId}
		>
			<div className={`relative inline-block ${sizeClasses[size]}`}>
				<div
					className={`absolute border-3 border-transparent rounded-full animate-spin-slow ${colorClasses[color]} ${borderWidthClasses[size]} ${sizeClasses[size]}`}
					style={{ animationDelay: "0s" }}
				></div>
				<div
					className={`absolute border-3 border-transparent rounded-full animate-spin-slow ${colorClasses[color]} ${borderWidthClasses[size]} ${sizeClasses[size]}`}
					style={{ animationDelay: "0.4s" }}
				></div>
				<div
					className={`absolute border-3 border-transparent rounded-full animate-spin-slow ${colorClasses[color]} ${borderWidthClasses[size]} ${sizeClasses[size]}`}
					style={{ animationDelay: "0.8s" }}
				></div>
			</div>
		</div>
	);
};

export default LoadingSpinner;

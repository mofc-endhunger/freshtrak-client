import React from "react";
import "./LoadingSpinner.scss";

const LoadingSpinner = ({
	size = "medium",
	color = "primary",
	className = "",
	"data-testid": dataTestId = "loading-spinner",
}) => {
	const sizeClass = `spinner-${size}`;
	const colorClass = `spinner-${color}`;

	return (
		<div
			className={`loading-spinner-container ${className}`}
			data-testid={dataTestId}
		>
			<div className={`loading-spinner ${sizeClass} ${colorClass}`}>
				<div className="spinner-ring"></div>
				<div className="spinner-ring"></div>
				<div className="spinner-ring"></div>
			</div>
		</div>
	);
};

export default LoadingSpinner;

import React from "react";

interface SpinnerComponentProps {
	variant?: "small" | "default";
}

const SpinnerComponent: React.FC<SpinnerComponentProps> = ({ variant }) => (
	<div
		className="d-flex justify-content-center mb-4"
		data-testid="spinning component"
	>
		<div
			className={
				variant === "small"
					? "spinner-border loading-spinner-small"
					: "spinner-border loading-spinner-height"
			}
			role="status"
		>
			<span className="sr-only">Loading...</span>
		</div>
	</div>
);

export default SpinnerComponent;

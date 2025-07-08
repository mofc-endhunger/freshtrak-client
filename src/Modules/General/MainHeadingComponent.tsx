/**
 * Used for Main Headings
 */
import React from "react";

interface MainHeadingComponentProps {
	text: string;
}

const MainHeadingComponent: React.FC<MainHeadingComponentProps> = ({
	text,
}) => {
	return (
		<div className="title-wrap">
			<h1 className="big-title mt-5 mb-5 mobile-mb">{text}</h1>
		</div>
	);
};

export default MainHeadingComponent;

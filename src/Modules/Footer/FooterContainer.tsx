import React from "react";
import FooterComponent from "./FooterComponent";

interface FooterContainerProps {
	[key: string]: any;
}

const FooterContainer: React.FC<FooterContainerProps> = props => {
	return (
		<footer className="bg-[#392947] text-white">
			<FooterComponent {...props} />
		</footer>
	);
};

export default FooterContainer;

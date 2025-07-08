import React from "react";
import FooterComponent from "./FooterComponent";
import "../../Assets/scss/main.scss";

interface FooterContainerProps {
	[key: string]: any;
}

const FooterContainer: React.FC<FooterContainerProps> = props => {
	return (
		<footer className="footer-bg footer">
			<FooterComponent {...props} />
		</footer>
	);
};

export default FooterContainer;

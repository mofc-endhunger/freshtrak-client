/**
 * Wrapper Component wraps the whole application.
 * Contains global header and footer.
 */

import React from "react";
import HeaderContainer from "../Header/HeaderContainer";
import FooterContainer from "../Footer/FooterContainer";
import { HeaderProvider } from "../../Store/ContextApi/HeaderContext";

interface WrapperComponentProps {
	children: React.ReactNode;
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({ children }) => {
	return (
		<React.Fragment>
			<HeaderProvider
				value={{ shortHeader: "navbar-green", isSignedIn: false }}
			>
				<HeaderContainer />
				{children}
				<FooterContainer />
			</HeaderProvider>
		</React.Fragment>
	);
};

export default WrapperComponent;

/**
 * Wrapper Component wraps the whole application.
 * Contains global header and footer.
 * Uses flexbox layout to ensure footer stays at bottom of viewport.
 */

import React from "react";
import HeaderContainer from "../Header/HeaderContainer";
import FooterContainer from "../Footer/FooterContainer";
import { HeaderProvider } from "../../Store/ContextApi/HeaderContext";
const WrapperComponent = (props) => {
	return (
		<HeaderProvider
			value={{
				themes: { isSignedIn: false, shortHeader: "navbar-green" },
			}}
		>
			<div className="flex flex-col min-h-screen">
				<HeaderContainer />
				<main className="flex-1">{props.children}</main>
				<FooterContainer {...props} />
			</div>
		</HeaderProvider>
	);
};

export default WrapperComponent;

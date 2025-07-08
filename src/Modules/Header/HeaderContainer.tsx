import React, { useContext } from "react";
import HeaderComponent from "./HeaderComponent";
import HeaderDataComponent from "./HeaderDataComponent";
import { HeaderContext } from "../../Store/ContextApi/HeaderContext";
import { useLocation } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";
import "../../Assets/scss/main.scss";

const HeaderContainer: React.FC = () => {
	let location = useLocation();
	const headerContext = useContext(HeaderContext);
	const shortHeader = headerContext.shortHeader;

	return (
		<div>
			{location.pathname === RENDER_URL.REGISTRATION_CONFIRM_URL ||
			location.pathname === RENDER_URL.ADD_FAMILY_URL ||
			location.pathname === RENDER_URL.FRESHTRAK_ABOUT ||
			location.pathname === RENDER_URL.EDIT_FAMILY_URL ||
			location.pathname.includes(RENDER_URL.AGENCY_EVENT_LIST) ||
			location.pathname.includes(
				RENDER_URL.REGISTRATION_EVENT_DETAILS_URL
			) ||
			location.pathname.includes(RENDER_URL.REGISTRATION_FORM_URL) ? (
				<HeaderComponent shortHeader={shortHeader} />
			) : (
				<header className="header">
					<HeaderComponent />
					<HeaderDataComponent />
				</header>
			)}
		</div>
	);
};

export default HeaderContainer;

import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { HeaderContext } from "../../Store/ContextApi/HeaderContext";
import { RENDER_URL } from "../../Utils/Urls";
import HeaderComponent from "./HeaderComponent";
import HeaderDataComponent from "./HeaderDataComponent";
import { HeaderContainerProps } from "./types/header.types";

/**
 * HeaderContainer - Container component that handles page-specific header logic
 *
 * This component determines which header variant to show based on the current route:
 * - Pages that need short header: Registration, family management, about pages
 * - Pages that need full header: Main page, search results, and other content pages
 *
 * @component
 * @param {HeaderContainerProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The appropriate header variant based on current route
 *
 * @example
 * ```tsx
 * <HeaderContainer />
 * ```
 */
const HeaderContainer: React.FC<HeaderContainerProps> = () => {
	const location = useLocation();
	const headerContext = useContext(HeaderContext);
	const shortHeader = headerContext?.themes?.shortHeader || "navbar-green";

	/**
	 * Determines if the current page should use the short header variant
	 * @returns {boolean} True if short header should be used
	 */
	const shouldUseShortHeader = (): boolean => {
		const { pathname } = location;
		return (
			pathname === RENDER_URL.REGISTRATION_CONFIRM_URL ||
			pathname === RENDER_URL.ADD_FAMILY_URL ||
			pathname === RENDER_URL.FRESHTRAK_ABOUT ||
			pathname === RENDER_URL.EDIT_FAMILY_URL ||
			pathname === RENDER_URL.SIGN_IN ||
			pathname.includes(RENDER_URL.AGENCY_EVENT_LIST) ||
			pathname.includes(RENDER_URL.REGISTRATION_EVENT_DETAILS_URL) ||
			pathname.includes(RENDER_URL.REGISTRATION_FORM_URL)
		);
	};

	const useShortHeader = shouldUseShortHeader();

	return (
		<div>
			{useShortHeader ? (
				<HeaderComponent shortHeader={shortHeader} />
			) : (
				<header
					className="bg-[#28ce85] bg-no-repeat bg-center bg-cover h-[300px] sm:h-[400px]"
					style={{
						backgroundImage: `url(${require("../../Assets/img/banner-bg.png")})`,
					}}
				>
					<HeaderComponent />
					<HeaderDataComponent />
				</header>
			)}
		</div>
	);
};

export default HeaderContainer;

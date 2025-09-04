import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { selectZip } from "../../Store/Search/searchSlice";
import localization from "../Localization/LocalizationComponent";
import { HeaderDataComponentProps } from "./types/header.types";

/**
 * HeaderDataComponent - Displays header content based on current page
 *
 * This component shows different content in the header based on the current route:
 * - Main page: Shows main title and subtitle
 * - Search results: Shows search-specific title with zip code
 * - Other pages: Shows main title and subtitle
 *
 * @component
 * @param {HeaderDataComponentProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The header content section with appropriate titles and descriptions
 *
 * @example
 * ```tsx
 * <HeaderDataComponent />
 * ```
 */
const HeaderDataComponent: React.FC<HeaderDataComponentProps> = () => {
	const location = useLocation();
	const zip = useSelector(selectZip);

	/**
	 * Determines the current path type for content display
	 * @param {string} pathname - Current route pathname
	 * @returns {string} The base path for content determination
	 */
	const getPath = (pathname: string): string => {
		if (!pathname || typeof pathname !== "string") {
			return "";
		}
		// Check if the pathname starts with the events list base path
		const eventsListBasePath = "/events/list";
		if (pathname.startsWith(eventsListBasePath)) {
			return eventsListBasePath;
		}
		return "";
	};

	const currentPath = getPath(location.pathname);
	const isSearchResultsPage = currentPath === "/events/list";
	const isLandingPage = location.pathname === "/";

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
			<div className="flex flex-col items-center justify-center h-full">
				<div className="w-full sm:w-[95%] md:w-[80%] lg:w-[85%] xl:w-[80%] max-w-4xl">
					{isSearchResultsPage ? (
						<h1 className="text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight">
							{localization.resource_zip_code} {zip}
						</h1>
					) : isLandingPage ? (
						<>
							<h1 className="text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight">
								Welcome
							</h1>
							<p
								className="text-center text-white font-varela text-[0.9rem] sm:text-[1.2rem] mt-4"
								data-testid="subtext-on-header"
							>
								Create a username and password to create
								FreshTrak account.
							</p>
						</>
					) : (
						<>
							<h1 className="text-center text-white font-bold text-[1.4rem] sm:text-[2.3rem] md:text-[2.5rem] lg:text-[3.3rem] capitalize leading-tight">
								{localization.home_freshtrack}
							</h1>
							<p
								className="text-center text-secondary font-varela text-[0.9rem] sm:text-[1.2rem] mt-4"
								data-testid="subtext-on-header"
							>
								{localization.home_header_component}
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default HeaderDataComponent;

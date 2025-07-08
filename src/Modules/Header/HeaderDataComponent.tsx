import React from "react";
// import '../../Assets/scss/main.scss';
// import { RENDER_URL } from "../../Utils/Urls";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectZip } from "../../Store/Search/searchSlice";
import localization from "../Localization/LocalizationComponent";

const HeaderDataComponent: React.FC = () => {
	const location = useLocation();
	const zip = useSelector(selectZip);

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

	return (
		<div className="container h-100">
			<div className="header-content h-100 d-flex flex-column align-items-center justify-content-center">
				<div className="banner-content">
					{currentPath !== "/events/list" ? (
						<h1 className="text-center">
							{localization.home_freshtrack}
						</h1>
					) : (
						<h1 className="text-center">
							{localization.resource_zip_code} {zip}
						</h1>
					)}
					{currentPath !== "/events/list" && (
						<p
							className="text-center"
							data-testid="subtext-on-header"
						>
							{localization.home_header_component}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default HeaderDataComponent;

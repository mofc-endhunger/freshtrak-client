import React from "react";
import { useLocation } from "react-router-dom";
import { RENDER_URL } from "../../Utils/Urls";
import AboutFreshTrakComponent from "./AboutFreshTrakComponent";
import WorkingWithFreshTrakComponent from "./WorkingWithFreshTrakComponent";

const StaticPageContainer: React.FC = () => {
	const location = useLocation();
	return (
		<React.Fragment>
			{location.pathname === RENDER_URL.FRESHTRAK_ABOUT ? (
				<AboutFreshTrakComponent />
			) : (
				<WorkingWithFreshTrakComponent />
			)}
		</React.Fragment>
	);
};

export default StaticPageContainer;

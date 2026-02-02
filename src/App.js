import React, { useEffect } from "react";
import AppRoutes from "./Core/Routes";
import { useSelector } from "react-redux";
import { AuthProvider } from "./Modules/Authentication/AuthContext";
import { HouseholdSignUpWrapper } from "./Modules/Households/components/HouseholdSignUpWrapper";
import { StorageService } from "./Utils/StorageService";
import { UpdateNotification } from "./components/shared/UpdateNotification";
import "./amplify-config";

// import "./Assets/scss/main.scss";
// import "./Assets/css/style.css";

const App = () => {
	const language = useSelector((state) => state.language.language);

	// App initialization cleanup - clear expired data on startup
	useEffect(() => {
		// Clear expired data from both localStorage and sessionStorage on app initialization
		StorageService.clearExpiredData("local");
		StorageService.clearExpiredData("session");
	}, []);

	// Page visibility handling - clear expired data when page becomes visible
	useEffect(() => {
		const handleVisibilityChange = () => {
			// Only clean up when page becomes visible (user returns to tab/window)
			if (document.visibilityState === "visible") {
				StorageService.clearExpiredData("local");
				StorageService.clearExpiredData("session");
			}
		};

		// Add event listener for visibility changes
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Cleanup listener on unmount
		return () => {
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange
			);
		};
	}, []);
	return (
		<div className="App">
			<div className="main-wrapper">
				<AuthProvider>
					<HouseholdSignUpWrapper>
						<AppRoutes language={language} />
					</HouseholdSignUpWrapper>
				</AuthProvider>
			</div>
			<UpdateNotification />
		</div>
	);
};

export default App;

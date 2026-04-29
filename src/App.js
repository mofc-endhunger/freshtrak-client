import React, { useEffect } from "react";
import AppRoutes from "./Core/Routes";
import { useSelector } from "react-redux";
import { AuthProvider } from "./Modules/Authentication/AuthContext";
import { HouseholdSignUpWrapper } from "./Modules/Households/components/HouseholdSignUpWrapper";
import { StorageService } from "./Utils/StorageService";
import "./amplify-config";

// import "./Assets/scss/main.scss";
// import "./Assets/css/style.css";

const App = () => {
	const language = useSelector((state) => state.language);

	// App initialization cleanup - clear expired data on startup
	useEffect(() => {
		// Clear expired data from both localStorage and sessionStorage on app initialization
		StorageService.clearExpiredData("local");
		StorageService.clearExpiredData("session");

		// Cross-session guest data guard.
		//
		// sessionStorage is wiped automatically when a tab or browser is closed, but
		// localStorage is not.  If guest data is present in localStorage but the
		// session marker is absent from sessionStorage, the data belongs to a prior
		// browser session (e.g. the user closed the tab before dismissing the
		// "Create Account" popup).  Clear it now so it cannot be picked up as an
		// active guest session by a different person using the same browser.
		if (StorageService.getGuestUser() && !StorageService.hasGuestSessionMarker()) {
			StorageService.removeItem("freshtrak_user_guest");
			StorageService.removeItem("userProfile"); // legacy key
			StorageService.removeItem("guestId");
			StorageService.removeItem("guestType");
			StorageService.clearUserToken();
		}
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
		</div>
	);
};

export default App;

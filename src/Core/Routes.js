//routing files
import React, { lazy, Suspense } from "react";
import { RENDER_URL } from "../Utils/Urls";
import "../Assets/scss/main.scss";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import ScrollContainer from "./ScrollContainer";
const DashBoardContainer = lazy(() =>
	import("../Modules/Dashboard/DashBoardContainer")
);
const EventContainer = lazy(() => import("../Modules/Events/EventContainer"));
const WrapperComponent = lazy(() =>
	import("../Modules/General/WrapperComponent")
);
const FamilyContainer = lazy(() => import("../Modules/Family/FamilyContainer"));
// Out of scope
// const EditFamilyContainer = lazy(() => import('../Modules/Family/EditFamilyContainer'));
// const SignInContainer = lazy(() => import('../Modules/Sign-In/SignInContainer'));

const StaticPageContainer = lazy(() =>
	import("../Modules/StaticPages/StaticPageContainer")
);
const RegistrationContainer = lazy(() =>
	import("../Modules/Registration/RegistrationContainer")
);
// const FamilyContainer = lazy(() => import("../Modules/Family/FamilyContainer"));
// Out of scope
// const EditFamilyContainer = lazy(() => import('../Modules/Family/EditFamilyContainer'));
// const SignInContainer = lazy(() => import('../Modules/Sign-In/SignInContainer'));
const AgencyEventListContainer = lazy(() =>
	import("../Modules/Events/AgencyEventListContainer")
);
const RegistrationEventDetailsContainer = lazy(() =>
	import("../Modules/Registration/RegistrationEventDetailsContainer")
);
const RegistrationConfirmComponent = lazy(() =>
	import("../Modules/Registration/RegistrationConfirmComponent")
);
const HomeContainer = lazy(() => import("../Modules/Home/HomeContainer"));
const QRCodeComponent = lazy(() =>
	import("../Modules/Registration/QRCodeComponent")
);
const PrivacyComponent = lazy(() =>
	import("../Modules/Policies/PrivacyComponent")
);
const TermsComponent = lazy(() => import("../Modules/Policies/TermsComponent"));

const AppRoutes = () => {
	React.useEffect(() => {}, []);

	return (
		<Router basename="/">
			<ScrollContainer />
			<Suspense fallback={<div className="displayNone"> </div>}>
				<WrapperComponent>
					<Routes>
						<Route
							path={RENDER_URL.ROOT_URL}
							element={<DashBoardContainer />}
						/>
						<Route
							path={RENDER_URL.EVENT_LIST_URL}
							element={<EventContainer />}
						/>
						<Route
							path={RENDER_URL.ADD_FAMILY_URL}
							element={<FamilyContainer />}
						/>
						{/* Flag to turn off/on Home Page Container for Loggedin user feature */}
						<Route
							path={RENDER_URL.HOME_URL}
							element={<HomeContainer />}
						/>

						{/* Out of Scope */}
						{/* <Route
              exact path={RENDER_URL.EDIT_FAMILY_URL}
              component={EditFamilyContainer}
            />

            <Route
              exact path={RENDER_URL.SIGN_IN}
              component={SignInContainer}
            /> */}

						{/* Out of Scope - redirection chnaged to Freshtrak Partners*/}
						{/* <Route
              path={RENDER_URL.FRESHTRAK_WORKING}
              component={StaticPageContainer}
            /> */}
						<Route
							path={RENDER_URL.FRESHTRAK_ABOUT}
							element={<StaticPageContainer />}
						/>

						<Route
							path={`${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/:id`}
							element={<RegistrationEventDetailsContainer />}
						/>

						<Route
							path={`${RENDER_URL.REGISTRATION_FORM_URL}/:eventDateId`}
							element={<RegistrationContainer />}
						/>

						<Route
							path={`${RENDER_URL.REGISTRATION_FORM_URL}/:eventDateId/:eventSlotId`}
							element={<RegistrationContainer />}
						/>

						<Route
							path={`${RENDER_URL.REGISTRATION_CONFIRM_URL}`}
							element={<RegistrationConfirmComponent />}
						/>

						<Route
							path={`${RENDER_URL.QRCODE_URL}/:code`}
							element={<QRCodeComponent />}
						/>

						<Route
							path={`${RENDER_URL.PRIVACY}`}
							element={<PrivacyComponent />}
						/>

						<Route
							path={`${RENDER_URL.TERMS}`}
							element={<TermsComponent />}
						/>

						<Route
							path={`${RENDER_URL.AGENCY_EVENT_LIST}/:agencyId`}
							element={<AgencyEventListContainer />}
						/>

						{/* Out of Scope */}
						{/* <Route
              exact path={RENDER_URL.ADD_FAMILY_URL}
              component={FamilyContainer}
            />

            <Route
              exact path={RENDER_URL.EDIT_FAMILY_URL}
              component={EditFamilyContainer}
            />

            <Route
              exact path={RENDER_URL.SIGN_IN}
              component={SignInContainer}
            /> */}

						<Route path="*" element={<Navigate to="/" replace />} />

						{/* Add URLs above this line */}
					</Routes>
				</WrapperComponent>
			</Suspense>
		</Router>
	);
};
export default AppRoutes;

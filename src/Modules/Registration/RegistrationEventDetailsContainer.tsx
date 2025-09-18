import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectEvent } from "../../Store/Events/eventSlice";
import SpinnerComponent from "../General/SpinnerComponent";
import { API_URL, BASE_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import RegistrationTextInfoComponent from "../Registration/RegistrationTextInfoComponent";
import AuthenticationModalComponent from "../Authentication/AuthenticationModal";
import { EventFormat } from "../../Utils/EventHandler";
import { Event, EventApiResponse } from "./types/registration.types";

interface RegistrationEventDetailsContainerProps {
	// Add specific props as needed
}

const RegistrationEventDetailsContainer: React.FC<
	RegistrationEventDetailsContainerProps
> = props => {
	const navigate = useNavigate();

	const { id: eventDateId } = useParams();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [showAuthenticationModal, setshowAuthenticationModal] =
		useState<boolean>(false);
	// const [ setUserToken] = useState(undefined);
	const [isSuccessful, setSuccessful] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [pageError, setPageError] = useState<boolean>(false);

	const event = useSelector(selectEvent) as Event;
	const [selectedEvent, setSelectedEvent] = useState<Event>(event);

	useEffect(() => {
		if (Object.keys(selectedEvent).length === 0 && !isError && !pageError) {
			getEvent();
		}
	});

	// Check authentication on component mount and hide modal if user is authenticated
	useEffect(() => {
		const cognitoUser = localStorage.getItem("cognitoUser");
		const localUserToken = localStorage.getItem("userToken");
		const guestId = localStorage.getItem("guestId");
		const userProfile = localStorage.getItem("userProfile");

		// Parse cognitoUser to check isSignedIn property
		let isCognitoSignedIn = false;
		if (cognitoUser) {
			try {
				const cognitoUserData = JSON.parse(cognitoUser);
				isCognitoSignedIn = cognitoUserData.isSignedIn === true;
			} catch (error) {
				console.warn("Could not parse cognitoUser:", error);
			}
		}

		const isUserAuthenticated =
			(cognitoUser && isCognitoSignedIn) ||
			(localUserToken && guestId && userProfile);

		// If user is authenticated, hide the auth modal
		if (isUserAuthenticated) {
			setshowAuthenticationModal(false);
		}
	}, [showAuthenticationModal]);

	const getEvent = async (): Promise<void> => {
		try {
			const resp = await axios.get<EventApiResponse>(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`
			);
			const { data } = resp;
			if (data?.event !== undefined) {
				setSelectedEvent(EventFormat(data.event, eventDateId));
				setLoading(false);
				setSuccessful(true);
			} else {
				setPageError(true);
			}
		} catch (e: unknown) {
			console.error(e);
			setIsError(true);
		}
	};

	useEffect(() => {
		const cognitoUser = localStorage.getItem("cognitoUser");
		const isLoggedIn = localStorage.getItem("isLoggedIn");
		if (cognitoUser && isLoggedIn === "true") {
			setshowAuthenticationModal(false);
		}
	}, [showAuthenticationModal]);

	const fetchUserToken = async (): Promise<void> => {
		setLoading(true);
		const { GUEST_AUTH, GUEST_USER } = API_URL;
		try {
			// Clear Cognito authentication data when logging in as guest
			localStorage.removeItem("cognitoUser");
			localStorage.removeItem("isLoggedIn");

			// Get guest authentication
			const resp = await axios.post(GUEST_AUTH);
			const { guestId, token, type } = resp.data;

			// Store guest authentication data
			localStorage.setItem("userToken", token);
			localStorage.setItem("guestId", guestId);
			localStorage.setItem("guestType", type);
			localStorage.setItem("isLoggedIn", "true");

			// Fetch user profile
			const userResp = await axios.get(GUEST_USER, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const { id, role } = userResp.data;

			// Store user profile with new structure
			const userProfile = {
				id,
				role,
				guestId,
				type,
			};
			localStorage.setItem("userProfile", JSON.stringify(userProfile));

			setLoading(false);
			setshowAuthenticationModal(false);
			if (selectedEvent && selectedEvent.id) {
				navigate(
					`${RENDER_URL.REGISTRATION_FORM_URL}/${selectedEvent.id}`
				);
			} else {
				setPageError(true);
			}
		} catch (e: unknown) {
			console.error(e);
			setshowAuthenticationModal(false);
			setLoading(false);
		}
	};

	const getUserToken = (): void => {
		// Check if user is authenticated with Cognito
		const cognitoUser = localStorage.getItem("cognitoUser");

		// Check if user is authenticated as guest
		const localUserToken = localStorage.getItem("userToken");
		const guestId = localStorage.getItem("guestId");
		const userProfile = localStorage.getItem("userProfile");

		// Parse cognitoUser to check isSignedIn property
		let isCognitoSignedIn = false;
		if (cognitoUser) {
			try {
				const cognitoUserData = JSON.parse(cognitoUser);
				isCognitoSignedIn = cognitoUserData.isSignedIn === true;
			} catch (error) {
				console.warn("Could not parse cognitoUser:", error);
			}
		}

		// If user is authenticated with either Cognito or guest, proceed to registration
		if (
			(cognitoUser && isCognitoSignedIn) ||
			(localUserToken && guestId && userProfile)
		) {
			setshowAuthenticationModal(false);

			// Navigate to registration form
			if (selectedEvent && selectedEvent.id) {
				navigate(
					`${RENDER_URL.REGISTRATION_FORM_URL}/${selectedEvent.id}`
				);
			} else {
				setPageError(true);
			}
			return;
		}

		// If no authentication found, show authentication modal
		showAuthenticationModal
			? fetchUserToken()
			: setshowAuthenticationModal(true);
	};

	// Check if user is authenticated to determine if auth modal should show
	const cognitoUser = localStorage.getItem("cognitoUser");
	const localUserToken = localStorage.getItem("userToken");
	const guestId = localStorage.getItem("guestId");
	const userProfile = localStorage.getItem("userProfile");

	// Parse cognitoUser to check isSignedIn property
	let isCognitoSignedIn = false;
	if (cognitoUser) {
		try {
			const cognitoUserData = JSON.parse(cognitoUser);
			isCognitoSignedIn = cognitoUserData.isSignedIn === true;
		} catch (error) {
			console.warn("Could not parse cognitoUser:", error);
		}
	}

	const isUserAuthenticated =
		(cognitoUser && isCognitoSignedIn) ||
		(localUserToken && guestId && userProfile);

	return (
		<Fragment>
			{isLoading && <SpinnerComponent />}

			{/* Only show auth modal if user is not authenticated AND modal should show */}
			{!isUserAuthenticated && showAuthenticationModal && (
				<AuthenticationModalComponent
					show={showAuthenticationModal}
					setshow={setshowAuthenticationModal}
					onLogin={fetchUserToken}
				/>
			)}

			{!isLoading && isSuccessful && (
				<div className="mt-4">
					<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 register-confirmation">
						<RegistrationTextInfoComponent
							event={selectedEvent}
							onRegisterNow={getUserToken}
						/>
					</section>
				</div>
			)}
		</Fragment>
	);
};
export default RegistrationEventDetailsContainer;

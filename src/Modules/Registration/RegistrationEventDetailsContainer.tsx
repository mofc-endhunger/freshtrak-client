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
import { StorageService } from "../../Utils/StorageService";

interface RegistrationEventDetailsContainerProps {
	// Add specific props as needed
}

const RegistrationEventDetailsContainer: React.FC<
	RegistrationEventDetailsContainerProps
> = (props) => {
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

	// Consolidated authentication check function using StorageService
	const isUserAuthenticated = (): boolean => {
		// Check if user has Cognito authentication (validated token)
		if (StorageService.isLoggedInUser()) {
			return true;
		}

		// Check if user has guest authentication (validated token)
		if (StorageService.isGuestUser()) {
			return true;
		}

		return false;
	};

	useEffect(() => {
		// Store the referrer URL if it's a search results page (backup for navigation)
		if (typeof window !== "undefined" && document.referrer) {
			try {
				const referrerUrl = new URL(document.referrer);
				if (referrerUrl.pathname.startsWith("/events/list")) {
					sessionStorage.setItem(
						"searchResultsUrl",
						referrerUrl.pathname + referrerUrl.search
					);
				}
			} catch (e) {
				// Ignore URL parsing errors
			}
		}
		if (Object.keys(selectedEvent).length === 0 && !isError && !pageError) {
			getEvent();
		}
	});

	// Check authentication on component mount and when authentication state might change
	useEffect(() => {
		if (isUserAuthenticated()) {
			setshowAuthenticationModal(false);
		} else {
			// If not authenticated, modal state should be controlled by getUserToken
			// Don't automatically show modal here - let getUserToken handle it
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const fetchUserToken = async (): Promise<void> => {
		setLoading(true);
		try {
			const { GUEST_USER } = API_URL;

			// Clear Cognito authentication data when logging in as guest
			StorageService.clearAuthData("cognito");

			// Get guest authentication
			const resp = await axios.post(GUEST_USER);
			const userProfile = resp.data;
			// Use StorageService to store guest user profile
			StorageService.setItem("freshtrak_user_guest", userProfile);

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
		// If user is authenticated, proceed to registration
		if (isUserAuthenticated()) {
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

		// Store event date ID in session storage for household setup flow
		// This allows HouseholdSignUpWrapper to detect registration flow after email confirmation
		if (selectedEvent && selectedEvent.id) {
			StorageService.setRegisteredEventDateID(selectedEvent.id);
		}

		// If no authentication found, show authentication modal
		showAuthenticationModal
			? fetchUserToken()
			: setshowAuthenticationModal(true);
	};

	return (
		<Fragment>
			{isLoading && <SpinnerComponent />}

			{/* Only show auth modal if user is not authenticated AND modal should show */}
			{!isUserAuthenticated() && showAuthenticationModal && (
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

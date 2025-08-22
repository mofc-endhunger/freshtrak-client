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
		const { GUEST_AUTH, GUEST_USER } = API_URL;
		try {
			let token, expires_at;
			const resp = await axios.post(GUEST_AUTH);
			token = resp.data.token;
			expires_at = resp.data.expires_at;
			localStorage.setItem("userToken", token);
			localStorage.setItem("tokenExpiresAt", expires_at);

			// Fetch user profile
			const userResp = await axios.get(GUEST_USER, {
				headers: { Authorization: `Bearer ${token}` },
			});
			localStorage.setItem("userProfile", JSON.stringify(userResp.data));

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
		const localUserToken = localStorage.getItem("userToken");
		const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");

		if (
			!tokenExpiresAt ||
			new Date(tokenExpiresAt) < new Date() ||
			!localUserToken ||
			localUserToken === "undefined"
		) {
			showAuthenticationModal
				? fetchUserToken()
				: setshowAuthenticationModal(true);
		} else {
			setshowAuthenticationModal(false);
			if (selectedEvent && selectedEvent.id) {
				navigate(
					`${RENDER_URL.REGISTRATION_FORM_URL}/${selectedEvent.id}`
				);
			} else {
				setPageError(true);
			}
		}
	};

	return (
		<Fragment>
			{isLoading && <SpinnerComponent />}
			<AuthenticationModalComponent
				show={showAuthenticationModal}
				setshow={setshowAuthenticationModal}
				onLogin={getUserToken}
			/>
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

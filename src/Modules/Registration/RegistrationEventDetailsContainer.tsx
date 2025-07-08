import React, { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectEvent, setCurrentEvent } from "../../Store/Events/eventSlice";
import SpinnerComponent from "../General/SpinnerComponent";
import { API_URL, BASE_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import RegistrationTextInfoComponent from "../Registration/RegistrationTextInfoComponent";
import AuthenticationModalComponent from "../Authentication/AuthenticationModal";
import { EventFormat } from "../../Utils/EventHandler";
import TagManager from "react-gtm-module";

interface Event {
	id: string;
	agencyName: string;
	date: string;
	startTime: string;
	endTime: string;
	// Add other event properties as needed
}

interface AuthenticationResponse {
	authentication: {
		token: string;
		expires_at: string;
	};
}

interface GuestAuthResponse {
	token: string;
	expires_at: string;
}

interface RegistrationEventDetailsContainerProps {
	// Add props if needed
}

const RegistrationEventDetailsContainer: React.FC<
	RegistrationEventDetailsContainerProps
> = props => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { id: eventDateId } = useParams<{ id: string }>();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [showAuthenticationModal, setshowAuthenticationModal] =
		useState<boolean>(false);
	const [isSuccessful, setSuccessful] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [pageError, setPageError] = useState<boolean>(false);

	const event = useSelector(selectEvent);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(
		event as any
	);
	const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

	useEffect(() => {
		if (
			Object.keys(selectedEvent || {}).length === 0 &&
			!isError &&
			!pageError
		) {
			getEvent();
		}
	});

	const getEvent = async (): Promise<void> => {
		try {
			const resp = await axios.get(
				`${BASE_URL}api/event_dates/${eventDateId}/event_details`
			);
			const { data } = resp as any;
			if (data && data.event !== undefined) {
				const eventData = EventFormat(data.event, eventDateId || "");
				dispatch(setCurrentEvent(eventData));
				setSelectedEvent(eventData as any);
			} else {
				setPageError(true);
			}
		} catch (e) {
			console.error(e);
			setIsError(true);
			if ((e as any).response) {
				setPageError(true);
			}
		}
	};

	const fetchUserToken = async (response?: any): Promise<void> => {
		setLoading(true);
		const { GUEST_AUTH, FB_AUTH } = API_URL;
		try {
			if (response) {
				const resp = await axios({
					method: "post",
					url: FB_AUTH,
					data: JSON.stringify(response),
					headers: { "Content-Type": "application/json" },
				});
				const {
					data: { authentication },
				}: { data: AuthenticationResponse } = resp;
				TagManager.dataLayer({
					dataLayer: { event: "returning-customer-login" },
				});
				localStorage.setItem("userToken", authentication.token);
				localStorage.setItem(
					"tokenExpiresAt",
					authentication.expires_at
				);
			} else {
				const resp = await axios.post(GUEST_AUTH);
				const {
					data: { token, expires_at },
				}: { data: GuestAuthResponse } = resp;
				localStorage.setItem("userToken", token);
				localStorage.setItem("tokenExpiresAt", expires_at);
			}
			navigate(
				`${RENDER_URL.REGISTRATION_FORM_URL}/${selectedEvent?.id}`
			);
		} catch (e) {
			console.error(e);
			setshowAuthenticationModal(false);
			setLoading(false);
		}
	};

	const getUserToken = (response?: any): void => {
		const localUserToken = localStorage.getItem("userToken");
		const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");

		if (
			new Date(tokenExpiresAt || "") < new Date() ||
			!localUserToken ||
			localUserToken === "undefined"
		) {
			showAuthenticationModal
				? fetchUserToken(response)
				: setshowAuthenticationModal(true);
		} else {
			setshowAuthenticationModal(false);
			navigate(
				`${RENDER_URL.REGISTRATION_FORM_URL}/${selectedEvent?.id}`
			);
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
					<section className="container pt-100 pb-100 register-confirmation">
						{selectedEvent && (
							<RegistrationTextInfoComponent
								event={selectedEvent as any}
								onRegisterNow={getUserToken}
							/>
						)}
					</section>
				</div>
			)}
		</Fragment>
	);
};

export default RegistrationEventDetailsContainer;

import React, { useEffect, useState, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import alarmIcon from "../../Assets/img/alarm.svg";
import LoadingSpinner from "../General/LoadingSpinner";

const EventSlotsModalComponent = props => {
	const {
		event: { id: eventDateId, acceptReservations },
		targetUrl,
		selectedSlotId,
		onSlotChange,
	} = props;
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [eventHour, setEventHour] = useState([]);
	const [show, setShow] = useState(false);
	const [eventDate, setEventDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const backHome = () => {
		navigate(-1);
	};

	const findEventSlot = event_slot_id => {
		let found = {};

		const event_slots = eventHour.reduce((acc, element, ind, arr) => {
			acc.push(...element.event_slots);
			return acc;
		}, []);

		found = event_slots.find(event_slot => {
			return parseInt(event_slot_id) === event_slot.event_slot_id;
		});

		return found;
	};

	useEffect(() => {
		if (acceptReservations === 1) {
			handleShow();
			getEventHours(eventDateId);
		}
	}, [eventDateId, acceptReservations]);

	const getEventHours = async eventDateId => {
		setIsLoading(true);
		try {
			const { EVENT_DATES_URL } = API_URL;
			const resp = await axios.get(
				EVENT_DATES_URL + "/" + eventDateId + "/event_hours"
			);
			const { data } = resp;
			if (
				data &&
				data.event_date &&
				data.event_date.event_hours !== undefined
			) {
				setEventHour(data.event_date.event_hours);
				setEventDate(data.event_date.date);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<Fragment>
			<Modal show={show} onHide={handleClose} backdrop="static">
				<Modal.Header>
					<Modal.Title>
						<span className="pr-3">
							<img
								aria-hidden="true"
								alt="Go back"
								src={alarmIcon}
							/>
						</span>
						Choose Time Slot
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container">
						{isLoading ? (
							<div className="d-flex justify-content-center py-4">
								<LoadingSpinner size="medium" />
							</div>
						) : (
							eventHour.map((item, index) =>
								item.event_slots
									.filter((e, i) => e.open_slots > 0)
									.map((e, i) => {
										const radioId = `time_slot_${e.event_slot_id}`;
										return (
											<div
												className="form-check p-2"
												key={index + "-" + i}
											>
												<input
													className="form-check-input"
													type="radio"
													name="time_slot"
													id={radioId}
													value={e.event_slot_id}
													checked={
														String(
															selectedSlotId
														) ===
														String(e.event_slot_id)
													}
													onChange={onSlotChange}
												/>
												<label
													className="form-check-label pl-2"
													htmlFor={radioId}
												>
													{e.start_time} -{" "}
													{e.end_time}
												</label>
											</div>
										);
									})
							)
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<button
						type="button"
						className="btn default-button"
						onClick={backHome}
					>
						Go Back
					</button>
					<LinkContainer
						to={{
							pathname: `${
								targetUrl || RENDER_URL.REGISTRATION_FORM_URL
							}/${eventDateId}/${selectedSlotId}`,
							state: {
								event_slot: findEventSlot(selectedSlotId),
								event_date: eventDate,
							},
						}}
					>
						<button
							type="submit"
							disabled={!selectedSlotId}
							className="btn primary-button ml-1 flex-grow-1"
							onClick={handleClose}
						>
							Save and Continue
						</button>
					</LinkContainer>
				</Modal.Footer>
			</Modal>
		</Fragment>
	);
};
export default EventSlotsModalComponent;

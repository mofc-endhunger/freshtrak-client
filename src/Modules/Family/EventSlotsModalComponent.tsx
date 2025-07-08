import React, { useEffect, useState, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import alarmIcon from "../../Assets/img/alarm.svg";

interface FormData {
	time_slot?: string;
	[key: string]: any;
}

interface EventSlot {
	event_slot_id: number;
	start_time: string;
	end_time: string;
	open_slots: number;
}

interface EventHour {
	event_slots: EventSlot[];
}

interface EventData {
	id: number;
	acceptReservations: number;
}

interface EventSlotsModalComponentProps {
	event: EventData;
	targetUrl?: string;
}

const EventSlotsModalComponent: React.FC<
	EventSlotsModalComponentProps
> = props => {
	const {
		event: { id: eventDateId, acceptReservations },
		targetUrl,
	} = props;

	const handleClose = (): void => setShow(false);
	const handleShow = (): void => setShow(true);
	const [eventHour, setEventHour] = useState<EventHour[]>([]);
	const [show, setShow] = useState<boolean>(false);
	const [eventDate, setEventDate] = useState<string>("");
	const { register, watch } = useForm<FormData>();
	const event_slot_id = watch("time_slot");
	const navigate = useNavigate();

	const backHome = (): void => {
		navigate(-1);
	};

	const findEventSlot = (event_slot_id: string): EventSlot | undefined => {
		let found: EventSlot | undefined;

		const event_slots = eventHour.reduce(
			(acc: EventSlot[], element: EventHour) => {
				acc.push(...element.event_slots);
				return acc;
			},
			[]
		);

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

	const getEventHours = async (eventDateId: number): Promise<void> => {
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
						{eventHour.map((item, index) =>
							item.event_slots
								.filter((e, i) => e.open_slots > 0)
								.map((e, i) => {
									return (
										<div
											className="form-check p-2"
											key={index + "-" + i}
										>
											<input
												className="form-check-input"
												type="radio"
												value={e.event_slot_id.toString()}
												{...register("time_slot")}
											/>
											<label className="form-check-label pl-2">
												{e.start_time} - {e.end_time}
											</label>
										</div>
									);
								})
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
						to={`${
							targetUrl || RENDER_URL.REGISTRATION_FORM_URL
						}/${eventDateId}/${event_slot_id}`}
						state={{
							event_slot: findEventSlot(event_slot_id || ""),
							event_date: eventDate,
						}}
					>
						<button
							type="submit"
							disabled={!event_slot_id}
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

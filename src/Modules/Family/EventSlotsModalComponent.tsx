import React, { useEffect, useState, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import alarmIcon from "../../Assets/img/alarm.svg";
import LoadingSpinner from "../General/LoadingSpinner";

import { Event } from "./types/family.types";

export interface EventSlotsModalProps {
	event: Event;
	targetUrl?: string;
	selectedSlotId?: string;
	onSlotChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
}

// Type for navigation state
interface NavigationState {
	pathname: string;
	state: {
		event_slot: EventSlot | undefined;
		event_date: string;
	};
}

interface EventSlot {
	event_slot_id: string;
	start_time: string;
	end_time: string;
	open_slots: number;
}

interface EventHour {
	event_slots: EventSlot[];
}

const EventSlotsModalComponent: React.FC<EventSlotsModalProps> = ({
	event: { id: eventDateId, acceptReservations },
	targetUrl,
	selectedSlotId,
	onSlotChange,
}) => {
	const [eventHour, setEventHour] = useState<EventHour[]>([]);
	const [show, setShow] = useState(false);
	const [eventDate, setEventDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const backHome = () => {
		navigate(-1);
	};

	const findEventSlot = (event_slot_id: string) => {
		const event_slots = eventHour.reduce((acc, element) => {
			acc.push(...element.event_slots);
			return acc;
		}, [] as EventSlot[]);

		return event_slots.find(event_slot => {
			return (
				parseInt(event_slot_id) === parseInt(event_slot.event_slot_id)
			);
		});
	};

	useEffect(() => {
		if (acceptReservations === 1 && eventDateId) {
			handleShow();
			getEventHours(eventDateId);
		}
	}, [eventDateId, acceptReservations]);

	const getEventHours = async (eventDateId: string) => {
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
			// Error handling for event slot selection
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Fragment>
			<Dialog open={show} onOpenChange={setShow}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<span className="pr-3">
								<img
									aria-hidden="true"
									alt="Go back"
									src={alarmIcon}
									className="w-6 h-6"
								/>
							</span>
							Choose Time Slot
						</DialogTitle>
					</DialogHeader>
					<div className="container py-4">
						{isLoading ? (
							<div className="flex justify-center py-4">
								<LoadingSpinner size="medium" />
							</div>
						) : (
							eventHour.map((item, index) =>
								item.event_slots
									.filter(e => e.open_slots > 0)
									.map((e, i) => {
										const radioId = `time_slot_${e.event_slot_id}`;
										return (
											<div
												className="flex items-center p-2 space-x-2"
												key={index + "-" + i}
											>
												<input
													className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
													className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
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
					<DialogFooter className="flex flex-col sm:flex-row gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={backHome}
							className="w-full sm:w-auto"
						>
							Go Back
						</Button>
						<LinkContainer
							to={{
								pathname: `${
									targetUrl ||
									RENDER_URL.REGISTRATION_FORM_URL
								}/${eventDateId}/${selectedSlotId}`,
								state: {
									event_slot: findEventSlot(
										selectedSlotId || ""
									),
									event_date: eventDate,
								},
							}}
						>
							<Button
								type="submit"
								disabled={!selectedSlotId}
								className="w-full sm:w-auto flex-1"
								onClick={handleClose}
							>
								Save and Continue
							</Button>
						</LinkContainer>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Fragment>
	);
};

export default EventSlotsModalComponent;

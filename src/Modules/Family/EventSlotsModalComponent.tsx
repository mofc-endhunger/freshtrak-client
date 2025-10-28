import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogFooter,
	DialogHeader,
} from "../../components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "../../components/ui/button";
import { API_URL, RENDER_URL } from "../../Utils/Urls";
import axios from "axios";
import alarmIcon from "../../Assets/img/alarm.svg";
import LoadingSpinner from "../General/LoadingSpinner";
import HouseholdConfirmationModal from "../Registration/components/HouseholdConfirmationModal";
import { HouseholdRegistrationService } from "../../Services/HouseholdRegistrationService";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { UsersMeResponse } from "../Households/types/api.types";
import { useAuth } from "../Authentication/AuthContext";

import { Event } from "./types/family.types";

// Transform household data to user data format expected by confirmation page
const transformHouseholdDataToUserData = (
	householdData: UsersMeResponse | null
) => {
	if (!householdData) {
		return {
			first_name: "",
			last_name: "",
			identification_code: "",
			address_line_1: "",
			address_line_2: "",
			city: "",
			state: "",
			zip_code: "",
			phone: "",
		};
	}

	// Extract head of household from members array
	const headOfHousehold =
		householdData.members?.find(
			member => member.is_head_of_household === 1
		) || householdData.members?.[0];

	// Parse household name to get first and last name
	const nameParts = householdData.name?.split(" ") || [];
	const first_name = headOfHousehold?.first_name || nameParts[0] || "";
	const last_name =
		headOfHousehold?.last_name || nameParts.slice(1).join(" ") || "";

	return {
		first_name,
		last_name,
		identification_code: householdData.identification_code || "",
		address_line_1: householdData.address_line_1 || "",
		address_line_2: householdData.address_line_2 || "",
		city: householdData.city || "",
		state: householdData.state || "",
		zip_code: householdData.zip_code || "",
		phone: householdData.phone || "",
	};
};

export interface EventSlotsModalProps {
	event: Event;
	targetUrl?: string;
	selectedSlotId?: string;
	onSlotChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
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
	event,
	targetUrl,
	selectedSlotId,
	onSlotChange,
}) => {
	const { id: eventDateId, acceptReservations } = event;
	const [eventHour, setEventHour] = useState<EventHour[]>([]);
	const [show, setShow] = useState(false);
	const [eventDate, setEventDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	// Household confirmation modal state
	const [showHouseholdModal, setShowHouseholdModal] = useState(false);
	const [householdData, setHouseholdData] = useState<UsersMeResponse | null>(
		null
	);
	const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
	const [householdError, setHouseholdError] = useState<string | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<EventSlot | null>(null);

	// Services
	const householdRegistrationService = new HouseholdRegistrationService();
	const householdsApiService = new HouseholdsApiService();

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

	// Fetch household data and show confirmation modal
	const handleSlotSelection = async (slotId: string) => {
		const slot = findEventSlot(slotId);
		if (!slot) return;

		setSelectedSlot(slot);
		setIsLoadingHousehold(true);
		setHouseholdError(null);

		// If user is not authenticated (guest user), skip household data fetch
		if (!isAuthenticated) {
			// Proceed directly to registration form for guest users
			navigateToRegistration(slot, null);
			setIsLoadingHousehold(false);
			return;
		}

		try {
			// Fetch household data only for authenticated users
			const household = await householdsApiService.getUsersMe();
			setHouseholdData(household);

			// Check if household data is complete enough for direct registration
			const isComplete =
				householdRegistrationService.checkHouseholdCompleteness(
					household
				);

			if (isComplete) {
				// Show confirmation modal
				setShowHouseholdModal(true);
			} else {
				// Proceed directly to registration form with prefilled data
				navigateToRegistration(slot, household);
			}
		} catch (error) {
			console.error("Failed to fetch household data:", error);
			setHouseholdError(
				"Failed to load household information. Please try again."
			);
			// Proceed to registration form without prefilled data
			navigateToRegistration(slot, null);
		} finally {
			setIsLoadingHousehold(false);
		}
	};

	// Navigate to registration form
	const navigateToRegistration = (
		slot: EventSlot,
		householdData: UsersMeResponse | null
	) => {
		navigate(
			`${targetUrl || RENDER_URL.REGISTRATION_FORM_URL}/${eventDateId}/${
				slot.event_slot_id
			}`,
			{
				state: {
					event_slot: slot,
					event_date: eventDate,
					householdData: householdData, // Pass household data for prefilling
				},
			}
		);
		setShow(false);
	};

	// Household confirmation modal handlers
	const handleHouseholdConfirm = async () => {
		if (!selectedSlot) return;

		setIsLoadingHousehold(true);
		setHouseholdError(null);

		try {
			// Register directly with household data
			const result =
				await householdRegistrationService.registerWithHousehold({
					eventId: event?.eventId || "",
					eventDateId: eventDateId || "",
					eventSlotId: selectedSlot.event_slot_id,
				});

			if (result.success) {
				// Registration successful - navigate to confirmation page
				navigate(`${RENDER_URL.REGISTRATION_CONFIRM_URL}`, {
					state: {
						event_slot: selectedSlot,
						event_date: eventDate,
						registrationMethod: "household",
						user: transformHouseholdDataToUserData(householdData),
					},
				});
				setShowHouseholdModal(false);
				setShow(false);
			} else {
				// Registration failed - show error
				console.error("Household registration failed:", result.error);
				setHouseholdError(result.error || "Registration failed");
			}
		} catch (error) {
			console.error("Household registration error:", error);
			setHouseholdError(
				"An unexpected error occurred during registration"
			);
		} finally {
			setIsLoadingHousehold(false);
		}
	};

	const handleHouseholdReview = () => {
		if (!selectedSlot) return;
		navigateToRegistration(selectedSlot, householdData);
		setShowHouseholdModal(false);
	};

	const handleHouseholdModalClose = () => {
		setShowHouseholdModal(false);
		setHouseholdError(null);
	};

	const handleBackHome = () => {
		navigate(RENDER_URL.ROOT_URL);
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
				<VisuallyHidden>
					<DialogTitle>Choose Time Slot</DialogTitle>
					<DialogDescription>
						Select an available time slot for your registration.
					</DialogDescription>
				</VisuallyHidden>
				<DialogContent className="sm:max-w-md bg-highlight border-none text-white">
					<DialogHeader>
						<DialogTitle
							id="timeslot-modal-title"
							className="flex items-center py-2 border-b border-white"
						>
							<span className="pr-3">
								<img
									aria-hidden="true"
									alt=""
									src={alarmIcon}
									className="w-6 h-6"
								/>
							</span>
							Choose Time Slot
						</DialogTitle>
						<DialogDescription id="timeslot-modal-description">
							Select an available time slot for your registration.
						</DialogDescription>
					</DialogHeader>
					<div className="container py-4">
						{isLoading ? (
							<div
								className="flex justify-center py-4"
								role="status"
								aria-label="Loading time slots"
							>
								<LoadingSpinner size="medium" />
							</div>
						) : (
							<fieldset
								role="radiogroup"
								aria-labelledby="timeslot-modal-title"
							>
								<legend className="sr-only">
									Available time slots for registration
								</legend>
								{eventHour.map((item, index) =>
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
															String(
																e.event_slot_id
															)
														}
														onChange={onSlotChange}
														aria-describedby={`${radioId}-description`}
													/>
													<label
														className="ml-2 text-sm font-medium cursor-pointer"
														htmlFor={radioId}
													>
														{e.start_time} -{" "}
														{e.end_time}
													</label>
													<span
														id={`${radioId}-description`}
														className="sr-only"
													>
														{e.open_slots} slot
														{e.open_slots !== 1
															? "s"
															: ""}{" "}
														available
													</span>
												</div>
											);
										})
								)}
							</fieldset>
						)}
					</div>
					<DialogFooter className="flex flex-col sm:flex-row gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={backHome}
							className="w-full sm:w-auto bg-white text-highlight min-h-12 uppercase"
							aria-describedby="back-button-description"
						>
							Go Back
						</Button>
						<Button
							type="submit"
							disabled={!selectedSlotId || isLoadingHousehold}
							className="w-full sm:w-auto flex-1 bg-primary text-white min-h-12 uppercase"
							onClick={() =>
								selectedSlotId &&
								handleSlotSelection(selectedSlotId)
							}
							aria-describedby="continue-button-description"
						>
							{isLoadingHousehold
								? "Loading..."
								: "Save and Continue"}
						</Button>
					</DialogFooter>

					{/* Hidden descriptions for screen readers */}
					<div id="back-button-description" className="sr-only">
						Return to the previous page without selecting a time
						slot.
					</div>
					<div id="continue-button-description" className="sr-only">
						Proceed with registration using the selected time slot.
					</div>
				</DialogContent>
			</Dialog>

			{/* Household Confirmation Modal */}
			<HouseholdConfirmationModal
				isOpen={showHouseholdModal}
				onClose={handleHouseholdModalClose}
				onBackHome={handleBackHome}
				onConfirm={handleHouseholdConfirm}
				onReview={handleHouseholdReview}
				householdData={householdData}
				isLoading={isLoadingHousehold}
				selectedSlot={selectedSlot}
				error={householdError || undefined}
			/>
		</Fragment>
	);
};

export default EventSlotsModalComponent;

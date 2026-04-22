import React, { useEffect, useRef, useState, Fragment } from "react";
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
import { StorageService } from "../../Utils/StorageService";
import { getAdditionalMemberCounts } from "../Households/utils/householdUtils";

import { Event } from "./types/family.types";
import localization from "../Localization/LocalizationComponent";

// Transform household data to user data format expected by confirmation page
const transformHouseholdDataToUserData = (
	householdData: UsersMeResponse | null,
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
			(member) => member.is_head_of_household === 1,
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
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
		null,
	);
	const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
	const [householdError, setHouseholdError] = useState<string | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<EventSlot | null>(null);
	const isMountedRef = useRef(true);

	const safeSetState = (callback: () => void) => {
		if (isMountedRef.current) {
			callback();
		}
	};

	// Services
	const householdRegistrationService = new HouseholdRegistrationService();
	const householdsApiService = new HouseholdsApiService();

	const handleShow = () => setShow(true);

	const backHome = () => {
		setShow(false);
		navigate(-1);
	};

	const findEventSlot = (event_slot_id: string) => {
		const event_slots = eventHour.reduce((acc, element) => {
			acc.push(...element.event_slots);
			return acc;
		}, [] as EventSlot[]);

		return event_slots.find((event_slot) => {
			return (
				parseInt(event_slot_id) === parseInt(event_slot.event_slot_id)
			);
		});
	};

	// Fetch household data and show confirmation modal
	const handleSlotSelection = async (slotId: string) => {
		const slot = findEventSlot(slotId);
		if (!slot) return;

		safeSetState(() => {
			setSelectedSlot(slot);
			setIsLoadingHousehold(true);
			setHouseholdError(null);
		});

		// If user is not authenticated (guest user), skip household data fetch
		if (!isAuthenticated) {
			navigateToRegistration(slot, null);
			safeSetState(() => setIsLoadingHousehold(false));
			return;
		}

		// Case managers register on behalf of others; never prefill or confirm their own household
		if (StorageService.isCaseManager()) {
			navigateToRegistration(slot, null);
			safeSetState(() => setIsLoadingHousehold(false));
			return;
		}

		try {
			// Fetch household data only for authenticated users
			const household = await householdsApiService.getUsersMe();
			safeSetState(() => setHouseholdData(household));

			// Check if user has completed household setup by verifying DOB is not placeholder
			// When household is auto-created on signup, DOB defaults to "1900-01-01"
			const headOfHousehold = household?.members?.find(
				(member) => member.is_head_of_household === 1,
			);
			const hasCompletedSetup = Boolean(
				headOfHousehold?.date_of_birth &&
				headOfHousehold.date_of_birth !== "1900-01-01",
			);

			if (hasCompletedSetup) {
				// Show confirmation modal for users who completed household setup
				safeSetState(() => setShowHouseholdModal(true));
			} else {
				// Proceed directly to registration form with prefilled data
				navigateToRegistration(slot, household);
			}
		} catch (error) {
			safeSetState(() =>
				setHouseholdError(localization.error_failed_load_household),
			);
			// Proceed to registration form without prefilled data
			navigateToRegistration(slot, null);
		} finally {
			safeSetState(() => setIsLoadingHousehold(false));
		}
	};

	// Navigate to registration form
	const navigateToRegistration = (
		slot: EventSlot,
		householdData: UsersMeResponse | null,
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
			},
		);
		safeSetState(() => setShow(false));
	};

	// Check if error message indicates "already registered"
	const isAlreadyRegisteredError = (
		errorMessage: string | null | undefined,
	): boolean => {
		if (!errorMessage) {
			return false;
		}

		const errorText = errorMessage.toLowerCase();
		const alreadyRegisteredKeywords = [
			"already registered",
			"already exist",
			"user already",
			"duplicate registration",
		];

		return alreadyRegisteredKeywords.some((keyword) =>
			errorText.includes(keyword),
		);
	};

	// Household confirmation modal handlers
	const handleHouseholdConfirm = async () => {
		if (!selectedSlot) return;

		safeSetState(() => {
			setIsLoadingHousehold(true);
			setHouseholdError(null);
		});

		try {
			// Send additional-member counts (HOH excluded) to the reservation endpoint.
			const hohDob =
				householdData?.members?.find(
					(m) => m.is_head_of_household === 1,
				)?.date_of_birth ?? householdData?.members?.[0]?.date_of_birth;

			const counts = householdData?.counts
				? getAdditionalMemberCounts(householdData.counts, hohDob)
				: { seniors: 0, adults: 0, children: 0 };

			const result =
				await householdRegistrationService.registerWithHousehold(
					{
						eventId: event?.eventId || "",
						eventDateId: eventDateId || "",
						eventSlotId: selectedSlot.event_slot_id,
					},
					counts,
				);

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
				safeSetState(() => {
					setShowHouseholdModal(false);
					setShow(false);
				});
			} else {
				// Check for "already registered" error
				const errorMessage =
					result.error || localization.error_registration_failed;
				if (isAlreadyRegisteredError(errorMessage)) {
					// Redirect to already registered page instead of showing error
					safeSetState(() => {
						setShowHouseholdModal(false);
						setShow(false);
					});
					navigate(RENDER_URL.REGISTRATION_ALREADY_REGISTERED_URL, {
						state: {
							eventName: event?.agencyName || event?.name,
						},
					});
					return;
				}

				// Registration failed - show error for other errors
				console.warn("Household registration failed:", result.error);
				safeSetState(() => setHouseholdError(errorMessage));
			}
		} catch (error: any) {
			console.error("Household registration error:", error);

			// Check if the error response indicates "already registered"
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				localization.error_unexpected_registration;
			if (
				isAlreadyRegisteredError(errorMessage) ||
				(error?.response?.data &&
					isAlreadyRegisteredError(
						JSON.stringify(error.response.data),
					))
			) {
				// Redirect to already registered page
				safeSetState(() => {
					setShowHouseholdModal(false);
					setShow(false);
				});
				navigate(RENDER_URL.REGISTRATION_ALREADY_REGISTERED_URL, {
					state: {
						eventName: event?.agencyName || event?.name,
					},
				});
				return;
			}

			safeSetState(() => setHouseholdError(errorMessage));
		} finally {
			safeSetState(() => setIsLoadingHousehold(false));
		}
	};

	const handleHouseholdReview = () => {
		if (!selectedSlot) return;
		navigateToRegistration(selectedSlot, householdData);
		setShowHouseholdModal(false);
	};

	const handleHouseholdModalClose = () => {
		safeSetState(() => {
			setShowHouseholdModal(false);
			setHouseholdError(null);
		});
	};

	const handleBackHome = () => {
		navigate(RENDER_URL.ROOT_URL);
	};

	useEffect(() => {
		isMountedRef.current = true;
		if (acceptReservations === 1 && eventDateId) {
			handleShow();
			getEventHours(eventDateId);
		}

		return () => {
			isMountedRef.current = false;
		};
	}, [eventDateId, acceptReservations]);

	const getEventHours = async (eventDateId: string) => {
		safeSetState(() => setIsLoading(true));
		try {
			const { EVENT_DATES_URL } = API_URL;
			const resp = await axios.get(
				EVENT_DATES_URL + "/" + eventDateId + "/event_hours",
			);
			const { data } = resp;
			if (
				data &&
				data.event_date &&
				data.event_date.event_hours !== undefined
			) {
				safeSetState(() => {
					setEventHour(data.event_date.event_hours);
					setEventDate(data.event_date.date);
				});
			}
		} catch (e) {
			// Error handling for event slot selection
		} finally {
			safeSetState(() => setIsLoading(false));
		}
	};

	// Calculate available slots once for reuse
	const availableSlots = eventHour.flatMap((item) =>
		item.event_slots.filter((e) => e.open_slots > 0),
	);
	const hasAvailableSlots = availableSlots.length > 0;

	return (
		<Fragment>
			<Dialog open={show} onOpenChange={setShow}>
				<VisuallyHidden>
					<DialogTitle>
						{localization.dialog_choose_time_slot_title ||
							"Choose Time Slot"}
					</DialogTitle>
					<DialogDescription>
						{localization.dialog_choose_time_slot_description ||
							"Select an available time slot for your registration."}
					</DialogDescription>
				</VisuallyHidden>
				<DialogContent
					className="sm:max-w-md bg-highlight border-none text-white"
					onPointerDownOutside={(e) => e.preventDefault()}
					onEscapeKeyDown={(e) => e.preventDefault()}
					showCloseButton={false}
				>
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
							{localization.dialog_choose_time_slot_title ||
								"Choose Time Slot"}
						</DialogTitle>
						<DialogDescription id="timeslot-modal-description">
							{localization.dialog_choose_time_slot_description ||
								"Select an available time slot for your registration."}
						</DialogDescription>
					</DialogHeader>
					<div className="container py-4">
						{isLoading ? (
							<div
								className="flex justify-center py-4"
								role="status"
								aria-label={
									localization.aria_loading_time_slots
								}
							>
								<LoadingSpinner size="medium" />
							</div>
						) : (
							(() => {
								if (!hasAvailableSlots) {
									return (
										<div className="text-center py-6 px-4">
											<p className="text-sm leading-relaxed">
												{
													localization.event_slots_no_available_message
												}
											</p>
										</div>
									);
								}

								return (
									<fieldset
										role="radiogroup"
										aria-labelledby="timeslot-modal-title"
									>
										<legend className="sr-only">
											{
												localization.sr_available_time_slots_registration
											}
										</legend>
										{eventHour.map((item, index) =>
											item.event_slots
												.filter((e) => e.open_slots > 0)
												.map((e, i) => {
													const radioId = `time_slot_${e.event_slot_id}`;
													return (
														<div
															className="flex items-center p-2 space-x-2"
															key={
																index + "-" + i
															}
														>
															<input
																className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
																type="radio"
																name="time_slot"
																id={radioId}
																value={
																	e.event_slot_id
																}
																checked={
																	String(
																		selectedSlotId,
																	) ===
																	String(
																		e.event_slot_id,
																	)
																}
																onChange={
																	onSlotChange
																}
																aria-describedby={`${radioId}-description`}
															/>
															<label
																className="ml-2 text-sm font-medium cursor-pointer"
																htmlFor={
																	radioId
																}
															>
																{e.start_time} -{" "}
																{e.end_time}
															</label>
															<span
																id={`${radioId}-description`}
																className="sr-only"
															>
																{e.open_slots}{" "}
																{e.open_slots !==
																1
																	? localization.text_slots
																	: localization.text_slot}{" "}
																{
																	localization.text_available
																}
															</span>
														</div>
													);
												}),
										)}
									</fieldset>
								);
							})()
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
							{localization.button_go_back}
						</Button>
						{hasAvailableSlots && (
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
									? localization.loading_loading
									: localization.button_save_and_continue}
							</Button>
						)}
					</DialogFooter>

					{/* Hidden descriptions for screen readers */}
					<div id="back-button-description" className="sr-only">
						{localization.sr_return_previous_without_slot}
					</div>
					<div id="continue-button-description" className="sr-only">
						{localization.sr_proceed_registration_selected_slot}
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

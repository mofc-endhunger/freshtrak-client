import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationCard from "../ReservationCard";
import type { Reservation } from "../../types/reservation.types";

jest.mock("react-redux", () => ({
	useSelector: () => "en",
	useDispatch: () => jest.fn(),
}));

jest.mock("../../../Feedback/FeedbackContainer", () => {
	return function MockFeedbackContainer(props: any) {
		return props.isOpen ? (
			<div data-testid="feedback-container" data-on-submit-complete={!!props.onSubmitComplete} />
		) : null;
	};
});

jest.mock("../../../Localization/LocalizationComponent", () => ({
	status_completed: "Completed",
	feedback_give_feedback: "Give Feedback",
}));

function createMockReservation(overrides: Partial<Reservation> = {}): Reservation {
	return {
		id: 1,
		event: { id: 10, name: "Test Event" },
		date: "2026-01-17",
		timeslot: { start_time: "09:00:00", end_time: "15:00:00" },
		household_id: 100,
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
		...overrides,
	};
}

describe("ReservationCard", () => {
	it("renders event name, date, timeslot for upcoming variant", () => {
		const reservation = createMockReservation();

		render(<ReservationCard reservation={reservation} variant="upcoming" />);

		expect(screen.getByText("Test Event")).toBeInTheDocument();
		expect(screen.getByText(/9:00\s*AM.*3:00\s*PM/i)).toBeInTheDocument();
		expect(screen.getByText(/Sat, Jan 17, 2026/)).toBeInTheDocument();
	});

	it("renders event name, date, timeslot for past variant", () => {
		const reservation = createMockReservation();

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.getByText("Test Event")).toBeInTheDocument();
		expect(screen.getByText(/9:00\s*AM.*3:00\s*PM/i)).toBeInTheDocument();
		expect(screen.getByText(/Sat, Jan 17, 2026/)).toBeInTheDocument();
	});

	it("shows status badge for past variant with status", () => {
		const reservation = createMockReservation({ status: "completed" });

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.getByText("Completed")).toBeInTheDocument();
	});

	it('shows "Give Feedback" button when variant=past AND survey.status is "in_progress"', () => {
		const reservation = createMockReservation({
			status: "completed",
			survey: { id: 1, status: "in_progress" },
		});

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.getByRole("button", { name: "Give Feedback" })).toBeInTheDocument();
	});

	it('shows "Give Feedback" button when variant=past AND survey.status is "scheduled"', () => {
		const reservation = createMockReservation({
			status: "completed",
			survey: { id: 1, status: "scheduled" },
		});

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.getByRole("button", { name: "Give Feedback" })).toBeInTheDocument();
	});

	it('hides "Give Feedback" button when survey.status is "completed"', () => {
		const reservation = createMockReservation({
			status: "completed",
			survey: { id: 1, status: "completed" },
		});

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.queryByRole("button", { name: "Give Feedback" })).not.toBeInTheDocument();
	});

	it('hides "Give Feedback" button when survey is undefined', () => {
		const reservation = createMockReservation({
			status: "completed",
			survey: undefined,
		});

		render(<ReservationCard reservation={reservation} variant="past" />);

		expect(screen.queryByRole("button", { name: "Give Feedback" })).not.toBeInTheDocument();
	});

	it('hides "Give Feedback" button when variant is "upcoming"', () => {
		const reservation = createMockReservation({
			status: "completed",
			survey: { id: 1, status: "in_progress" },
		});

		render(<ReservationCard reservation={reservation} variant="upcoming" />);

		expect(screen.queryByRole("button", { name: "Give Feedback" })).not.toBeInTheDocument();
	});

	it("calls onClick when card is clicked", async () => {
		const user = userEvent.setup();
		const reservation = createMockReservation();
		const onClick = jest.fn();

		render(<ReservationCard reservation={reservation} onClick={onClick} />);

		await user.click(screen.getByText("Test Event"));

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onClick).toHaveBeenCalledWith(reservation);
	});

	it("does not crash when onClick is not provided", async () => {
		const user = userEvent.setup();
		const reservation = createMockReservation();

		expect(() => {
			render(<ReservationCard reservation={reservation} />);
		}).not.toThrow();

		await user.click(screen.getByText("Test Event"));
	});

	it("passes onFeedbackSubmitted to FeedbackContainer as onSubmitComplete", async () => {
		const user = userEvent.setup();
		const reservation = createMockReservation({
			status: "completed",
			survey: { id: 1, status: "in_progress" },
		});
		const onFeedbackSubmitted = jest.fn();

		render(
			<ReservationCard
				reservation={reservation}
				variant="past"
				onFeedbackSubmitted={onFeedbackSubmitted}
			/>
		);

		await user.click(screen.getByRole("button", { name: "Give Feedback" }));

		const feedbackContainer = screen.getByTestId("feedback-container");
		expect(feedbackContainer.getAttribute("data-on-submit-complete")).toBe("true");
	});
});

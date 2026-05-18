import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PastEventsSection from "../PastEventsSection";

let mockGetPastReservations: jest.Mock;

jest.mock("../../../../Services/ReservationsApiService", () => {
	const fn = jest.fn();
	return {
		__esModule: true,
		ReservationsApiService: class {
			getPastReservations = fn;
		},
		__mockGetPastReservations: fn,
	};
});

beforeAll(() => {
	mockGetPastReservations = (
		require("../../../../Services/ReservationsApiService") as any
	).__mockGetPastReservations;
});

jest.mock("../ReservationCard", () => {
	return {
		__esModule: true,
		default: function MockReservationCard(props: any) {
			return (
				<div
					data-testid={`reservation-card-${props.reservation.id}`}
					data-has-on-click={String(!!props.onClick)}
					data-has-on-feedback-submitted={String(!!props.onFeedbackSubmitted)}
					onClick={() => props.onClick?.(props.reservation)}
				>
					{props.reservation.event.name}
				</div>
			);
		},
	};
});

jest.mock("../../../Households/components/LoadingSpinner", () => ({
	LoadingCard: ({ isLoading, children }: any) =>
		isLoading ? <div data-testid="loading">Loading...</div> : <div>{children}</div>,
}));

jest.mock("../../../Localization/LocalizationComponent", () => ({
	__esModule: true,
	default: {
		title_past_events: "Past Events",
		text_past_events_description: "Your event history from the last 30 days.",
		loading_reservations: "Loading past events...",
		text_no_past_events: "No past events found.",
		error_loading_reservations: "Failed to load past events",
	},
}));

const createMockReservation = (id: number, date: string, name: string): any => ({
	id,
	event: { id, name },
	date,
	timeslot: { start_time: "09:00:00", end_time: "15:00:00" },
	status: "completed",
	household_id: 1,
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
});

describe("PastEventsSection", () => {
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		consoleErrorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it("shows loading state initially", () => {
		mockGetPastReservations.mockImplementation(
			() => new Promise(() => {})
		);

		render(<PastEventsSection />);

		expect(screen.getByTestId("loading")).toBeInTheDocument();
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("shows empty state when API returns no reservations", async () => {
		mockGetPastReservations.mockResolvedValue({
			reservations: [],
			total: 0,
			upcoming_count: 0,
			past_count: 0,
		});

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
		});

		expect(screen.getByText("No past events found.")).toBeInTheDocument();
	});

	it("renders reservation cards when API returns data", async () => {
		const r1 = createMockReservation(1, "2026-01-15", "Event A");
		const r2 = createMockReservation(2, "2026-01-10", "Event B");

		mockGetPastReservations.mockResolvedValue({
			reservations: [r1, r2],
			total: 2,
			upcoming_count: 0,
			past_count: 2,
		});

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.getByTestId("reservation-card-1")).toBeInTheDocument();
			expect(screen.getByTestId("reservation-card-2")).toBeInTheDocument();
		});

		expect(screen.getByText("Event A")).toBeInTheDocument();
		expect(screen.getByText("Event B")).toBeInTheDocument();
	});

	it("shows error when API call fails", async () => {
		mockGetPastReservations.mockRejectedValue(new Error("Network error"));

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.getByText("Failed to load past events")).toBeInTheDocument();
		});
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error fetching past reservations:",
			expect.any(Error),
		);
	});

	it("passes fetchPastReservations as onFeedbackSubmitted to ReservationCard", async () => {
		const r1 = createMockReservation(1, "2026-01-15", "Event A");

		mockGetPastReservations.mockResolvedValue({
			reservations: [r1],
			total: 1,
			upcoming_count: 0,
			past_count: 1,
		});

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.getByTestId("reservation-card-1")).toBeInTheDocument();
		});

		const card = screen.getByTestId("reservation-card-1");
		expect(card.getAttribute("data-has-on-feedback-submitted")).toBe("true");
	});

	it("passes onEventClick handler to ReservationCard when provided", async () => {
		const r1 = createMockReservation(1, "2026-01-15", "Event A");
		const onEventClick = jest.fn();

		mockGetPastReservations.mockResolvedValue({
			reservations: [r1],
			total: 1,
			upcoming_count: 0,
			past_count: 1,
		});

		render(<PastEventsSection onEventClick={onEventClick} />);

		await waitFor(() => {
			expect(screen.getByTestId("reservation-card-1")).toBeInTheDocument();
		});

		const card = screen.getByTestId("reservation-card-1");
		expect(card.getAttribute("data-has-on-click")).toBe("true");

		await userEvent.click(screen.getByText("Event A"));
		expect(onEventClick).toHaveBeenCalledTimes(1);
		expect(onEventClick).toHaveBeenCalledWith(r1);
	});

	it("does not pass onClick to ReservationCard when onEventClick is not provided", async () => {
		const r1 = createMockReservation(1, "2026-01-15", "Event A");

		mockGetPastReservations.mockResolvedValue({
			reservations: [r1],
			total: 1,
			upcoming_count: 0,
			past_count: 1,
		});

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.getByTestId("reservation-card-1")).toBeInTheDocument();
		});

		const card = screen.getByTestId("reservation-card-1");
		expect(card.getAttribute("data-has-on-click")).toBe("false");
	});

	it("sorts reservations by date descending", async () => {
		const r1 = createMockReservation(1, "2026-01-05", "Oldest");
		const r2 = createMockReservation(2, "2026-01-15", "Middle");
		const r3 = createMockReservation(3, "2026-01-20", "Newest");

		mockGetPastReservations.mockResolvedValue({
			reservations: [r1, r2, r3],
			total: 3,
			upcoming_count: 0,
			past_count: 3,
		});

		render(<PastEventsSection />);

		await waitFor(() => {
			expect(screen.getByTestId("reservation-card-1")).toBeInTheDocument();
			expect(screen.getByTestId("reservation-card-2")).toBeInTheDocument();
			expect(screen.getByTestId("reservation-card-3")).toBeInTheDocument();
		});

		const cards = screen.getAllByTestId(/reservation-card-/);
		expect(cards[0].textContent).toBe("Newest");
		expect(cards[1].textContent).toBe("Middle");
		expect(cards[2].textContent).toBe("Oldest");
	});
});

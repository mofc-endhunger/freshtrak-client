import { acceptsReservationsOrInterest, filterEventsByReservations } from '../availabilityFilter';

const buildEvent = (overrides = {}) => ({
  id: 1,
  eventName: 'Test Event',
  acceptReservations: 0,
  acceptInterest: 0,
  ...overrides,
});

describe('acceptsReservationsOrInterest', () => {
  it('returns true when acceptReservations is 1', () => {
    expect(acceptsReservationsOrInterest(buildEvent({ acceptReservations: 1 }))).toBe(true);
  });

  it('returns true when acceptInterest is 1', () => {
    expect(acceptsReservationsOrInterest(buildEvent({ acceptInterest: 1 }))).toBe(true);
  });

  it('returns false when both flags are 0', () => {
    expect(acceptsReservationsOrInterest(buildEvent())).toBe(false);
  });
});

describe('filterEventsByReservations', () => {
  const eventsByDate = {
    '2026/05/29': [buildEvent({ id: 1, acceptReservations: 1 }), buildEvent({ id: 2 })],
    '2026/05/30': [buildEvent({ id: 3, acceptInterest: 1 }), buildEvent({ id: 4 })],
    '2026/05/31': [buildEvent({ id: 5 })],
  };

  it('returns all events when reservations filter is disabled', () => {
    expect(filterEventsByReservations(eventsByDate, false)).toEqual(eventsByDate);
  });

  it('includes events that accept reservations or RSVP', () => {
    expect(filterEventsByReservations(eventsByDate, true)).toEqual({
      '2026/05/29': [buildEvent({ id: 1, acceptReservations: 1 })],
      '2026/05/30': [buildEvent({ id: 3, acceptInterest: 1 })],
    });
  });

  it('returns input when eventsByDate is nullish', () => {
    expect(filterEventsByReservations(null, true)).toBeNull();
  });
});

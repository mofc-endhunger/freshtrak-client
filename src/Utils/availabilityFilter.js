import moment from 'moment';

/**
 * Filters events by availability time periods
 * @param {Object} eventsByDate - Events grouped by date (from EventHandler)
 * @param {string} availabilityFilter - The availability filter to apply
 * @returns {Object} Filtered events grouped by date
 *
 * TODO: This is client-side filtering. When API supports availability filtering,
 * this should be moved to server-side filtering for better performance.
 */
export const filterEventsByAvailability = (eventsByDate, availabilityFilter) => {
  if (!eventsByDate || availabilityFilter === 'All') {
    return eventsByDate;
  }

  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'day').startOf('day');
  const next7Days = moment().add(7, 'days').endOf('day');
  // Next 2 weeks = today through 14 days from today (not end-of-week)
  const endOfNext2Weeks = moment().add(14, 'days').endOf('day');
  const endOfMonth = moment().endOf('month');
  const endOfNextMonth = moment().add(1, 'month').endOf('month');

  const filteredEvents = {};

  Object.keys(eventsByDate).forEach((dateKey) => {
    // EventHandler uses YYYY/MM/DD format for date keys
    const eventDate = moment(dateKey, 'YYYY/MM/DD');

    let shouldInclude = false;

    switch (availabilityFilter) {
      case 'today':
        shouldInclude = eventDate.isSame(today, 'day');
        break;
      case 'tomorrow':
        shouldInclude = eventDate.isSame(tomorrow, 'day');
        break;
      case 'next_7_days':
        shouldInclude =
          eventDate.isSameOrAfter(today, 'day') && eventDate.isSameOrBefore(next7Days, 'day');
        break;
      case 'next_2_weeks':
        // Include today through 14 days from today (matches "Next 7 Days" behavior)
        shouldInclude =
          eventDate.isSameOrAfter(today, 'day') && eventDate.isSameOrBefore(endOfNext2Weeks, 'day');
        break;
      case 'this_month':
        // Include today through end of current month
        shouldInclude =
          eventDate.isSameOrAfter(today, 'day') && eventDate.isSameOrBefore(endOfMonth, 'day');
        break;
      case 'next_month':
        // First day of next month through end of next month
        shouldInclude =
          eventDate.isAfter(endOfMonth, 'day') && eventDate.isSameOrBefore(endOfNextMonth, 'day');
        break;
      default:
        shouldInclude = true;
    }

    if (shouldInclude) {
      filteredEvents[dateKey] = eventsByDate[dateKey];
    }
  });

  return filteredEvents;
};

/**
 * Returns true when an event date accepts reservations or RSVP (interest).
 * @param {Object} event - Event from EventHandler
 * @returns {boolean}
 */
export const acceptsReservationsOrInterest = (event) =>
  event.acceptReservations === 1 || event.acceptInterest === 1;

/**
 * Filters events by reservations or RSVP acceptance
 * @param {Object} eventsByDate - Events grouped by date (from EventHandler)
 * @param {boolean} reservationsFilter - When true, show only events that accept reservations or RSVP
 * @returns {Object} Filtered events grouped by date
 */
export const filterEventsByReservations = (eventsByDate, reservationsFilter) => {
  if (!eventsByDate || !reservationsFilter) {
    return eventsByDate;
  }

  const filteredEvents = {};

  Object.keys(eventsByDate).forEach((dateKey) => {
    const events = eventsByDate[dateKey];
    const filteredEventsForDate = events.filter(acceptsReservationsOrInterest);

    if (filteredEventsForDate.length > 0) {
      filteredEvents[dateKey] = filteredEventsForDate;
    }
  });

  return filteredEvents;
};

/**
 * Helper function to get availability filter options
 * @returns {Array} Array of availability filter options
 */
export const getAvailabilityOptions = () => [
  { value: 'All', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'next_7_days', label: 'Next 7 Days' },
  { value: 'next_2_weeks', label: 'Next 2 Weeks' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_month', label: 'Next Month' },
];

import moment from 'moment';
import { enrichEventWithMockImages } from './devImageEnrichment';

export const EventHandler = (agencies) =>
  EventDateSorterByDate(EventObjectBuilder(AgencyHandler(agencies)));

const EventDateSortByDistance = (arrayOfEvents) =>
  arrayOfEvents.sort(
    (a, b) =>
      (a.estimated_distance ? a.estimated_distance : Infinity) -
      (b.estimated_distance ? b.estimated_distance : Infinity),
  );

export const EventDateSorterByDate = (eventObj) => {
  const eventOrderByDate = {};
  Object.keys(eventObj)
    .sort((a, b) => {
      return moment(a, 'YYYY/MM/DD').toDate() - moment(b, 'YYYY/MM/DD').toDate();
    })
    .forEach((key) => {
      eventOrderByDate[key] = EventDateSortByDistance(eventObj[key]);
    });
  return eventOrderByDate;
};

export const EventObjectBuilder = (events) => {
  const eventSortedByDate = {};
  events.forEach((event) => {
    if (event.date in eventSortedByDate) {
      eventSortedByDate[event.date].push(event);
    } else {
      eventSortedByDate[event.date] = [event];
    }
  });
  return eventSortedByDate;
};

export const eventDateMapper = (
  event,
  phone,
  name,
  estimated_distance,
  agencyLatitude,
  agencyLongitude,
  agencyImages,
) => {
  const { event_dates, forms, exception_note, images: eventImages } = event;
  if (event_dates && event_dates.length > 0) {
    const safeForms = forms || [];
    return event_dates.map((dateOfEvent) => {
      const {
        id,
        event_id,
        accept_reservations,
        accept_interest,
        accept_walkin,
        start_time,
        end_time,
        date,
      } = dateOfEvent;
      return enrichEventWithMockImages({
        id,
        eventId: event_id,
        acceptReservations: accept_reservations,
        acceptInterest: accept_interest,
        acceptWalkin: accept_walkin,
        startTime: start_time,
        endTime: end_time,
        date,
        eventAddress: event.address,
        eventCity: event.city,
        eventState: event.state,
        eventZip: event.zip,
        phoneNumber: phone,
        agencyName: name,
        eventName: event.name,
        exceptionNote: exception_note,
        eventService: event.service_category ? event.service_category['service_category_name'] : '',
        estimated_distance,
        eventDetails: event.event_details,
        seniorAge: safeForms.length > 0 ? safeForms[0].display_age_senior : 60,
        adultAge: safeForms.length > 0 ? safeForms[0].display_age_adult : 18,
        agencyLatitude,
        agencyLongitude,
        agencyImages: agencyImages || [],
        eventImages: eventImages || [],
      });
    });
  } else {
    return [];
  }
};

export const EventFormat = (event, eventDateId) => {
  const {
    address: eventAddress,
    city: eventCity,
    state: eventState,
    zip: eventZip,
    forms,
    agency_name: agencyName,
    name: eventName,
    exception_note: exceptionNote,
    estimated_distance: estimatedDistance,
    service_category: serviceCategory,
    event_details: eventDetails,
    event_dates: eventDates,
    images: eventImages,
    agency_images: agencyImages,
  } = event;

  const eventDate = eventDates.filter((eventDate) => eventDateId === `${eventDate.id}`)[0];

  const {
    event_id: eventId,
    accept_reservations: acceptReservations,
    accept_interest: acceptInterest,
    accept_walkin: acceptWalkin,
    start_time: startTime,
    end_time: endTime,
    date,
  } = eventDate;

  return enrichEventWithMockImages({
    id: eventDateId,
    eventId,
    acceptReservations,
    acceptInterest,
    acceptWalkin,
    startTime,
    endTime,
    date,
    eventAddress,
    eventCity,
    eventState,
    eventZip,
    phoneNumber: '',
    agencyName,
    eventName,
    exceptionNote,
    eventService: serviceCategory && serviceCategory.service_category_name,
    estimatedDistance,
    eventDetails,
    seniorAge: forms.length > 0 ? forms[0].display_age_senior : 60,
    adultAge: forms.length > 0 ? forms[0].display_age_adult : 18,
    agencyImages: agencyImages || [],
    eventImages: eventImages || [],
  });
};

export const HomeEventFormat = (event, eventDateId) => {
  const {
    address: eventAddress,
    city: eventCity,
    state: eventState,
    zip: eventZip,
    forms,
    agency_name: agencyName,
    name: eventName,
    exception_note: exceptionNote,
    estimated_distance: estimatedDistance,
    service_category: serviceCategory,
    event_details: eventDetails,
    event_dates: eventDates,
    images: eventImages,
    agency_images: agencyImages,
  } = event;
  const eventDate = eventDates.filter((eventDate) => eventDateId === eventDate.id)[0];
  if (eventDate) {
    const {
      event_id: eventId,
      accept_reservations: acceptReservations,
      accept_interest: acceptInterest,
      accept_walkin: acceptWalkin,
      start_time: startTime,
      end_time: endTime,
      date,
    } = eventDate;

    return enrichEventWithMockImages({
      id: eventDateId,
      eventId,
      acceptReservations,
      acceptInterest,
      acceptWalkin,
      startTime,
      endTime,
      date,
      eventAddress,
      eventCity,
      eventState,
      eventZip,
      phoneNumber: '',
      agencyName,
      eventName,
      exceptionNote,
      eventService: serviceCategory && serviceCategory.service_category_name,
      estimatedDistance,
      eventDetails,
      seniorAge: forms.length > 0 ? forms[0].display_age_senior : 60,
      adultAge: forms.length > 0 ? forms[0].display_age_adult : 18,
      agencyImages: agencyImages || [],
      eventImages: eventImages || [],
    });
  } else {
    return null;
  }
};

export const AgencyHandler = (agencies) => {
  if (!agencies || !agencies.length > 0) {
    return [];
  }
  const eventDates = [];

  agencies.forEach((agency) => {
    const { events, phone, name, estimated_distance, latitude, longitude, images } = agency;

    if (events && events.length > 0) {
      events.forEach((event) => {
        try {
          eventDateMapper(
            event,
            phone,
            name,
            estimated_distance,
            latitude,
            longitude,
            images,
          ).forEach((x) => eventDates.push(x));
        } catch (err) {
          console.warn('AgencyHandler: skipping malformed event data for agency', name, err);
        }
      });
    }
  });

  return eventDates;
};

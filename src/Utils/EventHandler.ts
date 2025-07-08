import moment from 'moment';

interface EventDate {
  id: number;
  event_id: number;
  accept_reservations: boolean;
  accept_interest: boolean;
  accept_walkin: boolean;
  start_time: string;
  end_time: string;
  date: string;
}

interface Event {
  id: number;
  eventId: number;
  acceptReservations: boolean;
  acceptInterest: boolean;
  acceptWalkin: boolean;
  startTime: string;
  endTime: string;
  date: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  phoneNumber: string;
  agencyName: string;
  eventName: string;
  exceptionNote: string;
  eventService: string;
  estimated_distance?: number;
  estimatedDistance?: number;
  eventDetails: string;
  seniorAge: number;
  adultAge: number;
}

interface Agency {
  events: any[];
  phone: string;
  name: string;
  estimated_distance: number;
}

interface EventObject {
  [key: string]: Event[];
}

export const EventHandler = (agencies: Agency[]): EventObject =>
  EventDateSorterByDate(EventObjectBuilder(AgencyHandler(agencies)));

const EventDateSortByDistance = (arrayOfEvents: Event[]): Event[] =>
  arrayOfEvents.sort(
    (a, b) =>
      (a.estimated_distance ? a.estimated_distance : Infinity) -
      (b.estimated_distance ? b.estimated_distance : Infinity)
  );

export const EventDateSorterByDate = (eventObj: EventObject): EventObject => {
  const eventOrderByDate: EventObject = {};
  Object.keys(eventObj)
    .sort((a, b) => {
      return (
        moment(a, 'YYYY/MM/DD').toDate().getTime() - moment(b, 'YYYY/MM/DD').toDate().getTime()
      );
    })
    .forEach(key => {
      eventOrderByDate[key] = EventDateSortByDistance(eventObj[key]);
    });
  return eventOrderByDate;
};

export const EventObjectBuilder = (events: Event[]): EventObject => {
  const eventSortedByDate: EventObject = {};
  events.forEach(event => {
    if (event.date in eventSortedByDate) {
      eventSortedByDate[event.date].push(event);
    } else {
      eventSortedByDate[event.date] = [event];
    }
  });
  return eventSortedByDate;
};

export const eventDateMapper = (event: any, phone: string, name: string, estimated_distance: number): Event[] => {
  const { event_dates, forms, exception_note } = event;
  if (event_dates && event_dates.length > 0) {
    return event_dates.map((dateOfEvent: EventDate) => {
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
      return {
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
        eventService: event.service_category['service_category_name'],
        estimated_distance,
        eventDetails: event.event_details,
        seniorAge: forms.length > 0 ? forms[0].display_age_senior : 60,
        adultAge: forms.length > 0 ? forms[0].display_age_adult : 18,
      };
    });
  } else {
    return [];
  }
};

export const EventFormat = (event: any, eventDateId: string): Event => {
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
    event_dates: eventDates
  } = event;

  const eventDate = eventDates.filter((eventDate: any) => eventDateId === `${eventDate.id}`)[0];

  const {
    event_id: eventId,
    accept_reservations: acceptReservations,
    accept_interest: acceptInterest,
    accept_walkin: acceptWalkin,
    start_time: startTime,
    end_time: endTime,
    date,
  } = eventDate;

  return {
    id: parseInt(eventDateId),
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
    phoneNumber: "",
    agencyName,
    eventName,
    exceptionNote,
    eventService: serviceCategory && serviceCategory.service_category_name,
    estimatedDistance,
    eventDetails,
    seniorAge: forms.length > 0 ? forms[0].display_age_senior : 60,
    adultAge: forms.length > 0 ? forms[0].display_age_adult : 18,
  };
};

export const HomeEventFormat = (event: any, eventDateId: string): Event | null => {
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
    event_dates: eventDates
  } = event;
  const eventDate = eventDates.filter((eventDate: any) => eventDateId === eventDate.id)[0];
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

    return {
      id: parseInt(eventDateId),
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
      phoneNumber: "",
      agencyName,
      eventName,
      exceptionNote,
      eventService: serviceCategory && serviceCategory.service_category_name,
      estimatedDistance,
      eventDetails,
      seniorAge: forms.length > 0 ? forms[0].display_age_senior : 60,
      adultAge: forms.length > 0 ? forms[0].display_age_adult : 18,
    };
  }
  else {
    return null;
  }
};

export const AgencyHandler = (agencies: Agency[]): Event[] => {
  if (!agencies || agencies.length === 0) {
    return [];
  }
  const eventDates: Event[] = [];

  agencies.forEach(agency => {
    const { events, phone, name, estimated_distance } = agency;

    if (events && events.length > 0) {
      events.forEach(event => {
        eventDateMapper(event, phone, name, estimated_distance).forEach(x =>
          eventDates.push(x)
        );
      });
    }
  });

  return eventDates;
}; 
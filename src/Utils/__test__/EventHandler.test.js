import { EventHandler, EventObjectBuilder, AgencyHandler } from '../EventHandler';
import {
  mockAgencyBuilder,
  mockEventsBuilder,
  mockEventDatesBuilder,
  mockFormsBuilder,
  mockServiceCategoryBuilder,
  mockAgency,
  mockEvent,
  mockEventDate,
  mockForms,
  mockServiceCategory,
} from '../../Testing';

test('should handle bad or empty data', () => {
  expect(EventHandler(null)).toEqual({});
  expect(EventHandler([])).toEqual({});
});

test('should return an array of events', () => {
  const agency1 = mockAgencyBuilder();
  const event1 = mockEventsBuilder();
  const eventDate1 = mockEventDatesBuilder();
  const form1 = mockFormsBuilder();
  const service_category1 = mockServiceCategoryBuilder();
  const expected = [
    {
      id: eventDate1.id,
      eventId: eventDate1.event_id,
      acceptReservations: eventDate1.accept_reservations,
      acceptInterest: eventDate1.accept_interest,
      startTime: eventDate1.start_time,
      endTime: eventDate1.end_time,
      date: eventDate1.date,
      eventAddress: event1.address,
      eventCity: event1.city,
      eventState: event1.state,
      eventZip: event1.zip,
      phoneNumber: agency1.phone,
      agencyName: agency1.name,
      eventName: event1.name,
      exceptionNote: event1.exception_note,
      eventService: service_category1.service_category_name,
      estimated_distance: agency1.estimated_distance,
      eventDetails: event1.event_details,
      seniorAge: form1.display_age_senior,
      adultAge: form1.display_age_adult,
      agencyImages: [],
      eventImages: [],
    },
  ];
  const testData = [
    {
      ...agency1,
      events: [
        {
          ...event1,
          event_dates: [{ ...eventDate1 }],
          forms: [{ ...form1 }],
          service_category: { ...service_category1 },
        },
      ],
    },
  ];
  expect(AgencyHandler(testData)).toEqual(expected);
});

test('should return an array of events with multiple agencies and one with no events', () => {
  const agency1 = mockAgencyBuilder();
  const agency2 = mockAgencyBuilder();
  const event1 = mockEventsBuilder();
  const event2 = mockEventsBuilder();
  const eventDate1 = mockEventDatesBuilder();
  const form1 = mockFormsBuilder();
  const service_category1 = mockServiceCategoryBuilder();
  const expected = [
    {
      id: eventDate1.id,
      eventId: eventDate1.event_id,
      acceptReservations: eventDate1.accept_reservations,
      acceptInterest: eventDate1.accept_interest,
      startTime: eventDate1.start_time,
      endTime: eventDate1.end_time,
      date: eventDate1.date,
      eventAddress: event1.address,
      eventCity: event1.city,
      eventState: event1.state,
      eventZip: event1.zip,
      phoneNumber: agency1.phone,
      agencyName: agency1.name,
      eventName: event1.name,
      exceptionNote: event1.exception_note,
      eventService: service_category1.service_category_name,
      estimated_distance: agency1.estimated_distance,
      eventDetails: event1.event_details,
      seniorAge: form1.display_age_senior,
      adultAge: form1.display_age_adult,
      agencyImages: [],
      eventImages: [],
    },
  ];
  const testData = [
    {
      ...agency1,
      events: [
        {
          ...event1,
          event_dates: [{ ...eventDate1 }],
          forms: [{ ...form1 }],
          service_category: { ...service_category1 },
        },
      ],
    },
    { ...agency2, events: [event2] },
  ];
  expect(AgencyHandler(testData)).toEqual(expected);
});

test('should return an array of events with multiple agencies and multiple events', () => {
  const agency1 = mockAgencyBuilder();
  const agency2 = mockAgencyBuilder();
  const event1 = mockEventsBuilder();
  const event2 = mockEventsBuilder();
  const eventDate1 = mockEventDatesBuilder();
  const eventDate2 = mockEventDatesBuilder();
  const form1 = mockFormsBuilder();
  const form2 = mockFormsBuilder();
  const service_category1 = mockServiceCategoryBuilder();
  const service_category2 = mockServiceCategoryBuilder();
  const expected = [
    {
      id: eventDate1.id,
      eventId: eventDate1.event_id,
      acceptReservations: eventDate1.accept_reservations,
      acceptInterest: eventDate1.accept_interest,
      startTime: eventDate1.start_time,
      endTime: eventDate1.end_time,
      date: eventDate1.date,
      eventAddress: event1.address,
      eventCity: event1.city,
      eventState: event1.state,
      eventZip: event1.zip,
      phoneNumber: agency1.phone,
      agencyName: agency1.name,
      eventName: event1.name,
      exceptionNote: event1.exception_note,
      eventService: service_category1.service_category_name,
      estimated_distance: agency1.estimated_distance,
      eventDetails: event1.event_details,
      seniorAge: form1.display_age_senior,
      adultAge: form1.display_age_adult,
      agencyImages: [],
      eventImages: [],
    },
    {
      id: eventDate2.id,
      eventId: eventDate2.event_id,
      acceptReservations: eventDate2.accept_reservations,
      acceptInterest: eventDate2.accept_interest,
      startTime: eventDate2.start_time,
      endTime: eventDate2.end_time,
      date: eventDate2.date,
      eventAddress: event2.address,
      eventCity: event2.city,
      eventState: event2.state,
      eventZip: event2.zip,
      phoneNumber: agency2.phone,
      agencyName: agency2.name,
      eventName: event2.name,
      exceptionNote: event2.exception_note,
      eventService: service_category2.service_category_name,
      estimated_distance: agency2.estimated_distance,
      eventDetails: event2.event_details,
      seniorAge: form2.display_age_senior,
      adultAge: form2.display_age_adult,
      agencyImages: [],
      eventImages: [],
    },
  ];
  const testData = [
    {
      ...agency1,
      events: [
        {
          ...event1,
          event_dates: [{ ...eventDate1 }],
          forms: [{ ...form1 }],
          service_category: { ...service_category1 },
        },
      ],
    },
    {
      ...agency2,
      events: [
        {
          ...event2,
          event_dates: [{ ...eventDate2 }],
          forms: [{ ...form2 }],
          service_category: { ...service_category2 },
        },
      ],
    },
  ];
  expect(AgencyHandler(testData)).toEqual(expected);
});

test('should sort events into dates', () => {
  const agency1 = mockAgencyBuilder();
  const agency2 = mockAgencyBuilder();
  const event1 = mockEventsBuilder();
  const event2 = mockEventsBuilder();
  const eventDate1 = mockEventDatesBuilder();
  const eventDate2 = mockEventDatesBuilder();
  const form1 = mockFormsBuilder();
  const form2 = mockFormsBuilder();
  const service_category1 = mockServiceCategoryBuilder();
  const service_category2 = mockServiceCategoryBuilder();
  const expected = {
    [eventDate1.date]: [
      {
        id: eventDate1.id,
        eventId: eventDate1.event_id,
        acceptReservations: eventDate1.accept_reservations,
        acceptInterest: eventDate1.accept_interest,
        startTime: eventDate1.start_time,
        endTime: eventDate1.end_time,
        date: eventDate1.date,
        eventAddress: event1.address,
        eventCity: event1.city,
        eventState: event1.state,
        eventZip: event1.zip,
        phoneNumber: agency1.phone,
        agencyName: agency1.name,
        eventName: event1.name,
        exceptionNote: event1.exception_note,
        eventService: service_category1.service_category_name,
        estimated_distance: agency1.estimated_distance,
        eventDetails: event1.event_details,
        seniorAge: form1.display_age_senior,
        adultAge: form1.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
      {
        id: eventDate2.id,
        eventId: eventDate2.event_id,
        acceptReservations: eventDate2.accept_reservations,
        acceptInterest: eventDate2.accept_interest,
        startTime: eventDate2.start_time,
        endTime: eventDate2.end_time,
        date: eventDate1.date,
        eventAddress: event2.address,
        eventCity: event2.city,
        eventState: event2.state,
        eventZip: event2.zip,
        phoneNumber: agency2.phone,
        agencyName: agency2.name,
        eventName: event2.name,
        exceptionNote: event2.exception_note,
        eventService: service_category2.service_category_name,
        estimated_distance: agency2.estimated_distance,
        eventDetails: event2.event_details,
        seniorAge: form2.display_age_senior,
        adultAge: form2.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
    ],
  };
  expect(
    EventObjectBuilder(
      AgencyHandler([
        {
          ...agency1,
          events: [
            {
              ...event1,
              event_dates: [{ ...eventDate1 }],
              forms: [{ ...form1 }],
              service_category: { ...service_category1 },
            },
          ],
        },
        {
          ...agency2,
          events: [
            {
              ...event2,
              event_dates: [{ ...eventDate2, date: eventDate1.date }],
              forms: [{ ...form2 }],
              service_category: { ...service_category2 },
            },
          ],
        },
      ]),
    ),
  ).toEqual(expected);
});

test(`should return a final object sorted by events_date's date and distance`, () => {
  const shouldBeFirst = {
    ...mockAgency,
    name: 'should be first',
    events: [
      {
        ...mockEvent,
        event_dates: [{ ...mockEventDate, date: '2020-04-01' }],
        forms: [{ ...mockForms }],
        service_category: { ...mockServiceCategory },
      },
    ],
  };
  const shouldBeSecond = {
    ...mockAgency,
    name: 'should be second',
    estimated_distance: 10.31,
    events: [
      {
        ...mockEvent,
        event_dates: [{ ...mockEventDate, date: '2020-04-15' }],
        forms: [{ ...mockForms }],
        service_category: { ...mockServiceCategory },
      },
    ],
  };
  const shouldBeThird = {
    ...mockAgency,
    name: 'should be third',
    estimated_distance: 15.31,
    events: [
      {
        ...mockEvent,
        event_dates: [{ ...mockEventDate, date: '2020-04-15' }],
        forms: [{ ...mockForms }],
        service_category: { ...mockServiceCategory },
      },
    ],
  };

  const shouldBeForth = {
    ...mockAgency,
    name: 'should be forth',
    // test a null estimated distance
    estimated_distance: '',
    events: [
      {
        ...mockEvent,
        event_dates: [{ ...mockEventDate, date: '2020-04-15' }],
        forms: [{ ...mockForms }],
        service_category: { ...mockServiceCategory },
      },
    ],
  };

  const testData = [shouldBeForth, shouldBeThird, shouldBeSecond, shouldBeFirst];
  const expected = {
    [shouldBeFirst.events[0].event_dates[0].date]: [
      {
        agencyName: 'should be first',
        date: '2020-04-01',
        endTime: mockEventDate.end_time,
        eventAddress: mockEvent.address,
        eventCity: mockEvent.city,
        eventId: mockEventDate.event_id,
        acceptReservations: mockEventDate.accept_reservations,
        acceptInterest: mockEventDate.accept_interest,
        eventName: mockEvent.name,
        exceptionNote: mockEvent.exception_note,
        eventService: mockServiceCategory.service_category_name,
        eventDetails: mockEvent.event_details,
        eventState: mockEvent.state,
        eventZip: mockEvent.zip,
        id: mockEventDate.id,
        phoneNumber: mockAgency.phone,
        startTime: mockEventDate.start_time,
        estimated_distance: shouldBeFirst.estimated_distance,
        seniorAge: mockForms.display_age_senior,
        adultAge: mockForms.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
    ],
    [shouldBeSecond.events[0].event_dates[0].date]: [
      {
        agencyName: 'should be second',
        date: '2020-04-15',
        endTime: mockEventDate.end_time,
        eventAddress: mockEvent.address,
        eventCity: mockEvent.city,
        eventId: mockEventDate.event_id,
        acceptReservations: mockEventDate.accept_reservations,
        acceptInterest: mockEventDate.accept_interest,
        eventName: mockEvent.name,
        exceptionNote: mockEvent.exception_note,
        eventService: mockServiceCategory.service_category_name,
        eventDetails: mockEvent.event_details,
        eventState: mockEvent.state,
        eventZip: mockEvent.zip,
        id: mockEventDate.id,
        phoneNumber: mockAgency.phone,
        startTime: mockEventDate.start_time,
        estimated_distance: shouldBeSecond.estimated_distance,
        seniorAge: mockForms.display_age_senior,
        adultAge: mockForms.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
      {
        agencyName: 'should be third',
        date: '2020-04-15',
        endTime: mockEventDate.end_time,
        eventAddress: mockEvent.address,
        eventCity: mockEvent.city,
        eventId: mockEventDate.event_id,
        acceptReservations: mockEventDate.accept_reservations,
        acceptInterest: mockEventDate.accept_interest,
        eventName: mockEvent.name,
        exceptionNote: mockEvent.exception_note,
        eventService: mockServiceCategory.service_category_name,
        eventDetails: mockEvent.event_details,
        eventState: mockEvent.state,
        eventZip: mockEvent.zip,
        id: mockEventDate.id,
        phoneNumber: mockAgency.phone,
        startTime: mockEventDate.start_time,
        estimated_distance: shouldBeThird.estimated_distance,
        seniorAge: mockForms.display_age_senior,
        adultAge: mockForms.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
      {
        agencyName: 'should be forth',
        date: '2020-04-15',
        endTime: mockEventDate.end_time,
        eventAddress: mockEvent.address,
        eventCity: mockEvent.city,
        eventId: mockEventDate.event_id,
        acceptReservations: mockEventDate.accept_reservations,
        acceptInterest: mockEventDate.accept_interest,
        eventName: mockEvent.name,
        exceptionNote: mockEvent.exception_note,
        eventService: mockServiceCategory.service_category_name,
        eventDetails: mockEvent.event_details,
        eventState: mockEvent.state,
        eventZip: mockEvent.zip,
        id: mockEventDate.id,
        phoneNumber: mockAgency.phone,
        startTime: mockEventDate.start_time,
        estimated_distance: shouldBeForth.estimated_distance,
        seniorAge: mockForms.display_age_senior,
        adultAge: mockForms.display_age_adult,
        agencyImages: [],
        eventImages: [],
      },
    ],
  };
  expect(EventHandler(testData)).toEqual(expected);
});

test('should thread agency and event images through AgencyHandler', () => {
  const agencyImages = [{ id: 1, type: 'Logo', caption: 'Agency Logo', src: '/logo.png' }];
  const eventImages = [{ id: 2, type: 'Instructions', caption: 'Check-in', src: '/checkin.png' }];
  const agency = mockAgencyBuilder();
  const event = mockEventsBuilder();
  const eventDate = mockEventDatesBuilder();
  const form = mockFormsBuilder();
  const serviceCategory = mockServiceCategoryBuilder();

  const testData = [
    {
      ...agency,
      images: agencyImages,
      events: [
        {
          ...event,
          event_dates: [{ ...eventDate }],
          forms: [{ ...form }],
          service_category: { ...serviceCategory },
          images: eventImages,
        },
      ],
    },
  ];

  const result = AgencyHandler(testData);
  expect(result).toHaveLength(1);
  expect(result[0].agencyImages).toEqual(agencyImages);
  expect(result[0].eventImages).toEqual(eventImages);
});

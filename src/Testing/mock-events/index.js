import { build, fake } from 'test-data-bot';

export const mockImageBuilder = build('Image').fields({
  id: fake((f) => f.random.number()),
  type: 'Logo',
  caption: '',
  src: '/agency_pics/test_image.png',
});

export const mockAgencyBuilder = build('Agencies').fields({
  id: fake((f) => f.random.number()),
  address: fake((f) => f.address.streetAddress()),
  city: fake((f) => f.address.city()),
  state: fake((f) => f.address.state()),
  zip: fake((f) => f.address.zipCode()),
  phone: fake((f) => f.phone.phoneNumber()),
  name: fake((f) => f.random.word()),
  nickname: fake((f) => f.random.word()),
  estimated_distance: fake((f) => f.random.number()),
  events: [],
  images: [],
});

export const mockEventsBuilder = build('Events').fields({
  id: fake((f) => f.random.number()),
  address: fake((f) => f.address.streetAddress()),
  city: fake((f) => f.address.city()),
  state: fake((f) => f.address.state()),
  zip: fake((f) => f.address.zipCode()),
  latitude: fake((f) => f.address.latitude()),
  longitude: fake((f) => f.address.longitude()),
  agency_id: fake((f) => f.random.number()),
  name: fake((f) => f.random.word()),
  service: fake((f) => f.random.word()),
  event_details: fake((f) => f.random.word()),
  exception_note: '',
  event_dates: [],
  forms: [],
  service_category: {},
  images: [],
});

export const mockEventDatesBuilder = build('EventDates').fields({
  id: fake((f) => f.random.number()),
  accept_interest: 0,
  event_id: fake((f) => f.random.number()),
  accept_reservations: 1,
  start_time: '08:00 AM',
  end_time: '11:00 AM',
  date: fake((f) => f.date.future()),
});

export const mockFormsBuilder = build('Forms').fields({
  id: fake((f) => f.random.number()),
  display_age_senior: 60,
  display_age_adult: 18,
});

export const mockServiceCategoryBuilder = build('ServiceCategory').fields({
  id: fake((f) => f.random.number()),
  service_category_name: fake((f) => f.random.word()),
});

export const mockEventHoursBuilder = build('EventHours').fields({
  id: fake((f) => f.random.number()),
  start_time: '10:00 AM',
  end_time: '10:59 AM',
  event_hour_id: fake((f) => f.random.number()),
  open_slots: fake((f) => f.random.number()),
});
export const mockEventSlotBuilder = build('EventSlots').fields({
  id: fake((f) => f.random.number()),
  event_slot_id: fake((f) => f.random.number()),
  start_time: '10:00 AM',
  end_time: '10:59 AM',
  open_slots: fake((f) => f.random.number()),
});

export const mockAgency = mockAgencyBuilder();
export const mockImage = mockImageBuilder();
export const mockEvent = mockEventsBuilder();
export const mockEventDate = mockEventDatesBuilder();
export const mockForms = mockFormsBuilder();
export const mockServiceCategory = mockFormsBuilder();
export const mockEventHour = mockEventHoursBuilder();
export const mockEventSlot = mockEventSlotBuilder();

const agency1 = mockAgencyBuilder();
const agency2 = mockAgencyBuilder();
const event1 = mockEventsBuilder();
const event2 = mockEventsBuilder();
const event3 = mockEventsBuilder();
const eventDate1 = mockEventDatesBuilder();
const eventDate2 = mockEventDatesBuilder();
const eventDate3 = mockEventDatesBuilder();
const form1 = mockFormsBuilder();
const form2 = mockFormsBuilder();
const form3 = mockFormsBuilder();
export const testData = [
  {
    ...agency1,
    events: [{ ...event1, event_dates: [{ ...eventDate1 }], forms: [{ ...form1 }] }],
  },
  {
    ...agency2,
    events: [{ ...event2, event_dates: [{ ...eventDate2 }], forms: [{ ...form2 }] }],
  },
];

export const testDataWithMultiple = [
  {
    ...agency1,
    events: [{ ...event1, event_dates: [{ ...eventDate1 }], forms: [{ ...form1 }] }],
  },
  {
    ...agency2,
    events: [
      {
        ...event2,
        event_dates: [{ ...eventDate2, date: eventDate1.date }],
      },
      {
        ...event3,
        event_dates: [{ ...eventDate3 }],
      },
    ],
  },
];

export const preformattedEventData = {
  id: eventDate1.id,
  eventId: eventDate1.event_id,
  acceptReservations: eventDate1.accept_reservations,
  acceptInterest: eventDate1.acceptInterest,
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
  eventService: event1.service,
  eventDetails: event1.event_details,
  seniorAge: form1.display_age_senior,
  adultAge: form1.display_age_adult,
  agencyImages: [],
  eventImages: [],
};

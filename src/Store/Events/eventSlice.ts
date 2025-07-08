import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventData {
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

interface EventState {
  event: EventData | {};
}

const initialState: EventState = {
  event: {}
};

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setCurrentEvent(state, action: PayloadAction<EventData>) {
      const { payload } = action;
      state.event = payload;
    },
  }
});

export const { setCurrentEvent } = eventSlice.actions;
export const selectEvent = (state: { event: EventState }) => state.event.event;
export default eventSlice.reducer; 
//API call services will come here

import axios from "axios";
import { API_URL } from '../Utils/Urls';
import { CONFIRMATION_EMAIL } from '../Utils/Constants';
import { ApiResponse } from '../types';

const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

interface Location {
  state?: {
    event_slot: {
      start_time: string;
      end_time: string;
    };
    event_date: string;
  };
}

interface User {
  first_name: string;
  identification_code: string;
  email: string;
}

interface Event {
  agencyName: string;
  eventName: string;
  eventService: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  phoneNumber: string;
}

const getReservationText = (location: Location): string => {
  return location.state ? `Your reservation time is at <b> ${location.state.event_slot.start_time} - ${location.state.event_slot.end_time}</b> on <b>${location.state.event_date}</b>. ` : "";
};

const getCodeURL = (identification_code: string): string => {
  return `Your QRCode for the Reservation ${CLIENT_URL}qrcode/${identification_code}`;
};

const build_content = (first_name: string, identification_code: string, event: Event, location: Location): string => {
  return `<div><h4 style="color:green; text-align:center"> Your Reservation has been Confirmed.</h4><p> Hi <b>${first_name} </b>, </p><p> You have successfully registered for FreshTrak, ${getReservationText(location)} </p><p>Your confirmation code is ${identification_code.toUpperCase()}.</p><p>${getCodeURL(identification_code)}</p><h4> Event Details :</h4><p>Agency Name: ${event.agencyName}</p><p>Event Name: ${event.eventName}</p><p>Event Service Type: ${event.eventService}</p><p>Address: <br/>${event.eventAddress} <br/>${event.eventCity} <br/>${event.eventState} <br/>${event.eventZip} <br/> ${event.phoneNumber}</p></div>`;
};

export const sendRegistrationConfirmationEmail = async (user: User, event: Event, location: Location): Promise<void> => {
  const { SEND_EMAIL } = API_URL;
  const first_name = user['first_name'];
  const identification_code = user['identification_code'];
  const from = CONFIRMATION_EMAIL['FROM'];
  const subject = CONFIRMATION_EMAIL['SUBJECT'];
  const to = user['email'];
  const content = build_content(first_name, identification_code, event, location);

  try {
    await axios.post<ApiResponse<any>>(SEND_EMAIL, { from, subject, to, content });
  } catch (e) {
    console.log(e);
  }
}; 
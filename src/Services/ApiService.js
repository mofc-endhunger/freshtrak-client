//API call services will come here

import axios from 'axios';
import { API_URL } from '../Utils/Urls';
import { CONFIRMATION_EMAIL } from '../Utils/Constants';
import config from '../config';

const CLIENT_URL = config.CLIENT_URL;

const getReservationText = (location) => {
  return location.state
    ? `Your reservation time is at <b> ${location.state.event_slot.start_time} - ${location.state.event_slot.end_time}</b> on <b>${location.state.event_date}</b>. `
    : '';
};

const getCodeURL = (identification_code) => {
  return `Your QRCode for the Reservation ${CLIENT_URL}qrcode/${identification_code}`;
};

const build_content = (first_name, identification_code, event, location) => {
  return `<div><h4 style="color:green; text-align:center"> Your Reservation has been Confirmed.</h4><p> Hi <b>${first_name} </b>, </p><p> You have successfully registered for FreshTrak, ${getReservationText(
    location,
  )} </p><p>Your confirmation code is ${identification_code.toUpperCase()}.</p><p>${getCodeURL(
    identification_code,
  )}</p><h4> Event Details :</h4><p>Agency Name: ${
    event.agencyName
  }</p><p>Event Name: ${event.eventName}</p><p>Event Service Type: ${
    event.eventService
  }</p><p>Address: <br/>${event.eventAddress} <br/>${event.eventCity} <br/>${
    event.eventState
  } <br/>${event.eventZip} <br/> ${event.phoneNumber}</p></div>`;
};

export const sendRegistrationConfirmationEmail = async (user, event, location) => {
  const { SEND_EMAIL } = API_URL;
  let first_name = user['first_name'];
  let identification_code = user['identification_code'];
  let from = CONFIRMATION_EMAIL['FROM'];
  let subject = CONFIRMATION_EMAIL['SUBJECT'];
  let to = user['email'];
  let content = build_content(first_name, identification_code, event, location);
  try {
    await axios.post(SEND_EMAIL, { from, subject, to, content });
  } catch (e) {
    console.warn(e);
  }
};

/**
 * Event Card Component
 */
import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch } from 'react-redux';
import { MoreVertical } from 'lucide-react';
import { setCurrentEvent } from '../../Store/Events/eventSlice';
import { formatDateDayAndDate } from '../../Utils/DateFormat';
import { RENDER_URL } from '../../Utils/Urls';
import MiniMapComponent from '../General/MiniMapComponent';
import FullMapModalComponent from '../General/FullMapModalComponent';
import localization from '../Localization/LocalizationComponent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { sanitizeHtml } from '../../Utils/sanitizeHtml';
import ImageThumbnailStrip from '../../components/shared/ImageThumbnailStrip';
import '../../Assets/scss/main.scss';

interface EventImage {
  id: number;
  type: string;
  caption: string;
  src: string;
}

interface Event {
  id: string;
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
  eventService: string;
  acceptReservations: boolean;
  acceptInterest: boolean;
  acceptWalkin: boolean;
  eventDetails: string;
  exceptionNote?: string;
  latitude?: number;
  longitude?: number;
  agencyImages?: EventImage[];
  eventImages?: EventImage[];
}

interface Coordinates {
  lat: number;
  lng: number;
}

export type CardVariant = 'tile' | 'list';

interface EventCardComponentProps {
  event: Event;
  registrationView?: boolean;
  alreadyRegistered?: boolean;
  agencyLatitude?: number;
  agencyLongitude?: number;
  targetUrl?: string;
  variant?: CardVariant;
  eventNumber?: number; // For map view - displays the marker number
  isHighlighted?: boolean; // For map view - highlights the card when corresponding marker is hovered
  simplified?: boolean;
}

const EventCardComponent: React.FC<EventCardComponentProps> = (props) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);
  const dispatch = useDispatch();
  const {
    event: {
      id,
      startTime,
      endTime,
      date,
      eventAddress,
      eventCity,
      eventState,
      eventZip,
      phoneNumber,
      agencyName,
      eventName,
      eventService,
      acceptReservations,
      acceptInterest,
      acceptWalkin,
      eventDetails,
      exceptionNote,
      latitude: eventLatitude,
      longitude: eventLongitude,
      agencyImages,
      eventImages,
    },
    registrationView,
    alreadyRegistered,
    agencyLatitude,
    agencyLongitude,
    variant = 'tile',
    eventNumber,
    isHighlighted = false,
    simplified,
  } = props;

  // Fallback: use agency coordinates if event coordinates are missing
  const latitude = eventLatitude || agencyLatitude;
  const longitude = eventLongitude || agencyLongitude;

  const showRsvp = acceptInterest && !acceptReservations;
  const showRsvpOptional = acceptInterest && !acceptReservations && acceptWalkin;
  const showRsvpRequired = acceptInterest && !acceptReservations && !acceptWalkin;

  const handleMapClick = (coordinates: Coordinates, addressData?: any) => {
    setMapCoordinates(coordinates);
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
    setMapCoordinates(null);
  };

  const handleGetDirections = () => {
    const address = `${eventAddress}, ${eventCity}, ${eventState} ${eventZip}`;
    const encodedAddress = encodeURIComponent(address);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(directionsUrl, '_blank');
  };

  const getButton = (buttonName: string, targetUrl: string) => {
    const buttonClass =
      variant === 'list'
        ? 'btn bg-[#392947] text-white py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase min-h-[32px] lg:min-h-[36px] w-full'
        : 'btn bg-[#392947] text-white px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px] w-full';
    return (
      <LinkContainer to={targetUrl}>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            // Store the current search results URL before navigating to event details
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/events/list')) {
              const currentSearch = window.location.search;
              const searchResultsUrl = currentPath + currentSearch;
              sessionStorage.setItem('searchResultsUrl', searchResultsUrl);
            }
            dispatch(setCurrentEvent(props.event));
          }}
        >
          {buttonName}
        </button>
      </LinkContainer>
    );
  };

  const ButtonView = () => {
    const targetUrl =
      props.targetUrl !== undefined
        ? `${props.targetUrl}/${id}`
        : `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
    if (registrationView || alreadyRegistered) {
      return null;
    }
    if (acceptReservations) {
      return getButton(localization.button_reserve_time, targetUrl);
    } else if (showRsvp) {
      return getButton(localization.button_rsvp, targetUrl);
    } else {
      return null;
    }
  };

  // List view layout - horizontal card (compact for map view)
  if (variant === 'list') {
    return (
      <section tabIndex={0} className="w-full py-1">
        <div className="flex flex-row items-stretch">
          {/* Map Pin container - always rendered for alignment, content only shown if event has map coordinates */}
          <div className="flex items-center justify-center w-10 sm:w-12 shrink-0">
            {eventNumber && (
              <div className="relative flex flex-col items-center">
                {/* Pin shape */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                  {eventNumber}
                </div>
                {/* Pin point */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary -mt-0.5"></div>
              </div>
            )}
          </div>

          <div
            className={`flex-1 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
              isHighlighted ? 'ring-2 ring-orange-400' : ''
            }`}
          >
            <div className="flex flex-row">
              {/* Date/Time Section */}
              <div className="bg-text-primary text-white p-2 sm:p-3 lg:p-4 w-[70px] sm:w-[90px] lg:w-[110px] flex flex-col justify-center items-center shrink-0">
                <div className="text-[10px] sm:text-xs font-varela opacity-80 text-center">
                  {formatDateDayAndDate(date)}
                </div>
                <div className="text-xs sm:text-sm font-bold mt-1 text-center whitespace-nowrap">
                  {startTime}
                </div>
                <div className="text-xs sm:text-sm font-bold text-center whitespace-nowrap">
                  {endTime}
                </div>
              </div>

              {/* Main Content Section */}
              <div className="flex-1 p-2 sm:p-3 lg:p-4 flex flex-col sm:flex-row gap-2 overflow-hidden min-w-0">
                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate text-xs sm:text-sm">
                    {agencyName}
                  </div>
                  <div className="font-bold text-gray-700 truncate mt-0.5 text-xs sm:text-sm">
                    {eventName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-varela mt-0.5 truncate">
                    {eventService}
                  </div>

                  {/* Address */}
                  <div className="text-[10px] sm:text-xs font-varela text-gray-600 mt-1 truncate">
                    {eventAddress}, {eventCity} {eventState} {eventZip}
                  </div>

                  {/* Phone - only on larger screens */}
                  {phoneNumber && (
                    <div className="text-[10px] sm:text-xs font-varela text-gray-600 mt-0.5 hidden lg:block">
                      {phoneNumber}
                    </div>
                  )}

                  {/* Exception Note */}
                  {exceptionNote && exceptionNote !== '' && (
                    <div className="text-[10px] sm:text-xs font-varela mt-1">
                      <span className="text-gray-600">
                        {localization.label_service_area_limitations}
                      </span>{' '}
                      <span className="text-red-600" data-testid="exception-note">
                        {exceptionNote}
                      </span>
                    </div>
                  )}

                  {/* RSVP Status Messages */}
                  {!!showRsvpOptional && (
                    <span className="text-red-600 text-[10px] sm:text-xs block mt-1">
                      {localization.text_rsvp_optional_for_event}
                    </span>
                  )}
                  {!!showRsvpRequired && (
                    <span className="text-red-600 text-[10px] sm:text-xs block mt-1">
                      {localization.text_rsvp_required_for_event}
                    </span>
                  )}
                  {alreadyRegistered && (
                    <span className="text-red-600 text-[10px] sm:text-xs block mt-1">
                      {localization.text_already_registered}
                    </span>
                  )}

                  {/* Expandable Details */}
                  {showDetails && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
                      {eventDetails && (
                        <p className="text-[10px] sm:text-xs">
                          <b>{localization.text_information}</b>
                          <br />
                          {eventDetails}
                        </p>
                      )}
                      {((agencyImages && agencyImages.length > 0) ||
                        (eventImages && eventImages.length > 0)) && (
                        <ImageThumbnailStrip
                          agencyImages={agencyImages}
                          eventImages={eventImages}
                          maxVisible={2}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Actions - Ellipsis Menu (visible below sm) */}
                <div className="flex sm:hidden items-start shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-full"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      {((eventDetails && eventDetails.length > 0) ||
                        (agencyImages && agencyImages.length > 0) ||
                        (eventImages && eventImages.length > 0)) && (
                        <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                          {!showDetails
                            ? localization.button_view_details
                            : localization.button_hide_details}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleGetDirections}>
                        {localization.button_get_directions}
                      </DropdownMenuItem>
                      {!!acceptReservations && !registrationView && !alreadyRegistered && (
                        <DropdownMenuItem
                          onClick={() => {
                            dispatch(setCurrentEvent(props.event));
                            window.location.href =
                              props.targetUrl !== undefined
                                ? `${props.targetUrl}/${id}`
                                : `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
                          }}
                        >
                          {localization.button_reserve_time}
                        </DropdownMenuItem>
                      )}
                      {!!showRsvp && !registrationView && !alreadyRegistered && (
                        <DropdownMenuItem
                          onClick={() => {
                            dispatch(setCurrentEvent(props.event));
                            window.location.href =
                              props.targetUrl !== undefined
                                ? `${props.targetUrl}/${id}`
                                : `${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${id}`;
                          }}
                        >
                          {localization.button_rsvp}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop Actions Section (visible sm and up) */}
                <div className="hidden sm:flex flex-col gap-1.5 w-[120px] lg:w-[140px] xl:w-[160px] shrink-0">
                  {((eventDetails && eventDetails.length > 0) ||
                    (agencyImages && agencyImages.length > 0) ||
                    (eventImages && eventImages.length > 0)) && (
                    <button
                      className="btn bg-gray-200 text-[#392947] py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase min-h-[32px] lg:min-h-[36px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(!showDetails);
                      }}
                    >
                      {!showDetails
                        ? localization.button_view_details
                        : localization.button_hide_details}
                    </button>
                  )}
                  <button
                    className="btn bg-gray-200 text-[#392947] py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase min-h-[32px] lg:min-h-[36px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetDirections();
                    }}
                  >
                    {localization.button_get_directions}
                  </button>
                  {ButtonView() && <div onClick={(e) => e.stopPropagation()}>{ButtonView()}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <FullMapModalComponent
          isOpen={showMapModal}
          onClose={handleCloseMapModal}
          coordinates={mapCoordinates}
          address={eventAddress}
          city={eventCity}
          state={eventState}
          zip={eventZip}
          agencyName={agencyName}
          latitude={latitude}
          longitude={longitude}
        />
      </section>
    );
  }

  // Tile view layout - original vertical card
  return (
    <section className={registrationView ? '' : 'lg:col-span-1 xl:col-span-1'} tabIndex={0}>
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-text-primary text-white p-4 rounded-t-lg">
          <div className="text-lg font-bold pb-2 truncate">{agencyName}</div>
          <div className="text-lg font-bold pb-2 truncate">{eventName}</div>
          <div className="flex justify-between text-xs">
            <div className="flex-grow truncate font-varela">{eventService}</div>
          </div>
        </div>
        <div className={`p-4 ${simplified ? '' : 'min-h-[280px]'} flex flex-col justify-between`}>
          <div className="text-sm font-varela flex justify-between mb-2">
            <div className="date-wrapper">{formatDateDayAndDate(date)}</div>
            <div className="timing-wrapper">
              {startTime} - {endTime}
            </div>
          </div>
          <div className="text-xs font-varela max-w-[150px] my-2">
            {eventAddress}
            <br />
            {eventCity} {eventState} {eventZip}
            <br />
            {phoneNumber}
            <br />
          </div>
          {!simplified && (
            <>
              <MiniMapComponent
                address={eventAddress}
                city={eventCity}
                state={eventState}
                zip={eventZip}
                onClick={handleMapClick}
                latitude={latitude}
                longitude={longitude}
              />
              {exceptionNote && exceptionNote !== '' && (
                <div className="text-sm font-varela my-2">
                  {localization.label_service_area_limitations}
                  <br />
                  <span
                    className="text-red-600"
                    data-testid="exception-note"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(exceptionNote),
                    }}
                  />
                  <br />
                </div>
              )}
              {showDetails && (
                <div className="space-y-2">
                  {eventDetails && (
                    <p>
                      <b> {localization.text_information} </b>
                      <br />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(eventDetails),
                        }}
                      />
                    </p>
                  )}
                  {((agencyImages && agencyImages.length > 0) ||
                    (eventImages && eventImages.length > 0)) && (
                    <ImageThumbnailStrip agencyImages={agencyImages} eventImages={eventImages} />
                  )}
                </div>
              )}
              {!!showRsvpOptional && (
                <span className="text-red-600 text-sm">
                  {localization.text_rsvp_optional_for_event}
                </span>
              )}
              {!!showRsvpRequired && (
                <span className="text-red-600 text-sm">
                  {localization.text_rsvp_required_for_event}
                </span>
              )}
              {alreadyRegistered && (
                <span className="text-red-600 text-sm">{localization.text_already_registered}</span>
              )}
              <div className="space-y-3 mt-3">
                <div className="flex flex-col gap-2">
                  {((eventDetails && eventDetails.length > 0) ||
                    (agencyImages && agencyImages.length > 0) ||
                    (eventImages && eventImages.length > 0)) && (
                    <button
                      className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
                      onClick={() => {
                        setShowDetails(!showDetails);
                      }}
                    >
                      {!showDetails
                        ? localization.button_view_details
                        : localization.button_hide_details}
                    </button>
                  )}
                  <button
                    className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
                    onClick={handleGetDirections}
                  >
                    {localization.button_get_directions}
                  </button>
                </div>
                {ButtonView() && <div className="w-full">{ButtonView()}</div>}
              </div>
            </>
          )}
        </div>
      </div>
      {!simplified && (
        <FullMapModalComponent
          isOpen={showMapModal}
          onClose={handleCloseMapModal}
          coordinates={mapCoordinates}
          address={eventAddress}
          city={eventCity}
          state={eventState}
          zip={eventZip}
          agencyName={agencyName}
          latitude={latitude}
          longitude={longitude}
        />
      )}
    </section>
  );
};

export default EventCardComponent;

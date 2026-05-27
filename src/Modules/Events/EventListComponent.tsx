/**
 * EventList Component
 * Supports grid view (cards only) and list view (map + cards side by side)
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import EventCardComponent from './EventCardComponent';
import EventMapComponent, { EventLocation } from './EventMapComponent';
import ViewToggle, { ViewMode } from './ViewToggle';
import { formatDateDayAndDate } from '../../Utils/DateFormat';
import '../../Assets/scss/main.scss';
import localization from '../Localization/LocalizationComponent';

const VIEW_MODE_STORAGE_KEY = 'freshtrak_event_view_mode';

// Helper to check if an event has valid map coordinates
const hasValidCoordinates = (event: {
  latitude?: number;
  longitude?: number;
  agencyLatitude?: number;
  agencyLongitude?: number;
}): boolean => {
  const lat = event.latitude || event.agencyLatitude;
  const lng = event.longitude || event.agencyLongitude;

  // Check if coordinates exist and are not "0.0" or 0
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return false;
  }

  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

  // Invalid if 0, NaN, or very close to 0
  if (isNaN(latNum) || isNaN(lngNum) || Math.abs(latNum) < 0.0001 || Math.abs(lngNum) < 0.0001) {
    return false;
  }

  return true;
};

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
  agencyLatitude?: number;
  agencyLongitude?: number;
  agencyImages?: EventImage[];
  eventImages?: EventImage[];
  [key: string]: any;
}

interface ReservedEvent {
  id: string;
  [key: string]: any;
}

interface EventListComponentProps {
  events: Record<string, Event[]>;
  showHeader?: boolean;
  zipCode: string;
  distance?: number;
  targetUrl?: string;
  registrationView?: boolean;
  reservedEvents?: ReservedEvent[];
  lastItemRef?: (node: HTMLElement | null) => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

const EventListComponent: React.FC<EventListComponentProps> = ({
  events,
  showHeader = true,
  zipCode,
  distance = 10,
  targetUrl,
  registrationView,
  reservedEvents,
  lastItemRef,
  loadingMore = false,
  hasMore = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'list' || stored === 'grid' ? stored : 'grid';
  });
  const [highlightedEventIndex, setHighlightedEventIndex] = useState<number | null>(null);
  const [focusedMapIndex, setFocusedMapIndex] = useState<number | null>(null);

  // Refs for card elements and map container to enable scrolling
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const listContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const isRegisteredEvent = (event: Event): boolean => {
    const found =
      reservedEvents &&
      reservedEvents.find((reservedEvent) => {
        return reservedEvent.id === event.id;
      });
    return !!found;
  };

  // Flatten all events into a single array for map display and numbering
  const flattenedEvents = useMemo((): EventLocation[] => {
    const allEvents: EventLocation[] = [];
    Object.values(events).forEach((eventGroup) => {
      eventGroup.forEach((ev) => {
        allEvents.push({
          id: ev.id,
          eventName: ev.eventName,
          agencyName: ev.agencyName,
          eventAddress: ev.eventAddress,
          eventCity: ev.eventCity,
          eventState: ev.eventState,
          eventZip: ev.eventZip,
          latitude: ev.latitude,
          longitude: ev.longitude,
          agencyLatitude: ev.agencyLatitude,
          agencyLongitude: ev.agencyLongitude,
          startTime: ev.startTime,
          endTime: ev.endTime,
          date: ev.date,
        });
      });
    });
    return allEvents;
  }, [events]);

  // Get event index in flattened array for numbering
  const getEventIndex = useCallback(
    (eventId: string): number => {
      return flattenedEvents.findIndex((ev) => ev.id === eventId);
    },
    [flattenedEvents],
  );

  const handleMarkerHover = (_event: EventLocation | null, index: number | null) => {
    setHighlightedEventIndex(index);
  };

  // Handle marker click - scroll to corresponding card
  const handleMarkerClick = useCallback(
    (event: EventLocation, _index: number) => {
      const cardElement = cardRefsMap.current.get(event.id);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        // Briefly highlight the card
        setHighlightedEventIndex(getEventIndex(event.id));
        setTimeout(() => setHighlightedEventIndex(null), 2000);
      }
    },
    [getEventIndex],
  );

  // Handle card click - scroll to map if needed, then pan map to marker
  const handleCardClick = useCallback(
    (eventId: string) => {
      const index = flattenedEvents.findIndex((ev) => ev.id === eventId);
      if (index >= 0) {
        // First, scroll the map into view if it's not visible
        if (mapContainerRef.current) {
          const mapRect = mapContainerRef.current.getBoundingClientRect();
          const isMapInView = mapRect.top < window.innerHeight && mapRect.bottom > 0;

          if (!isMapInView) {
            mapContainerRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            // Wait for scroll to complete before focusing marker
            setTimeout(() => {
              setFocusedMapIndex(index);
              setTimeout(() => setFocusedMapIndex(null), 1000);
            }, 500);
          } else {
            setFocusedMapIndex(index);
            setTimeout(() => setFocusedMapIndex(null), 1000);
          }
        } else {
          setFocusedMapIndex(index);
          setTimeout(() => setFocusedMapIndex(null), 1000);
        }
      }
    },
    [flattenedEvents],
  );

  // Register card ref
  const setCardRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefsMap.current.set(id, element);
    } else {
      cardRefsMap.current.delete(id);
    }
  }, []);

  // Grid view - original layout
  if (viewMode === 'grid') {
    return (
      <div className="space-y-8" aria-live="polite">
        {showHeader && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {localization.resource_zip_code_events} {zipCode}
            </h2>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        )}
        {Object.keys(events).length === 0 && (
          <h3 className="text-xl font-semibold text-gray-700">
            {localization.no_events_scheduled}
          </h3>
        )}
        {Object.keys(events).length > 0 &&
          (() => {
            const dateEntries = Object.entries(events);
            const lastDateIndex = dateEntries.length - 1;

            return dateEntries.map(([date, event], dateIndex) => {
              const isLastDateGroup = dateIndex === lastDateIndex;
              const lastEventIndex = event.length - 1;

              return (
                <div key={date} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {formatDateDayAndDate(date)}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event &&
                      event.map((ev, evIdx) => {
                        const isLastItem = isLastDateGroup && evIdx === lastEventIndex;
                        return (
                          <div
                            key={ev.id}
                            ref={isLastItem && lastItemRef ? lastItemRef : undefined}
                          >
                            <EventCardComponent
                              event={ev}
                              targetUrl={targetUrl}
                              registrationView={registrationView}
                              alreadyRegistered={isRegisteredEvent(ev)}
                              variant="tile"
                              agencyLatitude={ev.agencyLatitude}
                              agencyLongitude={ev.agencyLongitude}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            });
          })()}

        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{localization.loading_more_events || 'Loading more events...'}</span>
            </div>
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && Object.keys(events).length > 0 && !loadingMore && (
          <div className="text-center py-4 text-gray-500">
            <span>{localization.no_more_events || 'No more events to load'}</span>
          </div>
        )}
      </div>
    );
  }

  // List view - Map + List side by side
  return (
    <div className="space-y-4" aria-live="polite">
      {showHeader && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {localization.resource_zip_code_events} {zipCode}
          </h2>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      )}
      {Object.keys(events).length === 0 && (
        <h3 className="text-xl font-semibold text-gray-700">{localization.no_events_scheduled}</h3>
      )}
      {Object.keys(events).length > 0 && (
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Map Section */}
          <div ref={mapContainerRef} className="w-full xl:w-2/5 xl:sticky xl:top-4 xl:self-start">
            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
              <EventMapComponent
                key={`map-${zipCode}-${distance}`}
                events={flattenedEvents}
                zipCode={zipCode}
                distance={distance}
                onMarkerHover={handleMarkerHover}
                onMarkerClick={handleMarkerClick}
                highlightedIndex={highlightedEventIndex}
                focusedIndex={focusedMapIndex}
                className="h-[350px] xl:h-[calc(100vh-200px)]"
              />
            </div>
          </div>

          {/* List Section */}
          <div
            ref={listContainerRef}
            className="w-full xl:w-3/5 xl:max-h-[calc(100vh-200px)] xl:overflow-y-auto"
          >
            <div className="space-y-6 px-4">
              {(() => {
                const dateEntries = Object.entries(events);
                const lastDateIndex = dateEntries.length - 1;

                return dateEntries.map(([date, event], dateIndex) => {
                  const isLastDateGroup = dateIndex === lastDateIndex;
                  const lastEventIndex = event.length - 1;

                  return (
                    <div key={date} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 sticky top-0 bg-[#F2F0F4] py-2 z-10">
                        {formatDateDayAndDate(date)}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {event &&
                          event.map((ev, evIdx) => {
                            const eventIndex = getEventIndex(ev.id);
                            const isOnMap = hasValidCoordinates(ev);
                            const isLastItem = isLastDateGroup && evIdx === lastEventIndex;
                            return (
                              <div
                                key={ev.id}
                                ref={(el) => {
                                  setCardRef(ev.id, el);
                                  if (isLastItem && lastItemRef) {
                                    lastItemRef(el);
                                  }
                                }}
                                className={`${isOnMap ? 'cursor-pointer' : ''}`}
                                onClick={isOnMap ? () => handleCardClick(ev.id) : undefined}
                                onMouseEnter={
                                  isOnMap ? () => setHighlightedEventIndex(eventIndex) : undefined
                                }
                                onMouseLeave={
                                  isOnMap ? () => setHighlightedEventIndex(null) : undefined
                                }
                              >
                                <EventCardComponent
                                  event={ev}
                                  targetUrl={targetUrl}
                                  registrationView={registrationView}
                                  alreadyRegistered={isRegisteredEvent(ev)}
                                  variant="list"
                                  agencyLatitude={ev.agencyLatitude}
                                  agencyLongitude={ev.agencyLongitude}
                                  eventNumber={isOnMap ? eventIndex + 1 : undefined}
                                  isHighlighted={highlightedEventIndex === eventIndex && isOnMap}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>{localization.loading_more_events || 'Loading more events...'}</span>
                  </div>
                </div>
              )}

              {/* End of results indicator */}
              {!hasMore && Object.keys(events).length > 0 && !loadingMore && (
                <div className="text-center py-4 text-gray-500">
                  <span>{localization.no_more_events || 'No more events to load'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventListComponent;

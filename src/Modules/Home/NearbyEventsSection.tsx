import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocodeToZip } from '../../Utils/MapUtils';
import { API_URL, RENDER_URL } from '../../Utils/Urls';
import { EventHandler } from '../../Utils/EventHandler';
import {
  filterEventsByAvailability,
  filterEventsByReservations,
} from '../../Utils/availabilityFilter';
import LoadingSpinner from '../General/LoadingSpinner';
import EventListComponent from '../Events/EventListComponent';
import ViewToggle from '../Events/ViewToggle';
import type { ViewMode } from '../Events/ViewToggle';
import localization from '../Localization/LocalizationComponent';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import type { NearbyEventsSectionProps, FilteredEvents } from './types/home.types';

const NEARBY_MAX_DISTANCE = 25;
const VIEW_MODE_STORAGE_KEY = 'freshtrak_event_view_mode';

type EventFetchStatus = 'idle' | 'loading' | 'done' | 'error';

const NearbyEventsSection: React.FC<NearbyEventsSectionProps> = ({ reservedEvents = [] }) => {
  const { status, coordinates } = useGeolocation();

  /**
   * Visibility rule: the section is shown whenever we successfully geocode
   * the user's position to a zip code. After that point it never hides —
   * API failures or empty results show appropriate inline messages instead
   * of silently removing the section.
   */
  const [resolvedZip, setResolvedZip] = useState<string | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'done' | 'failed'>(
    'idle',
  );

  const [allEvents, setAllEvents] = useState<FilteredEvents>({});
  const [eventFetchStatus, setEventFetchStatus] = useState<EventFetchStatus>('idle');

  // Filter state — availability defaults to 'All' so every nearby event is visible on load
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [reservationsFilter, setReservationsFilter] = useState<boolean>(false);
  const [distanceFilter, setDistanceFilter] = useState<number>(NEARBY_MAX_DISTANCE);
  const [serviceCat, setServiceCat] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'list' || stored === 'grid' ? stored : 'grid';
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Step 1: geocode to zip when location is granted
  useEffect(() => {
    if (status !== 'granted' || !coordinates) return;

    setGeocodeStatus('loading');

    reverseGeocodeToZip(coordinates.latitude, coordinates.longitude).then((zip) => {
      if (!isMountedRef.current) return;
      if (zip) {
        setResolvedZip(zip);
        setGeocodeStatus('done');
      } else {
        setGeocodeStatus('failed');
      }
    });
  }, [status, coordinates]);

  // Step 2: fetch events once we have a zip
  useEffect(() => {
    if (!resolvedZip) return;

    setEventFetchStatus('loading');

    axios
      .get(API_URL.EVENTS_LIST, {
        params: { zip_code: resolvedZip, distance: NEARBY_MAX_DISTANCE },
      })
      .then((resp) => {
        if (!isMountedRef.current) return;

        const agencies = resp.data?.agencies ?? [];
        let processed: FilteredEvents = {};
        try {
          processed = EventHandler(agencies) as FilteredEvents;
        } catch (err) {
          // EventHandler can throw on malformed API data (e.g. null service_category).
          // We still show the section with an empty state rather than hiding it.
          console.error('NearbyEventsSection: EventHandler failed', err);
        }

        setAllEvents(processed);
        setEventFetchStatus('done');
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        console.error('NearbyEventsSection: failed to fetch nearby events', err);
        setEventFetchStatus('error');
      });
  }, [resolvedZip]);

  // Extract unique service categories from the processed event snapshot
  const serviceCategories = useMemo<string[]>(() => {
    const seen = new Set<string>();
    Object.values(allEvents).forEach((events) => {
      events.forEach((e: any) => {
        if (e.eventService) seen.add(e.eventService);
      });
    });
    return Array.from(seen).sort();
  }, [allEvents]);

  // Apply all client-side filters on the stable processed snapshot
  const displayedEvents = useMemo<FilteredEvents>(() => {
    const localFiltered: FilteredEvents = {};
    Object.entries(allEvents).forEach(([date, events]) => {
      let filtered = events;

      if (serviceCat && serviceCat !== 'All') {
        filtered = filtered.filter((e: any) => e.eventService === serviceCat);
      }

      if (distanceFilter < NEARBY_MAX_DISTANCE) {
        filtered = filtered.filter(
          (e: any) =>
            typeof e.estimated_distance !== 'number' || e.estimated_distance <= distanceFilter,
        );
      }

      if (filtered.length > 0) localFiltered[date] = filtered;
    });

    const availFiltered = filterEventsByAvailability(localFiltered, availabilityFilter);
    return filterEventsByReservations(availFiltered, reservationsFilter) as FilteredEvents;
  }, [allEvents, serviceCat, distanceFilter, availabilityFilter, reservationsFilter]);

  // ── Visibility rules ────────────────────────────────────────────────────────
  // Only hide the section when we definitively cannot locate the user.
  if (
    status === 'unavailable' ||
    status === 'denied' ||
    status === 'error' ||
    geocodeStatus === 'failed'
  ) {
    return null;
  }

  // Show a global spinner while we are still locating or geocoding
  const isLocating =
    status === 'idle' ||
    status === 'loading' ||
    geocodeStatus === 'idle' ||
    geocodeStatus === 'loading';

  if (isLocating) {
    return (
      <div
        role="status"
        aria-label={localization.nearby_events_loading}
        data-testid="nearby-events-loading"
        className="py-6"
      >
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  // geocodeStatus === 'done' from here — resolvedZip is set
  return (
    <section
      aria-labelledby="nearby-events-heading"
      data-testid="nearby-events-section"
      className="space-y-3 pb-24"
    >
      {/* Heading row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 id="nearby-events-heading" className="font-bold text-2xl">
          {localization.nearby_events_title} ({resolvedZip})
        </h2>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Event fetch spinner (shown while section is already visible) */}
      {eventFetchStatus === 'loading' && (
        <div className="py-4" role="status" aria-label={localization.nearby_events_loading}>
          <LoadingSpinner size="small" />
        </div>
      )}

      {/* API error */}
      {eventFetchStatus === 'error' && (
        <p className="text-sm text-gray-500 py-4">
          {localization.nearby_events_error || 'Unable to load nearby events. Please try again.'}
        </p>
      )}

      {/* Filter bar + events — visible once fetch completes */}
      {eventFetchStatus === 'done' && (
        <>
          {/* Filter bar */}
          <div
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 py-2 border-b border-gray-200"
            data-testid="nearby-events-filters"
          >
            {/* Distance */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nearby-distance" className="text-sm text-gray-600">
                {localization.by_distance}
              </Label>
              <Select
                value={String(distanceFilter)}
                onValueChange={(v) => setDistanceFilter(Number(v))}
              >
                <SelectTrigger
                  id="nearby-distance"
                  className="h-8 min-w-[100px] text-sm"
                  data-testid="nearby-distance-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="3">3 mi</SelectItem>
                  <SelectItem value="5">5 mi</SelectItem>
                  <SelectItem value="10">10 mi</SelectItem>
                  <SelectItem value="25">25 mi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service category — only rendered when categories are present */}
            {serviceCategories.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nearby-service-cat" className="text-sm text-gray-600">
                  {localization.by_service_catogory}
                </Label>
                <Select
                  value={serviceCat || 'All'}
                  onValueChange={(v) => setServiceCat(v === 'All' ? '' : v)}
                >
                  <SelectTrigger
                    id="nearby-service-cat"
                    className="h-8 min-w-[160px] text-sm"
                    data-testid="nearby-service-cat-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="All">{localization.option_sort_all}</SelectItem>
                    {serviceCategories.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Availability */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nearby-availability" className="text-sm text-gray-600">
                {localization.by_availability}
              </Label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger
                  id="nearby-availability"
                  className="h-8 min-w-[130px] text-sm"
                  data-testid="nearby-availability-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="All">{localization.option_sort_all}</SelectItem>
                  <SelectItem value="today">
                    {localization.option_availability_today || 'Today'}
                  </SelectItem>
                  <SelectItem value="tomorrow">
                    {localization.option_availability_tomorrow || 'Tomorrow'}
                  </SelectItem>
                  <SelectItem value="next_7_days">
                    {localization.option_availability_next_7_days || 'Next 7 Days'}
                  </SelectItem>
                  <SelectItem value="next_2_weeks">
                    {localization.option_availability_next_2_weeks || 'Next 2 Weeks'}
                  </SelectItem>
                  <SelectItem value="this_month">
                    {localization.option_availability_this_month || 'This Month'}
                  </SelectItem>
                  <SelectItem value="next_month">
                    {localization.option_availability_next_month || 'Next Month'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reservations */}
            <div className="flex items-center gap-2 sm:pb-0.5">
              <Switch
                id="nearby-reservations"
                checked={reservationsFilter}
                onCheckedChange={setReservationsFilter}
                data-testid="nearby-reservations-switch"
              />
              <Label htmlFor="nearby-reservations" className="text-sm cursor-pointer">
                {localization.only_reservations}
              </Label>
            </div>
          </div>

          <EventListComponent
            events={displayedEvents}
            zipCode={resolvedZip!}
            distance={distanceFilter}
            showHeader={false}
            viewMode={viewMode}
            targetUrl={RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}
            reservedEvents={reservedEvents}
            hasMore={false}
          />
        </>
      )}
    </section>
  );
};

export default NearbyEventsSection;

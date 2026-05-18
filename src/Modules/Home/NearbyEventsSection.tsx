import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { useGeolocation } from '../../hooks/useGeolocation';
import { reverseGeocodeToZip } from '../../Utils/MapUtils';
import { API_URL, RENDER_URL } from '../../Utils/Urls';
import { EventHandler } from '../../Utils/EventHandler';
import LoadingSpinner from '../General/LoadingSpinner';
import EventListComponent from '../Events/EventListComponent';
import localization from '../Localization/LocalizationComponent';

import type { NearbyEventsSectionProps, FilteredEvents } from './types/home.types';

const NEARBY_DISTANCE_MILES = 25;

const NearbyEventsSection: React.FC<NearbyEventsSectionProps> = ({ reservedEvents = [] }) => {
  const { status, coordinates } = useGeolocation();

  const [nearbyEvents, setNearbyEvents] = useState<FilteredEvents | null>(null);
  const [resolvedZip, setResolvedZip] = useState<string | null>(null);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'done' | 'hidden'>('idle');

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (status !== 'granted' || !coordinates) return;

    const run = async () => {
      if (!isMountedRef.current) return;
      setFetchStatus('loading');

      const zip = await reverseGeocodeToZip(coordinates.latitude, coordinates.longitude);

      if (!zip) {
        if (isMountedRef.current) setFetchStatus('hidden');
        return;
      }

      try {
        const resp = await axios.get(API_URL.EVENTS_LIST, {
          params: { zip_code: zip, distance: NEARBY_DISTANCE_MILES },
        });

        if (!isMountedRef.current) return;

        const agencies = resp.data?.agencies ?? [];
        if (agencies.length === 0) {
          setFetchStatus('hidden');
          return;
        }

        const formatted = EventHandler(agencies) as FilteredEvents;
        const hasAnyEvent = Object.values(formatted).some((list) => list.length > 0);

        if (!hasAnyEvent) {
          setFetchStatus('hidden');
          return;
        }

        setResolvedZip(zip);
        setNearbyEvents(formatted);
        setFetchStatus('done');
      } catch (err) {
        console.error('NearbyEventsSection: failed to fetch nearby events', err);
        if (isMountedRef.current) setFetchStatus('hidden');
      }
    };

    run();
  }, [status, coordinates]);

  // Never mount anything when geolocation is unavailable or denied
  if (
    status === 'unavailable' ||
    status === 'denied' ||
    status === 'error' ||
    fetchStatus === 'hidden'
  ) {
    return null;
  }

  // Show spinner while geolocation is still resolving OR while fetching events
  const isLoading =
    status === 'idle' ||
    status === 'loading' ||
    fetchStatus === 'idle' ||
    fetchStatus === 'loading';

  if (isLoading) {
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

  // Events loaded but nothing to show — hidden per visibility rules
  if (fetchStatus !== 'done' || !nearbyEvents || !resolvedZip) {
    return null;
  }

  return (
    <section
      aria-labelledby="nearby-events-heading"
      data-testid="nearby-events-section"
      className="space-y-4 pb-24"
    >
      <h2 id="nearby-events-heading" className="mb-5 font-bold text-center text-2xl">
        {localization.nearby_events_title} ({resolvedZip})
      </h2>
      <EventListComponent
        events={nearbyEvents}
        zipCode={resolvedZip}
        showHeader={false}
        targetUrl={RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}
        reservedEvents={reservedEvents}
      />
    </section>
  );
};

export default NearbyEventsSection;

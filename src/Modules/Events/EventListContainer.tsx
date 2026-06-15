import React, { useMemo, useEffect } from 'react';
import EventListComponent from './EventListComponent';
import { EventHandler } from '../../Utils/EventHandler';
import {
  filterEventsByAvailability,
  filterEventsByReservations,
} from '../../Utils/availabilityFilter';

interface Agency {
  id: string;
  name: string;
  nickname: string;
  events: any[];
  [key: string]: any;
}

interface EventListContainerProps {
  zipCode: string;
  agencyData: Agency[];
  visibleEventCount?: number;
  availabilityFilter?: string;
  reservationsFilter?: boolean;
  distance?: number;
  lastItemRef?: (node: HTMLElement | null) => void;
  loadingMore?: boolean;
  onHasMoreChange?: (hasMore: boolean) => void;
}

const EventListContainer: React.FC<EventListContainerProps> = ({
  zipCode,
  agencyData,
  visibleEventCount = 30,
  availabilityFilter = 'next_7_days',
  reservationsFilter = false,
  distance = 10,
  lastItemRef,
  loadingMore = false,
  onHasMoreChange,
}) => {
  const allEvents = useMemo(() => EventHandler(agencyData), [agencyData]);

  const filteredEvents = useMemo(() => {
    const availFiltered = filterEventsByAvailability(allEvents, availabilityFilter);
    return filterEventsByReservations(availFiltered, reservationsFilter) as Record<string, any[]>;
  }, [allEvents, availabilityFilter, reservationsFilter]);

  const { visibleEvents, hasMore } = useMemo(() => {
    const sortedDates = Object.keys(filteredEvents).sort((a, b) => {
      const dateA = new Date(a.replace(/\//g, '-'));
      const dateB = new Date(b.replace(/\//g, '-'));
      return dateA.getTime() - dateB.getTime();
    });

    const result: Record<string, any[]> = {};
    let count = 0;

    for (const date of sortedDates) {
      const eventsForDate = filteredEvents[date];
      if (count + eventsForDate.length <= visibleEventCount) {
        result[date] = eventsForDate;
        count += eventsForDate.length;
      } else {
        const remaining = visibleEventCount - count;
        if (remaining > 0) {
          result[date] = eventsForDate.slice(0, remaining);
        }
        break;
      }
    }

    const totalEventCount = sortedDates.reduce((sum, date) => sum + filteredEvents[date].length, 0);

    return { visibleEvents: result, hasMore: count < totalEventCount };
  }, [filteredEvents, visibleEventCount]);

  useEffect(() => {
    onHasMoreChange?.(hasMore);
  }, [hasMore, onHasMoreChange]);

  return (
    <EventListComponent
      events={visibleEvents}
      zipCode={zipCode}
      distance={distance}
      lastItemRef={lastItemRef}
      loadingMore={loadingMore}
      hasMore={hasMore}
    />
  );
};

export default EventListContainer;

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Star } from 'lucide-react';
import { selectFavoriteEventIds } from '../../../Store/Favorites/favoritesSlice';
import { API_URL } from '../../../Utils/Urls';
import EventCardComponent from '../../Events/EventCardComponent';
import { Badge } from '../../../components/ui/badge';

interface EventDate {
  date: string;
  [key: string]: unknown;
}

interface FavoriteEvent {
  id: string;
  eventDates?: EventDate[];
  [key: string]: unknown;
}

const isEventPast = (event: FavoriteEvent): boolean => {
  if (!event.eventDates || event.eventDates.length === 0) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return event.eventDates.every((ed) => {
    const d = new Date(ed.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });
};

const SkeletonCard: React.FC = () => (
  <div
    data-testid="favorites-skeleton"
    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
  >
    <div className="h-16 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const FavoritesTab: React.FC = () => {
  const favoriteEventIds = useSelector(selectFavoriteEventIds);
  const [events, setEvents] = useState<FavoriteEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (favoriteEventIds.length === 0) {
      setEvents([]);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(false);
      const results: FavoriteEvent[] = [];

      for (const eventId of favoriteEventIds) {
        try {
          const resp = await axios.get(`${API_URL.EVENT_URL}/${eventId}`);
          const raw = resp.data?.event ?? resp.data;
          if (!raw) continue;

          // The finder API already filters event_dates to future-only dates.
          // An empty array means no upcoming occurrences (effectively a "past" event).
          const rawEventDates: Array<Record<string, unknown>> = raw.event_dates ?? [];
          const firstDate = rawEventDates[0] ?? {};

          results.push({
            // id: use first event_date.id for card navigation URLs (event_date routes).
            // Falls back to eventId so the card still renders for past events.
            id: String((firstDate.id as number | undefined) ?? eventId),
            // eventId: the parent event's real ID — used by FavoriteButton to
            // match against favoriteEventIds in Redux (was the root cause bug).
            eventId: String((raw.id as number | undefined) ?? eventId),
            eventName: (raw.name as string | undefined) ?? '',
            agencyName: (raw.agency_name as string | undefined) ?? '',
            startTime: String(firstDate.start_time ?? ''),
            endTime: String(firstDate.end_time ?? ''),
            date: String(firstDate.date ?? ''),
            eventAddress: (raw.address as string | undefined) ?? '',
            eventCity: (raw.city as string | undefined) ?? '',
            eventState: (raw.state as string | undefined) ?? '',
            eventZip: (raw.zip as string | undefined) ?? '',
            phoneNumber: (raw.agency_phone as string | undefined) ?? '',
            eventService:
              ((raw.service_category as Record<string, unknown> | undefined)
                ?.service_category_name as string | undefined) ?? '',
            acceptReservations: Boolean(firstDate.accept_reservations),
            acceptInterest: Boolean(firstDate.accept_interest),
            acceptWalkin: Boolean(firstDate.accept_walkin),
            eventDetails: (raw.event_details as string | undefined) ?? '',
            agencyImages: [],
            eventImages: Array.isArray(raw.images) ? raw.images : [],
            // Preserve all raw event_dates so isEventPast can check actual dates.
            eventDates: rawEventDates.map((d) => ({ date: String(d.date ?? ''), ...d })),
          } as unknown as FavoriteEvent);
        } catch {
          // Skip events that fail to load — they may have been deleted
        }
      }

      setEvents(results);
      setLoading(false);
    };

    fetchEvents();
  }, [favoriteEventIds]);

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (!loading && favoriteEventIds.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center gap-4"
        data-testid="favorites-tab-empty"
      >
        <Star className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
        <p className="text-muted-foreground text-sm max-w-xs">
          You haven&apos;t saved any events yet. Tap ★ on any event to save it.
        </p>
      </div>
    );
  }

  // ─── Loading skeletons ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4" data-testid="favorites-tab-loading">
        {favoriteEventIds.map((id) => (
          <SkeletonCard key={id} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="text-center text-muted-foreground py-8 text-sm"
        data-testid="favorites-tab-error"
      >
        Could not load your favorites. Please try again later.
      </p>
    );
  }

  // ─── Event list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4" data-testid="favorites-tab-list">
      {events.map((event) => {
        const past = isEventPast(event);
        return (
          <div
            key={event.id}
            className={past ? 'opacity-60' : undefined}
            data-testid={past ? 'favorites-past-event-wrapper' : 'favorites-event-wrapper'}
          >
            {past && (
              <div className="mb-1">
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                  data-testid="past-event-badge"
                >
                  Past event
                </Badge>
              </div>
            )}
            <EventCardComponent event={event as any} variant="list" registrationView={false} />
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesTab;

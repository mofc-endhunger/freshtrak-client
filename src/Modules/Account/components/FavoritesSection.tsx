import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, AlertCircle, ChevronRight, CalendarDays } from 'lucide-react';
import { selectFavoriteEventIds } from '../../../Store/Favorites/favoritesSlice';
import { API_URL, RENDER_URL } from '../../../Utils/Urls';
import { LoadingCard } from '../../Households/components/LoadingSpinner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import FavoriteButton from '../../../components/shared/FavoriteButton';
import localization from '../../Localization/LocalizationComponent';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventDateEntry {
  /** event_date.id — used for the registration/details page URL */
  eventDateId: string;
  date: string;
  startTime: string;
  endTime: string;
  /** Whether this date accepts reservation or RSVP — controls dialog row clickability */
  acceptReservations: boolean;
  acceptInterest: boolean;
}

interface SavedEvent {
  /** Parent event.id — used for FavoriteButton, API fetch key, and card key */
  eventId: string;
  eventName: string;
  agencyName: string;
  eventAddress: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  /** Upcoming dates sorted ascending */
  upcomingDates: EventDateEntry[];
  /** Most recent past date — shown when there are no upcoming dates */
  mostRecentPastDate: EventDateEntry | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? `${dateString}T12:00:00`
      : dateString;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string): string => timeString || '';

const partitionEventDates = (
  rawEventDates: Array<Record<string, unknown>>,
): { upcoming: EventDateEntry[]; mostRecentPast: EventDateEntry | null } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: EventDateEntry[] = [];
  let mostRecentPast: EventDateEntry | null = null;
  let mostRecentPastTime = -Infinity;

  for (const d of rawEventDates) {
    const dateStr = String(d.date ?? '');
    const t = new Date(`${dateStr}T12:00:00`).getTime();
    if (isNaN(t)) continue;

    const entry: EventDateEntry = {
      eventDateId: String((d.id as number | undefined) ?? ''),
      date: dateStr,
      startTime: String(d.start_time ?? ''),
      endTime: String(d.end_time ?? ''),
      acceptReservations: Boolean(d.accept_reservations),
      acceptInterest: Boolean(d.accept_interest),
    };

    if (t >= today.getTime()) {
      upcoming.push(entry);
    } else if (t > mostRecentPastTime) {
      mostRecentPastTime = t;
      mostRecentPast = entry;
    }
  }

  upcoming.sort((a, b) => {
    const ta = new Date(`${a.date}T12:00:00`).getTime();
    const tb = new Date(`${b.date}T12:00:00`).getTime();
    return ta - tb;
  });

  return { upcoming, mostRecentPast };
};

// ─── DateSelectionDialog ─────────────────────────────────────────────────────

interface DateSelectionDialogProps {
  event: SavedEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DateSelectionDialog: React.FC<DateSelectionDialogProps> = ({ event, open, onOpenChange }) => {
  const navigate = useNavigate();

  if (!event) return null;

  const handleDateClick = (entry: EventDateEntry) => {
    onOpenChange(false);
    navigate(`${RENDER_URL.REGISTRATION_EVENT_DETAILS_URL}/${entry.eventDateId}`, {
      state: { from: RENDER_URL.ACCOUNT_URL },
    });
  };

  const address = [event.eventAddress, event.eventCity, event.eventState, event.eventZip]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white border border-gray-200 text-gray-900 flex flex-col max-h-[80vh]"
        data-testid="date-selection-dialog"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-gray-900 pr-6">{event.agencyName}</DialogTitle>
          <DialogDescription className="text-gray-600">{event.eventName}</DialogDescription>
          {address && <p className="font-noto-sans text-xs text-gray-400 pt-1">{address}</p>}
        </DialogHeader>

        <div className="mt-2 overflow-y-auto min-h-0">
          {event.upcomingDates.length > 0 ? (
            <ul className="divide-y divide-gray-100" data-testid="date-list">
              {event.upcomingDates.map((entry) => {
                const canRegister = entry.acceptReservations || entry.acceptInterest;
                return (
                  <li key={entry.eventDateId}>
                    {canRegister ? (
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-3 py-3 px-1
                                   text-left hover:bg-gray-50 rounded transition-colors group"
                        onClick={() => handleDateClick(entry)}
                        data-testid="date-list-item"
                      >
                        <div>
                          <p className="font-noto-sans text-sm font-medium text-gray-900">
                            {formatDate(entry.date)}
                          </p>
                          {(entry.startTime || entry.endTime) && (
                            <p className="font-noto-sans text-xs text-gray-500 mt-0.5">
                              {formatTime(entry.startTime)}
                              {entry.endTime ? ` – ${formatTime(entry.endTime)}` : ''}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <div
                        className="flex items-center justify-between gap-3 py-3 px-1"
                        data-testid="date-list-item-walkin"
                      >
                        <div>
                          <p className="font-noto-sans text-sm font-medium text-gray-900">
                            {formatDate(entry.date)}
                          </p>
                          {(entry.startTime || entry.endTime) && (
                            <p className="font-noto-sans text-xs text-gray-500 mt-0.5">
                              {formatTime(entry.startTime)}
                              {entry.endTime ? ` – ${formatTime(entry.endTime)}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="font-noto-sans text-xs text-gray-400 shrink-0">
                          Walk-in only
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="font-noto-sans text-sm text-gray-500 py-4 text-center"
              data-testid="no-upcoming-dates"
            >
              No upcoming dates available.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── SavedEventCard ───────────────────────────────────────────────────────────

interface SavedEventCardProps {
  event: SavedEvent;
  onSelectDates: (event: SavedEvent) => void;
}

const SavedEventCard: React.FC<SavedEventCardProps> = ({ event, onSelectDates }) => {
  const hasUpcoming = event.upcomingDates.length > 0;
  const nextDate = event.upcomingDates[0] ?? null;

  const address = [event.eventAddress, event.eventCity, event.eventState, event.eventZip]
    .filter(Boolean)
    .join(', ');

  const handleClick = () => {
    if (hasUpcoming) {
      onSelectDates(event);
    }
  };

  return (
    <Card
      className={`border transition-shadow py-0 rounded-sm ${
        hasUpcoming
          ? 'border-gray-200 hover:shadow-md cursor-pointer'
          : 'border-gray-200 bg-gray-50/50 opacity-60'
      }`}
      onClick={handleClick}
      data-testid="saved-event-card"
    >
      <CardContent className="p-3">
        {/* Header row: agency name + star */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className={`font-noto-sans font-semibold text-base truncate ${
              hasUpcoming ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            {event.agencyName}
          </h3>
          {/* FavoriteButton handles its own stopPropagation */}
          <FavoriteButton eventId={Number(event.eventId)} className="-mt-1 -mr-1 shrink-0" />
        </div>

        {/* Event name */}
        <p
          className={`font-noto-sans text-sm truncate mb-2 ${
            hasUpcoming ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {event.eventName}
        </p>

        {/* Next date preview + upcoming count  */}
        {hasUpcoming && nextDate && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1 text-gray-500">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="font-noto-sans text-xs">
                Next: {formatDate(nextDate.date)}
                {nextDate.startTime && ` · ${nextDate.startTime}`}
              </span>
            </div>
            {event.upcomingDates.length > 1 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-xs px-1.5 py-0"
                data-testid="upcoming-count-badge"
              >
                {event.upcomingDates.length} dates
              </Badge>
            )}
          </div>
        )}

        {/* Address */}
        {address && <p className="font-noto-sans text-xs text-gray-400 truncate mb-2">{address}</p>}

        {/* Past event state */}
        {!hasUpcoming && (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 border border-amber-200 text-xs"
            data-testid="past-event-badge"
          >
            Past event
          </Badge>
        )}

        {/* "See dates" affordance for upcoming events */}
        {hasUpcoming && (
          <div className="flex items-center justify-end mt-1">
            <span className="font-noto-sans text-xs text-primary font-medium">See dates</span>
            <ChevronRight className="w-3.5 h-3.5 text-primary ml-0.5" aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── FavoritesSection ─────────────────────────────────────────────────────────

const FavoritesSection: React.FC = () => {
  const favoriteEventIds = useSelector(selectFavoriteEventIds);
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SavedEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (favoriteEventIds.length === 0) {
      setEvents([]);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const results: SavedEvent[] = [];

      await Promise.allSettled(
        favoriteEventIds.map(async (eventId) => {
          try {
            const resp = await axios.get(`${API_URL.EVENT_URL}/${eventId}`);
            const raw = resp.data?.event ?? resp.data;
            if (!raw) return;

            const rawEventDates: Array<Record<string, unknown>> = raw.event_dates ?? [];
            const { upcoming, mostRecentPast } = partitionEventDates(rawEventDates);

            results.push({
              eventId: String((raw.id as number | undefined) ?? eventId),
              eventName: (raw.name as string | undefined) ?? '',
              agencyName: (raw.agency_name as string | undefined) ?? '',
              eventAddress: (raw.address as string | undefined) ?? '',
              eventCity: (raw.city as string | undefined) ?? '',
              eventState: (raw.state as string | undefined) ?? '',
              eventZip: (raw.zip as string | undefined) ?? '',
              upcomingDates: upcoming,
              mostRecentPastDate: mostRecentPast,
            });
          } catch {
            // Skip events that fail to load — they may have been deleted
          }
        }),
      );

      // Sort: events with upcoming dates first (by next date asc), then past-only events
      results.sort((a, b) => {
        const aHas = a.upcomingDates.length > 0;
        const bHas = b.upcomingDates.length > 0;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (!aHas) return 0;
        const ta = new Date(`${a.upcomingDates[0].date}T12:00:00`).getTime();
        const tb = new Date(`${b.upcomingDates[0].date}T12:00:00`).getTime();
        return ta - tb;
      });

      setEvents(results);
      setLoading(false);
    };

    fetchEvents();
  }, [favoriteEventIds]);

  const handleSelectDates = (event: SavedEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <div className="w-full mt-8" data-testid="favorites-section">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="font-noto-sans font-semibold text-lg text-gray-900">
          {localization.title_saved_events || 'Saved Events'}
        </h2>
        <p className="font-noto-sans text-sm text-gray-500 mt-1">
          {localization.text_saved_events_description || 'Events you have saved for easy access.'}
        </p>
      </div>

      {/* Loading + Content */}
      <LoadingCard
        isLoading={loading}
        operation={localization.loading_saved_events || 'Loading saved events...'}
        className="w-full"
      >
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!error && favoriteEventIds.length === 0 && (
          <div
            className="text-center py-12 bg-gray-50 rounded-lg"
            data-testid="favorites-section-empty"
          >
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="font-noto-sans text-base text-gray-500">
              {localization.text_no_saved_events || "You haven't saved any events yet."}
            </p>
            <p className="font-noto-sans text-sm text-gray-400 mt-2">
              {localization.text_save_events_hint || 'Tap ★ on any event to save it here.'}
            </p>
          </div>
        )}

        {/* Event cards */}
        {!error && events.length > 0 && (
          <div className="space-y-4 w-full md:w-1/2" data-testid="favorites-section-list">
            {events.map((event) => (
              <SavedEventCard key={event.eventId} event={event} onSelectDates={handleSelectDates} />
            ))}
          </div>
        )}
      </LoadingCard>

      {/* Date selection dialog — rendered outside the list to avoid nesting issues */}
      <DateSelectionDialog event={selectedEvent} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default FavoritesSection;

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import FavoritesSection from '../FavoritesSection';
import favoritesReducer, { FavoritesState } from '../../../../Store/Favorites/favoritesSlice';
import axios from 'axios';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => mockAxiosInstance),
  };
});
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../../../Modules/Authentication/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

jest.mock('../../../../components/shared/FavoriteButton', () => () => (
  <button data-testid="favorite-button" />
));

jest.mock('../../../../Modules/Households/components/LoadingSpinner', () => ({
  LoadingCard: ({ isLoading, children }: any) =>
    isLoading ? <div data-testid="favorites-loading">Loading...</div> : <div>{children}</div>,
}));

jest.mock('../../../../Utils/Urls', () => ({
  API_URL: {
    EVENT_URL: 'https://finder-api.example.com/api/events',
  },
  RENDER_URL: {
    REGISTRATION_EVENT_DETAILS_URL: '/register/event',
    ACCOUNT_URL: '/account',
  },
}));

jest.mock('../../../../Modules/Localization/LocalizationComponent', () => ({
  __esModule: true,
  default: {
    title_saved_events: 'Saved Events',
    text_saved_events_description: 'Events you have saved for easy access.',
    loading_saved_events: 'Loading saved events...',
    text_no_saved_events: "You haven't saved any events yet.",
    text_save_events_hint: 'Tap ★ on any event to save it here.',
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildStore = (favoriteEventIds: number[]) =>
  configureStore({
    reducer: { favorites: favoritesReducer },
    preloadedState: {
      favorites: { favoriteEventIds, status: 'idle' } as FavoritesState,
    },
  });

const renderSection = (favoriteIds: number[]) => {
  const store = buildStore(favoriteIds);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <FavoritesSection />
      </MemoryRouter>
    </Provider>,
  );
};

const FUTURE_DATE_1 = '2099-12-28';
const FUTURE_DATE_2 = '2099-12-29';
const FUTURE_DATE_3 = '2099-12-30';
const PAST_DATE = '2000-01-01';

interface DateOptions {
  accept_reservations?: number;
  accept_interest?: number;
  accept_walkin?: number;
}

/**
 * Builds a mock axios response for a single event.
 * event_date.id = eventId * 1000 + index for predictable navigation assertions.
 * Default: walk-in only (no reservations, no interest).
 * Pass dateOptions to override per-call.
 */
const makeEventResponse = (id: number, dates: string[], dateOptions: DateOptions = {}) => ({
  data: {
    event: {
      id,
      name: `Event ${id}`,
      agency_name: `Agency ${id}`,
      address: '123 Main St',
      city: 'Grove City',
      state: 'OH',
      zip: '43123',
      event_dates: dates.map((d, i) => ({
        id: id * 1000 + i,
        date: d,
        start_time: '9 AM',
        end_time: '11 AM',
        accept_reservations: dateOptions.accept_reservations ?? 0,
        accept_interest: dateOptions.accept_interest ?? 0,
        accept_walkin: dateOptions.accept_walkin ?? 1,
      })),
    },
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FavoritesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  // ── Section Header ──────────────────────────────────────────────────────────

  describe('section header', () => {
    it('renders the section title', () => {
      renderSection([]);
      expect(screen.getByText('Saved Events')).toBeInTheDocument();
    });

    it('renders the section description', () => {
      renderSection([]);
      expect(screen.getByText('Events you have saved for easy access.')).toBeInTheDocument();
    });
  });

  // ── Empty State ─────────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders the empty state when there are no favorited events', () => {
      renderSection([]);
      expect(screen.getByTestId('favorites-section-empty')).toBeInTheDocument();
      expect(screen.getByText(/haven't saved any events yet/i)).toBeInTheDocument();
    });

    it('shows the save hint text', () => {
      renderSection([]);
      expect(screen.getByText(/tap ★ on any event/i)).toBeInTheDocument();
    });
  });

  // ── Loading ─────────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows the loading indicator while events are being fetched', () => {
      mockedAxios.get.mockReturnValue(new Promise(() => {}));
      renderSection([101]);
      expect(screen.getByTestId('favorites-loading')).toBeInTheDocument();
    });
  });

  // ── Level 1 Cards ───────────────────────────────────────────────────────────

  describe('level 1: event cards', () => {
    it('renders exactly one card per favorited event regardless of date count', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1, FUTURE_DATE_2]))
        .mockResolvedValueOnce(makeEventResponse(202, [FUTURE_DATE_3]));

      renderSection([101, 202]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-section-list')).toBeInTheDocument();
      });
      expect(screen.getAllByTestId('saved-event-card')).toHaveLength(2);
    });

    it('displays agency name and event name on the card', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));

      renderSection([101]);

      await waitFor(() => {
        expect(screen.getByText('Agency 101')).toBeInTheDocument();
      });
      expect(screen.getByText('Event 101')).toBeInTheDocument();
    });

    it('shows the "N dates" badge when there are multiple upcoming dates', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1, FUTURE_DATE_2, FUTURE_DATE_3]),
      );

      renderSection([101]);

      await waitFor(() => {
        expect(screen.getByTestId('upcoming-count-badge')).toBeInTheDocument();
      });
      expect(screen.getByTestId('upcoming-count-badge')).toHaveTextContent('3 dates');
    });

    it('does not show the badge when there is only one upcoming date', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));

      renderSection([101]);

      await waitFor(() => {
        expect(screen.getByTestId('saved-event-card')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('upcoming-count-badge')).not.toBeInTheDocument();
    });

    it('renders a FavoriteButton on each card', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]))
        .mockResolvedValueOnce(makeEventResponse(202, [FUTURE_DATE_2]));

      renderSection([101, 202]);

      await waitFor(() => {
        expect(screen.getAllByTestId('favorite-button')).toHaveLength(2);
      });
    });

    it('shows the "Past event" badge and no "See dates" affordance for all-past events', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(303, [PAST_DATE]));

      renderSection([303]);

      await waitFor(() => {
        expect(screen.getByTestId('past-event-badge')).toBeInTheDocument();
      });
      expect(screen.queryByText('See dates')).not.toBeInTheDocument();
    });

    it('does not open dialog when clicking a past-only event card', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(303, [PAST_DATE]));

      renderSection([303]);

      await waitFor(() => {
        expect(screen.getByTestId('saved-event-card')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByTestId('saved-event-card'));

      expect(screen.queryByTestId('date-selection-dialog')).not.toBeInTheDocument();
    });

    it('skips events that fail to load without crashing', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(makeEventResponse(202, [FUTURE_DATE_1]));

      renderSection([101, 202]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-section-list')).toBeInTheDocument();
      });
      expect(screen.getAllByTestId('saved-event-card')).toHaveLength(1);
    });
  });

  // ── Sort Order ──────────────────────────────────────────────────────────────

  describe('sort order', () => {
    it('renders upcoming events before past-only events', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(makeEventResponse(999, [PAST_DATE]))
        .mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));

      renderSection([999, 101]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-section-list')).toBeInTheDocument();
      });

      const cards = screen.getAllByTestId('saved-event-card');
      // The upcoming event (Agency 101) must come before the past one (Agency 999)
      expect(within(cards[0]).getByText('Agency 101')).toBeInTheDocument();
      expect(within(cards[1]).getByText('Agency 999')).toBeInTheDocument();
    });
  });

  // ── Level 2 Dialog ──────────────────────────────────────────────────────────

  describe('level 2: date selection dialog', () => {
    it('opens the dialog when clicking an upcoming event card', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      expect(screen.getByTestId('date-selection-dialog')).toBeInTheDocument();
    });

    it('shows all upcoming dates in the dialog', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1, FUTURE_DATE_2, FUTURE_DATE_3], {
          accept_reservations: 1,
        }),
      );
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      expect(screen.getAllByTestId('date-list-item')).toHaveLength(3);
    });

    it('renders reservation dates as clickable rows', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1], { accept_reservations: 1 }),
      );
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      expect(screen.getByTestId('date-list-item')).toBeInTheDocument();
      expect(screen.queryByTestId('date-list-item-walkin')).not.toBeInTheDocument();
    });

    it('renders interest-only dates as clickable rows', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1], { accept_interest: 1 }),
      );
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      expect(screen.getByTestId('date-list-item')).toBeInTheDocument();
    });

    it('renders walk-in-only dates as non-clickable rows with "Walk-in only" label', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      expect(screen.getByTestId('date-list-item-walkin')).toBeInTheDocument();
      expect(screen.queryByTestId('date-list-item')).not.toBeInTheDocument();
      expect(screen.getByText('Walk-in only')).toBeInTheDocument();
    });

    it('does not navigate when a walk-in-only row is present', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [FUTURE_DATE_1]));
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-list-item-walkin');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to the event details page when a reservation date is selected', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1], { accept_reservations: 1 }),
      );
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      await userEvent.click(screen.getByTestId('date-list-item'));
      expect(mockNavigate).toHaveBeenCalledWith('/register/event/101000', {
        state: { from: '/account' },
      });
    });

    it('navigates to the correct date for each reservation row', async () => {
      mockedAxios.get.mockResolvedValueOnce(
        makeEventResponse(101, [FUTURE_DATE_1, FUTURE_DATE_2], { accept_reservations: 1 }),
      );
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await waitFor(() => expect(screen.getAllByTestId('date-list-item')).toHaveLength(2));

      await userEvent.click(screen.getAllByTestId('date-list-item')[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/register/event/101000', {
        state: { from: '/account' },
      });

      await userEvent.click(screen.getByTestId('saved-event-card'));
      await waitFor(() => expect(screen.getAllByTestId('date-list-item')).toHaveLength(2));
      await userEvent.click(screen.getAllByTestId('date-list-item')[1]);
      expect(mockNavigate).toHaveBeenCalledWith('/register/event/101001', {
        state: { from: '/account' },
      });
    });

    it('renders mixed reservation and walk-in rows on the same event', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          event: {
            id: 101,
            name: 'Event 101',
            agency_name: 'Agency 101',
            address: '123 Main St',
            city: 'Grove City',
            state: 'OH',
            zip: '43123',
            event_dates: [
              {
                id: 101000,
                date: FUTURE_DATE_1,
                start_time: '9 AM',
                end_time: '11 AM',
                accept_reservations: 1,
                accept_interest: 0,
                accept_walkin: 0,
              },
              {
                id: 101001,
                date: FUTURE_DATE_2,
                start_time: '9 AM',
                end_time: '11 AM',
                accept_reservations: 0,
                accept_interest: 0,
                accept_walkin: 1,
              },
            ],
          },
        },
      });
      renderSection([101]);
      await screen.findByTestId('saved-event-card');
      await userEvent.click(screen.getByTestId('saved-event-card'));
      await screen.findByTestId('date-selection-dialog');
      expect(screen.getByTestId('date-list-item')).toBeInTheDocument();
      expect(screen.getByTestId('date-list-item-walkin')).toBeInTheDocument();
    });

    it('does not open dialog when clicking a past-only event card', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(303, [PAST_DATE]));
      renderSection([303]);
      await screen.findByTestId('past-event-badge');
      expect(screen.queryByTestId('date-selection-dialog')).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import FavoritesTab from '../FavoritesTab';
import favoritesReducer, { FavoritesState } from '../../../../Store/Favorites/favoritesSlice';

// After the mock factory, axios.get is the jest.fn() we set in the factory.
// We cast it here for ergonomic mock usage in tests.
import axios from 'axios';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Use a factory so axios.create() returns a mock instance before FavoritesApiService
// initialises its module-level singleton (which calls create() immediately).
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

jest.mock('../../../../components/shared/FavoriteButton', () => () => null);

jest.mock('../../../../Modules/Events/EventCardComponent', () => () => (
  <div data-testid="event-card" />
));

jest.mock('../../../../Utils/EventHandler', () => ({
  EventFormat: (raw: any) => ({
    id: String(raw.id),
    eventName: raw.name || 'Mock Event',
    agencyName: raw.agency_name || 'Mock Agency',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    date: raw.event_dates?.[0]?.date || '2099-12-31',
    eventAddress: '123 Main St',
    eventCity: 'Springfield',
    eventState: 'OH',
    eventZip: '43004',
    phoneNumber: '555-0100',
    eventService: 'Food Pantry',
    acceptReservations: false,
    acceptInterest: false,
    acceptWalkin: true,
    eventDetails: '',
    eventDates: raw.event_dates || [],
  }),
}));

jest.mock('../../../../Utils/Urls', () => ({
  API_URL: {
    EVENT_URL: 'https://finder-api.example.com/api/events',
    FAVORITES: 'https://reg-api.example.com/api/favorites',
    FAVORITE_BY_EVENT: (id: number) => `https://reg-api.example.com/api/favorites/${id}`,
  },
}));

jest.mock('../../../../Modules/Localization/LocalizationComponent', () => ({
  button_view_details: 'View Details',
  button_hide_details: 'Hide Details',
  button_get_directions: 'Get Directions',
  button_reserve_time: 'Reserve',
  button_rsvp: 'RSVP',
  text_information: 'Information',
  label_service_area_limitations: 'Limitations',
  text_rsvp_optional_for_event: 'RSVP Optional',
  text_rsvp_required_for_event: 'RSVP Required',
  text_already_registered: 'Already Registered',
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildStore = (favoriteEventIds: number[]) =>
  configureStore({
    reducer: { favorites: favoritesReducer },
    preloadedState: {
      favorites: { favoriteEventIds, status: 'idle' } as FavoritesState,
    },
  });

const renderTab = (favoriteIds: number[]) => {
  const store = buildStore(favoriteIds);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <FavoritesTab />
      </MemoryRouter>
    </Provider>,
  );
};

const futureDate = '2099-12-31';
const pastDate = '2000-01-01';

const makeEventResponse = (id: number, dates: string[]) => ({
  data: {
    event: {
      id,
      name: `Event ${id}`,
      agency_name: `Agency ${id}`,
      event_dates: dates.map((d) => ({ date: d })),
    },
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FavoritesTab', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('empty state', () => {
    it('renders the empty state when there are no favorited events', () => {
      renderTab([]);
      expect(screen.getByTestId('favorites-tab-empty')).toBeInTheDocument();
      expect(screen.getByText(/haven't saved any events yet/i)).toBeInTheDocument();
    });

    it('does not render loading skeletons when list is empty', () => {
      renderTab([]);
      expect(screen.queryByTestId('favorites-tab-loading')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders skeleton cards while events are being fetched', () => {
      // Never resolve to keep loading state
      mockedAxios.get.mockReturnValue(new Promise(() => {}));
      renderTab([101, 202]);
      expect(screen.getByTestId('favorites-tab-loading')).toBeInTheDocument();
      expect(screen.getAllByTestId('favorites-skeleton')).toHaveLength(2);
    });
  });

  describe('populated state', () => {
    it('renders event cards for each favorited event after loading', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(makeEventResponse(101, [futureDate]))
        .mockResolvedValueOnce(makeEventResponse(202, [futureDate]));

      renderTab([101, 202]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-tab-list')).toBeInTheDocument();
      });
      expect(screen.getAllByTestId('event-card')).toHaveLength(2);
    });

    it('does not render the "Past event" badge for events with future dates', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(101, [futureDate]));

      renderTab([101]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-tab-list')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('past-event-badge')).not.toBeInTheDocument();
    });

    it('renders the "Past event" badge for events whose all dates are in the past', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(303, [pastDate]));

      renderTab([303]);

      await waitFor(() => {
        expect(screen.getByTestId('past-event-badge')).toBeInTheDocument();
      });
      expect(screen.getByText('Past event')).toBeInTheDocument();
    });

    it('applies reduced opacity wrapper to past events', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(404, [pastDate]));

      renderTab([404]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-past-event-wrapper')).toBeInTheDocument();
      });
    });

    it('does not apply reduced opacity wrapper to upcoming events', async () => {
      mockedAxios.get.mockResolvedValueOnce(makeEventResponse(505, [futureDate]));

      renderTab([505]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-event-wrapper')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('favorites-past-event-wrapper')).not.toBeInTheDocument();
    });

    it('skips events that fail to load without crashing', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(makeEventResponse(202, [futureDate]));

      renderTab([101, 202]);

      await waitFor(() => {
        expect(screen.getByTestId('favorites-tab-list')).toBeInTheDocument();
      });
      // Only the successfully loaded event renders
      expect(screen.getAllByTestId('event-card')).toHaveLength(1);
    });
  });
});

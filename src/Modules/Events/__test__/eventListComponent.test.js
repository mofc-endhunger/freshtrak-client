import React from 'react';
import { screen } from '@testing-library/react';
import EventListComponent from '../EventListComponent';
import { preformattedEventData, renderWithRouter } from '../../../Testing';

// FavoriteButton is now rendered inside EventCardComponent. Mock it here so
// tests don't need AuthProvider or a full Redux favorites store.
jest.mock('../../../components/shared/FavoriteButton', () => () => null);

// AuthContext is imported by FavoriteButton; provide a safe fallback even
// when the module-level mock above prevents FavoriteButton from rendering.
jest.mock('../../../Modules/Authentication/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

// Ensure axios.create() returns a proper mock instance so FavoritesApiService
// (imported transitively via FavoriteButton → favoritesSlice) does not throw.
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

const VIEW_MODE_STORAGE_KEY = 'freshtrak_event_view_mode';

// Suppress the moment deprecation warning from test-data-bot
const originalWarn = console.warn.bind(console.warn);
beforeAll(() => {
  console.warn = (msg) => !msg.toString().includes('Deprecation warning') && originalWarn(msg);
});
afterAll(() => {
  console.warn = originalWarn;
});

beforeEach(() => {
  localStorage.clear();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function setViewMode(mode) {
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
}

function makeEvents(...agencyNames) {
  return agencyNames.reduce((acc, name, i) => {
    const date = `2099/06/${String(i + 1).padStart(2, '0')}`;
    acc[date] = [{ ...preformattedEventData, id: String(i + 1), date, agencyName: name }];
    return acc;
  }, {});
}

// ─── Existing tests ──────────────────────────────────────────────────────────

describe('EventListComponent', () => {
  describe('empty state', () => {
    it('renders the no-events message when events is an empty object', () => {
      renderWithRouter(<EventListComponent events={{}} />);
      expect(screen.getByText('No Events Currently Scheduled')).toBeInTheDocument();
    });
  });

  describe('grid view (card view)', () => {
    beforeEach(() => setViewMode('grid'));

    it('displays event data when events are passed', () => {
      const events = { [preformattedEventData.date]: [preformattedEventData] };
      renderWithRouter(<EventListComponent events={events} zipCode={43123} />);
      expect(screen.getByText(preformattedEventData.agencyName)).toBeInTheDocument();
      expect(
        screen.getByText(/Resource Events Serving Residents of Zip Code 43123/i),
      ).toBeInTheDocument();
    });

    it('calls lastItemRef with the last card element so infinite scroll can fire', () => {
      const lastItemRef = jest.fn();
      const events = makeEvents('Agency A', 'Agency B', 'Agency C');
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" lastItemRef={lastItemRef} />,
      );
      // The ref callback must have been invoked with a DOM element (not null/undefined)
      expect(lastItemRef).toHaveBeenCalled();
      const calls = lastItemRef.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toBeInstanceOf(HTMLElement);
    });

    it('only attaches lastItemRef to the very last rendered card, not to earlier ones', () => {
      const lastItemRef = jest.fn();
      const events = makeEvents('First Agency', 'Middle Agency', 'Last Agency');
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" lastItemRef={lastItemRef} />,
      );
      // Should be called exactly once (for the sentinel element on the last card)
      expect(lastItemRef).toHaveBeenCalledTimes(1);
    });

    it('does not call lastItemRef when there are no events', () => {
      const lastItemRef = jest.fn();
      renderWithRouter(
        <EventListComponent events={{}} zipCode="43701" lastItemRef={lastItemRef} />,
      );
      expect(lastItemRef).not.toHaveBeenCalled();
    });

    it('shows the loading spinner when loadingMore is true', () => {
      const events = { [preformattedEventData.date]: [preformattedEventData] };
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" loadingMore={true} hasMore={true} />,
      );
      expect(screen.getByText(/loading more events/i)).toBeInTheDocument();
    });

    it('shows the end-of-results indicator when hasMore is false and events exist', () => {
      const events = { [preformattedEventData.date]: [preformattedEventData] };
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" hasMore={false} loadingMore={false} />,
      );
      expect(screen.getByText(/no more events to load/i)).toBeInTheDocument();
    });

    it('does not show the end-of-results indicator when loadingMore is true', () => {
      const events = { [preformattedEventData.date]: [preformattedEventData] };
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" hasMore={false} loadingMore={true} />,
      );
      expect(screen.queryByText(/no more events to load/i)).not.toBeInTheDocument();
    });
  });

  describe('list view (map + cards)', () => {
    beforeEach(() => setViewMode('list'));

    it('calls lastItemRef with the last card element', () => {
      const lastItemRef = jest.fn();
      const events = makeEvents('Agency A', 'Agency B', 'Agency C');
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" lastItemRef={lastItemRef} />,
      );
      expect(lastItemRef).toHaveBeenCalled();
      const lastCall = lastItemRef.mock.calls[lastItemRef.mock.calls.length - 1][0];
      expect(lastCall).toBeInstanceOf(HTMLElement);
    });

    it('only attaches lastItemRef to the last card', () => {
      const lastItemRef = jest.fn();
      const events = makeEvents('First Agency', 'Middle Agency', 'Last Agency');
      renderWithRouter(
        <EventListComponent events={events} zipCode="43701" lastItemRef={lastItemRef} />,
      );
      expect(lastItemRef).toHaveBeenCalledTimes(1);
    });
  });
});

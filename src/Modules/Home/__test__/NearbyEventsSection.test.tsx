import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import NearbyEventsSection from '../NearbyEventsSection';
import type { ReservedEvent } from '../types/home.types';

// ---------------------------------------------------------------------------
// Mock: useGeolocation
// ---------------------------------------------------------------------------
const mockUseGeolocation = jest.fn();
jest.mock('../../../hooks/useGeolocation', () => ({
  useGeolocation: (...args: unknown[]) => mockUseGeolocation(...args),
}));

// ---------------------------------------------------------------------------
// Mock: reverseGeocodeToZip
// ---------------------------------------------------------------------------
const mockReverseGeocodeToZip = jest.fn();
jest.mock('../../../Utils/MapUtils', () => ({
  reverseGeocodeToZip: (...args: unknown[]) => mockReverseGeocodeToZip(...args),
}));

// ---------------------------------------------------------------------------
// Mock: axios
// ---------------------------------------------------------------------------
jest.mock('axios', () => ({ get: jest.fn() }));
const mockAxios = require('axios');

// ---------------------------------------------------------------------------
// Mock: EventHandler — returns a non-empty result so the section becomes visible
// ---------------------------------------------------------------------------
jest.mock('../../../Utils/EventHandler', () => ({
  EventHandler: jest.fn((agencies: unknown[]) => {
    if (!agencies || agencies.length === 0) return {};
    return { '2026/05/26': [{ id: 'evt-1', eventName: 'Food Drive', eventService: 'Food' }] };
  }),
}));

// ---------------------------------------------------------------------------
// Mock: availability + reservations filters — pass-through to avoid date coupling
// ---------------------------------------------------------------------------
jest.mock('../../../Utils/availabilityFilter', () => ({
  filterEventsByAvailability: jest.fn((events: unknown) => events),
  filterEventsByReservations: jest.fn((events: unknown) => events),
}));

// ---------------------------------------------------------------------------
// Mock: EventListComponent
// ---------------------------------------------------------------------------
jest.mock(
  '../../Events/EventListComponent',
  () =>
    function MockEventListComponent({ zipCode }: { zipCode: string }) {
      return <div data-testid="event-list-component">Event list for zip: {zipCode}</div>;
    },
);

// ---------------------------------------------------------------------------
// Mock: ViewToggle
// ---------------------------------------------------------------------------
jest.mock('../../Events/ViewToggle', () => ({
  __esModule: true,
  default: function MockViewToggle({
    viewMode,
    onViewModeChange,
  }: {
    viewMode: string;
    onViewModeChange: (mode: string) => void;
  }) {
    return (
      <div data-testid="view-toggle">
        <button
          data-testid="view-toggle-grid"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
        >
          Grid
        </button>
        <button
          data-testid="view-toggle-list"
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
        >
          List
        </button>
      </div>
    );
  },
}));

// ---------------------------------------------------------------------------
// Mock: shadcn UI primitives
// ---------------------------------------------------------------------------
jest.mock('../../../components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
    ...rest
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-value={value} {...rest}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...rest}>{children}</div>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({
    value,
    children,
    ...rest
  }: {
    value: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button data-testid={`select-item-${value}`} data-value={value} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('../../../components/ui/switch', () => ({
  Switch: ({
    id,
    checked,
    onCheckedChange,
    ...rest
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    [key: string]: unknown;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...rest}
    />
  ),
}));

jest.mock('../../../components/ui/label', () => ({
  Label: ({ children, ...rest }: { children: React.ReactNode; [key: string]: unknown }) => (
    <label {...rest}>{children}</label>
  ),
}));

// ---------------------------------------------------------------------------
// Mock: LoadingSpinner
// ---------------------------------------------------------------------------
jest.mock(
  '../../General/LoadingSpinner',
  () =>
    function MockLoadingSpinner({ size }: { size: string }) {
      return <div data-testid={`loading-spinner-${size}`}>Loading...</div>;
    },
);

// ---------------------------------------------------------------------------
// Mock: Localization
// ---------------------------------------------------------------------------
jest.mock('../../Localization/LocalizationComponent', () => ({
  nearby_events_title: 'Nearby Events',
  nearby_events_loading: 'Finding events near you...',
  nearby_events_error: 'Unable to load nearby events. Please try again.',
  by_distance: 'by Distance',
  by_service_catogory: 'by Service Category',
  by_availability: 'by Availability',
  option_sort_all: 'All',
  option_availability_today: 'Today',
  option_availability_tomorrow: 'Tomorrow',
  option_availability_next_7_days: 'Next 7 Days',
  option_availability_next_2_weeks: 'Next 2 Weeks',
  option_availability_this_month: 'This Month',
  option_availability_next_month: 'Next Month',
  only_reservations: 'Reservations Only',
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_COORDS: GeolocationCoordinates = {
  latitude: 40.7128,
  longitude: -74.006,
  accuracy: 10,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
};

const MOCK_AGENCIES = [
  { id: 'agency-1', name: 'Test Agency', events: [{ id: 1, name: 'Food Drive' }] },
];

const RESERVED_EVENTS: ReservedEvent[] = [];

const renderSection = (reservedEvents = RESERVED_EVENTS) =>
  render(<NearbyEventsSection reservedEvents={reservedEvents} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NearbyEventsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Loading states ─────────────────────────────────────────────────────────

  describe('loading states', () => {
    it("renders a loading spinner while geolocation is in 'loading' status", () => {
      mockUseGeolocation.mockReturnValue({ status: 'loading', coordinates: null, error: null });
      renderSection();
      expect(screen.getByTestId('loading-spinner-medium')).toBeInTheDocument();
      expect(screen.queryByText('Nearby Events')).not.toBeInTheDocument();
    });

    it("renders a loading spinner while geolocation is 'idle'", () => {
      mockUseGeolocation.mockReturnValue({ status: 'idle', coordinates: null, error: null });
      renderSection();
      expect(screen.getByTestId('loading-spinner-medium')).toBeInTheDocument();
    });

    it("has accessible role='status' on the loading container", () => {
      mockUseGeolocation.mockReturnValue({ status: 'loading', coordinates: null, error: null });
      renderSection();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // ── Hidden states (geolocation not available) ──────────────────────────────

  describe('hidden states — section not rendered when location is unavailable', () => {
    const hiddenStatuses = ['denied', 'unavailable', 'error'] as const;

    hiddenStatuses.forEach((status) => {
      it(`renders nothing when status is '${status}'`, () => {
        mockUseGeolocation.mockReturnValue({ status, coordinates: null, error: null });
        const { container } = renderSection();
        expect(container).toBeEmptyDOMElement();
      });
    });

    it('renders nothing when reverseGeocodeToZip returns null (geocoding failed)', async () => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue(null);

      const { container } = renderSection();

      await waitFor(() => expect(container).toBeEmptyDOMElement());
    });
  });

  // ── Section visible after geocoding ───────────────────────────────────────

  describe('section remains visible after zip is resolved, regardless of API outcome', () => {
    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
    });

    it('shows the section with empty events when the API returns no agencies', async () => {
      mockAxios.get.mockResolvedValue({ data: { agencies: [] } });

      renderSection();

      await screen.findByTestId('nearby-events-section');
    });

    it('shows an inline error message (not a blank page) when the API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      renderSection();

      await screen.findByText('Unable to load nearby events. Please try again.');
      // Section container itself is still present
      expect(screen.getByTestId('nearby-events-section')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('still renders the section when EventHandler produces no events (e.g. all event_dates expired)', async () => {
      mockAxios.get.mockResolvedValue({ data: { agencies: MOCK_AGENCIES } });

      // Override EventHandler to return empty — simulates agencies with no upcoming event_dates
      const { EventHandler } = require('../../../Utils/EventHandler');
      (EventHandler as jest.Mock).mockReturnValueOnce({});

      renderSection();

      await screen.findByTestId('nearby-events-section');
    });
  });

  // ── Successful render ──────────────────────────────────────────────────────

  describe('successful render', () => {
    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockResolvedValue({ data: { agencies: MOCK_AGENCIES } });
    });

    it('renders the section heading with the localized title and resolved zip', async () => {
      renderSection();

      await screen.findByRole('heading', { name: /Nearby Events/ });
      expect(screen.getByRole('heading', { name: /Nearby Events/ })).toHaveTextContent('10001');
    });

    it('renders EventListComponent with the resolved zip code', async () => {
      renderSection();

      await waitFor(() => {
        expect(screen.getByTestId('event-list-component')).toBeInTheDocument();
        expect(screen.getByText('Event list for zip: 10001')).toBeInTheDocument();
      });
    });

    it('calls reverseGeocodeToZip with the resolved coordinates', async () => {
      renderSection();

      await waitFor(() =>
        expect(mockReverseGeocodeToZip).toHaveBeenCalledWith(
          MOCK_COORDS.latitude,
          MOCK_COORDS.longitude,
        ),
      );
    });

    it('calls the API with zip_code and distance=25', async () => {
      renderSection();

      await waitFor(() =>
        expect(mockAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            params: expect.objectContaining({ zip_code: '10001', distance: 25 }),
          }),
        ),
      );
    });

    it('passes reservedEvents prop through to EventListComponent', async () => {
      const reservedEvents: ReservedEvent[] = [
        {
          id: 'res-1',
          event_date_id: 'date-1',
          name: 'Reserved Event',
          date: '2026-05-26',
          startTime: '10:00',
          endTime: '12:00',
          eventAddress: '123 Main St',
          eventCity: 'New York',
          eventState: 'NY',
          eventZip: '10001',
          phoneNumber: '555-1234',
          agencyName: 'Agency',
          eventName: 'Reserved Event',
          eventService: 'Food',
          acceptReservations: true,
          acceptInterest: false,
          acceptWalkin: false,
          eventDetails: '',
        },
      ];

      renderSection(reservedEvents);

      await screen.findByTestId('event-list-component');
    });
  });

  // ── Filter bar ─────────────────────────────────────────────────────────────

  describe('filter bar', () => {
    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockResolvedValue({ data: { agencies: MOCK_AGENCIES } });
    });

    it('renders the filter bar after events load', async () => {
      renderSection();
      await screen.findByTestId('nearby-events-filters');
    });

    it('renders the distance select (default 25 mi)', async () => {
      renderSection();

      await screen.findByTestId('nearby-distance-select');
      const wrapper = screen.getByTestId('nearby-distance-select').closest('[data-value]');
      expect(wrapper).toHaveAttribute('data-value', '25');
    });

    it('renders the availability select with "All" as the default', async () => {
      renderSection();

      await screen.findByTestId('nearby-availability-select');
      const wrapper = screen.getByTestId('nearby-availability-select').closest('[data-value]');
      expect(wrapper).toHaveAttribute('data-value', 'All');
    });

    it('renders the reservations switch unchecked by default', async () => {
      renderSection();

      await screen.findByTestId('nearby-reservations-switch');
      expect(screen.getByTestId('nearby-reservations-switch')).not.toBeChecked();
    });

    it('toggling the reservations switch updates its checked state', async () => {
      renderSection();

      await screen.findByTestId('nearby-reservations-switch');
      fireEvent.click(screen.getByTestId('nearby-reservations-switch'));

      expect(screen.getByTestId('nearby-reservations-switch')).toBeChecked();
    });
  });

  // ── View toggle ────────────────────────────────────────────────────────────

  describe('view toggle', () => {
    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockResolvedValue({ data: { agencies: MOCK_AGENCIES } });
    });

    it('renders the ViewToggle in the section heading row', async () => {
      renderSection();
      await screen.findByTestId('view-toggle');
    });

    it('defaults to grid view', async () => {
      localStorage.removeItem('freshtrak_event_view_mode');
      renderSection();

      await waitFor(() => {
        expect(screen.getByTestId('view-toggle-grid')).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByTestId('view-toggle-list')).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('switching to list view updates the toggle state', async () => {
      localStorage.removeItem('freshtrak_event_view_mode');
      renderSection();

      await screen.findByTestId('view-toggle-list');
      fireEvent.click(screen.getByTestId('view-toggle-list'));

      expect(screen.getByTestId('view-toggle-list')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('view-toggle-grid')).toHaveAttribute('aria-pressed', 'false');
    });
  });
});

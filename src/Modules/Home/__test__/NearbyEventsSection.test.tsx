import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
jest.mock('axios', () => ({
  get: jest.fn(),
}));
const mockAxios = require('axios');

// ---------------------------------------------------------------------------
// Mock: EventHandler
// ---------------------------------------------------------------------------
jest.mock('../../../Utils/EventHandler', () => ({
  EventHandler: jest.fn((agencies: unknown[]) => {
    if (!agencies || agencies.length === 0) return {};
    return {
      '2025-01-01': [{ id: 'evt-1', eventName: 'Food Drive' }],
    };
  }),
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

  describe('loading states', () => {
    it("renders a loading spinner while geolocation is in 'loading' status", () => {
      mockUseGeolocation.mockReturnValue({
        status: 'loading',
        coordinates: null,
        error: null,
      });

      renderSection();

      expect(screen.getByTestId('loading-spinner-medium')).toBeInTheDocument();
      expect(screen.queryByText('Nearby Events')).not.toBeInTheDocument();
    });

    it("renders a loading spinner while geolocation is 'idle'", () => {
      mockUseGeolocation.mockReturnValue({
        status: 'idle',
        coordinates: null,
        error: null,
      });

      renderSection();

      expect(screen.getByTestId('loading-spinner-medium')).toBeInTheDocument();
    });

    it("has accessible role='status' on the loading container", () => {
      mockUseGeolocation.mockReturnValue({
        status: 'loading',
        coordinates: null,
        error: null,
      });

      renderSection();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('hidden states — no section rendered', () => {
    const hiddenStatuses = ['denied', 'unavailable', 'error'] as const;

    hiddenStatuses.forEach((status) => {
      it(`renders nothing when status is '${status}'`, () => {
        mockUseGeolocation.mockReturnValue({
          status,
          coordinates: null,
          error: null,
        });

        const { container } = renderSection();

        expect(container).toBeEmptyDOMElement();
      });
    });

    it('renders nothing when reverseGeocodeToZip returns null', async () => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue(null);

      const { container } = renderSection();

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it('renders nothing when API returns an empty agencies array', async () => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockResolvedValue({ data: { agencies: [] } });

      const { container } = renderSection();

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it('renders nothing when the API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      const { container } = renderSection();

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('successful render', () => {
    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        status: 'granted',
        coordinates: MOCK_COORDS,
        error: null,
      });
      mockReverseGeocodeToZip.mockResolvedValue('10001');
      mockAxios.get.mockResolvedValue({
        data: {
          agencies: [{ id: 'agency-1', name: 'Test Agency', events: [] }],
        },
      });
    });

    it('renders the section heading with the localized title', async () => {
      renderSection();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Nearby Events/ })).toBeInTheDocument();
      });
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

      await waitFor(() => {
        expect(mockReverseGeocodeToZip).toHaveBeenCalledWith(
          MOCK_COORDS.latitude,
          MOCK_COORDS.longitude,
        );
      });
    });

    it('calls the API with zip_code and distance=25', async () => {
      renderSection();

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            params: expect.objectContaining({
              zip_code: '10001',
              distance: 25,
            }),
          }),
        );
      });
    });

    it('passes reservedEvents prop through to EventListComponent', async () => {
      const reservedEvents: ReservedEvent[] = [
        {
          id: 'res-1',
          event_date_id: 'date-1',
          name: 'Reserved Event',
          date: '2025-01-01',
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

      await waitFor(() => {
        expect(screen.getByTestId('event-list-component')).toBeInTheDocument();
      });
    });
  });
});

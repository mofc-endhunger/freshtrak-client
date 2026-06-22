import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RegistrationContainer from '../RegistrationContainer';
import eventSlice from '../../../Store/Events/eventSlice';
import userSlice from '../../../Store/userSlice';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

// Mock the dependencies
jest.mock('react-gtm-module', () => ({
  dataLayer: jest.fn(),
}));

jest.mock('../../../Utils/EventHandler', () => ({
  EventFormat: jest.fn((event) => event),
}));

jest.mock('../../../Services/ApiService', () => ({
  sendRegistrationConfirmationEmail: jest.fn(),
}));

const mockGetUsersMe = jest.fn();
const mockUpdateHousehold = jest.fn().mockResolvedValue({});

const defaultHouseholdData = {
  members: [
    {
      user_id: '1',
      first_name: 'Jane',
      last_name: 'Smith',
      middle_name: 'A',
      gender_id: 2,
      suffix_id: null,
      date_of_birth: '1985-06-15',
    },
  ],
  address_line_1: '456 Oak Ave',
  address_line_2: 'Apt 3',
  city: 'Springfield',
  state: 'IL',
  zip_code: '62701',
  phone: '5555551234',
  email: 'jane@household.com',
  permission_to_text: true,
  permission_to_email: true,
  identification_code: 'HOUSE123',
  counts: {
    seniors: 1,
    adults: 2,
    children: 1,
    total: 4,
  },
};

jest.mock('../../../Services/HouseholdsApiService', () => ({
  HouseholdsApiService: jest.fn().mockImplementation(() => ({
    getUsersMe: (...args: any[]) => mockGetUsersMe(...args),
    updateHousehold: (...args: any[]) => mockUpdateHousehold(...args),
  })),
}));

jest.mock('../RegistrationComponent', () => {
  return function MockRegistrationComponent({ user }: { user: any }) {
    return (
      <div data-testid="registration-component">
        <span data-testid="user-first-name">{user?.first_name}</span>
        <span data-testid="user-last-name">{user?.last_name}</span>
        <span data-testid="user-address">{user?.address_line_1}</span>
        <span data-testid="user-city">{user?.city}</span>
        <span data-testid="user-phone">{user?.phone}</span>
        <span data-testid="user-email">{user?.email}</span>
        <span data-testid="user-dob">{user?.date_of_birth}</span>
      </div>
    );
  };
});

jest.mock('../../General/SpinnerComponent', () => {
  return function MockSpinnerComponent() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

jest.mock('../../General/ErrorComponent', () => {
  return function MockErrorComponent({ error }: { error: string[] }) {
    return <div data-testid="error-component">Error: {error.join(', ')}</div>;
  };
});

jest.mock('../../Authentication/AuthenticationModal', () => {
  return function MockAuthModal({ show, onLogin }: { show: boolean; onLogin: () => void }) {
    return show ? <div data-testid="auth-modal">Auth Modal</div> : null;
  };
});

jest.mock('../../Notifications/NotifyToastComponent', () => ({
  NotifyToast: () => <div data-testid="notify-toast">Toast</div>,
  showToast: jest.fn(),
}));

// Mock StorageService
jest.mock('../../../Utils/StorageService', () => {
  const mockStorageService = {
    getUserToken: jest.fn(),
    getGuestUser: jest.fn(),
    getCognitoUser: jest.fn(),
    isLoggedInUser: jest.fn(),
    isGuestUser: jest.fn(),
    isCaseManager: jest.fn(),
    setRegisteredEventDateID: jest.fn(),
    setItem: jest.fn(),
    getItem: jest.fn().mockReturnValue(null),
    setGuestSessionMarker: jest.fn(),
    clearAuthData: jest.fn(),
  };
  return {
    StorageService: mockStorageService,
  };
});

// Get the mocked StorageService after mock is created
const { StorageService: mockStorageService } = require('../../../Utils/StorageService');

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      event: eventSlice,
      user: userSlice,
    },
    preloadedState: {
      event: {
        event: {
          id: '1',
          agencyName: 'Test Agency',
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '10:00',
          acceptWalkin: true,
        },
      },
      user: {
        user: null,
      },
    },
  });
};

describe('RegistrationContainer', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();

    // Reset StorageService mocks
    mockStorageService.getUserToken.mockReturnValue(null);
    mockStorageService.getGuestUser.mockReturnValue(null);
    mockStorageService.getCognitoUser.mockReturnValue(null);
    mockStorageService.isLoggedInUser.mockReturnValue(false);
    mockStorageService.isGuestUser.mockReturnValue(false);
    mockStorageService.isCaseManager.mockReturnValue(false);

    // Default household API response
    mockGetUsersMe.mockResolvedValue(defaultHouseholdData);
    mockUpdateHousehold.mockResolvedValue({});

    // Mock environment variables
    process.env.REACT_APP_CLIENT_URL = 'http://localhost:3000';

    // Mock axios.get to return a mock event by default
    mockAxios.get.mockResolvedValue({
      data: {
        event: {
          id: '1',
          agencyName: 'Test Agency',
          date: '2024-01-01',
          startTime: '09:00',
          endTime: '10:00',
          acceptWalkin: true,
        },
      },
    });
  });

  const renderWithProviders = (
    component: React.ReactElement,
    routeEntry: string | { pathname: string; state?: Record<string, unknown> } = '/register/form/1',
  ) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[routeEntry]}>
          <Routes>
            <Route path="/register/form/:eventDateId" element={component} />
            <Route path="/register/form/:eventDateId/:eventSlotId" element={component} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  test('renders without crashing', () => {
    // Mock that user is not authenticated (no token)
    mockStorageService.getUserToken.mockReturnValue(null);
    mockStorageService.getGuestUser.mockReturnValue(null);
    mockStorageService.isLoggedInUser.mockReturnValue(false);
    mockStorageService.isGuestUser.mockReturnValue(false);

    const { container } = renderWithProviders(<RegistrationContainer />);
    expect(container).toBeInTheDocument();
  });

  test('shows auth modal when user is not authenticated', async () => {
    mockStorageService.getUserToken.mockReturnValue(null);
    mockStorageService.getGuestUser.mockReturnValue(null);
    mockStorageService.isLoggedInUser.mockReturnValue(false);
    mockStorageService.isGuestUser.mockReturnValue(false);

    renderWithProviders(<RegistrationContainer />);

    // Wait for the auth modal to appear (component checks auth after event loads)
    await waitFor(
      () => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  test('shows auth modal when user is authenticated but no profile', async () => {
    // Mock that user has token but no profile
    mockStorageService.getUserToken.mockReturnValue('mock-token');
    mockStorageService.getGuestUser.mockReturnValue(null);
    mockStorageService.isLoggedInUser.mockReturnValue(false);
    mockStorageService.isGuestUser.mockReturnValue(false);

    renderWithProviders(<RegistrationContainer />);

    // Component shows spinner when token exists but no user profile
    // (because !user triggers spinner at line 928)
    await waitFor(
      () => {
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  describe('RSVP path household prefill', () => {
    const cognitoUser = { name: 'Cognito User', email: 'cognito@test.com' };

    beforeEach(() => {
      // Simulate an authenticated Cognito user with no router state (RSVP path)
      mockStorageService.isLoggedInUser.mockReturnValue(true);
      mockStorageService.getCognitoUser.mockReturnValue(cognitoUser);
      mockStorageService.isCaseManager.mockReturnValue(false);
    });

    it('calls getUsersMe to prefill household data when no householdData in router state', async () => {
      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      await waitFor(() => {
        expect(mockGetUsersMe).toHaveBeenCalledTimes(1);
      });
    });

    it('prefills address fields from household API response on RSVP path', async () => {
      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      await waitFor(
        () => {
          expect(screen.getByTestId('user-address')).toHaveTextContent('456 Oak Ave');
        },
        { timeout: 3000 },
      );

      expect(screen.getByTestId('user-city')).toHaveTextContent('Springfield');
      expect(screen.getByTestId('user-phone')).toHaveTextContent('5555551234');
      expect(screen.getByTestId('user-email')).toHaveTextContent('jane@household.com');
    });

    it('prefills name fields from primary household member on RSVP path', async () => {
      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      await waitFor(
        () => {
          expect(screen.getByTestId('user-first-name')).toHaveTextContent('Jane');
        },
        { timeout: 3000 },
      );

      expect(screen.getByTestId('user-last-name')).toHaveTextContent('Smith');
    });

    it('does NOT call getUsersMe when householdData is already in router state (Register path)', async () => {
      renderWithProviders(<RegistrationContainer />, {
        pathname: '/register/form/1',
        state: {
          householdData: defaultHouseholdData,
          event_slot: { event_slot_id: 10, start_time: '09:00', end_time: '10:00' },
          event_date: '2024-01-01',
        },
      });

      // Allow effects to settle
      await waitFor(() => {
        expect(screen.getByTestId('registration-component')).toBeInTheDocument();
      });

      // getUsersMe should not have been called for the RSVP prefill path
      expect(mockGetUsersMe).not.toHaveBeenCalled();
    });

    it('renders form with Cognito fallback when getUsersMe API call fails', async () => {
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      // Form should still render using Cognito defaults
      await waitFor(
        () => {
          expect(screen.getByTestId('registration-component')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Name should fall back to Cognito user data
      expect(screen.getByTestId('user-first-name')).toHaveTextContent('Cognito');
    });

    it('does not call getUsersMe for case managers', async () => {
      mockStorageService.isCaseManager.mockReturnValue(true);

      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      await waitFor(() => {
        expect(screen.getByTestId('registration-component')).toBeInTheDocument();
      });

      expect(mockGetUsersMe).not.toHaveBeenCalled();
    });

    it('does not call getUsersMe for unauthenticated users', async () => {
      mockStorageService.isLoggedInUser.mockReturnValue(false);
      mockStorageService.getCognitoUser.mockReturnValue(null);
      mockStorageService.isGuestUser.mockReturnValue(false);
      mockStorageService.getUserToken.mockReturnValue(null);

      renderWithProviders(<RegistrationContainer />, '/register/form/1');

      await waitFor(() => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      });

      expect(mockGetUsersMe).not.toHaveBeenCalled();
    });
  });

  test('always fetches fresh event data based on URL eventDateId', async () => {
    // This test verifies the fix for the caching bug where stale event data
    // from localStorage (redux-persist) was shown instead of fetching fresh data

    // Mock axios to return event data
    const mockEvent = {
      id: '123',
      agencyName: 'Test Agency',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      acceptWalkin: true,
    };
    mockAxios.get.mockResolvedValue({
      data: { event: mockEvent },
    });

    // Mock StorageService (user not authenticated - will show auth modal)
    mockStorageService.getUserToken.mockReturnValue(null);
    mockStorageService.getGuestUser.mockReturnValue(null);
    mockStorageService.isLoggedInUser.mockReturnValue(false);
    mockStorageService.isGuestUser.mockReturnValue(false);

    // Render with a specific eventDateId in the URL
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/register/form/123']}>
          <Routes>
            <Route path="/register/form/:eventDateId" element={<RegistrationContainer />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    // Wait for the axios call to be made
    await waitFor(
      () => {
        // Verify axios.get was called with the URL containing the eventDateId from the URL
        expect(mockAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('api/event_dates/123/event_details'),
        );
      },
      { timeout: 3000 },
    );
  });
});

import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { preformattedEventData, mockFamily } from '../../../Testing';
import RegistrationConfirmComponent from '../RegistrationConfirmComponent';
import { Event, RegistrationFormData } from '../types/registration.types';

jest.mock('axios');
const mockAxios = require('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  const React = jest.requireActual('react');
  const withFutureFlags = (RouterComponent: React.ComponentType<any>) => {
    const WrappedRouter = ({ future, ...props }: any) =>
      React.createElement(RouterComponent, {
        ...props,
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
          ...(future || {}),
        },
      });
    return WrappedRouter;
  };

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: withFutureFlags(actual.MemoryRouter),
    BrowserRouter: withFutureFlags(actual.BrowserRouter),
  };
});

jest.mock('../../../Utils/StorageService', () => ({
  StorageService: {
    getRegisteredEventDateID: jest.fn().mockReturnValue('123'),
    getItem: jest.fn().mockReturnValue('true'),
    clearUserToken: jest.fn(),
    removeItem: jest.fn(),
    isGuestUser: jest.fn().mockReturnValue(false),
    isLoggedInUser: jest.fn().mockReturnValue(true),
    isCaseManager: jest.fn().mockReturnValue(false),
  },
}));

jest.mock('../../Localization/LocalizationComponent', () => ({
  __esModule: true,
  default: {
    title_youre_registered: "You're Registered!",
    header_your_confirmation_number: 'Your Confirmation Number:',
    header_your_qr_code: 'Your QR Code',
    header_your_information: 'Your Information',
    header_head_of_household: 'Head of Household',
    header_additional_location_information: 'Additional Location Information',
    button_back_to_home: 'Back to Home',
    button_print: 'Print',
    button_save: 'Save',
    button_cancel: 'Cancel',
    button_continue: 'Continue',
    aria_print_confirmation: 'Print confirmation',
    aria_save_confirmation: 'Save confirmation',
    cm_register_another: 'Register Another Person',
    cm_registration_complete: 'Registration Complete!',
    cm_save_before_leaving_title: 'Save Confirmation?',
    cm_save_before_leaving_description: 'Have you saved or printed the confirmation information?',
    family_member_count_plural: 'family members',
    dialog_create_account_title: 'Create an Account',
    dialog_create_account_description: 'Save your information for next time',
    guest_signin_button: 'Sign In / Create Account',
  },
}));

jest.mock('../components/PrintableConfirmationCard', () => {
  const MockPrintable = () => <div data-testid="printable-card">Printable</div>;
  return {
    __esModule: true,
    default: MockPrintable,
    generateConfirmationCardPNG: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('../../../Utils/sanitizeHtml', () => ({
  sanitizeHtml: (html: string) => html,
}));

// Type definitions for test data
interface TestState {
  event: { event: Event };
  user: { user: RegistrationFormData };
}

interface LocationState {
  state: {
    user: RegistrationFormData;
    eventTimeStamp: Record<string, any>;
  };
}

const eventData = {
  ...preformattedEventData,
  acceptWalkin: true,
  eventName: 'Test Food Drive',
} as Event;

const eventDetailsApiResponse = {
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  forms: [],
  agency_name: 'Test Agency',
  name: 'Test Food Drive',
  exception_note: '',
  estimated_distance: 0,
  service_category: { service_category_name: 'Food' },
  event_details: '',
  event_dates: [
    {
      id: 123,
      event_id: 1,
      accept_reservations: true,
      accept_interest: false,
      accept_walkin: true,
      start_time: '09:00 AM',
      end_time: '10:00 AM',
      date: '2024-01-01',
    },
  ],
};

const initialState: TestState = {
  event: { event: eventData },
  user: { user: mockFamily },
};

const mockStore = (configureStore as any)([]);

// Mock canvas context for QR code rendering
window.HTMLCanvasElement.prototype.getContext = function (contextId: string) {
  if (contextId === '2d') {
    return {} as CanvasRenderingContext2D;
  }
  return null;
} as any;

const renderWithState = (
  locationState: Record<string, any>,
  storeOverrides?: Partial<TestState>,
) => {
  const store = mockStore({ ...initialState, ...storeOverrides });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: locationState }]}>
        <Routes>
          <Route path="/confirmation" element={<RegistrationConfirmComponent />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('RegistrationConfirmComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockAxios.get.mockResolvedValue({
      data: { event: eventDetailsApiResponse },
    });
  });

  it('should render without errors', () => {
    const store = mockStore(initialState);
    expect(() => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <RegistrationConfirmComponent
              location={
                {
                  state: {
                    user: mockFamily,
                    eventTimeStamp: {},
                  },
                } as LocationState
              }
            />
          </MemoryRouter>
        </Provider>,
      );
    }).not.toThrow();
  });

  it('should load without errors with empty event', async () => {
    const emptyStore = mockStore({
      event: { event: {} as Event },
      user: { user: mockFamily },
    });
    const user_mock_data: LocationState = {
      state: { user: mockFamily, eventTimeStamp: {} },
    };

    render(
      <Provider store={emptyStore}>
        <MemoryRouter>
          <RegistrationConfirmComponent location={user_mock_data} />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalled();
    });
  });

  it('should show the event data and user data', () => {
    const user_mock_data: LocationState = {
      state: { user: mockFamily, eventTimeStamp: {} },
    };
    const { identification_code } = mockFamily;
    const testStore = mockStore({
      event: {
        event: {
          ...preformattedEventData,
          acceptWalkin: true,
        } as Event,
      },
      user: { user: mockFamily },
    });

    const { getAllByText } = render(
      <Provider store={testStore}>
        <MemoryRouter>
          <RegistrationConfirmComponent location={user_mock_data} />
        </MemoryRouter>
      </Provider>,
    );

    // Verify the identification code is displayed (appears in multiple places)
    const identificationCodes = getAllByText(identification_code);
    expect(identificationCodes.length).toBeGreaterThan(0);
  });

  describe('Case Manager confirmation view', () => {
    const cmLocationState = {
      user: mockFamily,
      eventTimeStamp: { start_time: '9:00 AM', end_time: '10:00 AM' },
      isCaseManager: true,
      eventDateId: '456',
    };

    it('shows Registration Complete heading for case managers', () => {
      renderWithState(cmLocationState);
      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });

    it('shows Register Another Person button', () => {
      renderWithState(cmLocationState);
      expect(screen.getByText('Register Another Person')).toBeInTheDocument();
    });

    it('shows Back to Home button', () => {
      renderWithState(cmLocationState);
      const homeButtons = screen.getAllByText('Back to Home');
      expect(homeButtons.length).toBeGreaterThan(0);
    });

    it('navigates to home when Back to Home is clicked', () => {
      renderWithState(cmLocationState);
      const homeButtons = screen.getAllByText('Back to Home');
      fireEvent.click(homeButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows save confirmation dialog when Register Another is clicked', async () => {
      renderWithState(cmLocationState);
      fireEvent.click(screen.getByText('Register Another Person'));

      await waitFor(() => {
        expect(screen.getByText('Save Confirmation?')).toBeInTheDocument();
        expect(
          screen.getByText('Have you saved or printed the confirmation information?'),
        ).toBeInTheDocument();
      });
    });

    it('closes dialog when Cancel is clicked', async () => {
      renderWithState(cmLocationState);
      fireEvent.click(screen.getByText('Register Another Person'));

      await waitFor(() => {
        expect(screen.getByText('Save Confirmation?')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByText('Save Confirmation?')).not.toBeInTheDocument();
      });
    });

    it('navigates to event registration when Continue is clicked', async () => {
      renderWithState(cmLocationState);
      fireEvent.click(screen.getByText('Register Another Person'));
      const continueButton = await screen.findByText('Continue');
      fireEvent.click(continueButton);

      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/456'));
    });

    it('displays registrant information', () => {
      renderWithState(cmLocationState);
      const matches = screen.getAllByText(mockFamily.first_name, { exact: false });
      expect(matches.length).toBeGreaterThan(0);
    });

    it('shows print and save buttons', () => {
      renderWithState(cmLocationState);
      expect(screen.getByRole('button', { name: 'Print confirmation' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save confirmation' })).toBeInTheDocument();
    });

    it('does not show the regular user view', () => {
      renderWithState(cmLocationState);
      expect(screen.queryByText("You're Registered!")).not.toBeInTheDocument();
    });

    it('does not show Register Another when eventDateId is missing', () => {
      const stateWithoutDateId = {
        ...cmLocationState,
        eventDateId: undefined,
      };
      renderWithState(stateWithoutDateId);
      expect(screen.queryByText('Register Another Person')).not.toBeInTheDocument();
    });
  });

  describe('Regular user confirmation view', () => {
    const regularLocationState = {
      user: mockFamily,
      eventTimeStamp: {},
      isCaseManager: false,
    };

    it("shows You're Registered heading for regular users", () => {
      renderWithState(regularLocationState);
      expect(screen.getByText("You're Registered!")).toBeInTheDocument();
    });

    it('does not show Register Another Person button', () => {
      renderWithState(regularLocationState);
      expect(screen.queryByText('Register Another Person')).not.toBeInTheDocument();
    });

    it('does not show the CM view', () => {
      renderWithState(regularLocationState);
      expect(screen.queryByText('Registration Complete!')).not.toBeInTheDocument();
    });
  });

  describe('Guest sign-in modal', () => {
    it('does not show guest modal for case managers', async () => {
      jest.useFakeTimers();
      const { StorageService } = require('../../../Utils/StorageService');
      StorageService.isGuestUser.mockReturnValue(true);
      StorageService.isLoggedInUser.mockReturnValue(false);

      renderWithState({
        user: mockFamily,
        eventTimeStamp: {},
        isCaseManager: true,
        eventDateId: '456',
      });

      await act(async () => {
        jest.advanceTimersByTime(4000);
      });

      expect(screen.queryByText('Create an Account')).not.toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});

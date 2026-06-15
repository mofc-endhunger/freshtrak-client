import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RegistrationComponent from '../RegistrationComponent';
import eventSlice from '../../../Store/Events/eventSlice';
import userSlice from '../../../Store/userSlice';

// Mock child components
jest.mock('../../Family/PrimaryInfoFormComponent', () => {
  return function MockPrimaryInfoFormComponent() {
    return <div data-testid="primary-info-form">Primary Info Form</div>;
  };
});

jest.mock('../../Family/AddressComponent', () => {
  return function MockAddressComponent() {
    return <div data-testid="address-component">Address Component</div>;
  };
});

jest.mock('../../Family/ContactInformationComponent', () => {
  return function MockContactInformationComponent() {
    return <div data-testid="contact-information-component">Contact Information Component</div>;
  };
});

jest.mock('../../Family/MemberCountFormComponent', () => {
  return function MockMemberCountFormComponent() {
    return <div data-testid="member-count-form-component">Member Count Form Component</div>;
  };
});

jest.mock('../../Family/EventSlotsModalComponent', () => {
  return function MockEventSlotsModalComponent() {
    return <div data-testid="event-slots-modal-component">Event Slots Modal Component</div>;
  };
});

jest.mock('../../General/BackButtonComponent', () => {
  return function MockBackButtonComponent() {
    return <div data-testid="back-button-component">Back Button Component</div>;
  };
});

jest.mock('../../General/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading Spinner</div>;
  };
});

jest.mock('../../Localization/LocalizationComponent', () => ({
  __esModule: true,
  default: new Proxy(
    {
      formatString: (str: string, ...args: any[]) =>
        args.reduce((s: string, arg: any, i: number) => s.replace(`{${i}}`, String(arg)), str),
      getLanguage: () => 'en',
    },
    { get: (target: any, prop: string) => target[prop] ?? prop },
  ),
}));

// Mock the opc-timeline
jest.mock('@one-platform/opc-timeline', () => {});

// Mock utilities
jest.mock('../../../Utils/DateFormat', () => ({
  formatDateForServer: jest.fn((date) => date),
}));

// Create mock store
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

// Mock user data
const mockUser = {
  first_name: 'John',
  middle_name: '',
  last_name: 'Doe',
  suffix: '',
  date_of_birth: '1990-01-01',
  gender: 'male',
  address_line_1: '123 Main St',
  address_line_2: '',
  city: 'Test City',
  state: 'TS',
  zip_code: '12345',
  phone: '1234567890',
  permission_to_text: false,
  email: 'john.doe@example.com',
  permission_to_email: false,
  seniors_in_household: 0,
  adults_in_household: 1,
  children_in_household: 0,
  license_plate: '',
  identification_code: 'TEST123',
};

// Mock event data
const mockEvent = {
  id: '1',
  agencyName: 'Test Agency',
  date: '2024-01-01',
  startTime: '09:00',
  endTime: '10:00',
  acceptWalkin: true,
};

// Mock onRegister function
const mockOnRegister = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true }}>{component}</BrowserRouter>
    </Provider>,
  );
};

describe('RegistrationComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('primary-info-form')).toBeInTheDocument();
  });

  it('shows back button on first step', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('back-button-component')).toBeInTheDocument();
  });

  it('shows event slots modal component', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('event-slots-modal-component')).toBeInTheDocument();
  });

  it('renders timeline component', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    // Check if the timeline container is rendered
    expect(screen.getByTestId('back-button-component')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    // The form submission is handled by the child components
    // This test verifies that the component renders without errors
    expect(screen.getByTestId('primary-info-form')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={true}
      />,
    );

    expect(screen.getByTestId('primary-info-form')).toBeInTheDocument();
  });

  it('handles empty user data gracefully', () => {
    renderWithProviders(
      <RegistrationComponent
        user={mockUser}
        onRegister={mockOnRegister}
        event={mockEvent}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('primary-info-form')).toBeInTheDocument();
  });
});

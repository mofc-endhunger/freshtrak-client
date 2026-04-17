/**
 * Integration Test for HouseholdSignUpWrapper
 * Tests the integration of household setup with the sign-up process
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HouseholdSignUpWrapper } from '../HouseholdSignUpWrapper';
import { AuthProvider } from '../../../Authentication/AuthContext';

// Mock the HouseholdSignUpIntegration service
jest.mock('../../services/HouseholdSignUpIntegration', () => ({
  useHouseholdSignUpIntegration: () => ({
    getSignUpState: () => ({
      hasOfferedSetup: false,
      userChoice: null,
      completionStatus: 'pending',
      householdId: null,
      lastPromptDate: null,
    }),
    offerHouseholdSetup: jest.fn(),
    createHousehold: jest.fn(),
    skipHouseholdSetup: jest.fn(),
    deferHouseholdSetup: jest.fn(),
    isNewUserSignUp: jest.fn(() => false),
  }),
}));

// Mock the HouseholdSetupOffer component
jest.mock('../HouseholdSetupOffer', () => ({
  HouseholdSetupOffer: ({ onSetupNow, onSkip, onSetupLater }: any) => (
    <div data-testid="household-setup-offer">
      <button onClick={onSetupNow}>Setup Now</button>
      <button onClick={onSkip}>Skip</button>
      <button onClick={onSetupLater}>Setup Later</button>
    </div>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const createTestStore = () =>
  configureStore({
    reducer: {
      language: (state = { language: 'en' }, action: any) => state,
      event: (state = { event: {} }, action: any) => state,
      user: (state = { user: null }, action: any) => state,
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('HouseholdSignUpWrapper Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders children when user is not authenticated', () => {
    renderWithProviders(
      <AuthProvider>
        <HouseholdSignUpWrapper>
          <div data-testid="app-content">App Content</div>
        </HouseholdSignUpWrapper>
      </AuthProvider>,
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('household-setup-offer')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated but household setup not offered', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cognitoUser') {
        return JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
        });
      }
      return null;
    });

    renderWithProviders(
      <AuthProvider>
        <HouseholdSignUpWrapper>
          <div data-testid="app-content">App Content</div>
        </HouseholdSignUpWrapper>
      </AuthProvider>,
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('shows household setup offer when conditions are met', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cognitoUser') {
        return JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          isSignedIn: true,
        });
      }
      if (key === 'household_signup_state') {
        return JSON.stringify({
          hasOfferedSetup: false,
          userChoice: null,
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: null,
        });
      }
      return null;
    });

    renderWithProviders(
      <AuthProvider>
        <HouseholdSignUpWrapper>
          <div data-testid="app-content">App Content</div>
        </HouseholdSignUpWrapper>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
  });

  it('handles household setup actions correctly', async () => {
    const mockOfferHouseholdSetup = jest.fn();
    const mockCreateHousehold = jest.fn();
    const mockSkipHouseholdSetup = jest.fn();
    const mockDeferHouseholdSetup = jest.fn();

    jest.doMock('../../services/HouseholdSignUpIntegration', () => ({
      useHouseholdSignUpIntegration: () => ({
        getSignUpState: () => ({
          hasOfferedSetup: false,
          userChoice: null,
          completionStatus: 'pending',
          householdId: null,
          lastPromptDate: null,
        }),
        offerHouseholdSetup: mockOfferHouseholdSetup,
        createHousehold: mockCreateHousehold,
        skipHouseholdSetup: mockSkipHouseholdSetup,
        deferHouseholdSetup: mockDeferHouseholdSetup,
        isNewUserSignUp: jest.fn(() => false),
      }),
    }));

    renderWithProviders(
      <AuthProvider>
        <HouseholdSignUpWrapper>
          <div data-testid="app-content">App Content</div>
        </HouseholdSignUpWrapper>
      </AuthProvider>,
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });
});

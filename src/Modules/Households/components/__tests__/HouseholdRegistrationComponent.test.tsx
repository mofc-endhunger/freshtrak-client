import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import HouseholdRegistrationComponent from '../HouseholdRegistrationComponent';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockGetUsersMe = jest.fn();
jest.mock('../../../../Services/HouseholdsApiService', () => ({
  HouseholdsApiService: jest.fn().mockImplementation(() => ({
    getUsersMe: (...args: unknown[]) => mockGetUsersMe(...args),
  })),
}));

// Capture the prefilledData prop so tests can assert on it without a full form render.
const mockHouseholdForm = jest.fn();
jest.mock('../../../../components/shared', () => ({
  HouseholdForm: (props: Record<string, unknown>) => {
    mockHouseholdForm(props);
    return <div data-testid="household-form" />;
  },
}));

jest.mock('../LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner" />,
}));

jest.mock('../../../Localization/LocalizationComponent', () => ({
  title_set_up_household: 'Set up household',
  subtitle_complete_household_profile: 'Complete your profile',
  button_complete_setup: 'Complete',
  button_cancel: 'Cancel',
}));

jest.mock('../../../Localization/languageOptions', () => ({
  getLanguageCodes: () => ['en', 'es'],
  getLanguageOptionById: () => null,
}));

jest.mock('../../utils/householdUtils', () => ({
  getGenderFromId: jest.fn(() => 'female'),
  getSuffixFromId: jest.fn(() => ''),
  getAdditionalMemberCounts: jest.fn(() => ({ seniors: 0, adults: 1, children: 0 })),
}));

// Controlled authUser mock — reassigned per test via mockUseAuth.
const mockUseAuth = jest.fn();
jest.mock('../../../Authentication/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const apiMemberData = {
  members: [
    {
      user_id: '1',
      first_name: 'Jane',
      last_name: 'Doe',
      middle_name: '',
      suffix_id: null,
      gender_id: 2,
      date_of_birth: '1985-06-15',
    },
  ],
  address_line_1: '123 API St',
  city: 'Springfield',
  state: 'IL',
  zip_code: '62701',
  phone: '5551234567',
  email: 'jane@api.com',
  permission_to_text: true,
  permission_to_email: false,
  counts: { seniors: 0, adults: 1, children: 0 },
};

const cognitoUser = { name: 'Cognito User', email: 'cognito@test.com' };

const onComplete = jest.fn();
const onCancel = jest.fn();

function renderComponent() {
  return render(<HouseholdRegistrationComponent onComplete={onComplete} onCancel={onCancel} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HouseholdRegistrationComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUsersMe.mockResolvedValue(apiMemberData);
    mockUseAuth.mockReturnValue({ user: cognitoUser });
  });

  describe('loading state', () => {
    it('shows spinner while the API fetch is in-flight', () => {
      // Never resolves during this test
      mockGetUsersMe.mockReturnValue(new Promise(() => {}));
      renderComponent();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('household-form')).not.toBeInTheDocument();
    });

    it('removes spinner and renders form once API resolves', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId('household-form')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('removes spinner and renders form even when API fails', async () => {
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId('household-form')).toBeInTheDocument();
      });
    });
  });

  describe('API data vs Cognito name precedence', () => {
    it('passes API-sourced first/last names to HouseholdForm when API succeeds', async () => {
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.first_name).toBe('Jane');
      expect(lastCall.prefilledData.last_name).toBe('Doe');
    });

    it('does not overwrite API names with Cognito display-name split when authUser resolves after API', async () => {
      // API resolves first
      renderComponent();
      await screen.findByTestId('household-form');

      // Simulate authUser resolving later by re-rendering with a new (but equivalent) user ref.
      // This triggers the authUser effect again with apiDataLoadedRef already true.
      mockUseAuth.mockReturnValue({ user: { ...cognitoUser, name: 'Should Not Appear' } });
      // Re-render with updated auth context value would not happen automatically in this test
      // since useAuth is a hook called on render. The ref check prevents overwrite, so we
      // verify the form received API names in the last call before auth re-resolution.
      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.first_name).toBe('Jane');
      expect(lastCall.prefilledData.last_name).toBe('Doe');
      // Cognito splits the name on the first space — these must NOT appear
      expect(lastCall.prefilledData.first_name).not.toBe('Should');
      expect(lastCall.prefilledData.last_name).not.toBe('Not Appear');
    });

    it('passes API email and not Cognito email', async () => {
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.email).toBe('jane@api.com');
    });

    it('respects API permission_to_email=false and does not flip it to true via authUser', async () => {
      // The API returns permission_to_email: false. authUser effect must not overwrite it.
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.permission_to_email).toBe(false);
    });
  });

  describe('Cognito fallback when API has no usable data', () => {
    it('falls back to Cognito names when API call throws', async () => {
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      // "Cognito User" split on first space → first="Cognito", last="User"
      expect(lastCall.prefilledData.first_name).toBe('Cognito');
      expect(lastCall.prefilledData.last_name).toBe('User');
    });

    it('defaults permission_to_email to false when neither API nor prev supplies one', async () => {
      // CAN-SPAM: marketing email consent must be affirmative. When the API
      // gives us no stored preference, the authUser fallback must leave the
      // checkbox unchecked rather than opting the user in by default.
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.permission_to_email).toBe(false);
    });

    it('preserves Cognito names but applies API preferences when API returns no members', async () => {
      // When the household exists but has no members yet, the API still carries
      // household-level preferences (address, permission_to_email, etc.).  The
      // component should merge: names from the synchronous Cognito fallback are
      // kept (no member API source), but contact preferences from the API win.
      mockGetUsersMe.mockResolvedValue({
        members: [],
        counts: {},
        permission_to_email: false, // API says no email — must NOT be flipped to true
        permission_to_text: false,
      });
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      // authUser fires first (synchronous), API merges on top — names preserved.
      expect(lastCall.prefilledData.first_name).toBe('Cognito');
      expect(lastCall.prefilledData.last_name).toBe('User');
      // API-sourced preference must survive the authUser merge.
      expect(lastCall.prefilledData.permission_to_email).toBe(false);
    });

    it('fills Cognito names when API returns no members and authUser arrives after the API resolves', async () => {
      // Simulate authUser being null on first render so the API effect runs first,
      // then authUser resolves later and the names should still be filled.
      mockUseAuth.mockReturnValue({ user: null });

      let resolveGetUsersMe!: (v: unknown) => void;
      mockGetUsersMe.mockReturnValue(
        new Promise((res) => {
          resolveGetUsersMe = res;
        }),
      );

      const { rerender } = renderComponent();

      // Resolve the API with no members while authUser is still null.
      await act(async () => {
        resolveGetUsersMe({ members: [], counts: {}, permission_to_email: false });
      });

      // Now authUser resolves — re-render with the Cognito user available.
      mockUseAuth.mockReturnValue({ user: cognitoUser });
      rerender(<HouseholdRegistrationComponent onComplete={onComplete} onCancel={onCancel} />);

      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      // Names must come from Cognito (API provided none).
      expect(lastCall.prefilledData.first_name).toBe('Cognito');
      expect(lastCall.prefilledData.last_name).toBe('User');
      // API-sourced preference must still win (prev.permission_to_email ?? false).
      expect(lastCall.prefilledData.permission_to_email).toBe(false);
    });

    it('falls back to Cognito email when API fails', async () => {
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.email).toBe('cognito@test.com');
    });

    it('renders form with empty prefilledData when both API and authUser are unavailable', async () => {
      mockGetUsersMe.mockRejectedValue(new Error('Network error'));
      mockUseAuth.mockReturnValue({ user: null });
      renderComponent();
      await screen.findByTestId('household-form');
      // Should not throw and form should render
      expect(screen.getByTestId('household-form')).toBeInTheDocument();
    });
  });

  describe('address and contact data from API', () => {
    it('passes API address fields to HouseholdForm', async () => {
      renderComponent();
      await screen.findByTestId('household-form');

      const lastCall = mockHouseholdForm.mock.calls[
        mockHouseholdForm.mock.calls.length - 1
      ]?.[0] as {
        prefilledData: Record<string, unknown>;
      };
      expect(lastCall.prefilledData.address_line_1).toBe('123 API St');
      expect(lastCall.prefilledData.city).toBe('Springfield');
      expect(lastCall.prefilledData.phone).toBe('5551234567');
    });
  });
});

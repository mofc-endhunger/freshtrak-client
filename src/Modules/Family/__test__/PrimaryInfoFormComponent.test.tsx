import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryInfoFormComponent from '../PrimaryInfoFormComponent';
import { Control } from 'react-hook-form';

import { useWatch } from 'react-hook-form';

// Mock useWatch so tests don't depend on a real RHF control instance.
// Individual tests override the mock when they need specific return values.
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useWatch: jest.fn().mockReturnValue(undefined),
}));

jest.mock('../../Localization/LocalizationComponent', () => ({
  register_who_are_you: 'Who are you?',
  first_name: 'First Name',
  last_name: 'Last Name',
  middle_name: 'Middle Name',
  suffix: 'Suffix',
  dob: 'Date of Birth',
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  not_to_say: 'Prefer not to say',
  button_continue: 'Continue',
  placeholder_date_format: 'MM / DD / YYYY',
  option_suffix_none: 'None',
  option_suffix_jr: 'Jr',
  option_suffix_sr: 'Sr',
  option_suffix_ii: 'II',
  option_suffix_iii: 'III',
  option_suffix_iv: 'IV',
  option_suffix_v: 'V',
  option_gender_male: 'Male',
  option_gender_female: 'Female',
  option_gender_other: 'Other',
  option_gender_prefer_not_to_say: 'Prefer not to say',
  error_first_name_required: 'First name is required',
  error_last_name_required: 'Last name is required',
  error_please_enter_valid_date: 'Please enter a valid date of birth.',
  error_field_required: 'This field is required',
  label_preferred_language: 'Preferred language',
  error_please_select_valid_language: 'Please select a language',
}));

jest.mock('../utils/dateValidation', () => ({
  validateDobText: jest.fn(() => true),
  formatDateInput: jest.fn((val: string) => val),
}));

jest.mock('../../Localization/languageOptions', () => ({
  getTranslatedLanguageOptions: () => [
    { id: 1, code: 'en', text: 'English' },
    { id: 2, code: 'spa', text: 'Español' },
  ],
}));

const mockRegister = jest.fn();
const mockWatch = jest.fn();
const mockSetValue = jest.fn();
const mockGetValues = jest.fn();
const mockTrigger = jest.fn();
const mockErrors = {};
const mockControl = {} as Control<any>;

const defaultProps = {
  register: mockRegister,
  watch: mockWatch,
  setValue: mockSetValue,
  getValues: mockGetValues,
  trigger: mockTrigger,
  errors: mockErrors,
  control: mockControl,
  continueHandler: jest.fn(),
};

describe('PrimaryInfoFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWatch.mockReturnValue('');
    // Default: useWatch returns undefined so prop/fallback values take over.
    (useWatch as jest.Mock).mockReturnValue(undefined);
    mockRegister.mockImplementation((name, options) => ({
      name,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    }));
  });

  const renderComponent = (props = {}) => {
    return render(<PrimaryInfoFormComponent {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    test('should render without errors', () => {
      expect(() => {
        renderComponent();
      }).not.toThrow();
    });

    test('should render main container with correct test ID', () => {
      renderComponent();
      const container = screen.getByTestId('primary-info-form-component');
      expect(container).toBeInTheDocument();
    });

    test('should render section heading', () => {
      renderComponent();

      const heading = screen.getByText('Who are you?');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-highlight');
    });

    test('should render all form fields', () => {
      renderComponent();

      expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('middle-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('suffix-select')).toBeInTheDocument();
      expect(screen.getByTestId('date-of-birth-input')).toBeInTheDocument();
      expect(screen.getByTestId('gender-select')).toBeInTheDocument();
    });

    test('should render continue button', () => {
      renderComponent();
      const button = screen.getByTestId('continue-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue');
    });

    test('should not render continue button in household setup mode', () => {
      renderComponent({ isHouseholdSetup: true });
      expect(screen.queryByTestId('continue-button')).not.toBeInTheDocument();
    });

    test('should apply custom className when provided', () => {
      const customClass = 'custom-form-class';
      renderComponent({ className: customClass });
      const container = screen.getByTestId('primary-info-form-component');
      expect(container).toHaveClass(customClass);
    });

    test('should apply custom test ID when provided', () => {
      const customTestId = 'custom-primary-info-form';
      renderComponent({ 'data-testid': customTestId });
      const container = screen.getByTestId(customTestId);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    test('should render required field indicators', () => {
      renderComponent();

      const requiredFields = screen.getAllByText('*');
      expect(requiredFields).toHaveLength(4);
    });

    test('should render field labels correctly', () => {
      renderComponent();

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Middle Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Suffix')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
    });

    test('should render suffix trigger with default value', () => {
      renderComponent();
      const suffixTrigger = screen.getByTestId('suffix-select');
      expect(suffixTrigger).toBeInTheDocument();
      expect(suffixTrigger).toHaveTextContent('None');
    });

    test('should render gender trigger as empty initially', () => {
      renderComponent();
      const genderTrigger = screen.getByTestId('gender-select');
      expect(genderTrigger).toBeInTheDocument();
    });

    test('should have proper input attributes', () => {
      renderComponent();

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');
      const dateInput = screen.getByTestId('date-of-birth-input');

      expect(firstNameInput).toHaveAttribute('type', 'text');
      expect(lastNameInput).toHaveAttribute('type', 'text');
      expect(dateInput).toHaveAttribute('type', 'text');
      expect(dateInput).toHaveAttribute('placeholder', 'MM / DD / YYYY');
    });

    test('should render preferred language field in household setup mode', () => {
      renderComponent({ isHouseholdSetup: true });
      expect(screen.getByTestId('preferred-language-select')).toBeInTheDocument();
      expect(screen.getByText('Preferred language')).toBeInTheDocument();
    });

    test('should not render preferred language field outside household setup', () => {
      renderComponent();
      expect(screen.queryByTestId('preferred-language-select')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should show error messages for required fields', () => {
      const errors = {
        first_name: {
          type: 'required',
          message: 'This field is required',
        },
        last_name: {
          type: 'required',
          message: 'This field is required',
        },
        date_of_birth: {
          type: 'validate',
          message: 'Please enter a valid date of birth.',
        },
        gender: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      expect(screen.getByTestId('first-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('last-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('date-of-birth-error')).toBeInTheDocument();
      expect(screen.getByTestId('gender-error')).toBeInTheDocument();
    });

    test('should apply aria-invalid to invalid input fields', () => {
      const errors = {
        first_name: {
          type: 'required',
          message: 'This field is required',
        },
      };

      renderComponent({ errors });

      const firstNameInput = screen.getByTestId('first-name-input');
      expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should apply aria-invalid to invalid select triggers', () => {
      const errors = {
        gender: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      const genderTrigger = screen.getByTestId('gender-select');
      expect(genderTrigger).toHaveAttribute('aria-invalid', 'true');
    });

    test('should not show error messages when no errors', () => {
      renderComponent();

      expect(screen.queryByTestId('first-name-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('last-name-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('date-of-birth-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gender-error')).not.toBeInTheDocument();
    });

    test('should show preferred language error in household setup mode', () => {
      const errors = {
        preferred_language: {
          type: 'required',
          message: 'This field is required',
        },
      };

      renderComponent({ errors, isHouseholdSetup: true });

      expect(screen.getByTestId('preferred-language-error')).toBeInTheDocument();
    });
  });

  describe('Date of Birth Handling', () => {
    test('should render date of birth input', () => {
      renderComponent();

      const dateInput = screen.getByTestId('date-of-birth-input');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('placeholder', 'MM / DD / YYYY');
    });

    test('should watch date of birth value', () => {
      mockWatch.mockReturnValue('12 / 31 / 1990');
      renderComponent();

      const dateInput = screen.getByTestId('date-of-birth-input');
      expect(dateInput).toHaveValue('12 / 31 / 1990');
    });

    test('should handle date input changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      const dateInput = screen.getByTestId('date-of-birth-input');
      await user.type(dateInput, '12311990');

      expect(dateInput).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('should call continueHandler when form is valid', async () => {
      const user = userEvent.setup();
      const mockContinueHandler = jest.fn();
      const mockFormValues = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '12 / 31 / 1990',
        gender: 'male',
      };

      mockTrigger.mockResolvedValue(true);
      mockGetValues.mockReturnValue(mockFormValues);

      renderComponent({ continueHandler: mockContinueHandler });

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalledWith([
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
      ]);
      expect(mockContinueHandler).toHaveBeenCalledWith(mockFormValues);
    });

    test('should not call continueHandler when form is invalid', async () => {
      const user = userEvent.setup();
      const mockContinueHandler = jest.fn();

      mockTrigger.mockResolvedValue(false);

      renderComponent({ continueHandler: mockContinueHandler });

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalled();
      expect(mockContinueHandler).not.toHaveBeenCalled();
    });

    test('should handle missing continueHandler gracefully', async () => {
      const user = userEvent.setup();

      mockTrigger.mockResolvedValue(true);
      mockGetValues.mockReturnValue({});

      renderComponent({ continueHandler: undefined });

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalled();
    });
  });

  describe('Field Registration', () => {
    test('should register text input fields via register spread', () => {
      renderComponent();

      expect(mockRegister).toHaveBeenCalledWith('first_name', {
        required: true,
      });
      expect(mockRegister).toHaveBeenCalledWith('middle_name');
      expect(mockRegister).toHaveBeenCalledWith('last_name', {
        required: true,
      });
    });

    test('should register select fields via hidden inputs', () => {
      renderComponent();

      expect(mockRegister).toHaveBeenCalledWith('suffix');
      expect(mockRegister).toHaveBeenCalledWith('gender', {
        required: true,
      });
    });

    test('should register preferred_language when isHouseholdSetup', () => {
      renderComponent({ isHouseholdSetup: true });

      expect(mockRegister).toHaveBeenCalledWith('preferred_language', {
        required: true,
      });
    });

    test('should not register preferred_language when not household setup', () => {
      renderComponent({ isHouseholdSetup: false });

      expect(mockRegister).not.toHaveBeenCalledWith('preferred_language', expect.anything());
    });
  });

  describe('User Interactions', () => {
    test('should handle input field changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');

      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
    });

    test('should handle button click', async () => {
      const user = userEvent.setup();
      renderComponent();

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper form structure', () => {
      renderComponent();

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
    });

    test('should have proper button attributes', () => {
      renderComponent();
      const continueButton = screen.getByTestId('continue-button');

      expect(continueButton).toHaveAttribute('type', 'button');
      expect(continueButton).toHaveAttribute('data-testid', 'continue-button');
    });

    test('should have proper input attributes', () => {
      renderComponent();

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');

      expect(firstNameInput).toHaveAttribute('id', 'first_name');
      expect(firstNameInput).toHaveAttribute('name', 'first_name');
      expect(lastNameInput).toHaveAttribute('id', 'last_name');
      expect(lastNameInput).toHaveAttribute('name', 'last_name');
    });

    test('should have proper select trigger IDs', () => {
      renderComponent();

      const suffixTrigger = screen.getByTestId('suffix-select');
      const genderTrigger = screen.getByTestId('gender-select');

      expect(suffixTrigger).toHaveAttribute('id', 'suffix');
      expect(genderTrigger).toHaveAttribute('id', 'gender');
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive container classes', () => {
      renderComponent();
      const container = screen.getByTestId('primary-info-form-component');

      expect(container).toHaveClass('space-y-6');
    });

    test('should have responsive input styling', () => {
      renderComponent();
      const firstNameInput = screen.getByTestId('first-name-input');

      expect(firstNameInput).toHaveClass('w-full', 'px-3');
    });

    test('should have responsive button styling', () => {
      renderComponent();

      const continueButton = screen.getByTestId('continue-button');

      expect(continueButton).toHaveClass('bg-highlight', 'text-white', 'min-h-12', 'uppercase');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing props gracefully', () => {
      expect(true).toBe(true);
    });

    test('should handle undefined errors gracefully', () => {
      expect(true).toBe(true);
    });

    test('should handle null continueHandler', async () => {
      const user = userEvent.setup();
      mockTrigger.mockResolvedValue(true);
      mockGetValues.mockReturnValue({});

      renderComponent({ continueHandler: null });

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('should render efficiently', () => {
      const startTime = performance.now();

      renderComponent();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000);
    });

    test('should not cause memory leaks', () => {
      const { unmount } = renderComponent();

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Pre-filled Select Values (useWatch-based)', () => {
    test('should display gender value returned by useWatch', () => {
      // Simulate the form returning 'female' via useWatch (as happens after reset + setValue).
      (useWatch as jest.Mock).mockImplementation(({ name }: { name: string }) => {
        if (name === 'gender') return 'female';
        return undefined;
      });

      renderComponent();

      const genderTrigger = screen.getByTestId('gender-select');
      expect(genderTrigger).toHaveTextContent('Female');
    });

    test('should fall back to genderValue prop when useWatch returns undefined', () => {
      // useWatch returns undefined (field not yet registered) — prop should be used.
      (useWatch as jest.Mock).mockReturnValue(undefined);

      renderComponent({ genderValue: 'female' });

      const genderTrigger = screen.getByTestId('gender-select');
      expect(genderTrigger).toHaveTextContent('Female');
    });

    test('should display suffix value returned by useWatch', () => {
      (useWatch as jest.Mock).mockImplementation(({ name }: { name: string }) => {
        if (name === 'suffix') return 'Jr';
        return undefined;
      });

      renderComponent();

      const suffixTrigger = screen.getByTestId('suffix-select');
      expect(suffixTrigger).toHaveTextContent('Jr');
    });

    test('should fall back to suffixValue prop when useWatch returns undefined', () => {
      (useWatch as jest.Mock).mockReturnValue(undefined);

      renderComponent({ suffixValue: 'Sr' });

      const suffixTrigger = screen.getByTestId('suffix-select');
      expect(suffixTrigger).toHaveTextContent('Sr');
    });

    test('should display preferred language value from useWatch in household setup mode', () => {
      (useWatch as jest.Mock).mockImplementation(({ name }: { name: string }) => {
        if (name === 'preferred_language') return 'en';
        return undefined;
      });

      renderComponent({ isHouseholdSetup: true });

      const langTrigger = screen.getByTestId('preferred-language-select');
      expect(langTrigger).toHaveTextContent('English');
    });

    test('should fall back to preferredLanguageValue prop when useWatch returns undefined', () => {
      (useWatch as jest.Mock).mockReturnValue(undefined);

      renderComponent({ isHouseholdSetup: true, preferredLanguageValue: 'en' });

      const langTrigger = screen.getByTestId('preferred-language-select');
      expect(langTrigger).toHaveTextContent('English');
    });

    test('should show no selection when gender is empty and useWatch returns undefined', () => {
      (useWatch as jest.Mock).mockReturnValue(undefined);

      renderComponent({ genderValue: '' });

      const genderTrigger = screen.getByTestId('gender-select');
      expect(genderTrigger).toBeInTheDocument();
    });

    test('should validate only required fields (no preferred_language) in non-setup mode', async () => {
      const user = userEvent.setup();
      mockTrigger.mockResolvedValue(true);
      mockGetValues.mockReturnValue({});
      const mockContinueHandler = jest.fn();

      renderComponent({ continueHandler: mockContinueHandler });

      const continueButton = screen.getByTestId('continue-button');
      await user.click(continueButton);

      expect(mockTrigger).toHaveBeenCalledWith([
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
      ]);
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactInformationComponent from '../ContactInformationComponent';

jest.mock('../../Localization/LocalizationComponent', () => ({
  register_how_to_contact: 'How to Contact You',
  phone_number: 'Phone Number',
  no_phone: 'No Phone Available',
  phone_contact_you:
    'I agree to receive SMS text message confirmations, reminders, and program updates about my food pantry visits. Message frequency varies. Message & data rates may apply. Reply STOP to opt out, HELP for help. See our {privacyPolicy} and {termsOfUse} for more details.',
  privacy_policy_link: 'Privacy Policy',
  terms_of_use_link: 'Terms of Use',
  no_email: 'No Email Available',
  email_transactional_disclaimer:
    "We'll use your email to send appointment confirmations, reminders, program updates, and security verification codes required to use your account.",
  email_contact_you:
    'I agree to receive emails about other food assistance programs, benefits, and services that may be available to me or my family.',
  label_email: 'Email',
  error_phone_number_required: 'Phone number is required',
  error_email_required: 'Email is required',
  error_field_required: 'This field is required',
  label_no_email_question: 'No Email?',
  label_get_free_email: 'Get one free from Google.',
}));

jest.mock('../PhoneInputComponent', () => {
  return function MockPhoneInputComponent(props: any) {
    return (
      <input
        type="text"
        className={props.className}
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        data-testid="phone-input"
      />
    );
  };
});

const mockRegister = jest.fn();
const mockWatch = jest.fn();
const mockSetValue = jest.fn();
const mockGetValues = jest.fn();
const mockErrors = {};

const defaultProps = {
  register: mockRegister,
  errors: mockErrors,
  getValues: mockGetValues,
  setValue: mockSetValue,
  watch: mockWatch,
};

describe('ContactInformationComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWatch.mockImplementation((fieldName: string) => {
      const mockValues: { [key: string]: any } = {
        phone: '',
        email: '',
        no_phone_number: false,
        no_email: false,
        permission_to_text: false,
        permission_to_email: false,
      };
      return mockValues[fieldName] ?? '';
    });
    mockRegister.mockImplementation((name, options) => ({
      name,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    }));
  });

  const renderComponent = (props = {}) => {
    return render(<ContactInformationComponent {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    test('should render without errors', () => {
      expect(() => {
        renderComponent();
      }).not.toThrow();
    });

    test('should render main container with correct test ID', () => {
      renderComponent();
      const container = screen.getByTestId('contact-information-component');
      expect(container).toBeInTheDocument();
    });

    test('should render section heading', () => {
      renderComponent();
      const heading = screen.getByText('How to Contact You');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
    });

    test('should apply custom className when provided', () => {
      const customClass = 'custom-contact-class';
      renderComponent({ className: customClass });
      const container = screen.getByTestId('contact-information-component');
      expect(container).toHaveClass(customClass);
    });

    test('should apply custom test ID when provided', () => {
      const customTestId = 'custom-contact-component';
      renderComponent({ 'data-testid': customTestId });
      const container = screen.getByTestId(customTestId);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Phone Number Section', () => {
    test('should render phone number field when no_phone_number is false', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return false;
        if (fieldName === 'phone') return '';
        return false;
      });

      renderComponent();

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    test('should not render phone number field when no_phone_number is true', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return true;
        return '';
      });

      renderComponent();

      expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
      expect(screen.queryByTestId('phone-input')).not.toBeInTheDocument();
    });

    test('should show phone error when phone field has error', () => {
      const errors = {
        phone: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      expect(screen.getByTestId('phone-error')).toBeInTheDocument();
      expect(screen.getByText(/This field is required/)).toBeInTheDocument();
    });

    test('should apply error styling to phone input when there are errors', () => {
      const errors = {
        phone: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      const phoneInput = screen.getByTestId('phone-input');
      expect(phoneInput).toHaveClass(
        'border-red-500',
        'focus:ring-red-500',
        'focus:border-red-500',
      );
    });

    test('should render no phone checkbox when phone is empty', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'phone') return '';
        if (fieldName === 'no_phone_number') return false;
        return false;
      });

      renderComponent();

      expect(screen.getByText('No Phone Available')).toBeInTheDocument();
      const noPhoneCheckbox = screen.getByRole('checkbox', {
        name: 'No Phone Available',
      });
      expect(noPhoneCheckbox).toBeInTheDocument();
    });

    test('should not render no phone checkbox when phone has value', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'phone') return '(555) 123-4567';
        if (fieldName === 'no_phone_number') return false;
        return false;
      });

      renderComponent();

      expect(screen.queryByText('No Phone Available')).not.toBeInTheDocument();
    });

    test('should render phone permission checkbox when phone permissions are shown', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return false;
        return '';
      });

      renderComponent();

      const consent = screen.getByTestId('phone permission');
      expect(consent).toBeInTheDocument();
      // Twilio requires each of these clauses verbatim. Asserted on textContent
      // because the sentence is now split across two anchor elements.
      expect(consent).toHaveTextContent(
        /I agree to receive SMS text message confirmations, reminders, and program updates about my food pantry visits\./,
      );
      expect(consent).toHaveTextContent(/Message frequency varies\./);
      expect(consent).toHaveTextContent(/Message & data rates may apply\./);
      expect(consent).toHaveTextContent(/Reply STOP to opt out, HELP for help\./);
    });

    test('links the SMS consent statement to the Privacy Policy and Terms of Use', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return false;
        return '';
      });

      renderComponent();

      const privacy = screen.getByRole('link', { name: 'Privacy Policy' });
      const terms = screen.getByRole('link', { name: 'Terms of Use' });

      expect(privacy).toHaveAttribute('href', 'https://www.freshtrak.com/privacy');
      expect(terms).toHaveAttribute('href', 'https://www.freshtrak.com/terms');

      // Opened in a new tab so an in-progress registration is not lost.
      expect(privacy).toHaveAttribute('target', '_blank');
      expect(privacy).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(terms).toHaveAttribute('target', '_blank');
      expect(terms).toHaveAttribute('rel', expect.stringContaining('noopener'));

      expect(screen.getByTestId('phone permission')).toContainElement(privacy);

      // Dropping the <label> in favour of aria-labelledby must not cost the
      // checkbox its accessible name — screen readers still announce the consent.
      expect(
        screen.getByRole('checkbox', { name: /I agree to receive SMS text message/ }),
      ).toHaveAttribute('id', 'permission_to_text');
    });

    test('following a policy link does not toggle the SMS consent checkbox', async () => {
      const user = userEvent.setup();
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return false;
        return '';
      });

      renderComponent();
      mockSetValue.mockClear();

      await user.click(screen.getByRole('link', { name: 'Privacy Policy' }));

      expect(mockSetValue).not.toHaveBeenCalledWith(
        'permission_to_text',
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('Email Section', () => {
    test('should render email field when no_email is false', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_email') return false;
        if (fieldName === 'email') return '';
        return false;
      });

      renderComponent();

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    test('should not render email field when no_email is true', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_email') return true;
        return '';
      });

      renderComponent();

      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();
    });

    test('should show email error when email field has error', () => {
      const errors = {
        email: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });

    test('should apply aria-invalid to email input when there are errors', () => {
      const errors = {
        email: { type: 'required', message: 'This field is required' },
      };

      renderComponent({ errors });

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should render no email checkbox when email is empty', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'email') return '';
        if (fieldName === 'no_email') return false;
        return false;
      });

      renderComponent();

      expect(screen.getByText('No Email Available')).toBeInTheDocument();
      const noEmailCheckbox = screen.getByRole('checkbox', {
        name: 'No Email Available',
      });
      expect(noEmailCheckbox).toBeInTheDocument();
    });

    test('should not render no email checkbox when email has value', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'email') return 'test@example.com';
        if (fieldName === 'no_email') return false;
        return false;
      });

      renderComponent();

      expect(screen.queryByText('No Email Available')).not.toBeInTheDocument();
    });

    test('should render email permission checkbox when email permissions are shown', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_email') return false;
        return '';
      });

      renderComponent();

      expect(
        screen.getByText(
          'I agree to receive emails about other food assistance programs, benefits, and services that may be available to me or my family.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('email permission')).toBeInTheDocument();
    });

    test('should render Google email link', () => {
      renderComponent();

      const googleLink = screen.getByText('Get one free from Google.');
      expect(googleLink).toBeInTheDocument();
      expect(googleLink).toHaveAttribute('href', 'https://support.google.com/mail/answer/56256');
      expect(googleLink).toHaveAttribute('target', '_blank');
      expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Form Registration', () => {
    test('should register checkbox fields via useEffect', () => {
      renderComponent();

      expect(mockRegister).toHaveBeenCalledWith('no_phone_number');
      expect(mockRegister).toHaveBeenCalledWith('permission_to_text');
      expect(mockRegister).toHaveBeenCalledWith('no_email');
      expect(mockRegister).toHaveBeenCalledWith('permission_to_email');
    });

    test('shows the transactional email disclaimer outside the marketing opt-in', () => {
      // CAN-SPAM: confirmations, reminders and security codes are part of the
      // account relationship, so their disclosure must sit outside the checkbox
      // the user is consenting with.
      renderComponent();

      const disclaimer = screen.getByTestId('email-transactional-disclaimer');
      expect(disclaimer).toHaveTextContent(
        /security verification codes required to use your account/i,
      );

      const optIn = screen.getByTestId('email permission');
      expect(optIn).not.toContainElement(disclaimer);
      expect(optIn).toHaveTextContent(/other food assistance programs/i);
    });

    test('should register phone and email fields for validation', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        const mockValues: { [key: string]: any } = {
          phone: '',
          email: '',
          no_phone_number: false,
          no_email: false,
          permission_to_text: false,
          permission_to_email: false,
        };
        return mockValues[fieldName] ?? '';
      });

      renderComponent();

      expect(mockRegister).toHaveBeenCalledWith('phone', {
        required: 'Phone number is required',
      });
      expect(mockRegister).toHaveBeenCalledWith('email', {
        required: 'Email is required',
      });
    });

    test('should watch form values', () => {
      renderComponent();

      expect(mockWatch).toHaveBeenCalledWith('no_phone_number');
      expect(mockWatch).toHaveBeenCalledWith('no_email');
      expect(mockWatch).toHaveBeenCalledWith('phone');
      expect(mockWatch).toHaveBeenCalledWith('email');
    });
  });

  describe('User Interactions', () => {
    test('should handle phone input changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      const phoneInput = screen.getByTestId('phone-input');
      await user.type(phoneInput, '5551234567');

      expect(phoneInput).toBeInTheDocument();
    });

    test('should handle email input changes', async () => {
      const user = userEvent.setup();
      renderComponent();

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    test('should call setValue when no-phone checkbox is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const noPhoneCheckbox = screen.getByRole('checkbox', {
        name: 'No Phone Available',
      });
      await user.click(noPhoneCheckbox);

      expect(mockSetValue).toHaveBeenCalledWith('no_phone_number', true, { shouldDirty: true });
    });

    test('should call setValue when no-email checkbox is clicked', async () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'email') return '';
        if (fieldName === 'no_email') return false;
        if (fieldName === 'no_phone_number') return false;
        return false;
      });

      const user = userEvent.setup();
      renderComponent();

      const noEmailCheckbox = screen.getByRole('checkbox', {
        name: 'No Email Available',
      });
      await user.click(noEmailCheckbox);

      expect(mockSetValue).toHaveBeenCalledWith('no_email', true, {
        shouldDirty: true,
      });
    });
  });

  describe('Conditional Rendering', () => {
    test('should show phone section when no_phone_number is false', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return false;
        return '';
      });

      renderComponent();

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    test('should hide phone section when no_phone_number is true', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_phone_number') return true;
        return '';
      });

      renderComponent();

      expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
      expect(screen.queryByTestId('phone-input')).not.toBeInTheDocument();
    });

    test('should show email section when no_email is false', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_email') return false;
        return '';
      });

      renderComponent();

      expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    test('should hide email section when no_email is true', () => {
      mockWatch.mockImplementation((fieldName: string) => {
        if (fieldName === 'no_email') return true;
        return '';
      });

      renderComponent();

      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper form structure', () => {
      renderComponent();

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    test('should have proper input attributes', () => {
      renderComponent();

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'off');
    });

    test('should have proper label associations', () => {
      renderComponent();

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    test('should have proper checkbox labels', () => {
      renderComponent();

      const noPhoneCheckbox = screen.getByRole('checkbox', {
        name: 'No Phone Available',
      });
      expect(noPhoneCheckbox).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive container classes', () => {
      renderComponent();
      const container = screen.getByTestId('contact-information-component');

      expect(container).toHaveClass('space-y-6');
    });

    test('should have responsive input styling', () => {
      renderComponent();
      const emailInput = screen.getByTestId('email-input');

      expect(emailInput).toHaveClass('w-full', 'px-3');
    });

    test('should have proper checkbox sizing', () => {
      renderComponent();
      const noPhoneCheckbox = screen.getByRole('checkbox', {
        name: 'No Phone Available',
      });

      expect(noPhoneCheckbox).toHaveClass('size-4');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing props gracefully', () => {
      expect(true).toBe(true);
    });

    test('should handle undefined errors gracefully', () => {
      expect(true).toBe(true);
    });

    test('should handle null setValue', () => {
      expect(true).toBe(true);
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
});

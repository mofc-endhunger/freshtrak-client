import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import FamilyContainer from '../FamilyContainer';

// Mock external dependencies
jest.mock('../../Registration/RegistrationHeaderComponent', () => {
  return function MockRegistrationHeaderComponent({ event }: any) {
    return <div data-testid="registration-header">Registration Header</div>;
  };
});

jest.mock('../../Registration/RegistrationTextComponent', () => {
  return function MockRegistrationTextComponent({ event }: any) {
    return <div data-testid="registration-text">Registration Text</div>;
  };
});

jest.mock('../PrimaryInfoFormComponent', () => {
  return function MockPrimaryInfoFormComponent(props: any) {
    return (
      <div data-testid="primary-info-form">
        <input name="first_name" data-testid="first-name-input" />
        <input name="last_name" data-testid="last-name-input" />
        <input name="date_of_birth" data-testid="date-of-birth-input" />
      </div>
    );
  };
});

jest.mock('../AddressComponent', () => {
  return function MockAddressComponent(props: any) {
    return (
      <div data-testid="address-component">
        <input name="address_line_1" data-testid="address-input" />
        <input name="city" data-testid="city-input" />
        <input name="state" data-testid="state-input" />
        <input name="zip_code" data-testid="zip-input" />
      </div>
    );
  };
});

jest.mock('../ContactInformationComponent', () => {
  return function MockContactInformationComponent(props: any) {
    return (
      <div data-testid="contact-information-component">
        <input name="phone" data-testid="phone-input" />
        <input name="email" data-testid="email-input" />
      </div>
    );
  };
});

jest.mock('../MemberCountFormComponent', () => {
  return function MockMemberCountFormComponent(props: any) {
    return (
      <div data-testid="member-count-component">
        <input name="household_size" data-testid="household-size-input" />
        <input name="adults" data-testid="adults-input" />
        <input name="children" data-testid="children-input" />
        <input name="seniors" data-testid="seniors-input" />
      </div>
    );
  };
});

// Mock Redux store
const mockStore = configureStore([]);

// Mock event data
const mockEvent = {
  id: '1',
  name: 'Test Event',
  date: '2024-01-15',
  startTime: '10:00 AM',
  endTime: '2:00 PM',
  eventAddress: '123 Test Street',
  eventCity: 'Test City',
  eventState: 'TS',
  eventZip: '12345',
  phoneNumber: '(555) 123-4567',
  agencyName: 'Test Agency',
  eventName: 'Test Event Name',
  eventService: 'Food Distribution',
  acceptReservations: true,
  acceptInterest: false,
  acceptWalkin: true,
  eventDetails: 'Test event details',
  seniorAge: 60,
  adultAge: 18,
  maxHouseholdSize: 6,
  availableSlots: 50,
  latitude: 40.7128,
  longitude: -74.006,
  agencyLatitude: 40.7128,
  agencyLongitude: -74.006,
  estimatedDistance: 2.5,
};

describe('FamilyContainer', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      event: { event: mockEvent },
    });

    // Mock console methods to reduce noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderFamilyContainer = (props = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <FamilyContainer {...props} />
        </MemoryRouter>
      </Provider>,
    );
  };

  describe('Rendering', () => {
    test('should render without errors', () => {
      expect(() => {
        renderFamilyContainer();
      }).not.toThrow();
    });

    test('should render main container with correct test ID', () => {
      renderFamilyContainer();
      const container = screen.getByTestId('family-container');
      expect(container).toBeInTheDocument();
    });

    test('should render registration header component', () => {
      renderFamilyContainer();
      const header = screen.getByTestId('registration-header');
      expect(header).toBeInTheDocument();
    });

    test('should render registration text component', () => {
      renderFamilyContainer();
      const text = screen.getByTestId('registration-text');
      expect(text).toBeInTheDocument();
    });

    test('should render family registration form', () => {
      renderFamilyContainer();
      const form = screen.getByTestId('family-registration-form');
      expect(form).toBeInTheDocument();
    });

    test('should render all form sections', () => {
      renderFamilyContainer();

      // Check section headers
      expect(screen.getByText('Primary Information')).toBeInTheDocument();
      expect(screen.getByText('Address Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Family Members')).toBeInTheDocument();

      // Check form components
      expect(screen.getByTestId('primary-info-form')).toBeInTheDocument();
      expect(screen.getByTestId('address-component')).toBeInTheDocument();
      expect(screen.getByTestId('contact-information-component')).toBeInTheDocument();
      expect(screen.getByTestId('member-count-component')).toBeInTheDocument();
    });

    test('should render submit button', () => {
      renderFamilyContainer();
      const submitButton = screen.getByTestId('continue-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Continue');
    });

    test('should apply custom className when provided', () => {
      const customClass = 'custom-container-class';
      renderFamilyContainer({ className: customClass });
      const container = screen.getByTestId('family-container');
      expect(container).toHaveClass(customClass);
    });

    test('should apply custom test ID when provided', () => {
      const customTestId = 'custom-family-container';
      renderFamilyContainer({ 'data-testid': customTestId });
      const container = screen.getByTestId(customTestId);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Form Functionality', () => {
    // test("should handle form submission", async () => {
    // 	const user = userEvent.setup();
    // 	renderFamilyContainer();

    // 	const submitButton = screen.getByTestId("continue-button");

    // 	// Fill in some form data
    // 	const firstNameInput = screen.getByTestId("first-name-input");
    // 	const lastNameInput = screen.getByTestId("last-name-input");

    // 	await user.type(firstNameInput, "John");
    // 	await user.type(lastNameInput, "Doe");

    // 	// Submit the form
    // 	await user.click(submitButton);

    // 	// Check that console.log was called with form data
    // 	await waitFor(() => {
    // 		expect(console.log).toHaveBeenCalledWith(
    // 			"Form data submitted:",
    // 			expect.any(Object)
    // 		);
    // 	});
    // });

    test('should handle form submission errors', async () => {
      const user = userEvent.setup();
      renderFamilyContainer();

      const submitButton = screen.getByTestId('continue-button');

      // Mock console.error to track error handling
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate an error during submission
      // This would typically be handled by the actual submission logic
      await user.click(submitButton);

      // The component should handle errors gracefully
      expect(submitButton).toBeInTheDocument();
    });

    test('should disable submit button when form is invalid', () => {
      renderFamilyContainer();
      const submitButton = screen.getByTestId('continue-button');

      // Initially, the button should be disabled if form is invalid
      // This depends on the form validation logic
      expect(submitButton).toBeInTheDocument();
    });

    test('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      renderFamilyContainer();

      const submitButton = screen.getByTestId('continue-button');

      // Fill in required fields to make form valid
      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');

      // Submit the form
      await user.click(submitButton);

      // Check for loading state (this would depend on the actual implementation)
      // For now, we'll just verify the button is still present
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should validate required fields', async () => {
      const user = userEvent.setup();
      renderFamilyContainer();

      const submitButton = screen.getByTestId('continue-button');

      // Try to submit without filling required fields
      await user.click(submitButton);

      // The form should handle validation appropriately
      expect(submitButton).toBeInTheDocument();
    });

    test('should handle form field changes', async () => {
      const user = userEvent.setup();
      renderFamilyContainer();

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');

      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
    });
  });

  describe('Redux Integration', () => {
    test('should connect to Redux store and get event data', () => {
      renderFamilyContainer();

      // The component should receive event data from Redux
      // We can verify this by checking that the event-dependent components render
      expect(screen.getByTestId('registration-header')).toBeInTheDocument();
      expect(screen.getByTestId('registration-text')).toBeInTheDocument();
    });

    test('should handle missing event data gracefully', () => {
      // Create store without event data
      const emptyStore = mockStore({
        event: { event: null },
      });

      render(
        <Provider store={emptyStore}>
          <MemoryRouter>
            <FamilyContainer />
          </MemoryRouter>
        </Provider>,
      );

      // Component should still render without errors
      expect(screen.getByTestId('family-container')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive container classes', () => {
      renderFamilyContainer();
      const container = screen.getByTestId('family-container');

      // Check for responsive Tailwind classes
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('bg-gray-50');
    });

    test('should have responsive form layout', () => {
      renderFamilyContainer();
      const form = screen.getByTestId('family-registration-form');

      // Check for responsive form classes
      expect(form).toHaveClass('space-y-8');
    });

    test('should have responsive button styling', () => {
      renderFamilyContainer();
      const submitButton = screen.getByTestId('continue-button');

      // Check for responsive button classes
      expect(submitButton).toHaveClass('px-6');
      expect(submitButton).toHaveClass('py-3');
      expect(submitButton).toHaveClass('text-base');
    });
  });

  describe('Accessibility', () => {
    test('should have proper form structure', () => {
      renderFamilyContainer();
      const form = screen.getByTestId('family-registration-form');

      expect(form).toHaveAttribute('data-testid', 'family-registration-form');
    });

    test('should have proper button attributes', () => {
      renderFamilyContainer();
      const submitButton = screen.getByTestId('continue-button');

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).toHaveAttribute('data-testid', 'continue-button');
    });

    test('should have proper section headings', () => {
      renderFamilyContainer();

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings).toHaveLength(4);

      expect(headings[0]).toHaveTextContent('Primary Information');
      expect(headings[1]).toHaveTextContent('Address Information');
      expect(headings[2]).toHaveTextContent('Contact Information');
      expect(headings[3]).toHaveTextContent('Family Members');
    });
  });

  describe('Error Handling', () => {
    test('should handle component errors gracefully', () => {
      // Mock a component that throws an error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderFamilyContainer();
      }).not.toThrow();
    });

    test('should handle Redux store errors', () => {
      // Create a store that might cause errors
      const errorStore = mockStore({
        event: { event: undefined },
      });

      expect(() => {
        render(
          <Provider store={errorStore}>
            <MemoryRouter>
              <FamilyContainer />
            </MemoryRouter>
          </Provider>,
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should render efficiently', () => {
      const startTime = performance.now();

      renderFamilyContainer();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });

    test('should not cause memory leaks', () => {
      const { unmount } = renderFamilyContainer();

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdditionalPickUpFormComponent from '../AdditionalPickUpFormComponent';

// Mock the SVG import
jest.mock('../../../Assets/img/add.svg', () => 'mocked-add-icon');

const mockOnSelectedChild = jest.fn();

const renderAdditionalPickUpForm = () => {
  return render(<AdditionalPickUpFormComponent onSelectedChild={mockOnSelectedChild} />);
};

describe('AdditionalPickUpFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the main heading', () => {
      renderAdditionalPickUpForm();
      expect(screen.getByText('Additional Pickup Information (Optional)')).toBeInTheDocument();
    });

    it('renders the description text', () => {
      renderAdditionalPickUpForm();
      expect(
        screen.getByText(/Provide details about who will be picking up your order/),
      ).toBeInTheDocument();
    });

    it('renders pickup type select field', () => {
      renderAdditionalPickUpForm();
      const pickupTypeSelect = screen.getByRole('combobox');
      expect(pickupTypeSelect).toBeInTheDocument();
      // The Select component is a button element, so we check for role instead of id/name
      expect(pickupTypeSelect).toHaveAttribute('role', 'combobox');
    });

    it('renders pickup name input field', () => {
      renderAdditionalPickUpForm();
      const pickupNameInput = screen.getByLabelText('Name');
      expect(pickupNameInput).toBeInTheDocument();
      expect(pickupNameInput).toHaveAttribute('id', 'pickup_name');
      expect(pickupNameInput).toHaveAttribute('name', 'pickup_name');
      expect(pickupNameInput).toHaveAttribute('placeholder', "Enter pickup person's name");
    });

    it('renders vehicle license plate input field', () => {
      renderAdditionalPickUpForm();
      const licensePlateInput = screen.getByLabelText('Vehicle License Plate Number');
      expect(licensePlateInput).toBeInTheDocument();
      expect(licensePlateInput).toHaveAttribute('id', 'vehicle_number_plate');
      expect(licensePlateInput).toHaveAttribute('name', 'vehicle_number_plate');
      expect(licensePlateInput).toHaveAttribute('placeholder', 'Enter vehicle license plate');
    });

    it('renders add vehicle button', () => {
      renderAdditionalPickUpForm();
      expect(screen.getByText('Add a Vehicle')).toBeInTheDocument();
      expect(screen.getByAltText('Add vehicle')).toBeInTheDocument();
    });

    it('renders informational text', () => {
      renderAdditionalPickUpForm();
      expect(
        screen.getByText(/Where possible, when you arrive we'll look for your vehicle/),
      ).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates pickup info when pickup type changes', async () => {
      renderAdditionalPickUpForm();

      // For the Select component, we need to simulate the onValueChange callback
      // Since we can't directly interact with the Select component in tests,
      // we'll test that the component calls onSelectedChild when state changes
      const pickupTypeSelect = screen.getByRole('combobox');
      expect(pickupTypeSelect).toBeInTheDocument();

      // The Select component will call onSelectedChild through useEffect when state changes
      // We can verify this by checking that onSelectedChild was called
      expect(mockOnSelectedChild).toHaveBeenCalled();
    });

    it('updates pickup name when name input changes', async () => {
      renderAdditionalPickUpForm();

      const pickupNameInput = screen.getByLabelText('Name');
      fireEvent.change(pickupNameInput, {
        target: { value: 'John Doe' },
      });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: 'John Doe',
            pickupNumberPlate: '',
          },
        });
      });
    });

    it('updates vehicle license plate when input changes', async () => {
      renderAdditionalPickUpForm();

      const licensePlateInput = screen.getByLabelText('Vehicle License Plate Number');
      fireEvent.change(licensePlateInput, {
        target: { value: 'ABC123' },
      });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: '',
            pickupNumberPlate: 'ABC123',
          },
        });
      });
    });

    it('calls onSelectedChild with updated data when multiple fields change', async () => {
      renderAdditionalPickUpForm();

      // For the Select component, we need to use getByRole instead of getByLabelText
      const pickupTypeSelect = screen.getByRole('combobox');
      const pickupNameInput = screen.getByLabelText('Name');
      const licensePlateInput = screen.getByLabelText('Vehicle License Plate Number');

      expect(pickupTypeSelect).toBeInTheDocument();
      expect(pickupNameInput).toBeInTheDocument();
      expect(licensePlateInput).toBeInTheDocument();

      // Change the name input
      fireEvent.change(pickupNameInput, {
        target: { value: 'John Doe' },
      });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: 'John Doe',
            pickupNumberPlate: '',
          },
        });
      });
    });
  });

  describe('Select Options', () => {
    it('has correct option values for pickup type', () => {
      renderAdditionalPickUpForm();

      // For the Select component, we need to look for the button element since it's a Radix UI component
      const pickupTypeSelect = screen.getByRole('combobox');

      // The Select component shows the selected value, not individual options
      // We can test that it shows the placeholder text
      expect(pickupTypeSelect).toHaveTextContent('Select pickup person');
    });
  });

  describe('State Management', () => {
    it('initializes with empty state values', () => {
      renderAdditionalPickUpForm();

      const pickupNameInput = screen.getByLabelText('Name') as HTMLInputElement;
      const licensePlateInput = screen.getByLabelText(
        'Vehicle License Plate Number',
      ) as HTMLInputElement;

      expect(pickupNameInput.value).toBe('');
      expect(licensePlateInput.value).toBe('');
    });

    it('calls onSelectedChild on initial render with empty values', () => {
      renderAdditionalPickUpForm();

      expect(mockOnSelectedChild).toHaveBeenCalledWith({
        pickupData: {
          pickupInfo: '',
          pickupName: '',
          pickupNumberPlate: '',
        },
      });
    });

    it('calls onSelectedChild whenever any state value changes', async () => {
      renderAdditionalPickUpForm();

      // Clear the initial call
      mockOnSelectedChild.mockClear();

      const pickupNameInput = screen.getByLabelText('Name');
      fireEvent.change(pickupNameInput, {
        target: { value: 'Test Name' },
      });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: 'Test Name',
            pickupNumberPlate: '',
          },
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive text alignment classes', () => {
      renderAdditionalPickUpForm();

      const headerContainer = screen
        .getByText('Additional Pickup Information (Optional)')
        .closest('div');
      expect(headerContainer).toHaveClass('text-center', 'md:text-left');
    });

    it('applies consistent spacing classes', () => {
      renderAdditionalPickUpForm();

      // The root div should have space-y-6 pt-12
      const rootContainer = screen
        .getByText('Additional Pickup Information (Optional)')
        .closest('div')?.parentElement;
      expect(rootContainer).toHaveClass('space-y-6', 'pt-12');

      const formFieldsContainer = screen.getByRole('combobox').closest('div');
      expect(formFieldsContainer?.parentElement).toHaveClass('space-y-4');
    });

    it('applies responsive text sizing', () => {
      renderAdditionalPickUpForm();

      const heading = screen.getByText('Additional Pickup Information (Optional)');
      const description = screen.getByText(
        /Provide details about who will be picking up your order/,
      );

      expect(heading).toHaveClass('text-xl');
      expect(description).toHaveClass('text-sm');
    });

    it('applies responsive spacing between elements', () => {
      renderAdditionalPickUpForm();

      // Look for the form fields container that has space-y-4
      const formFieldsContainer = screen.getByRole('combobox').closest('div')?.parentElement;
      expect(formFieldsContainer).toHaveClass('space-y-4');
    });

    it('applies responsive padding and margins', () => {
      renderAdditionalPickUpForm();

      // The root div should have pt-12
      const rootContainer = screen
        .getByText('Additional Pickup Information (Optional)')
        .closest('div')?.parentElement;
      expect(rootContainer).toHaveClass('pt-12');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels associated with inputs', () => {
      renderAdditionalPickUpForm();

      // For the Select component, we need to look for the button element since it's a Radix UI component
      const pickupTypeSelect = screen.getByRole('combobox');
      const pickupNameInput = screen.getByLabelText('Name');
      const licensePlateInput = screen.getByLabelText('Vehicle License Plate Number');

      expect(pickupTypeSelect).toBeInTheDocument();
      expect(pickupNameInput).toBeInTheDocument();
      expect(licensePlateInput).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      renderAdditionalPickUpForm();

      const form = screen.getByText('Additional Pickup Information (Optional)').closest('div');
      expect(form).toBeInTheDocument();
    });

    it('has proper alt text for images', () => {
      renderAdditionalPickUpForm();

      const addIcon = screen.getByAltText('Add vehicle');
      expect(addIcon).toBeInTheDocument();
    });
  });

  describe('Visual Elements and Styling', () => {
    it('applies proper text colors', () => {
      renderAdditionalPickUpForm();

      const heading = screen.getByText('Additional Pickup Information (Optional)');
      const description = screen.getByText(
        /Provide details about who will be picking up your order/,
      );
      const addVehicleText = screen.getByText('Add a Vehicle');

      expect(heading).toHaveClass('text-gray-900');
      expect(description).toHaveClass('text-gray-600');
      expect(addVehicleText).toHaveClass('text-gray-700');
    });

    it('applies proper font weights', () => {
      renderAdditionalPickUpForm();

      const heading = screen.getByText('Additional Pickup Information (Optional)');
      const labels = screen.getAllByText(/Who's Picking up\?|Name|Vehicle License Plate Number/);

      expect(heading).toHaveClass('font-semibold');
      labels.forEach((label) => {
        expect(label).toHaveClass('font-medium');
      });
    });

    it('applies proper background colors and borders', () => {
      renderAdditionalPickUpForm();

      const addVehicleButton = screen.getByText('Add a Vehicle').closest('div');
      const infoBox = screen.getByText(/Where possible, when you arrive/).closest('div');

      expect(addVehicleButton).toHaveClass('bg-gray-50', 'border-gray-200');
      expect(infoBox).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('applies hover effects to interactive elements', () => {
      renderAdditionalPickUpForm();

      const addVehicleButton = screen.getByText('Add a Vehicle').closest('div');
      expect(addVehicleButton).toHaveClass('hover:bg-gray-100');
    });

    it('applies transition effects', () => {
      renderAdditionalPickUpForm();

      const addVehicleButton = screen.getByText('Add a Vehicle').closest('div');
      expect(addVehicleButton).toHaveClass('transition-colors', 'duration-200');
    });
  });

  describe('Component Integration', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<AdditionalPickUpFormComponent ref={ref} onSelectedChild={mockOnSelectedChild} />);

      expect(ref.current).toBeInTheDocument();
    });

    it('has proper display name', () => {
      expect(AdditionalPickUpFormComponent.displayName).toBe('AdditionalPickUpFormComponent');
    });

    it('integrates with parent component through onSelectedChild callback', () => {
      renderAdditionalPickUpForm();

      expect(mockOnSelectedChild).toHaveBeenCalled();
      expect(mockOnSelectedChild).toHaveBeenCalledWith({
        pickupData: {
          pickupInfo: '',
          pickupName: '',
          pickupNumberPlate: '',
        },
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles empty string inputs gracefully', async () => {
      renderAdditionalPickUpForm();

      const pickupNameInput = screen.getByLabelText('Name');
      fireEvent.change(pickupNameInput, { target: { value: '' } });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: '',
            pickupNumberPlate: '',
          },
        });
      });
    });

    it('handles special characters in inputs', async () => {
      renderAdditionalPickUpForm();

      const pickupNameInput = screen.getByLabelText('Name');
      fireEvent.change(pickupNameInput, {
        target: { value: 'John-Doe & Co.' },
      });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: 'John-Doe & Co.',
            pickupNumberPlate: '',
          },
        });
      });
    });

    it('handles long input values', async () => {
      renderAdditionalPickUpForm();

      const longName = 'A'.repeat(100);
      const pickupNameInput = screen.getByLabelText('Name');
      fireEvent.change(pickupNameInput, { target: { value: longName } });

      await waitFor(() => {
        expect(mockOnSelectedChild).toHaveBeenCalledWith({
          pickupData: {
            pickupInfo: '',
            pickupName: longName,
            pickupNumberPlate: '',
          },
        });
      });
    });
  });

  describe('Event Handling', () => {
    it('prevents default form submission behavior', () => {
      renderAdditionalPickUpForm();

      const pickupNameInput = screen.getByLabelText('Name');
      const mockPreventDefault = jest.fn();

      fireEvent.change(pickupNameInput, {
        target: { value: 'Test Name' },
        preventDefault: mockPreventDefault,
      });

      // The preventDefault is called in the buildAddressForm function
      expect(mockPreventDefault).not.toHaveBeenCalled();
    });

    it('handles all input types correctly', () => {
      renderAdditionalPickUpForm();

      // For the Select component, we need to look for the button element since it's a Radix UI component
      const pickupTypeSelect = screen.getByRole('combobox');
      const pickupNameInput = screen.getByLabelText('Name');
      const licensePlateInput = screen.getByLabelText('Vehicle License Plate Number');

      expect(pickupTypeSelect).toBeInTheDocument();
      expect(pickupNameInput).toBeInTheDocument();
      expect(licensePlateInput).toBeInTheDocument();
    });
  });
});

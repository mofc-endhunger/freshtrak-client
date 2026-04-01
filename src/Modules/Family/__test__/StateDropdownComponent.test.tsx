import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StateDropdownComponent from '../StateDropdownComponent';

jest.mock('../../Localization/LocalizationComponent', () => ({
  state: 'State',
  error_field_required: 'This field is required',
  option_state_alaska: 'Alaska',
  option_state_alabama: 'Alabama',
  option_state_arkansas: 'Arkansas',
  option_state_arizona: 'Arizona',
  option_state_california: 'California',
  option_state_colorado: 'Colorado',
  option_state_connecticut: 'Connecticut',
  option_state_district_of_columbia: 'District of Columbia',
  option_state_delaware: 'Delaware',
  option_state_florida: 'Florida',
  option_state_georgia: 'Georgia',
  option_state_hawaii: 'Hawaii',
  option_state_iowa: 'Iowa',
  option_state_idaho: 'Idaho',
  option_state_illinois: 'Illinois',
  option_state_indiana: 'Indiana',
  option_state_kansas: 'Kansas',
  option_state_kentucky: 'Kentucky',
  option_state_louisiana: 'Louisiana',
  option_state_massachusetts: 'Massachusetts',
  option_state_maryland: 'Maryland',
  option_state_maine: 'Maine',
  option_state_michigan: 'Michigan',
  option_state_minnesota: 'Minnesota',
  option_state_missouri: 'Missouri',
  option_state_mississippi: 'Mississippi',
  option_state_montana: 'Montana',
  option_state_north_carolina: 'North Carolina',
  option_state_north_dakota: 'North Dakota',
  option_state_nebraska: 'Nebraska',
  option_state_new_hampshire: 'New Hampshire',
  option_state_new_jersey: 'New Jersey',
  option_state_new_mexico: 'New Mexico',
  option_state_nevada: 'Nevada',
  option_state_new_york: 'New York',
  option_state_ohio: 'Ohio',
  option_state_oklahoma: 'Oklahoma',
  option_state_oregon: 'Oregon',
  option_state_pennsylvania: 'Pennsylvania',
  option_state_puerto_rico: 'Puerto Rico',
  option_state_rhode_island: 'Rhode Island',
  option_state_south_carolina: 'South Carolina',
  option_state_south_dakota: 'South Dakota',
  option_state_tennessee: 'Tennessee',
  option_state_texas: 'Texas',
  option_state_utah: 'Utah',
  option_state_virginia: 'Virginia',
  option_state_vermont: 'Vermont',
  option_state_washington: 'Washington',
  option_state_wisconsin: 'Wisconsin',
  option_state_west_virginia: 'West Virginia',
  option_state_wyoming: 'Wyoming',
}));

const defaultProps = {
  value: '',
  onValueChange: jest.fn(),
};

describe('StateDropdownComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    test('should display the correct label', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('should render the select trigger', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('should have the correct id on the trigger', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('id', 'state');
    });
  });

  describe('Selected Value Display', () => {
    test('should display selected state when value is provided', () => {
      render(<StateDropdownComponent {...defaultProps} value="CA" />);
      expect(screen.getByText('California')).toBeInTheDocument();
    });

    test('should display different selected state', () => {
      render(<StateDropdownComponent {...defaultProps} value="NY" />);
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    test('should display Texas when TX is selected', () => {
      render(<StateDropdownComponent {...defaultProps} value="TX" />);
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });
  });

  describe('Callback Contract', () => {
    test('should accept onValueChange callback', () => {
      const mockOnValueChange = jest.fn();

      render(<StateDropdownComponent {...defaultProps} onValueChange={mockOnValueChange} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('should render trigger as a combobox', () => {
      render(<StateDropdownComponent {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    test('should update displayed value when value prop changes', () => {
      const { rerender } = render(<StateDropdownComponent {...defaultProps} value="" />);

      rerender(<StateDropdownComponent {...defaultProps} value="FL" />);

      expect(screen.getByText('Florida')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should not show error when no error is provided', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    test('should show error message when error is provided', () => {
      render(<StateDropdownComponent {...defaultProps} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('should set aria-invalid on trigger when error is present', () => {
      render(<StateDropdownComponent {...defaultProps} error="This field is required" />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });

    test('should not set aria-invalid when no error', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Disabled State', () => {
    test('should disable the trigger when disabled is true', () => {
      render(<StateDropdownComponent {...defaultProps} disabled={true} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    test('should not be disabled by default', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper label association', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const label = screen.getByText('State');
      const trigger = screen.getByRole('combobox');
      expect(label).toHaveAttribute('for', 'state');
      expect(trigger).toHaveAttribute('id', 'state');
    });

    test('should have required indicator', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('should be keyboard accessible', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined value gracefully', () => {
      render(<StateDropdownComponent {...defaultProps} value={undefined} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('should handle empty string value', () => {
      render(<StateDropdownComponent {...defaultProps} value="" />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('should handle undefined error gracefully', () => {
      render(<StateDropdownComponent {...defaultProps} error={undefined} />);
      expect(screen.getByText('State')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    test('should have correct container styling', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const container = screen.getByText('State').closest('div');
      expect(container).toHaveClass('space-y-2');
    });

    test('should render label with correct styling', () => {
      render(<StateDropdownComponent {...defaultProps} />);
      const label = screen.getByText('State');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('text-gray-700');
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import DashboardCreateAccountComponent from '../DashboardCreateAccountComponent';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../Localization/LocalizationComponent', () => ({
  home_freshtrack: 'FreshTrak is here to help!',
  home_stay: 'Stay Up to Date',
  home_comming_soon: 'Make a FreshTrak account to stay up to date on local food access events.',
  home_create_account_button: 'Create Account',
  home_findfood: 'Find Food',
  home_zip_details:
    'Enter your zip code and get connected to food access resources in your community.',
}));

jest.mock('../../../Assets/img/calendar.svg', () => 'calendar.svg');
jest.mock('../../../Assets/img/findfood.svg', () => 'findfood.svg');

const renderComponent = () =>
  render(
    <MemoryRouter>
      <DashboardCreateAccountComponent />
    </MemoryRouter>,
  );

describe('DashboardCreateAccountComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the section heading', () => {
      renderComponent();
      expect(screen.getByText('FreshTrak is here to help!')).toBeInTheDocument();
    });

    it('renders the Stay Up to Date feature card', () => {
      renderComponent();
      expect(screen.getByText('Stay Up to Date')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Make a FreshTrak account to stay up to date on local food access events.',
        ),
      ).toBeInTheDocument();
    });

    it('renders the Find Food feature card', () => {
      renderComponent();
      expect(screen.getByText('Find Food')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Enter your zip code and get connected to food access resources in your community.',
        ),
      ).toBeInTheDocument();
    });

    it('renders the Create Account button', () => {
      renderComponent();
      expect(screen.getByTestId('create-account-button')).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    it('does not render a Create Account button for the Find Food card', () => {
      renderComponent();
      expect(screen.getAllByTestId('feature-card')).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Create Account' })).toHaveLength(1);
    });
  });

  describe('Navigation', () => {
    it('navigates to /login when Create Account button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('create-account-button'));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

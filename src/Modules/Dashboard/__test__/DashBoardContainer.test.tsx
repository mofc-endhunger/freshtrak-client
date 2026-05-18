import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashBoardContainer from '../DashBoardContainer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock(
  '../DashBoardDataComponent',
  () =>
    function MockDashBoardDataComponent() {
      return <div data-testid="dashboard-data-component">Search Form</div>;
    },
);

jest.mock(
  '../DashBoardFoodBankComponent',
  () =>
    function MockDashBoardFoodBankComponent() {
      return <div data-testid="dashboard-food-bank-component">Food Bank</div>;
    },
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashBoardContainer', () => {
  it('renders all child sections', () => {
    render(<DashBoardContainer />);

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-data-component')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-food-bank-component')).toBeInTheDocument();
  });
});

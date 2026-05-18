import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import DashBoardDataComponent from '../DashBoardDataComponent';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock(
  '../DashboardCreateAccountComponent',
  () =>
    function MockDashboardCreateAccountComponent() {
      return <div data-testid="create-account-component">FreshTrak is here to help</div>;
    },
);

jest.mock(
  '../../Home/NearbyEventsSection',
  () =>
    function MockNearbyEventsSection() {
      return <div data-testid="nearby-events-section">Nearby Events</div>;
    },
);

jest.mock(
  '../../General/SearchComponent',
  () =>
    function MockSearchComponent() {
      return <div data-testid="search-component">Search</div>;
    },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderComponent = () =>
  render(
    <MemoryRouter>
      <DashBoardDataComponent />
    </MemoryRouter>,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashBoardDataComponent', () => {
  it('renders search form, nearby events, and create account sections', () => {
    renderComponent();

    expect(screen.getByTestId('search-component')).toBeInTheDocument();
    expect(screen.getByTestId('nearby-events-section')).toBeInTheDocument();
    expect(screen.getByTestId('create-account-component')).toBeInTheDocument();
  });

  it('renders NearbyEventsSection after the search form and before FreshTrak section', () => {
    renderComponent();

    const searchEl = screen.getByTestId('search-component');
    const nearbyEl = screen.getByTestId('nearby-events-section');
    const createAccountEl = screen.getByTestId('create-account-component');

    // NearbyEventsSection comes after the search form
    expect(
      searchEl.compareDocumentPosition(nearbyEl) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // "FreshTrak is here to help!" section comes after NearbyEventsSection
    expect(
      nearbyEl.compareDocumentPosition(createAccountEl) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

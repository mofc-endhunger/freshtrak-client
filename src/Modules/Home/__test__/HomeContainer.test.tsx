import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HomeContainer from '../HomeContainer';
// search slice mocked in test

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');
// Mock axios.all
mockAxios.all = jest.fn((promises) => Promise.all(promises));

// Mock StorageService
jest.mock('../../../Utils/StorageService', () => ({
  StorageService: {
    getItem: jest.fn((key: string) => {
      if (key === 'search_zip') return '12345';
      return null;
    }),
    getUserToken: jest.fn(() => 'mock-token'),
  },
}));

// Mock the LoadingSpinner component
jest.mock('../../General/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: { size: string }) {
    return <div data-testid={`loading-spinner-${size}`}>Loading...</div>;
  };
});

// Mock the EventListComponent
jest.mock('../../Events/EventListComponent', () => {
  return function MockEventListComponent({ events, zipCode }: any) {
    return <div data-testid="event-list-component">Mock Event List for zip: {zipCode}</div>;
  };
});

// Mock the EventHandler and HomeEventFormat functions
jest.mock(
  '../../../Utils/EventHandler',
  () => ({
    EventHandler: jest.fn((data) => ({
      '2024-01-01': [{ id: '1', name: 'Test Event' }],
    })),
    HomeEventFormat: jest.fn((event, dateId) => ({
      id: '1',
      eventName: 'Test Event',
      acceptReservations: true,
      acceptInterest: true,
      acceptWalkin: true,
      eventService: 'test-service',
    })),
  }),
  { virtual: true },
);

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      // Use a minimal mock reducer for the search slice to avoid TS/module resolution issues
      search: (state = {}, _action) => state,
    },
  });
};

describe('HomeContainer', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    mockAxios.get.mockClear();
    // Mock axios.all to return an empty array by default
    if (mockAxios.all) {
      mockAxios.all.mockClear();
    }
  });

  const renderWithProvider = () => {
    return render(
      <Provider store={mockStore}>
        <HomeContainer />
      </Provider>,
    );
  };

  it('renders the component with correct heading and form', async () => {
    // Mock the reservations API call
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });

    renderWithProvider();

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Zip Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter zip code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders all child components', () => {
    // Mock the reservations API call
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });

    renderWithProvider();

    expect(screen.getByText('Your Local Food Bank')).toBeInTheDocument();
    expect(screen.getByText('Your UpComing Reservations')).toBeInTheDocument();
    expect(screen.getByText('Resource Events')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    // Mock the reservations API call first (called on mount)
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });
    // Mock the events API call (called on form submit)
    mockAxios.get.mockResolvedValueOnce({
      data: { agencies: [] },
    });

    renderWithProvider();

    const zipInput = screen.getByPlaceholderText('Enter zip code');

    // Wait for loading to finish, then find the search button
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });

    // Fill in the form
    fireEvent.change(zipInput, { target: { value: '67890' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(zipInput).toHaveValue('67890');
    });
  });

  it('shows validation error for empty zip code', async () => {
    // Mock the reservations API call to return empty array
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });
    // Mock axios.all if it exists
    if (mockAxios.all) {
      mockAxios.all.mockResolvedValue([]);
    }

    renderWithProvider();

    // Wait for loading to finish, then find the search button
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Zip code is required')).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters when form is submitted', async () => {
    // Mock the reservations API call first (called on mount)
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });
    // Mock axios.all if it exists
    if (mockAxios.all) {
      mockAxios.all.mockResolvedValue([]);
    }
    // Mock the events API call (called on form submit)
    mockAxios.get.mockResolvedValueOnce({
      data: { agencies: [] },
    });

    renderWithProvider();

    const zipInput = screen.getByPlaceholderText('Enter zip code');

    // Wait for loading to finish, then find the search button
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(zipInput, { target: { value: '67890' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(expect.any(String), {
        params: { zip_code: '67890' },
      });
    });
  });

  it('shows loading spinner when fetching events', async () => {
    // Mock the reservations API call first (called on mount)
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });
    // Mock the events API call with delay
    mockAxios.get.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    renderWithProvider();

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    const zipInput = screen.getByPlaceholderText('Enter zip code');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(zipInput, { target: { value: '67890' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner-medium')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock the reservations API call first (called on mount)
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });
    // Mock the events API call to reject
    mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

    renderWithProvider();

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    const zipInput = screen.getByPlaceholderText('Enter zip code');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(zipInput, { target: { value: '67890' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      // Should still render the component
      expect(screen.getByText('Zip Code')).toBeInTheDocument();
    });
  });

  it('fetches user reservations on component mount', async () => {
    // Mock axios.all to return empty array
    if (mockAxios.all) {
      mockAxios.all.mockResolvedValue([]);
    }
    // Mock the reservations API call
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });

    renderWithProvider();

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        }),
      );
    });
  });

  it('renders with correct background and spacing classes', () => {
    // Mock the reservations API call
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });

    renderWithProvider();

    const section = screen.getByText('Zip Code').closest('section');
    expect(section).toHaveClass('bg-[#F2F0F4]');

    const container = section?.querySelector('.container');
    expect(container).toHaveClass(
      'pt-16',
      'sm:pt-24',
      'lg:pt-[150px]',
      'pb-16',
      'sm:pb-24',
      'lg:pb-[150px]',
    );
  });

  it('renders form with shadcn components', async () => {
    // Mock the reservations API call
    mockAxios.get.mockResolvedValueOnce({
      data: [],
    });

    renderWithProvider();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
    });

    // Check that Label component is used
    const label = screen.getByText('Zip Code');
    expect(label.tagName).toBe('LABEL');

    // Check that Input component is used
    const input = screen.getByPlaceholderText('Enter zip code');
    expect(input).toBeInTheDocument();

    // Check that Button component is used
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeInTheDocument();
  });
});

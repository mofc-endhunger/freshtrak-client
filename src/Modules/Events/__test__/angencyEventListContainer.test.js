import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import AgencyEventListContainer from '../AgencyEventListContainer';
import {
  mockAgencyBuilder,
  mockEventsBuilder,
  mockEventDatesBuilder,
  mockFormsBuilder,
} from '../../../Testing/mock-events';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    ...jest.requireActual('axios'),
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => mockAxiosInstance),
  };
});

// FavoriteButton (now inside EventCardComponent) requires AuthContext
jest.mock('../../Authentication/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

// Avoid rendering FavoriteButton's full Redux + dialog tree in these tests
jest.mock('../../../components/shared/FavoriteButton', () => () => null);

const mockStore = configureStore([]);
const store = mockStore({});

const renderWithRoute = (ui) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/agency/123']}>
        <Routes>
          <Route path="/agency/:agencyId" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('AgencyEventListContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading', async () => {
    axios.get.mockResolvedValue({ data: { agency: {} } });
    renderWithRoute(<AgencyEventListContainer />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  test('should show error if server error', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    const { getByText } = renderWithRoute(<AgencyEventListContainer />);
    await waitFor(() => {
      getByText('Something went wrong');
    });
  });

  test('should show the results from the events api', async () => {
    const mockEvent = mockEventsBuilder({ name: 'Test Event' });
    const mockEventDate = mockEventDatesBuilder();
    const mockForm = mockFormsBuilder();
    const agencyWithEvents = mockAgencyBuilder({
      events: [
        {
          ...mockEvent,
          event_dates: [mockEventDate],
          forms: [mockForm],
        },
      ],
    });
    axios.get.mockResolvedValue({ data: { agency: agencyWithEvents } });
    const { getByText } = renderWithRoute(<AgencyEventListContainer />);
    await waitFor(() => {
      getByText('Test Event');
    });
  });
});

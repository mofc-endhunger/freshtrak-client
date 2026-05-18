import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, waitFor, screen } from '@testing-library/react';
import EventContainer from '../EventContainer';
import axios from 'axios';
import { mockFoodBank } from '../../../Testing';

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
    // top-level methods used directly by EventContainer
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    // axios.create() used by FavoritesApiService
    create: jest.fn(() => mockAxiosInstance),
  };
});
jest.mock('@radix-ui/react-use-size');

// Auth mock — default unauthenticated; overridden per test where needed
let mockIsAuthenticated = false;
jest.mock('../../Authentication/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

// FavoriteButton mock to avoid full Redux setup inside the card
jest.mock('../../../components/shared/FavoriteButton', () => () => null);

const initialState = {
  addressSearch: { zipCode: '12345' },
  favorites: { favoriteEventIds: [], status: 'idle' },
};
const mockStore = configureStore([]);
const store = mockStore(initialState);

// Mocking Google API library without which it shows error.
jest.mock('../../General/GooglePlacesAutocomplete', () => {
  const React = require('react'); // eslint-disable-line
  class GooglePlacesAutocomplete extends React.Component {
    render() {
      return (
        <input
          type="text"
          className={this.props.className}
          id={this.props.id}
          name={this.props.name}
          value={this.props.value}
          onChange={this.props.onChange}
          placeholder={this.props.placeholder}
          {...this.props}
        />
      );
    }
  }

  return GooglePlacesAutocomplete;
});

const renderWithRoute = (ui) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/events/list/12345']}>
        <Routes>
          <Route path="/events/list/:zipCode" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('EventContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = false;
  });

  test('should load without errors', async () => {
    axios.get.mockResolvedValue({ data: { foodbanks: [mockFoodBank] } });
    renderWithRoute(<EventContainer />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  test('Successful api call', async () => {
    axios.get.mockResolvedValue({ data: { foodbanks: [mockFoodBank] } });
    const { getByText } = renderWithRoute(<EventContainer />);
    await waitFor(() => {
      getByText(mockFoodBank.name);
    });
  });

  test('Failed api call', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    const { getByText } = renderWithRoute(<EventContainer />);
    await waitFor(() => {
      getByText('Something went wrong');
    });
  });

  // ─── Favorites filter chip ────────────────────────────────────────────────

  describe('Favorites filter chip', () => {
    test('does not render the Favorites chip when unauthenticated', async () => {
      mockIsAuthenticated = false;
      axios.get.mockResolvedValue({ data: { agencies: [], foodbanks: [] } });
      renderWithRoute(<EventContainer />);
      await waitFor(() => {
        expect(screen.queryByTestId('favorites-filter-chip')).not.toBeInTheDocument();
      });
    });

    test('renders the Favorites chip when authenticated', async () => {
      mockIsAuthenticated = true;
      axios.get.mockResolvedValue({ data: { agencies: [], foodbanks: [] } });
      renderWithRoute(<EventContainer />);
      await waitFor(() => {
        expect(screen.getByTestId('favorites-filter-chip')).toBeInTheDocument();
      });
    });
  });
});

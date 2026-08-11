import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import EventContainer from '../EventContainer';
import axios from 'axios';
import { mockFoodBank } from '../../../Testing';

jest.mock('axios');
jest.mock('@radix-ui/react-use-size');

const initialState = {
  addressSearch: { zipCode: '12345' },
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

  describe('events request failure', () => {
    // Routes each endpoint independently so a failing events search can be
    // tested without also failing the unrelated foodbank lookup.
    const mockEndpoints = ({ events }) =>
      axios.get.mockImplementation((url) => {
        if (url.includes('api/agencies')) return events();
        if (url.includes('api/foodbanks'))
          return Promise.resolve({ data: { foodbanks: [mockFoodBank] } });
        if (url.includes('api/external-agencies'))
          return Promise.resolve({ data: { external_agencies: [] } });
        return Promise.resolve({ data: {} });
      });

    test('surfaces an error with a retry instead of an empty result set', async () => {
      mockEndpoints({ events: () => Promise.reject(new Error('timeout of 20000ms exceeded')) });

      renderWithRoute(<EventContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('events-error')).toBeInTheDocument();
      });
      expect(screen.getByTestId('events-error-retry')).toBeInTheDocument();
      // A failed request must not be reported as "no events scheduled" -- that
      // would tell the user there is no food available when the search in fact
      // never completed.
      expect(screen.queryByTestId('no-events-message')).not.toBeInTheDocument();
    });

    test('retry re-issues the events request and clears the error', async () => {
      let attempt = 0;
      mockEndpoints({
        events: () => {
          attempt += 1;
          return attempt === 1
            ? Promise.reject(new Error('timeout of 20000ms exceeded'))
            : Promise.resolve({ data: { agencies: [] } });
        },
      });

      renderWithRoute(<EventContainer />);

      const retry = await screen.findByTestId('events-error-retry');
      fireEvent.click(retry);

      await waitFor(() => {
        expect(screen.queryByTestId('events-error')).not.toBeInTheDocument();
      });
      expect(attempt).toBeGreaterThanOrEqual(2);
    });

    test('bounds the events request with a timeout so a stall cannot hang the page', async () => {
      mockEndpoints({ events: () => Promise.resolve({ data: { agencies: [] } }) });

      renderWithRoute(<EventContainer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
      const eventsCall = axios.get.mock.calls.find(([url]) => url.includes('api/agencies'));
      expect(eventsCall).toBeDefined();
      expect(eventsCall[1].timeout).toBeGreaterThan(0);
    });
  });
});

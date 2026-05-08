import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton';
import favoritesReducer, { FavoritesState } from '../../../Store/Favorites/favoritesSlice';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Capture dispatched actions without replacing the actual reducer
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

let mockIsAuthenticated = true;
jest.mock('../../../Modules/Authentication/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

// Axios mock for any potential side effects (service imports)
jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  })),
}));

jest.mock('../../../Utils/Urls', () => ({
  API_URL: {
    FAVORITES: 'https://reg-api.example.com/api/favorites',
    FAVORITE_BY_EVENT: (id: number) => `https://reg-api.example.com/api/favorites/${id}`,
  },
  RENDER_URL: { LOGIN_URL: '/login' },
}));

jest.mock('../../../Utils/StorageService', () => ({
  StorageService: { getCognitoUser: jest.fn(() => ({ accessToken: 'mock-token' })) },
}));

jest.mock('../../../config', () => ({
  default: { REGISTRATION_API: 'https://reg-api.example.com' },
}));

jest.mock('../../../lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildStore = (favoriteEventIds: number[] = []) =>
  configureStore({
    reducer: { favorites: favoritesReducer },
    preloadedState: {
      favorites: { favoriteEventIds, status: 'idle' } as FavoritesState,
    },
  });

const renderButton = (eventId: number, favoriteIds: number[] = []) => {
  const store = buildStore(favoriteIds);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <FavoriteButton eventId={eventId} />
      </MemoryRouter>
    </Provider>,
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
  });

  describe('rendering', () => {
    it('renders the button with accessible label when not favorited', () => {
      renderButton(101, []);
      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
      expect(screen.getByTestId('star-outline')).toBeInTheDocument();
    });

    it('renders the button with accessible label when favorited', () => {
      renderButton(101, [101]);
      expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
      expect(screen.getByTestId('star-filled')).toBeInTheDocument();
    });
  });

  describe('authenticated user interactions', () => {
    it('dispatches addFavorite thunk when clicking an unfavorited event', () => {
      renderButton(202, []);
      fireEvent.click(screen.getByTestId('favorite-button'));
      // mockDispatch is called with the result of addFavorite(202) thunk
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('dispatches removeFavorite thunk when clicking a favorited event', () => {
      renderButton(303, [303]);
      fireEvent.click(screen.getByTestId('favorite-button'));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('does not open the login prompt for authenticated users', () => {
      renderButton(404, []);
      fireEvent.click(screen.getByTestId('favorite-button'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated user interactions', () => {
    beforeEach(() => {
      mockIsAuthenticated = false;
    });

    it('opens the login-prompt dialog instead of dispatching', () => {
      renderButton(505, []);
      fireEvent.click(screen.getByTestId('favorite-button'));
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/sign in to save favorites/i)).toBeInTheDocument();
    });

    it('navigates to /login when the Log in button is clicked', () => {
      renderButton(505, []);
      fireEvent.click(screen.getByTestId('favorite-button'));
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('closes the dialog when Cancel is clicked without navigating', () => {
      renderButton(505, []);
      fireEvent.click(screen.getByTestId('favorite-button'));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('event propagation', () => {
    it('stops click event from propagating to the parent', () => {
      const parentHandler = jest.fn();
      const store = buildStore([]);
      render(
        <Provider store={store}>
          <MemoryRouter>
            <div onClick={parentHandler}>
              <FavoriteButton eventId={606} />
            </div>
          </MemoryRouter>
        </Provider>,
      );
      fireEvent.click(screen.getByTestId('favorite-button'));
      expect(parentHandler).not.toHaveBeenCalled();
    });
  });
});

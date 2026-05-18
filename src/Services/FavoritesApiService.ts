/**
 * Favorites API Service
 *
 * Manages user favorite events via the registration API:
 *   GET    /api/favorites            — fetch all favorite event IDs for the current user
 *   POST   /api/favorites            — add an event to favorites
 *   DELETE /api/favorites/:eventId   — remove an event from favorites
 *
 * All endpoints require a valid Cognito JWT (Bearer token).
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { StorageService } from '../Utils/StorageService';
import { API_URL } from '../Utils/Urls';
import config from '../config';

export interface FavoriteRecord {
  id: number;
  event_id: number;
  created_at: string;
}

export interface GetFavoritesResponse {
  favorites: FavoriteRecord[];
}

export interface AddFavoriteResponse {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
}

export interface FavoritesApiError {
  status: number;
  message: string;
}

export class FavoritesApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.REGISTRATION_API || '',
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.axiosInstance.interceptors.request.use(
      (cfg) => {
        const token = this.getAuthToken();
        if (token) {
          cfg.headers = cfg.headers || {};
          cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
      },
      (error) => Promise.reject(error),
    );
  }

  private getAuthToken(): string | null {
    try {
      const cognitoUser = StorageService.getCognitoUser();
      return cognitoUser?.accessToken ?? null;
    } catch {
      return null;
    }
  }

  private parseError(error: AxiosError): FavoritesApiError {
    if (error.response) {
      const data = error.response.data as { message?: string };
      return {
        status: error.response.status,
        message: data?.message || 'An error occurred',
      };
    }
    return { status: 0, message: error.message || 'Network error' };
  }

  /**
   * GET /api/favorites
   * Returns all favorited event records for the authenticated user.
   */
  async getFavorites(): Promise<GetFavoritesResponse> {
    try {
      const response = await this.axiosInstance.get<GetFavoritesResponse>(API_URL.FAVORITES);
      return response.data;
    } catch (error) {
      throw this.parseError(error as AxiosError);
    }
  }

  /**
   * POST /api/favorites
   * Adds an event to the authenticated user's favorites.
   */
  async addFavorite(eventId: number): Promise<AddFavoriteResponse> {
    try {
      const response = await this.axiosInstance.post<AddFavoriteResponse>(API_URL.FAVORITES, {
        event_id: eventId,
      });
      return response.data;
    } catch (error) {
      throw this.parseError(error as AxiosError);
    }
  }

  /**
   * DELETE /api/favorites/:eventId
   * Removes an event from the authenticated user's favorites.
   */
  async removeFavorite(eventId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(API_URL.FAVORITE_BY_EVENT(eventId));
    } catch (error) {
      throw this.parseError(error as AxiosError);
    }
  }
}

export const favoritesApiService = new FavoritesApiService();

import axios from 'axios';
import { HouseholdRegistrationService } from '../HouseholdRegistrationService';
import { UsersMeResponse } from '../../Modules/Households/types/api.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock API_URL
jest.mock('../../Utils/Urls', () => ({
  API_URL: {
    CREATE_RESERVATION: 'https://api.example.com/registrations',
  },
}));

// Mock StorageService
const mockGetCognitoUser = jest.fn();

jest.mock('../../Utils/StorageService', () => ({
  StorageService: {
    getCognitoUser: (...args: any[]) => mockGetCognitoUser(...args),
  },
}));

describe('HouseholdRegistrationService', () => {
  let service: HouseholdRegistrationService;

  beforeEach(() => {
    service = new HouseholdRegistrationService();
    jest.clearAllMocks();
    // Reset mock to return token
    mockGetCognitoUser.mockReturnValue({
      email: 'test@example.com',
      name: 'Test User',
      isSignedIn: true,
      accessToken: 'mock-token',
      signInDetails: {
        isSignedIn: true,
        accessToken: 'mock-token',
      },
    });
  });

  describe('registerWithHousehold', () => {
    const mockTimeslotData = {
      eventId: 'event123',
      eventDateId: 'date456',
      eventSlotId: 'slot789',
    };

    it('successfully registers with household data', async () => {
      const mockResponse = {
        data: { success: true, message: 'Registration successful' },
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration completed successfully');
      expect(result.data).toEqual(mockResponse.data);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.example.com/registrations',
        {
          event_id: 'event123',
          event_date_id: 'date456',
          event_slot_id: 'slot789',
        },
        {
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
    });

    it('handles timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      // Mock multiple rejections for retry attempts
      mockedAxios.post
        .mockRejectedValueOnce(timeoutError)
        .mockRejectedValueOnce(timeoutError)
        .mockRejectedValueOnce(timeoutError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timed out. Please try again.');
    });

    it('handles authentication errors (401)', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(authError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed. Please sign in again.');
    });

    it('handles timeslot conflict errors (409)', async () => {
      const conflictError = {
        response: {
          status: 409,
          data: { message: 'Timeslot no longer available' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(conflictError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('This timeslot is no longer available. Please select another time.');
    });

    it('handles validation errors (422)', async () => {
      const validationError = {
        response: {
          status: 422,
          data: { message: 'Invalid data' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(validationError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid registration data. Please review your information.');
    });

    it('handles server errors (500)', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      // Mock multiple rejections for retry attempts
      mockedAxios.post
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error. Please try again later.');
    });

    it('handles network errors', async () => {
      const networkError = {
        message: 'Network Error',
      };

      // Mock multiple rejections for retry attempts
      mockedAxios.post
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError);

      const result = await service.registerWithHousehold(mockTimeslotData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please check your connection and try again.');
    });
  });

  describe('checkHouseholdCompleteness', () => {
    const completeHouseholdData: UsersMeResponse = {
      id: 1,
      number: 1,
      name: 'Smith Family',
      identification_code: 'ABC123',
      added_by: 1,
      last_updated_by: 1,
      deleted_by: null,
      deleted_on: null,
      members: [],
      updated_at: '2024-01-01T00:00:00Z',
      counts: {
        adults: 2,
        children: 1,
        seniors: 1,
        total: 4,
      },
      address_line_1: '123 Main St',
      address_line_2: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      zip_code: '12345',
      phone: '555-1234',
      email: 'smith@example.com',
      permission_to_text: true,
      permission_to_email: true,
    };

    it('returns true for complete household data', () => {
      const result = service.checkHouseholdCompleteness(completeHouseholdData);
      expect(result).toBe(true);
    });

    it('returns false when address_line_1 is missing', () => {
      const incompleteData = { ...completeHouseholdData, address_line_1: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when city is missing', () => {
      const incompleteData = { ...completeHouseholdData, city: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when state is missing', () => {
      const incompleteData = { ...completeHouseholdData, state: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when zip_code is missing', () => {
      const incompleteData = { ...completeHouseholdData, zip_code: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when phone is missing', () => {
      const incompleteData = { ...completeHouseholdData, phone: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when email is missing', () => {
      const incompleteData = { ...completeHouseholdData, email: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when no members', () => {
      const incompleteData = {
        ...completeHouseholdData,
        counts: { adults: 0, children: 0, seniors: 0, total: 0 },
      };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('returns false when counts are negative', () => {
      const incompleteData = {
        ...completeHouseholdData,
        counts: { adults: -1, children: 0, seniors: 0, total: 0 },
      };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('handles empty string values as incomplete', () => {
      const incompleteData = { ...completeHouseholdData, address_line_1: '' };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });

    it('handles undefined values as incomplete', () => {
      const incompleteData = { ...completeHouseholdData, address_line_1: null };
      const result = service.checkHouseholdCompleteness(incompleteData);
      expect(result).toBe(false);
    });
  });
});

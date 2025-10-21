import axios from 'axios';
import { HouseholdRegistrationService } from '../HouseholdRegistrationService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HouseholdRegistrationService Retry Logic Tests', () => {
  let householdRegistrationService: HouseholdRegistrationService;

  beforeEach(() => {
    householdRegistrationService = new HouseholdRegistrationService();
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify({ accessToken: 'mock-token' })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Retry Logic Tests', () => {
    test('should retry on network error and eventually succeed', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };


      // First two calls fail with network error, third succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockResolvedValueOnce(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    test('should retry on timeout error and eventually succeed', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };


      // First call times out, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded',
        })
        .mockResolvedValueOnce(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    test('should retry on server error (500) and eventually succeed', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };


      // First call fails with 500 error, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          response: {
            status: 500,
            data: {
              message: 'Internal server error',
            },
          },
        })
        .mockResolvedValueOnce(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    test('should not retry on authentication error (401)', async () => {
      const mockToken = 'invalid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed. Please sign in again.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // No retry
    });

    test('should not retry on timeslot conflict error (409)', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 409,
          data: {
            message: 'Timeslot is no longer available',
            code: 'TIMESLOT_CONFLICT',
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('This timeslot is no longer available. Please select another time.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // No retry
    });

    test('should not retry on validation error (422)', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'Invalid household data provided',
            errors: {
              address_line_1: 'Address is required',
            },
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid registration data. Please review your information.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // No retry
    });

    test('should stop retrying after maximum attempts', async () => {
      const mockToken = 'valid-token';


      // All calls fail with network error
      mockedAxios.post.mockRejectedValue({
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please check your connection and try again.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(3); // Max retry attempts
    });

    test('should include attempt number in console logs', async () => {
      const mockToken = 'valid-token';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();


      // First call fails, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            message: 'Registration successful',
          },
        });

      await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      // Check that attempt numbers are logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🏠 Registering with household data (attempt 1):'),
        expect.any(Object)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🏠 Registering with household data (attempt 2):'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle mixed retryable and non-retryable errors', async () => {
      const mockToken = 'valid-token';


      // First call fails with retryable error, second with non-retryable
      mockedAxios.post
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockRejectedValueOnce({
          response: {
            status: 401,
            data: {
              message: 'Unauthorized',
            },
          },
        });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed. Please sign in again.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    test('should handle unknown error types', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        message: 'Unknown error',
        someUnknownProperty: 'value',
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred. Please try again.');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Unknown errors are treated as non-retryable
    });
  });

  describe('Performance Tests', () => {
    test('should complete retry cycle within reasonable time', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };


      // First call fails, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockResolvedValueOnce(mockResponse);

      const startTime = Date.now();

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds (1 second delay + processing)
    });

    test('should handle concurrent retry operations', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };


      // Each operation fails once then succeeds
      mockedAxios.post
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'NETWORK_ERROR',
        })
        .mockResolvedValueOnce(mockResponse);

      const promises = [
        householdRegistrationService.registerWithHousehold({
          eventId: 'event-1',
          eventDateId: 'date-1',
          eventSlotId: 'slot-1',
        }),
        householdRegistrationService.registerWithHousehold({
          eventId: 'event-2',
          eventDateId: 'date-2',
          eventSlotId: 'slot-2',
        }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(4); // 2 operations × 2 calls each
    });
  });
});

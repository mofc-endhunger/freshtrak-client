import axios from 'axios';
import { HouseholdRegistrationService } from '../HouseholdRegistrationService';
import { API_URL } from '../../Utils/Urls';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock StorageService
const mockGetCognitoUser = jest.fn();

jest.mock('../../Utils/StorageService', () => ({
  StorageService: {
    getCognitoUser: (...args: any[]) => mockGetCognitoUser(...args),
  },
}));

describe('Registration API Integration Tests', () => {
  let householdRegistrationService: HouseholdRegistrationService;

  beforeEach(() => {
    householdRegistrationService = new HouseholdRegistrationService();
    jest.clearAllMocks();
    // Reset mock to return token
    mockGetCognitoUser.mockReturnValue({
      email: 'test@example.com',
      name: 'Test User',
      isSignedIn: true,
      accessToken: 'mock-cognito-token',
      signInDetails: {
        isSignedIn: true,
        accessToken: 'mock-cognito-token',
      },
    });
  });

  describe('API Response Time Tests', () => {
    test('should complete registration API call within 3 seconds', async () => {
      const mockToken = 'mock-cognito-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration completed successfully',
          data: {
            registration_id: 'reg-123',
            confirmation_code: 'ABC123',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const startTime = Date.now();

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(3000); // Less than 3 seconds
      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        API_URL.CREATE_RESERVATION,
        {
          event_id: 'event-123',
          event_date_id: 'date-456',
          event_slot_id: 'slot-789',
        },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
    });

    test('should handle timeout gracefully when API takes longer than 5 seconds', async () => {
      const mockToken = 'mock-cognito-token';


      // Mock axios to simulate timeout
      mockedAxios.post.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'Request timed out. Please try again.',
        message: 'Registration failed',
      });
    });
  });

  describe('Authentication Tests', () => {
    test('should handle valid authentication token', async () => {
      const mockToken = 'mock-cognito-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        API_URL.CREATE_RESERVATION,
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    test('should handle missing authentication token', async () => {

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

      expect(result).toEqual({
        success: false,
        error: 'Authentication failed. Please sign in again.',
        message: 'Registration failed',
      });
    });

    test('should handle expired authentication token', async () => {
      const expiredToken = 'expired-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: {
            message: 'Token expired',
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'Authentication failed. Please sign in again.',
        message: 'Registration failed',
      });
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle 409 conflict error (timeslot unavailable)', async () => {
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

      expect(result).toEqual({
        success: false,
        error: 'This timeslot is no longer available. Please select another time.',
        message: 'Registration failed',
      });
    });

    test('should handle 422 validation error (invalid household data)', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'Invalid household data provided',
            errors: {
              address_line_1: 'Address is required',
              phone: 'Phone number is invalid',
            },
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'Invalid registration data. Please review your information.',
        message: 'Registration failed',
      });
    });

    test('should handle 500 server error', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'Server error. Please try again later.',
        message: 'Registration failed',
      });
    });

    test('should handle network error', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'Network error. Please check your connection and try again.',
        message: 'Registration failed',
      });
    });

    test('should handle unknown error', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        message: 'Something went wrong',
        someUnknownProperty: 'value',
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        message: 'Registration failed',
      });
    });
  });

  describe('Payload Structure Validation Tests', () => {
    test('should send correct payload structure for household registration', async () => {
      const mockToken = 'mock-cognito-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        API_URL.CREATE_RESERVATION,
        {
          event_id: 'event-123',
          event_date_id: 'date-456',
          event_slot_id: 'slot-789',
        },
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        })
      );
    });

    test('should handle missing required fields in payload', async () => {
      const mockToken = 'valid-token';


      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: 'Missing required fields',
            errors: {
              event_id: 'Event ID is required',
              event_date_id: 'Event date ID is required',
              event_slot_id: 'Event slot ID is required',
            },
          },
        },
      });

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: '',
        eventDateId: '',
        eventSlotId: '',
      });

      expect(result).toEqual({
        success: false,
        error: 'Missing required fields',
        message: 'Registration failed',
      });
    });
  });

  describe('Success Scenarios', () => {
    test('should handle successful registration with complete response', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration completed successfully',
          data: {
            registration_id: 'reg-123456',
            confirmation_code: 'ABC123',
            qr_code_url: 'https://example.com/qr/ABC123',
            event_details: {
              name: 'Food Distribution Event',
              date: '2024-01-15',
              time: '10:00 AM - 12:00 PM',
              location: 'Community Center',
            },
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: true,
        message: 'Registration completed successfully',
        data: {
          success: true,
          message: 'Registration completed successfully',
          data: {
            registration_id: 'reg-123456',
            confirmation_code: 'ABC123',
            qr_code_url: 'https://example.com/qr/ABC123',
            event_details: {
              name: 'Food Distribution Event',
              date: '2024-01-15',
              time: '10:00 AM - 12:00 PM',
              location: 'Community Center',
            },
          },
        },
      });
    });

    test('should handle successful registration with minimal response', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await householdRegistrationService.registerWithHousehold({
        eventId: 'event-123',
        eventDateId: 'date-456',
        eventSlotId: 'slot-789',
      });

      expect(result).toEqual({
        success: true,
        message: 'Registration completed successfully',
        data: {
          success: true,
        },
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent registration requests', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const promises = Array.from({ length: 5 }, (_, index) =>
        householdRegistrationService.registerWithHousehold({
          eventId: `event-${index}`,
          eventDateId: `date-${index}`,
          eventSlotId: `slot-${index}`,
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(5);
    });

    test('should maintain performance under load', async () => {
      const mockToken = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, (_, index) =>
        householdRegistrationService.registerWithHousehold({
          eventId: `event-${index}`,
          eventDateId: `date-${index}`,
          eventSlotId: `slot-${index}`,
        })
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 10;

      expect(averageTime).toBeLessThan(1000); // Average response time should be less than 1 second
    });
  });
});

# Households API Service

This document describes the Households API Service implementation, including architecture, usage, and configuration.

## Overview

The `HouseholdsApiService` is a dedicated service class that handles all household-related API operations. It provides a clean, type-safe interface for interacting with the household backend API while handling authentication, error management, caching, and retry logic.

## Architecture

### Key Features

-   **Type Safety**: Full TypeScript integration with comprehensive type definitions
-   **Authentication**: Automatic Cognito token handling for authenticated requests
-   **Error Handling**: Comprehensive error handling with user-friendly messages
-   **Caching**: Intelligent client-side caching for improved performance
-   **Retry Logic**: Automatic retry for failed requests with exponential backoff
-   **Request/Response Interceptors**: Centralized request/response processing

### Service Structure

```
HouseholdsApiService
├── Authentication Management
├── Request/Response Interceptors
├── Caching Layer
├── Retry Logic
├── Error Handling
└── API Operations
    ├── Household CRUD
    ├── Member Management
    └── Bulk Operations
```

## Configuration

### Environment Variables

The service uses the following environment variables:

```env
REACT_APP_PANTRY_FINDER_API=https://api.example.com
```

### API Endpoints

The service automatically constructs endpoints based on the backend API specification:

-   `POST /households` - Create household
-   `GET /households` - Get current user's household
-   `GET /households/:id` - Get household by ID
-   `PATCH /households/:id` - Update household
-   `GET /households/:id/members` - List household members
-   `POST /households/:id/members` - Add household member
-   `PATCH /households/:id/members/:memberId` - Update household member
-   `DELETE /households/:id/members/:memberId` - Deactivate household member

## Usage Examples

### Basic Usage

```typescript
import { householdsApiService } from "../Services/HouseholdsApiService";

// Create a new household
const householdData = {
	address_line_1: "123 Main St",
	city: "Columbus",
	state: "OH",
	zip_code: "43004",
	preferred_language: "en",
	primary_first_name: "Jane",
	primary_last_name: "Doe",
	primary_date_of_birth: "1990-01-01",
};

try {
	const household = await householdsApiService.createHousehold(householdData);
	console.log("Household created:", household);
} catch (error) {
	console.error("Failed to create household:", error);
}
```

### Member Management

```typescript
// Add a new member
const memberData = {
	first_name: "John",
	last_name: "Doe",
	date_of_birth: "2010-06-15",
	gender: "male",
};

const member = await householdsApiService.addMember(householdId, memberData);

// Update member information
const updateData = {
	phone: "555-123-4567",
	email: "john.doe@example.com",
};

const updatedMember = await householdsApiService.updateMember(
	householdId,
	memberId,
	updateData
);

// Deactivate member
await householdsApiService.deactivateMember(householdId, memberId);
```

### Error Handling

```typescript
try {
	const household = await householdsApiService.getHousehold();
} catch (error) {
	switch (error.type) {
		case "AUTHENTICATION_ERROR":
			// Handle authentication issues
			break;
		case "NETWORK_ERROR":
			// Handle network issues
			break;
		case "VALIDATION_ERROR":
			// Handle validation errors
			break;
		default:
		// Handle other errors
	}
}
```

## Authentication

The service automatically handles Cognito authentication by:

1. **Token Retrieval**: Extracting access tokens from localStorage
2. **Header Injection**: Adding `Authorization: Bearer <token>` headers
3. **Token Validation**: Checking token validity before requests
4. **Error Handling**: Gracefully handling authentication failures

### Token Storage

Tokens are stored in localStorage under the `cognitoUser` key:

```typescript
{
  "email": "user@example.com",
  "name": "John Doe",
  "isSignedIn": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "signInDetails": { ... }
}
```

## Caching

The service implements intelligent caching to improve performance:

### Cache Strategy

-   **GET Requests**: Automatically cached for 5 minutes
-   **Write Operations**: Cache invalidated after successful updates
-   **Cache Keys**: Structured keys for different data types
-   **TTL**: Configurable time-to-live for cached data

### Cache Management

```typescript
// Clear all cached data
householdsApiService.clearCache();

// Clear specific household cache
householdsApiService.clearCacheForHousehold(householdId);
```

## Error Handling

### Error Types

The service categorizes errors into specific types:

-   `AUTHENTICATION_ERROR` - Token issues, user not authenticated
-   `AUTHORIZATION_ERROR` - Permission denied, insufficient rights
-   `VALIDATION_ERROR` - Invalid data, missing required fields
-   `NETWORK_ERROR` - Connection issues, timeouts
-   `SERVER_ERROR` - Backend server errors (5xx)
-   `NOT_FOUND` - Resource not found (404)
-   `CONFLICT` - Resource conflicts (409)
-   `API_RATE_LIMIT` - Rate limiting (429)

### Error Response Format

```typescript
interface ApiErrorDetails {
	type: HouseholdApiError;
	message: string;
	code?: string;
	details?: any;
	retryable: boolean;
}
```

## Retry Logic

The service implements automatic retry for failed requests:

### Retry Configuration

-   **Max Attempts**: 3 retry attempts
-   **Retry Delay**: Exponential backoff (1s, 2s, 3s)
-   **Retryable Errors**: Network errors, server errors (5xx), rate limits
-   **Non-Retryable**: Authentication, authorization, validation errors

### Retry Behavior

```typescript
// Automatic retry for retryable errors
try {
	const result = await householdsApiService.getHousehold();
} catch (error) {
	// Service automatically retries up to 3 times
	// Only throws error after all retries exhausted
}
```

## Performance Optimization

### Request Optimization

-   **Request Deduplication**: Prevents duplicate requests
-   **Connection Pooling**: Reuses HTTP connections
-   **Compression**: Automatic gzip compression
-   **Timeout Management**: 30-second request timeout

### Response Optimization

-   **Data Caching**: Reduces redundant API calls
-   **Selective Updates**: Only updates changed data
-   **Batch Operations**: Supports bulk member operations
-   **Pagination**: Efficient handling of large datasets

## Testing

### Mock Data

Comprehensive mock data is available for testing:

```typescript
import {
	mockHousehold,
	mockHouseholdMembers,
	mockCreateHouseholdRequest,
} from "../Testing/mock-households";

// Use mock data in tests
const testHousehold = mockHousehold;
const testMembers = mockHouseholdMembers;
```

### Test Utilities

```typescript
// Create custom mock household
const customHousehold = createMockHousehold({
	city: "Custom City",
	preferred_language: "es",
});

// Create custom mock member
const customMember = createMockMember({
	first_name: "Custom",
	last_name: "Member",
});
```

## Integration with Existing Code

### URL Configuration

Household endpoints are added to the existing URL configuration:

```typescript
// src/Utils/Urls.js
export const API_URL = {
	// ... existing endpoints
	HOUSEHOLDS: `${REGISTRATION_URL}households`,
	HOUSEHOLD_MEMBERS: householdId =>
		`${REGISTRATION_URL}households/${householdId}/members`,
};
```

### Authentication Integration

The service integrates seamlessly with the existing Cognito authentication system:

-   Uses existing token storage format
-   Follows established authentication patterns
-   Maintains compatibility with current auth flow

## Best Practices

### Error Handling

1. **Always handle errors**: Use try-catch blocks for all API calls
2. **Check error types**: Handle different error types appropriately
3. **Provide user feedback**: Show meaningful error messages to users
4. **Log errors**: Log errors for debugging and monitoring

### Performance

1. **Use caching**: Leverage built-in caching for frequently accessed data
2. **Batch operations**: Use bulk operations when possible
3. **Optimize requests**: Only request necessary data
4. **Handle loading states**: Show loading indicators during API calls

### Security

1. **Token management**: Never expose tokens in client-side code
2. **Input validation**: Validate data before sending to API
3. **Error sanitization**: Don't expose sensitive error details
4. **HTTPS only**: Ensure all API calls use HTTPS

## Troubleshooting

### Common Issues

1. **Authentication Errors**

    - Check if user is logged in
    - Verify token is valid and not expired
    - Ensure proper Cognito configuration

2. **Network Errors**

    - Check internet connection
    - Verify API endpoint URLs
    - Check for CORS issues

3. **Validation Errors**
    - Review required fields
    - Check data format and types
    - Validate input data before API calls

### Debug Mode

Enable debug logging by setting:

```typescript
// In development
localStorage.setItem("debug_households_api", "true");
```

This will log detailed information about API requests, responses, and errors.

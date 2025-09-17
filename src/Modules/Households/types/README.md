# Households Module TypeScript Interfaces

This directory contains all TypeScript interfaces and types for the Households module, organized by functionality and following the project's established patterns.

## File Structure

-   **`household.types.ts`** - Core household and member data structures
-   **`api.types.ts`** - API request/response types and service interfaces
-   **`form.types.ts`** - Form data types and validation interfaces
-   **`error.types.ts`** - Error handling types and error codes
-   **`index.ts`** - Main export file with all type definitions

## Core Types

### Household

The main household data structure containing:

-   Basic household information (address, language preference, notes)
-   Array of household members
-   Derived counts (children, adults, seniors, total)
-   Audit timestamps

### HouseholdMember

Individual member data structure with:

-   Personal information (name, demographics)
-   Contact details (phone, email)
-   Address information (optional, defaults to household)
-   Status and activity flags

### HouseholdCounts

Derived counts calculated from member dates of birth:

-   `children`: Age < 18
-   `seniors`: Age ≥ 60
-   `adults`: Total active members - children - seniors
-   `total`: Total active members

## API Types

### Request/Response Types

-   `CreateHouseholdRequest` - Data needed to create a new household
-   `UpdateHouseholdRequest` - Data for updating household information
-   `CreateMemberRequest` - Data for adding new household members
-   `UpdateMemberRequest` - Data for updating member information

### Service Interface

`HouseholdApiService` defines all available API operations:

-   Household CRUD operations
-   Member management operations
-   Bulk operations for multiple members

## Form Types

### Form Data Types

-   `HouseholdSetupFormData` - Complete household setup form
-   `MemberFormData` - Individual member form data
-   `HouseholdEditFormData` - Household information editing

### Component Props

-   `FormComponentProps` - Base props for form components
-   `HouseholdSetupWizardProps` - Multi-step setup wizard
-   `MemberFormProps` - Member creation/editing forms

## Error Types

### Error Categories

-   `HouseholdError` - Household-specific errors
-   `MemberError` - Member-specific errors
-   `ValidationError` - Form validation errors
-   `ApiError` - API communication errors
-   `AuthenticationError` - Auth-related errors

### Error Codes

Enumeration of specific error codes for consistent error handling:

-   `HOUSEHOLD_NOT_FOUND`, `MEMBER_NOT_FOUND`
-   `INVALID_ADDRESS`, `INVALID_DATE_OF_BIRTH`
-   `USER_NOT_AUTHENTICATED`, `TOKEN_EXPIRED`
-   `API_NETWORK_ERROR`, `API_TIMEOUT`

## Usage Examples

### Basic Household Creation

```typescript
import { CreateHouseholdRequest, Household } from "./types";

const householdData: CreateHouseholdRequest = {
	address_line_1: "123 Main St",
	city: "Columbus",
	state: "OH",
	zip_code: "43004",
	preferred_language: "en",
	primary_first_name: "Jane",
	primary_last_name: "Doe",
	primary_date_of_birth: "1990-01-01",
};
```

### Member Form Component

```typescript
import { MemberFormProps, MemberFormData } from "./types";

const MemberForm: React.FC<MemberFormProps> = ({
	register,
	errors,
	onSave,
	onCancel,
	isLoading,
	initialData,
}) => {
	// Component implementation
};
```

### Error Handling

```typescript
import { HouseholdErrorType, HouseholdErrorCodes } from "./types";

const handleError = (error: HouseholdErrorType) => {
	switch (error.code) {
		case HouseholdErrorCodes.HOUSEHOLD_NOT_FOUND:
			// Handle household not found
			break;
		case HouseholdErrorCodes.INVALID_ADDRESS:
			// Handle invalid address
			break;
		default:
		// Handle generic error
	}
};
```

## Type Safety Benefits

1. **Compile-time Validation** - Catch errors during development
2. **IntelliSense Support** - Better IDE autocomplete and suggestions
3. **Refactoring Safety** - Rename operations update all references
4. **API Contract** - Clear interface between frontend and backend
5. **Form Validation** - Type-safe form data handling

## Integration with Existing Code

These types are designed to integrate seamlessly with:

-   **React Hook Form** - Form validation and data handling
-   **Existing Family Module** - Backward compatibility maintained
-   **Authentication System** - Cognito integration
-   **API Services** - Consistent request/response patterns
-   **Error Handling** - Centralized error management

## Future Extensibility

The type system is designed to be easily extensible:

-   Add new member fields without breaking existing code
-   Extend API operations with new endpoints
-   Add new validation rules and error types
-   Support additional languages and demographics

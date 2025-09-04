# AWS Cognito Authentication Implementation

This module implements a demo signin/signup functionality using AWS Cognito and Amplify for the FreshTrak application.

## Features

- **Sign Up**: Create new accounts with email and password
- **Sign In**: Authenticate existing users with email and password
- **Email Confirmation**: Verify email addresses with confirmation codes
- **Guest Login**: Continue as guest (existing functionality)
- **Form Validation**: Client-side validation using Zod and React Hook Form
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Components

### Core Components

- **AuthenticationModal**: Main modal component with tabbed interface
- **SignInFormComponent**: Sign in form with email/password fields
- **SignUpFormComponent**: Sign up form with email/password/name fields
- **ConfirmSignUpFormComponent**: Email confirmation form
- **AuthContext**: React context for authentication state management
- **AuthDemoPage**: Demo page for testing authentication functionality

### Supporting Components

- **GuestLoginButtonComponent**: Guest login button (existing)
- **LoadingSpinner**: Loading indicator component

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_CLIENT_ID=your-user-pool-client-id
REACT_APP_AWS_REGION=us-east-1
```

### AWS Cognito Setup

1. Create a Cognito User Pool in AWS Console
2. Configure the user pool with:
   - Email as username
   - Email verification required
   - Password policy (minimum 8 characters)
3. Create a user pool client
4. Update the environment variables with your pool details

## Usage

### Basic Usage

```tsx
import { AuthProvider } from './Modules/Authentication/AuthContext';
import AuthenticationModal from './Modules/Authentication/AuthenticationModal';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthProvider>
      <AuthenticationModal
        show={showAuth}
        setshow={setShowAuth}
        onLogin={() => console.log('Login successful')}
        initialTab="signin"
        showGuestLogin={true}
      />
    </AuthProvider>
  );
}
```

### Using the Auth Context

```tsx
import { useAuth } from './Modules/Authentication/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.email}!</div>;
  }

  return <div>Please sign in</div>;
}
```

## Demo

Visit `/auth-demo` to test the authentication functionality. The demo page includes:

- Authentication status display
- Buttons to trigger the authentication modal
- Instructions for testing
- Configuration notes

## Styling

The implementation follows the existing FreshTrak design system:

- **Colors**: Uses the established color palette (primary green, secondary purple)
- **Components**: Built with shadcn/ui components
- **Typography**: Consistent with existing patterns
- **Responsive**: Mobile-first design approach

## Dependencies

- `aws-amplify`: AWS Amplify SDK
- `@aws-amplify/ui-react`: Amplify UI components
- `react-hook-form`: Form handling
- `@hookform/resolvers`: Form validation resolvers
- `zod`: Schema validation
- `@radix-ui/*`: UI primitives (via shadcn/ui)

## File Structure

```
src/Modules/Authentication/
├── AuthContext.tsx                 # Authentication context
├── AuthenticationModal.tsx         # Main modal component
├── SignInFormComponent.tsx         # Sign in form
├── SignUpFormComponent.tsx         # Sign up form
├── ConfirmSignUpFormComponent.tsx  # Email confirmation form
├── GuestLoginButtonComponent.tsx   # Guest login button
├── AuthDemoPage.tsx               # Demo page
├── types/
│   └── authentication.types.ts    # TypeScript interfaces
└── README.md                      # This file
```

## Testing

The implementation includes comprehensive error handling and validation:

- Form validation with Zod schemas
- Network error handling
- User feedback for all states
- Loading states for better UX

## Production Considerations

For production deployment:

1. Set up a real AWS Cognito User Pool
2. Configure proper environment variables
3. Set up proper error monitoring
4. Add unit tests for components
5. Configure proper CORS settings
6. Set up proper logging and analytics

## Security Notes

- Passwords are handled securely by AWS Cognito
- No sensitive data is stored in localStorage
- All authentication flows go through AWS services
- CSRF protection is handled by Amplify

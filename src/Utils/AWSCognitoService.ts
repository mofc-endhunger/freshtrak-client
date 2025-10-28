// Use AWS SDK v2 for better compatibility
import * as AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
});

// Create Cognito client
const cognito = new AWS.CognitoIdentityServiceProvider();

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  name: string;
}

export interface SignUpResult {
  userId: string;
  username: string;
  isPendingConfirmation: boolean;
}

export interface ConfirmSignUpParams {
  username: string;
  confirmationCode: string;
}

export interface ConfirmSignUpResult {
  success: boolean;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResult {
  isSignedIn: boolean;
  userId: string;
  accessToken?: string;
}

export interface UserAttributesResult {
  [key: string]: string | undefined;
  // Common standard attributes
  sub?: string;                    // Unique user identifier
  email?: string;                  // User's email
  name?: string;                   // User's full name
  given_name?: string;             // First name
  family_name?: string;            // Last name
  phone_number?: string;           // Phone number
  email_verified?: string;         // Email verification status
  phone_number_verified?: string;  // Phone verification status
  updated_at?: string;             // Last updated timestamp
  locale?: string;                 // User's locale
  zoneinfo?: string;               // Timezone
  birthdate?: string;              // Birth date
  gender?: string;                 // Gender
  address?: string;                // Address
  picture?: string;                // Profile picture URL
  website?: string;                // Website URL
  profile?: string;                // Profile URL
  preferred_username?: string;     // Preferred username
  nickname?: string;               // Nickname
  middle_name?: string;            // Middle name
  // Additional fields we add
  account_created_date?: string;   // Account creation date (from custom attribute)
  account_last_modified?: string;  // Last modified date
  user_status?: string;            // User status
  // Custom attributes (prefixed with 'custom:')
  'custom:account_created_date'?: string;  // Raw custom attribute
}

/**
 * Custom signup function (no client secret required)
 */
export const customSignUp = async (params: SignUpParams): Promise<SignUpResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;

  if (!clientId) {
    throw new Error('REACT_APP_USER_POOL_CLIENT_ID is not configured');
  }

  // Generate a unique username since the user pool is configured for email alias
  const username = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const signUpParams: any = {
    ClientId: clientId,
    Username: username, // Use generated username for email alias configuration
    Password: params.password,
    UserAttributes: [
      {
        Name: 'email',
        Value: params.email,
      },
      {
        Name: 'name',
        Value: params.name,
      },
      // Note: Custom attributes require User Pool schema configuration
      // For now, we'll store account creation date in localStorage instead
      // TODO: Consider migrating to AdminGetUser API or database storage in the future
      // for better separation of concerns and to avoid cluttering user attributes
      {
        Name: 'custom:account_created_date',
        Value: new Date().toISOString(),
      },
    ],
  };

  try {
    const result = await cognito.signUp(signUpParams).promise();

    // Note: Account creation date is tracked by Cognito but not accessible via getUser API

    return {
      userId: result.UserSub || '',
      username: username,
      isPendingConfirmation: !result.UserConfirmed
    };
  } catch (error: any) {
    console.error('AWSCognitoService: SignUp error', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

/**
 * Custom confirm signup function (no client secret required)
 */
export const customConfirmSignUp = async (params: ConfirmSignUpParams): Promise<ConfirmSignUpResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;

  if (!clientId) {
    throw new Error('REACT_APP_USER_POOL_CLIENT_ID is not configured');
  }

  const confirmSignUpParams: any = {
    ClientId: clientId,
    Username: params.username,
    ConfirmationCode: params.confirmationCode,
  };

  try {
    await cognito.confirmSignUp(confirmSignUpParams).promise();

    return {
      success: true
    };
  } catch (error: any) {
    console.error('AWSCognitoService: ConfirmSignUp error', error);
    throw new Error(error.message || 'Failed to confirm sign up');
  }
};

/**
 * Custom sign in function (no client secret required)
 */
export const customSignIn = async (params: SignInParams): Promise<SignInResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;

  if (!clientId) {
    throw new Error('REACT_APP_USER_POOL_CLIENT_ID is not configured');
  }

  // Use USER_PASSWORD_AUTH flow (same as backend)
  try {

    const signInParams: any = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: params.email,
        PASSWORD: params.password,
      },
    };

    const result = await cognito.initiateAuth(signInParams).promise();

    return {
      isSignedIn: !!result.AuthenticationResult,
      userId: result.AuthenticationResult?.AccessToken || '',
      accessToken: result.AuthenticationResult?.AccessToken
    };
  } catch (error: any) {
    console.error('AWSCognitoService: initiateAuth failed:', error.message);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Custom fetch user attributes function that uses access token
 */
export const customFetchUserAttributes = async (accessToken: string): Promise<UserAttributesResult> => {
  try {
    const getUserParams = {
      AccessToken: accessToken
    };

    const result = await cognito.getUser(getUserParams).promise();

    // Convert AWS format to our format
    const attributes: UserAttributesResult = {};
    if (result.UserAttributes) {
      result.UserAttributes.forEach(attr => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value;
        }
      });
    }

    // Extract account creation date from custom attribute
    if (attributes['custom:account_created_date']) {
      attributes.account_created_date = attributes['custom:account_created_date'];
    }

    return attributes;
  } catch (error: any) {
    console.error('AWSCognitoService: getUser failed:', error.message);
    throw new Error(error.message || 'Failed to fetch user attributes');
  }
};

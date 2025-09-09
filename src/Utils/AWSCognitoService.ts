// Use AWS SDK v2 for better compatibility
import * as AWS from 'aws-sdk';
import { generateSecretHash } from './CognitoUtils';

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

/**
 * Custom signup function that handles SECRET_HASH for clients with secrets
 */
export const customSignUp = async (params: SignUpParams): Promise<SignUpResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

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
    ],
  };

  // Add SECRET_HASH if client secret is configured
  if (clientSecret) {
    const secretHash = generateSecretHash(username, clientId, clientSecret);
    signUpParams.SecretHash = secretHash;
  } else {
    console.warn('AWSCognitoService: No client secret configured');
  }

  try {
    const result = await cognito.signUp(signUpParams).promise();

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
 * Custom confirm signup function that handles SECRET_HASH for clients with secrets
 */
export const customConfirmSignUp = async (params: ConfirmSignUpParams): Promise<ConfirmSignUpResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('REACT_APP_USER_POOL_CLIENT_ID is not configured');
  }

  const confirmSignUpParams: any = {
    ClientId: clientId,
    Username: params.username,
    ConfirmationCode: params.confirmationCode,
  };

  // Add SECRET_HASH if client secret is configured
  if (clientSecret) {
    const secretHash = generateSecretHash(params.username, clientId, clientSecret);
    confirmSignUpParams.SecretHash = secretHash;
  } else {
    console.warn('AWSCognitoService: No client secret configured for confirmSignUp');
  }

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
 * Custom sign in function that handles SECRET_HASH for clients with secrets
 */
export const customSignIn = async (params: SignInParams): Promise<SignInResult> => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;

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

    // Add SECRET_HASH if client secret is configured
    if (clientSecret) {
      const secretHash = generateSecretHash(params.email, clientId, clientSecret);
      signInParams.AuthParameters.SECRET_HASH = secretHash;
    } else {
      console.warn('AWSCognitoService: No client secret configured for signIn');
    }

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

import { Amplify } from 'aws-amplify';
import config from './config';

// Configuration for AWS Cognito
// Client secret is no longer required - Cognito client is configured without secrets
const isTestEnvironment =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

const userPoolId = config.USER_POOL_ID;
const userPoolClientId = config.USER_POOL_CLIENT_ID;

if (!isTestEnvironment && (!userPoolId || !userPoolClientId)) {
  throw new Error(
    'Missing Cognito configuration. Set USER_POOL_ID and USER_POOL_CLIENT_ID in runtime-config.js or environment variables.'
  );
}

const amplifyConfig = {
  Auth: {
    Cognito: {
      // Test environment keeps deterministic placeholders to avoid unrelated test setup failures.
      userPoolId: userPoolId || 'us-east-1_testpool',
      userPoolClientId: userPoolClientId || 'testclientid1234567890',
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      signUpVerificationMethod: 'code' as const, // 'code' | 'link'
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: false,
        },
      },
    },
  },
};
// Configure Amplify
Amplify.configure(amplifyConfig);

export default amplifyConfig;

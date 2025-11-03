import { Amplify } from 'aws-amplify';
import config from './config';

// Configuration for AWS Cognito
// Client secret is no longer required - Cognito client is configured without secrets
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: config.USER_POOL_ID || 'us-east-1_demo123',
      userPoolClientId: config.USER_POOL_CLIENT_ID || 'demo-client-id',
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

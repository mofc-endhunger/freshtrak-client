import { Amplify } from 'aws-amplify';

// Demo configuration for AWS Cognito
// In production, these values should come from environment variables
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_demo123',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'demo-client-id',
      userPoolClientSecret: process.env.REACT_APP_USER_POOL_CLIENT_SECRET,
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

# AWS Cognito Client Secret Configuration

This document explains how to configure AWS Cognito with a client secret to fix the "SECRET_HASH was not received" error.

## Problem

When your AWS Cognito User Pool client is configured with a client secret, AWS requires a `SECRET_HASH` parameter in all authentication requests. The error occurs because the current implementation doesn't include this parameter.

## Solution

The codebase has been updated to automatically generate and include the `SECRET_HASH` when a client secret is configured.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AWS Cognito Configuration
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_CLIENT_ID=your-user-pool-client-id
REACT_APP_USER_POOL_CLIENT_SECRET=your-user-pool-client-secret
REACT_APP_AWS_REGION=us-east-1
```

## How It Works

1. **CognitoUtils.ts**: Contains utility functions to generate the SECRET_HASH using HMAC-SHA256
2. **AuthContext.tsx**: Updated to automatically include SECRET_HASH in all Cognito operations when a client secret is configured
3. **amplify-config.ts**: Updated to include the client secret in the configuration

## SECRET_HASH Generation

The SECRET_HASH is generated using:

-   Message: `username + clientId`
-   Key: `clientSecret`
-   Algorithm: HMAC-SHA256
-   Encoding: Base64

## Operations That Include SECRET_HASH

The following operations now automatically include SECRET_HASH when a client secret is configured:

-   Sign Up
-   Confirm Sign Up
-   Resend Confirmation Code
-   Reset Password
-   Confirm Reset Password

## Testing

1. Set up your environment variables with the correct Cognito client secret
2. Try signing up with a new user
3. The SECRET_HASH error should be resolved

## Security Notes

-   Never commit the client secret to version control
-   Use environment variables for all sensitive configuration
-   The client secret is only used to generate the SECRET_HASH and is not stored in the application state

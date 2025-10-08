import * as CryptoJS from 'crypto-js';

/**
 * Generates a SECRET_HASH for AWS Cognito operations when using a client secret
 * @param username - The username (email in this case)
 * @param clientId - The Cognito User Pool Client ID
 * @param clientSecret - The Cognito User Pool Client Secret
 * @returns The base64-encoded SECRET_HASH
 */
export const generateSecretHash = (
  username: string,
  clientId: string,
  clientSecret: string
): string => {
  const message = username + clientId;
  const hash = CryptoJS.HmacSHA256(message, clientSecret);
  return CryptoJS.enc.Base64.stringify(hash);
};

/**
 * Gets the SECRET_HASH for the current configuration
 * @param username - The username (email in this case)
 * @returns The SECRET_HASH or undefined if no client secret is configured
 */
export const getSecretHash = (username: string): string | undefined => {
  const clientId = process.env.REACT_APP_USER_POOL_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_USER_POOL_CLIENT_SECRET;


  if (!clientId || !clientSecret) {
    console.warn('CognitoUtils: Missing clientId or clientSecret:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });
    return undefined;
  }

  const secretHash = generateSecretHash(username, clientId, clientSecret);

  return secretHash;
};
